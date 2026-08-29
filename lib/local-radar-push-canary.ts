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

const EXPECTED_FROM = "2026-08-30T23:00:00.000Z";
const EXPECTED_TO = "2026-08-31T22:59:59.000Z";

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
  const eventId = `canary:local-radar:${outboxId}`;
  const dedupeKey = `local-radar-canary:${outboxId}:${recipient.endpoint_id}`;

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
    )`;

  const dispatch = await dispatchCanonicalPushAlerts({ measuredAt: now });

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
    WHERE o.id=${outboxId}
    LIMIT 1` as CanaryOutcomeRow[];

  const outcome = rows[0] ?? null;
  return {
    accepted: outcome?.state === "sent" && Boolean(outcome.provider_message_id),
    eligibleUsers: 1,
    eligibleEndpoints: recipients.length,
    eventType: "local_radar_test",
    outboxId,
    state: outcome?.state ?? "missing",
    sentAt: outcome?.sent_at ?? null,
    providerMessageId: outcome?.provider_message_id ?? null,
    deliveryResult: outcome?.delivery_result ?? null,
    lastError: outcome?.last_error ?? null,
    dispatch,
  };
}
