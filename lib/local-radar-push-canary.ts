import { randomUUID } from "node:crypto";

import { dispatchCanonicalPushAlerts } from "@/lib/canonical-push";
import { fateDropPostgres } from "@/lib/postgres";

type CanaryRecipient = {
  endpoint_id: string;
  user_id: string;
  expo_push_token: string;
  echo_enabled: boolean;
  push_enabled: boolean;
};

type CanaryOutcomeRow = {
  id: string;
  state: string;
  sent_at: number | null;
  last_error: string | null;
  provider_message_id: string | null;
  delivery_result: string | null;
};

const CANARY_KEY = "2026-08-29-smyths-monday";
const EXPECTED_FROM = "2026-08-30T23:00:00.000Z";
const EXPECTED_TO = "2026-08-31T22:59:59.000Z";

async function readOutcome(sql: Awaited<ReturnType<typeof fateDropPostgres>>, dedupeKey: string) {
  const rows = await sql`
    SELECT
      o.id,
      o.state,
      o.sent_at,
      o.last_error,
      attempt.provider_message_id,
      attempt.result AS delivery_result
    FROM fatedrop_notification_outbox o
    LEFT JOIN LATERAL (
      SELECT provider_message_id,result
      FROM fatedrop_notification_delivery_attempts
      WHERE outbox_id=o.id
      ORDER BY attempted_at DESC
      LIMIT 1
    ) attempt ON true
    WHERE o.dedupe_key=${dedupeKey}
    LIMIT 1` as CanaryOutcomeRow[];
  return rows[0] ?? null;
}

export async function runLocalRadarProductionCanary() {
  const sql = await fateDropPostgres();
  const recipients = await sql`
    SELECT
      pe.id AS endpoint_id,
      pe.user_id,
      pe.expo_push_token,
      COALESCE(np.echo_enabled,true) AS echo_enabled,
      COALESCE(np.push_enabled,true) AS push_enabled
    FROM fatedrop_push_endpoints pe
    JOIN fatedrop_memberships m ON m.user_id=pe.user_id
    LEFT JOIN fatedrop_notification_preferences np ON np.user_id=pe.user_id
    WHERE pe.enabled=true
      AND m.status IN ('active','trialing')
      AND m.tier IN ('plus','pro')
    ORDER BY pe.updated_at DESC` as CanaryRecipient[];

  const eligibleUsers = new Set(recipients.map((recipient) => recipient.user_id));
  if (eligibleUsers.size !== 1) {
    return {
      accepted: false,
      reason: eligibleUsers.size === 0 ? "no_eligible_push_user" : "ambiguous_eligible_push_users",
      eligibleUsers: eligibleUsers.size,
      eligibleEndpoints: recipients.length,
    };
  }

  const recipient = recipients[0];
  if (!recipient.push_enabled) {
    return { accepted: false, reason: "push_disabled", eligibleUsers: 1, eligibleEndpoints: recipients.length };
  }
  if (!recipient.echo_enabled) {
    return { accepted: false, reason: "echo_disabled", eligibleUsers: 1, eligibleEndpoints: recipients.length };
  }

  const now = Math.floor(Date.now() / 1000);
  const outboxId = randomUUID();
  const eventId = `canary:local-radar:${CANARY_KEY}`;
  const dedupeKey = `local-radar-canary:${CANARY_KEY}:${recipient.endpoint_id}`;

  const existing = await readOutcome(sql, dedupeKey);
  if (existing?.state === "sent" && existing.provider_message_id) {
    return {
      accepted: true,
      alreadySent: true,
      eligibleUsers: 1,
      eligibleEndpoints: recipients.length,
      eventType: "local_radar_test",
      outboxId: existing.id,
      state: existing.state,
      sentAt: existing.sent_at,
      providerMessageId: existing.provider_message_id,
      deliveryResult: existing.delivery_result,
      lastError: existing.last_error,
      dispatch: null,
    };
  }

  if (!existing) {
    await sql`
      INSERT INTO fatedrop_notification_outbox (
        id,dedupe_key,user_id,event_type,event_id,channel,title,body,url,payload_json,state,attempts,next_attempt_at,created_at,updated_at
      ) VALUES (
        ${outboxId},${dedupeKey},${recipient.user_id},'local_radar_test',${eventId},'push',
        'TEST · FateDrop · Local Radar',
        'Smyths incoming stock test: Temporal Forces ETB and Destined Rivals expected Monday 31 August. Tap to inspect Local Radar.',
        NULL,
        ${JSON.stringify({
          route: "local-radar",
          localIntelId: eventId,
          stage: "ECHO",
          retailerId: "smyths-uk",
          retailerName: "Smyths",
          productTitle: "[TEST] Temporal Forces ETB + Destined Rivals",
          expectedFrom: EXPECTED_FROM,
          expectedTo: EXPECTED_TO,
          expectedLabel: "TEST · Expected Monday 31 August",
          branchCount: 0,
          operatorIssue: 0,
          test: true,
          canary: true,
          endpointId: recipient.endpoint_id,
          expoPushToken: recipient.expo_push_token,
        })}::jsonb,
        'pending',0,${now},${now},${now}
      )
      ON CONFLICT (dedupe_key) DO NOTHING`;
  }

  const dispatch = await dispatchCanonicalPushAlerts({ measuredAt: now });
  const outcome = await readOutcome(sql, dedupeKey);

  return {
    accepted: outcome?.state === "sent" && Boolean(outcome.provider_message_id),
    alreadySent: false,
    eligibleUsers: 1,
    eligibleEndpoints: recipients.length,
    eventType: "local_radar_test",
    outboxId: outcome?.id ?? outboxId,
    state: outcome?.state ?? "missing",
    sentAt: outcome?.sent_at ?? null,
    providerMessageId: outcome?.provider_message_id ?? null,
    deliveryResult: outcome?.delivery_result ?? null,
    lastError: outcome?.last_error ?? null,
    dispatch,
  };
}
