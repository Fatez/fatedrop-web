import { randomUUID } from "node:crypto";

import { fateDropPostgres } from "@/lib/postgres";

export const OPERATOR_ECHO_RETRACTION_COPY = "This Echo was retracted by FateDrop.";

export type OperatorEchoRetraction = {
  eventId: string;
  targetEventId: string;
  targetOperatorIssue: number;
  retractionIssue: number;
  reason: string;
  operatorLogin: string;
  requestedAt: string;
};

type OriginalOutboxRow = {
  id: string;
  user_id: string;
  state: string;
  attempts: number;
  payload_json: Record<string, unknown> | string;
};

function objectPayload(value: OriginalOutboxRow["payload_json"]) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

export async function retractedOperatorEchoIds(eventIds: string[]) {
  const targets = [...new Set(eventIds.filter((eventId) => /^local-radar-operator:[1-9][0-9]*$/.test(eventId)))];
  if (!targets.length) return new Set<string>();
  const sql = await fateDropPostgres();
  const serialized = JSON.stringify(targets);
  const rows = await sql`
    SELECT target_event_id
    FROM fatedrop_operator_echo_retractions
    WHERE target_event_id IN (
      SELECT jsonb_array_elements_text(${serialized}::jsonb)
    )`;
  return new Set(rows.map((row) => String(row.target_event_id)));
}

export async function recordOperatorEchoRetraction(command: OperatorEchoRetraction) {
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  const requestedAt = Math.floor(Date.parse(command.requestedAt) / 1000);
  const payload = JSON.stringify({
    schemaVersion: 2,
    operation: "retract",
    operatorConfirmation: "RETRACT_GLOBAL_ECHO",
    eventId: command.eventId,
    targetEventId: command.targetEventId,
    targetOperatorIssue: command.targetOperatorIssue,
    retractionIssue: command.retractionIssue,
    reason: command.reason,
    operatorLogin: command.operatorLogin,
    requestedAt: command.requestedAt,
  });

  const inserted = await sql`
    INSERT INTO fatedrop_operator_echo_retractions (
      target_event_id,retraction_event_id,original_operator_issue,retraction_issue,reason,operator_login,requested_at,retracted_at,payload_json
    ) VALUES (
      ${command.targetEventId},${command.eventId},${command.targetOperatorIssue},${command.retractionIssue},${command.reason},${command.operatorLogin},${requestedAt},${now},${payload}::jsonb
    )
    ON CONFLICT (target_event_id) DO NOTHING
    RETURNING target_event_id,retraction_event_id`;

  const existing = inserted[0] ?? (await sql`
    SELECT target_event_id,retraction_event_id
    FROM fatedrop_operator_echo_retractions
    WHERE target_event_id=${command.targetEventId}
    LIMIT 1`)[0];
  if (!existing) throw new Error("Operator Echo retraction could not be persisted.");

  const priorAudit = await sql`
    SELECT outcome
    FROM fatedrop_operator_echo_retraction_audit
    WHERE request_event_id=${command.eventId}
    LIMIT 1`;
  const outcome = priorAudit[0]?.outcome === "effective" || priorAudit[0]?.outcome === "already_retracted"
    ? String(priorAudit[0].outcome)
    : String(existing.retraction_event_id) === command.eventId ? "effective" : "already_retracted";
  await sql`
    INSERT INTO fatedrop_operator_echo_retraction_audit (
      request_event_id,target_event_id,outcome,reason,operator_login,requested_at,recorded_at
    ) VALUES (
      ${command.eventId},${command.targetEventId},${outcome},${command.reason},${command.operatorLogin},${requestedAt},${now}
    )
    ON CONFLICT (request_event_id) DO NOTHING`;

  const originalRows = await sql`
    SELECT id,user_id,state,attempts,payload_json
    FROM fatedrop_notification_outbox
    WHERE channel='push'
      AND event_type='operator_readiness_echo'
      AND event_id=${command.targetEventId}` as OriginalOutboxRow[];

  const suppressed = await sql`
    UPDATE fatedrop_notification_outbox
    SET state='suppressed',last_error='operator_echo_retracted',next_attempt_at=${now},updated_at=${now}
    WHERE channel='push'
      AND event_type='operator_readiness_echo'
      AND event_id=${command.targetEventId}
      AND state IN ('pending','failed','sending')
    RETURNING id`;

  const correctionRows = originalRows
    .filter((row) => row.state === "sent" || row.state === "sending")
    .flatMap((row) => {
      const original = objectPayload(row.payload_json);
      const endpointId = typeof original.endpointId === "string" ? original.endpointId : null;
      const expoPushToken = typeof original.expoPushToken === "string" ? original.expoPushToken : null;
      if (!endpointId || !expoPushToken) return [];
      return [{
        id: randomUUID(),
        dedupe_key: `operator-echo-retraction:${command.targetEventId}:${endpointId}`,
        user_id: row.user_id,
        event_type: "operator_echo_retraction",
        event_id: command.eventId,
        channel: "push",
        title: "FateDrop · Echo correction",
        body: OPERATOR_ECHO_RETRACTION_COPY,
        url: null,
        payload_json: {
          route: "operator-correction",
          noAction: true,
          operatorEchoRetraction: true,
          retractedEventId: command.targetEventId,
          retractionIssue: command.retractionIssue,
          stage: "ECHO",
          endpointId,
          expoPushToken,
          pushPlatform: typeof original.pushPlatform === "string" ? original.pushPlatform : null,
        },
        state: "pending",
        attempts: 0,
        // A row claimed before the retraction marker may already be in flight.
        // Hold its correction briefly so it cannot overtake the original Expo call.
        next_attempt_at: row.state === "sending" ? now + 30 : now,
        created_at: now,
        updated_at: now,
      }];
    });

  let correctionsQueued = 0;
  if (correctionRows.length) {
    const serialized = JSON.stringify(correctionRows);
    const queued = await sql`
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
    correctionsQueued = queued.length;
  }

  return {
    outcome,
    targetEventId: String(existing.target_event_id),
    effectiveRetractionEventId: String(existing.retraction_event_id),
    suppressed: suppressed.length,
    correctionsQueued,
  };
}
