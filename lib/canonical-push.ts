import { randomUUID } from "node:crypto";
import { listCanonicalAlerts, type CanonicalAlert } from "@/lib/canonical-alerts";
import { fateDropPostgres } from "@/lib/postgres";
import { productAlertEnabled } from "@/lib/product-alert-intelligence";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_ATTEMPTS = 3;

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
      LIMIT ${Math.max(1, Math.min(500, limit))}
    )
    UPDATE fatedrop_notification_outbox o
    SET state='sending',attempts=o.attempts+1,updated_at=${now}
    FROM candidates c
    WHERE o.id=c.id
    RETURNING o.*`;
  return rows as unknown as OutboxRow[];
}

async function sendExpo(ticket: OutboxRow) {
  const data = payload(ticket.payload_json);
  const token = typeof data.expoPushToken === "string" ? data.expoPushToken : null;
  if (!token) return { ok: false, permanent: true, detail: "missing-push-token" };
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ to: token, title: ticket.title, body: ticket.body, data: { ...data, expoPushToken: undefined } }),
      signal: AbortSignal.timeout(8000),
    });
    const result = await response.json().catch(() => ({})) as { data?: ExpoTicket | ExpoTicket[] };
    const first = Array.isArray(result.data) ? result.data[0] : result.data;
    if (!response.ok || !first || first.status !== "ok") {
      const detail = first?.details?.error || first?.message || `expo-${response.status}`;
      return { ok: false, permanent: detail === "DeviceNotRegistered", detail };
    }
    return { ok: true, permanent: false, detail: first.id || "accepted" };
  } catch (error) {
    return { ok: false, permanent: false, detail: error instanceof Error ? error.message : "expo-request-failed" };
  }
}

async function settleOutbox(row: OutboxRow, result: { ok: boolean; permanent: boolean; detail: string }) {
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  if (result.ok) {
    await sql`UPDATE fatedrop_notification_outbox SET state='sent',provider_message_id=${result.detail},last_error=NULL,updated_at=${now} WHERE id=${row.id}`;
    return;
  }
  const final = result.permanent || row.attempts >= MAX_ATTEMPTS;
  await sql`UPDATE fatedrop_notification_outbox SET state=${final ? "dead" : "failed"},last_error=${result.detail},next_attempt_at=${retryAt(now,row.attempts)},updated_at=${now} WHERE id=${row.id}`;
}

export async function runCanonicalPushWorker({ measuredAt = Math.floor(Date.now() / 1000), lookbackSeconds = 900, claimLimit = 100 } = {}) {
  const enqueued = await enqueueRecentAlerts({ measuredAt, lookbackSeconds });
  if (!dispatchEnabled()) return { dispatchEnabled: false, enqueued, claimed: 0, sent: 0, failed: 0 };
  const claimed = await claimPending(claimLimit);
  let sent = 0, failed = 0;
  for (const row of claimed) {
    const result = await sendExpo(row);
    await settleOutbox(row, result);
    if (result.ok) sent += 1; else failed += 1;
  }
  return { dispatchEnabled: true, enqueued, claimed: claimed.length, sent, failed };
}
