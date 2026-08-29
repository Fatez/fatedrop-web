import { randomUUID } from "node:crypto";

import { betaPremiumEnabled } from "@/lib/beta-premium";
import { dispatchCanonicalPushAlerts } from "@/lib/canonical-push";
import { fateDropPostgres } from "@/lib/postgres";

type CanaryRecipient = {
  endpoint_id: string;
  user_id: string;
  expo_push_token: string;
  whisper_enabled: boolean;
  echo_enabled: boolean;
  manifested_enabled: boolean;
  vanished_enabled: boolean;
  push_enabled: boolean;
};

type CanaryOutcomeRow = {
  event_id: string;
  state: string;
  sent_at: number | null;
  last_error: string | null;
  provider_message_id: string | null;
  delivery_result: string | null;
};

export type CanaryKind = "whisper" | "echo" | "manifested" | "vanished" | "local-radar";

const CANARY_KINDS = new Set<CanaryKind>(["whisper", "echo", "manifested", "vanished", "local-radar"]);

export function isPushCanaryKind(value: string): value is CanaryKind {
  return CANARY_KINDS.has(value as CanaryKind);
}

type CanarySpec = {
  kind: CanaryKind;
  eventType: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
};

function canarySpecs(runId: string): CanarySpec[] {
  return [
    {
      kind: "whisper",
      eventType: "whisper",
      title: "TEST · WHISPER",
      body: "FateDrop production push test — Whisper transport only. No stock event occurred.",
      payload: { route: "alerts", stage: "WHISPER", fateStage: "WHISPER", test: true, canary: true },
    },
    {
      kind: "echo",
      eventType: "echo",
      title: "TEST · ECHO",
      body: "FateDrop production push test — Echo transport only. No stock event occurred.",
      payload: { route: "alerts", stage: "ECHO", fateStage: "ECHO", test: true, canary: true },
    },
    {
      kind: "manifested",
      eventType: "manifested",
      title: "TEST · MANIFESTED",
      body: "FateDrop production push test — Manifested transport only. No stock event occurred.",
      payload: { route: "alerts", stage: "MANIFESTED", fateStage: "MANIFESTED", test: true, canary: true },
    },
    {
      kind: "vanished",
      eventType: "vanished",
      title: "TEST · VANISHED",
      body: "FateDrop production push test — Vanished transport only. No stock event occurred.",
      payload: { route: "alerts", stage: "VANISHED", fateStage: "VANISHED", test: true, canary: true },
    },
    {
      kind: "local-radar",
      eventType: "local_radar_operator",
      title: "TEST · LOCAL RADAR",
      body: "FateDrop production push test — manual physical-store alert presentation only. No physical stock claim occurred.",
      payload: {
        route: "local-radar",
        localIntelId: `canary:local-radar:${runId}`,
        stage: "ECHO",
        retailerId: "test-retailer",
        retailerName: "FateDrop Test Retailer",
        productTitle: "TEST · Manual physical-store alert",
        expectedFrom: null,
        expectedTo: null,
        expectedLabel: "TEST ONLY",
        branchCount: 1,
        operatorIssue: 0,
        test: true,
        canary: true,
      },
    },
  ];
}

function disabledPreference(recipient: CanaryRecipient, specs: CanarySpec[]) {
  if (!recipient.push_enabled) return "push_disabled";
  if (specs.some((spec) => spec.kind === "whisper") && !recipient.whisper_enabled) return "whisper_disabled";
  if (specs.some((spec) => spec.kind === "echo") && !recipient.echo_enabled) return "echo_disabled";
  if (specs.some((spec) => spec.kind === "manifested") && !recipient.manifested_enabled) return "manifested_disabled";
  if (specs.some((spec) => spec.kind === "vanished") && !recipient.vanished_enabled) return "vanished_disabled";
  return null;
}

export async function runProductionPushCanarySuite(selectedKind?: CanaryKind) {
  const sql = await fateDropPostgres();
  const temporaryBetaPremium = betaPremiumEnabled();
  const recipients = await sql`
    SELECT
      pe.id AS endpoint_id,
      pe.user_id,
      pe.expo_push_token,
      COALESCE(np.whisper_enabled,true) AS whisper_enabled,
      COALESCE(np.echo_enabled,true) AS echo_enabled,
      COALESCE(np.manifested_enabled,true) AS manifested_enabled,
      COALESCE(np.vanished_enabled,true) AS vanished_enabled,
      COALESCE(np.push_enabled,true) AS push_enabled
    FROM fatedrop_push_endpoints pe
    JOIN fatedrop_memberships m ON m.user_id=pe.user_id
    JOIN fatedrop_beta_access ba ON ba.user_id=pe.user_id AND ba.status='approved'
    LEFT JOIN fatedrop_notification_preferences np ON np.user_id=pe.user_id
    WHERE pe.enabled=true
      AND (
        ${temporaryBetaPremium}=true
        OR (m.status IN ('active','trialing') AND m.tier IN ('plus','pro'))
      )
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

  const now = Math.floor(Date.now() / 1000);
  const runId = randomUUID();
  const allSpecs = canarySpecs(runId);
  const specs = selectedKind ? allSpecs.filter((spec) => spec.kind === selectedKind) : allSpecs;
  const recipient = recipients[0];
  const preferenceFailure = disabledPreference(recipient, specs);
  if (preferenceFailure) {
    return { accepted: false, reason: preferenceFailure, eligibleUsers: 1, eligibleEndpoints: recipients.length };
  }

  const queueRows = specs.map((spec) => {
    const outboxId = randomUUID();
    const eventId = `canary:suite:${runId}:${spec.kind}`;
    return {
      id: outboxId,
      dedupe_key: `push-canary-suite:${runId}:${spec.kind}:${recipient.endpoint_id}`,
      user_id: recipient.user_id,
      event_type: spec.eventType,
      event_id: eventId,
      channel: "push",
      title: spec.title,
      body: spec.body,
      url: null,
      payload_json: {
        ...spec.payload,
        canaryKind: spec.kind,
        endpointId: recipient.endpoint_id,
        expoPushToken: recipient.expo_push_token,
      },
      state: "pending",
      attempts: 0,
      next_attempt_at: now,
      created_at: now,
      updated_at: now,
    };
  });

  const serialized = JSON.stringify(queueRows);
  const inserted = await sql`
    INSERT INTO fatedrop_notification_outbox (
      id,dedupe_key,user_id,event_type,event_id,channel,title,body,url,payload_json,state,attempts,next_attempt_at,created_at,updated_at
    )
    SELECT
      item.id,item.dedupe_key,item.user_id,item.event_type,item.event_id,item.channel,item.title,item.body,item.url,
      item.payload_json,item.state,item.attempts,item.next_attempt_at,item.created_at,item.updated_at
    FROM jsonb_to_recordset(${serialized}::jsonb) AS item(
      id text,dedupe_key text,user_id text,event_type text,event_id text,channel text,title text,body text,url text,
      payload_json jsonb,state text,attempts integer,next_attempt_at bigint,created_at bigint,updated_at bigint
    )
    ON CONFLICT (dedupe_key) DO NOTHING
    RETURNING id`;

  if (inserted.length !== specs.length) {
    return {
      accepted: false,
      reason: "canary_enqueue_incomplete",
      eligibleUsers: 1,
      eligibleEndpoints: recipients.length,
      queued: inserted.length,
      expected: specs.length,
    };
  }

  const dispatch = await dispatchCanonicalPushAlerts({ measuredAt: now });
  const eventPrefix = `canary:suite:${runId}:%`;
  const rows = await sql`
    SELECT
      o.event_id,
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
    WHERE o.event_id LIKE ${eventPrefix}
    ORDER BY o.event_id ASC` as CanaryOutcomeRow[];

  const outcomes = specs.map((spec) => {
    const eventId = `canary:suite:${runId}:${spec.kind}`;
    const outcome = rows.find((row) => row.event_id === eventId) ?? null;
    return {
      kind: spec.kind,
      eventType: spec.eventType,
      eventId,
      state: outcome?.state ?? "missing",
      sentAt: outcome?.sent_at ?? null,
      providerMessageId: outcome?.provider_message_id ?? null,
      deliveryResult: outcome?.delivery_result ?? null,
      lastError: outcome?.last_error ?? null,
    };
  });

  const accepted = outcomes.every((outcome) => outcome.state === "sent" && Boolean(outcome.providerMessageId));
  return {
    accepted,
    reason: accepted ? null : "one_or_more_canaries_not_sent",
    eligibleUsers: 1,
    eligibleEndpoints: recipients.length,
    runId,
    selectedKind: selectedKind ?? null,
    queued: inserted.length,
    expected: specs.length,
    outcomes,
    dispatch,
  };
}

// Kept as a compatibility wrapper for any internal caller that still names the
// original Vanished canary. The production route continues to run the complete suite.
export async function runVanishedProductionCanary() {
  return runProductionPushCanarySuite();
}
