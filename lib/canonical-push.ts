import { randomUUID } from "node:crypto";
import { listCanonicalAlerts, type CanonicalAlert } from "@/lib/canonical-alerts";
import { fateDropPostgres } from "@/lib/postgres";
import { productAlertEnabled } from "@/lib/product-alert-intelligence";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_ATTEMPTS = 3;
const SENDING_LEASE_SECONDS = 5 * 60;

type RecipientRow = {
  endpoint_id: string;
  user_id: string;
  expo_push_token: string;
  whisper_enabled: boolean;
  echo_enabled: boolean;
  manifested_enabled: boolean;
  vanished_enabled: boolean;
  sealed_tcg_enabled: boolean;
  single_cards_enabled: boolean;
  accessories_enabled: boolean;
  merchandise_enabled: boolean;
  unknown_products_enabled: boolean;
  push_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
};

type OutboxRow = {
  id: string;
  user_id: string;
  event_id: string;
  title: string;
  body: string;
  url: string | null;
  payload_json: Record<string, unknown> | string;
  attempts: number;
};

type ExpoTicket = {
  status?: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

export type LocalRadarOperatorPush = {
  eventId: string;
  stage: "WHISPER" | "ECHO";
  title: string;
  body: string;
  retailerId: string;
  retailerName: string;
  productTitle: string;
  expectedFrom: string | null;
  expectedTo: string | null;
  expectedLabel: string | null;
  branchCount: number;
  operatorIssue: number;
};

function dispatchEnabled() {
  return process.env.FATEDROP_PUSH_DISPATCH_ENABLED === "true";
}

function epoch(iso: string) {
  const value = Math.floor(new Date(iso).getTime() / 1000);
  return Number.isFinite(value) ? value : 0;
}

function stageEnabled(alert: CanonicalAlert, recipient: RecipientRow) {
  if (!recipient.push_enabled) return false;
  if (alert.fateStage === "WHISPER") return recipient.whisper_enabled;
  if (alert.fateStage === "ECHO") return recipient.echo_enabled;
  if (alert.fateStage === "MANIFESTED") return recipient.manifested_enabled;
  if (alert.fateStage === "VANISHED") return recipient.vanished_enabled;
  return false;
}

function operatorStageEnabled(event: LocalRadarOperatorPush, recipient: RecipientRow) {
  if (!recipient.push_enabled) return false;
  if (event.stage === "WHISPER") return recipient.whisper_enabled;
  if (event.stage === "ECHO") return recipient.echo_enabled;
  return false;
}

function productEnabled(alert: CanonicalAlert, recipient: RecipientRow) {
  return productAlertEnabled(alert.productIntelligence, {
    sealedTcg: recipient.sealed_tcg_enabled,
    singleCards: recipient.single_cards_enabled,
    accessories: recipient.accessories_enabled,
    merchandise: recipient.merchandise_enabled,
    unknownProducts: recipient.unknown_products_enabled,
  });
}

function minutesInTimezone(now: Date, timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone || "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
    return hour * 60 + minute;
  } catch {
    return null;
  }
}

function parseClock(value: string | null) {
  if (!value || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function inQuietHours(recipient: RecipientRow, now: Date) {
  if (!recipient.quiet_hours_enabled) return false;
  const current = minutesInTimezone(now, recipient.timezone);
  const start = parseClock(recipient.quiet_hours_start);
  const end = parseClock(recipient.quiet_hours_end);
  if (current == null || start == null || end == null || start === end) return false;
  return start < end ? current >= start && current < end : current >= start || current < end;
}

function payload(value: OutboxRow["payload_json"]) {
  if (typeof value !== "string") return value ?? {};
  try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
}

function retryAt(now: number, attempts: number) {
  return now + Math.min(900, 30 * (2 ** Math.max(0, attempts - 1)));
}

async function eligibleRecipients() {
  const sql = await fateDropPostgres();
  const rows = await sql`
    SELECT
      pe.id AS endpoint_id,
      pe.user_id,
      pe.expo_push_token,
      COALESCE(np.whisper_enabled,true) AS whisper_enabled,
      COALESCE(np.echo_enabled,true) AS echo_enabled,
      COALESCE(np.manifested_enabled,true) AS manifested_enabled,
      COALESCE(np.vanished_enabled,true) AS vanished_enabled,
      COALESCE(np.sealed_tcg_enabled,true) AS sealed_tcg_enabled,
      COALESCE(np.single_cards_enabled,true) AS single_cards_enabled,
      COALESCE(np.accessories_enabled,false) AS accessories_enabled,
      COALESCE(np.merchandise_enabled,false) AS merchandise_enabled,
      COALESCE(np.unknown_products_enabled,true) AS unknown_products_enabled,
      COALESCE(np.push_enabled,true) AS push_enabled,
      COALESCE(np.quiet_hours_enabled,false) AS quiet_hours_enabled,
      np.quiet_hours_start,
      np.quiet_hours_end,
      COALESCE(np.timezone,'Europe/London') AS timezone
    FROM fatedrop_push_endpoints pe
    JOIN fatedrop_memberships m ON m.user_id=pe.user_id
    LEFT JOIN fatedrop_notification_preferences np ON np.user_id=pe.user_id
    WHERE pe.enabled=true
      AND m.status IN ('active','trialing')
      AND m.tier IN ('plus','pro')
    ORDER BY pe.updated_at DESC
    LIMIT 2000`;
  return rows as RecipientRow[];
}

async function enqueueRecentAlerts({ measuredAt, lookbackSeconds = 900 }: { measuredAt: number; lookbackSeconds?: number }) {
  const [alerts, recipients] = await Promise.all([
    listCanonicalAlerts({ limit: 100 }),
    eligibleRecipients(),
  ]);
  if (!alerts.length || !recipients.length) return { alerts: 0, recipients: recipients.length, queued: 0 };

  const since = Math.max(0, measuredAt - lookbackSeconds);
  const recent = alerts.filter((alert) => epoch(alert.detectedAt) >= since && epoch(alert.detectedAt) <= measuredAt + 60);
  if (!recent.length) return { alerts: 0, recipients: recipients.length, queued: 0 };

  const nowDate = new Date();
  const now = Math.floor(nowDate.getTime() / 1000);
  const queueRows: Array<Record<string, unknown>> = [];

  for (const alert of recent) {
    for (const recipient of recipients) {
      if (!stageEnabled(alert, recipient) || !productEnabled(alert, recipient) || inQuietHours(recipient, nowDate)) continue;
      queueRows.push({
        id: randomUUID(),
        dedupe_key: `push:${alert.id}:${recipient.endpoint_id}`,
        user_id: recipient.user_id,
        event_type: alert.fateStage.toLowerCase(),
        event_id: alert.id,
        channel: "push",
        title: alert.notification.title,
        body: alert.notification.body,
        url: alert.productUrl,
        payload_json: {
          ...alert.notification.data,
          endpointId: recipient.endpoint_id,
          expoPushToken: recipient.expo_push_token,
        },
        state: "pending",
        attempts: 0,
        next_attempt_at: now,
        created_at: now,
        updated_at: now,
      });
    }
  }

  if (!queueRows.length) return { alerts: recent.length, recipients: recipients.length, queued: 0 };
  const sql = await fateDropPostgres();
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
  return { alerts: recent.length, recipients: recipients.length, queued: inserted.length };
}

async function enqueueLocalRadarOperatorPush(event: LocalRadarOperatorPush) {
  const recipients = await eligibleRecipients();
  if (!recipients.length) return { recipients: 0, queued: 0 };
  const nowDate = new Date();
  const now = Math.floor(nowDate.getTime() / 1000);
  const queueRows: Array<Record<string, unknown>> = [];

  for (const recipient of recipients) {
    if (!operatorStageEnabled(event, recipient) || inQuietHours(recipient, nowDate)) continue;
    queueRows.push({
      id: randomUUID(),
      dedupe_key: `local-radar:${event.eventId}:${recipient.endpoint_id}`,
      user_id: recipient.user_id,
      event_type: `local_radar_${event.stage.toLowerCase()}`,
      event_id: event.eventId,
      channel: "push",
      title: event.title,
      body: event.body,
      url: null,
      payload_json: {
        route: "local-radar",
        localIntelId: event.eventId,
        stage: event.stage,
        retailerId: event.retailerId,
        retailerName: event.retailerName,
        productTitle: event.productTitle,
        expectedFrom: event.expectedFrom,
        expectedTo: event.expectedTo,
        expectedLabel: event.expectedLabel,
        branchCount: event.branchCount,
        operatorIssue: event.operatorIssue,
        endpointId: recipient.endpoint_id,
        expoPushToken: recipient.expo_push_token,
      },
      state: "pending",
      attempts: 0,
      next_attempt_at: now,
      created_at: now,
      updated_at: now,
    });
  }

  if (!queueRows.length) return { recipients: recipients.length, queued: 0 };
  const sql = await fateDropPostgres();
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
  return { recipients: recipients.length, queued: inserted.length };
}

async function recoverStaleSending() {
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  const staleBefore = now - SENDING_LEASE_SECONDS;
  await sql`
    UPDATE fatedrop_notification_outbox
    SET
      state='failed',
      last_error=COALESCE(last_error,'Push delivery lease expired before a result was recorded.'),
      next_attempt_at=${now},
      updated_at=${now}
    WHERE channel='push'
      AND state='sending'
      AND updated_at <= ${staleBefore}`;
}

async function claimPending(limit = 100) {
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  const rows = await sql`
    WITH candidates AS (
      SELECT id
      FROM fatedrop_notification_outbox
      WHERE channel='push'
        AND state IN ('pending','failed')
        AND attempts < ${MAX_ATTEMPTS}
        AND next_attempt_at <= ${now}
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${Math.max(1, Math.min(100, limit))}
    )
    UPDATE fatedrop_notification_outbox outbox
    SET state='sending',attempts=outbox.attempts+1,updated_at=${now}
    FROM candidates
    WHERE outbox.id=candidates.id
    RETURNING outbox.id,outbox.user_id,outbox.event_id,outbox.title,outbox.body,outbox.url,outbox.payload_json,outbox.attempts`;
  return rows as OutboxRow[];
}

async function recordResult(row: OutboxRow, ticket: ExpoTicket, transportError: string | null = null) {
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  const data = payload(row.payload_json);
  const endpointId = typeof data.endpointId === "string" ? data.endpointId : null;
  const ticketOk = !transportError && ticket.status === "ok";
  const providerMessageId = ticket.id || null;
  const errorCode = ticket.details?.error || null;
  const detail = transportError || ticket.message || errorCode || null;
  const deadToken = errorCode === "DeviceNotRegistered";
  const finalFailure = deadToken || row.attempts >= MAX_ATTEMPTS;
  const nextAttempt = finalFailure ? now : retryAt(now, row.attempts);

  await sql`
    UPDATE fatedrop_notification_outbox
    SET
      state=${ticketOk ? "sent" : "failed"},
      sent_at=${ticketOk ? now : null},
      last_error=${ticketOk ? null : detail},
      next_attempt_at=${nextAttempt},
      updated_at=${now}
    WHERE id=${row.id}`;

  await sql`
    INSERT INTO fatedrop_notification_delivery_attempts (
      id,outbox_id,attempted_at,result,provider_message_id,detail
    ) VALUES (
      ${randomUUID()},${row.id},${now},${ticketOk ? "sent" : finalFailure ? "failed" : "retry"},${providerMessageId},${detail}
    )`;

  if (endpointId) {
    if (ticketOk) {
      await sql`
        UPDATE fatedrop_push_endpoints
        SET last_success_at=${now},failure_reason=NULL,updated_at=${now}
        WHERE id=${endpointId}`;
    } else {
      await sql`
        UPDATE fatedrop_push_endpoints
        SET last_failure_at=${now},failure_reason=${detail},enabled=CASE WHEN ${deadToken} THEN false ELSE enabled END,updated_at=${now}
        WHERE id=${endpointId}`;
    }
  }
}

async function sendClaimed(rows: OutboxRow[], fetchImpl: typeof fetch = fetch) {
  if (!rows.length) return { claimed: 0, sent: 0, failed: 0 };

  const messages = rows.map((row) => {
    const data = payload(row.payload_json);
    return {
      to: data.expoPushToken,
      sound: "default",
      title: row.title,
      body: row.body,
      data: Object.fromEntries(Object.entries(data).filter(([key]) => !["expoPushToken","endpointId"].includes(key))),
    };
  });

  const headers: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
  if (process.env.EXPO_ACCESS_TOKEN) headers.Authorization = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;

  let tickets: ExpoTicket[] = [];
  let transportError: string | null = null;
  try {
    const response = await fetchImpl(EXPO_PUSH_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(messages),
      signal: AbortSignal.timeout(8_000),
    });
    const result = await response.json().catch(() => null) as { data?: ExpoTicket[] | ExpoTicket; errors?: unknown } | null;
    if (!response.ok) throw new Error(`Expo push HTTP ${response.status}`);
    tickets = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];
    if (tickets.length !== rows.length) throw new Error("Expo push ticket count mismatch");
  } catch (error) {
    transportError = error instanceof Error ? error.message : "Expo push transport failed";
    tickets = rows.map(() => ({ status: "error", message: transportError || undefined }));
  }

  let sent = 0;
  let failed = 0;
  for (let index = 0; index < rows.length; index += 1) {
    const ticket = tickets[index] ?? { status: "error", message: "Missing Expo push ticket" };
    if (!transportError && ticket.status === "ok") sent += 1;
    else failed += 1;
    await recordResult(rows[index], ticket, transportError);
  }
  return { claimed: rows.length, sent, failed };
}

export async function dispatchCanonicalPushAlerts({ measuredAt = Math.floor(Date.now() / 1000), fetchImpl = fetch }: { measuredAt?: number; fetchImpl?: typeof fetch } = {}) {
  if (!dispatchEnabled()) return { enabled: false, queued: 0, claimed: 0, sent: 0, failed: 0 };
  await recoverStaleSending();
  const queued = await enqueueRecentAlerts({ measuredAt });
  const claimed = await claimPending(100);
  const delivery = await sendClaimed(claimed, fetchImpl);
  return { enabled: true, queued: queued.queued, ...delivery };
}

export async function dispatchLocalRadarOperatorPush(event: LocalRadarOperatorPush, { fetchImpl = fetch }: { fetchImpl?: typeof fetch } = {}) {
  if (!dispatchEnabled()) return { enabled: false, recipients: 0, queued: 0, claimed: 0, sent: 0, failed: 0 };
  await recoverStaleSending();
  const queued = await enqueueLocalRadarOperatorPush(event);
  const claimed = await claimPending(100);
  const delivery = await sendClaimed(claimed, fetchImpl);
  return { enabled: true, recipients: queued.recipients, queued: queued.queued, ...delivery };
}
