import { fateDropPostgres } from "@/lib/postgres";

export type CanonicalAlertDelivery = {
  signalId: string;
  result: "sent" | "failed" | "skipped";
  detail: string | null;
  providerMessageId: string | null;
  attemptedAt: number;
};

export type CanonicalAlertState = "whisper" | "echo" | "manifested" | "vanished";

type CanonicalAlertStateSummary = {
  total: number;
  sent: number;
  issues: number;
};

export type CanonicalAlertDeliverySummary = {
  days: number;
  total: number;
  sent: number;
  issues: number;
  byState: Record<CanonicalAlertState, CanonicalAlertStateSummary>;
  daily: Array<{
    day: string;
    total: number;
    sent: number;
    issues: number;
  }>;
};

const CANONICAL_STATES: CanonicalAlertState[] = ["whisper", "echo", "manifested", "vanished"];
const CONFIG_ISSUES = new Set(["missing_bot_token", "missing_channel_id", "missing_lifecycle_channel_id"]);

function isAlertWorthyAttempt(result: string, detail: string | null) {
  if (result === "sent" || result === "failed") return true;
  if (result !== "skipped") return false;
  return CONFIG_ISSUES.has(String(detail || "").trim());
}

function utcDay(epochSeconds: number) {
  return new Date(epochSeconds * 1000).toISOString().slice(0, 10);
}

function emptyStateSummary(): CanonicalAlertStateSummary {
  return { total: 0, sent: 0, issues: 0 };
}

export async function listCanonicalAlertDeliveries({
  id,
  limit = 50,
}: {
  id?: string | null;
  limit?: number;
} = {}): Promise<CanonicalAlertDelivery[]> {
  const sql = await fateDropPostgres();
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));

  const rows = id
    ? await sql`
        SELECT s.id AS signal_id,d.result,d.detail,d.provider_message_id,d.attempted_at
        FROM fatedrop_signals s
        JOIN LATERAL (
          SELECT result,detail,provider_message_id,attempted_at
          FROM fatedrop_signal_delivery_attempts
          WHERE signal_id=s.id AND channel='discord'
          ORDER BY attempted_at DESC
          LIMIT 1
        ) d ON true
        WHERE s.id=${id}
        LIMIT 1`
    : await sql`
        SELECT s.id AS signal_id,d.result,d.detail,d.provider_message_id,d.attempted_at
        FROM fatedrop_signals s
        JOIN LATERAL (
          SELECT result,detail,provider_message_id,attempted_at
          FROM fatedrop_signal_delivery_attempts
          WHERE signal_id=s.id AND channel='discord'
          ORDER BY attempted_at DESC
          LIMIT 1
        ) d ON true
        ORDER BY s.detected_at DESC
        LIMIT 500`;

  return rows
    .map((row) => ({
      signalId: String(row.signal_id),
      result: String(row.result) as CanonicalAlertDelivery["result"],
      detail: row.detail == null ? null : String(row.detail),
      providerMessageId: row.provider_message_id == null ? null : String(row.provider_message_id),
      attemptedAt: Number(row.attempted_at),
    }))
    .filter((attempt) => isAlertWorthyAttempt(attempt.result, attempt.detail))
    .slice(0, safeLimit);
}

export async function getCanonicalAlertDeliverySummary(days = 7): Promise<CanonicalAlertDeliverySummary> {
  const sql = await fateDropPostgres();
  const safeDays = Math.max(1, Math.min(30, Math.floor(days)));
  const cutoff = Math.floor(Date.now() / 1000) - safeDays * 86_400;
  const rows = await sql`
    SELECT s.state,s.detected_at,d.result,d.detail
    FROM fatedrop_signals s
    JOIN LATERAL (
      SELECT result,detail,attempted_at
      FROM fatedrop_signal_delivery_attempts
      WHERE signal_id=s.id AND channel='discord'
      ORDER BY attempted_at DESC
      LIMIT 1
    ) d ON true
    WHERE s.detected_at >= ${cutoff}
      AND s.state IN ('whisper','echo','manifested','vanished')
    ORDER BY s.detected_at ASC`;

  const byState: Record<CanonicalAlertState, CanonicalAlertStateSummary> = {
    whisper: emptyStateSummary(),
    echo: emptyStateSummary(),
    manifested: emptyStateSummary(),
    vanished: emptyStateSummary(),
  };
  const daily = new Map<string, { day: string; total: number; sent: number; issues: number }>();

  for (const row of rows) {
    const state = String(row.state) as CanonicalAlertState;
    const result = String(row.result);
    const detail = row.detail == null ? null : String(row.detail);
    if (!CANONICAL_STATES.includes(state) || !isAlertWorthyAttempt(result, detail)) continue;

    const issue = result !== "sent";
    byState[state].total += 1;
    if (result === "sent") byState[state].sent += 1;
    if (issue) byState[state].issues += 1;

    const day = utcDay(Number(row.detected_at));
    const bucket = daily.get(day) ?? { day, total: 0, sent: 0, issues: 0 };
    bucket.total += 1;
    if (result === "sent") bucket.sent += 1;
    if (issue) bucket.issues += 1;
    daily.set(day, bucket);
  }

  const stateValues = Object.values(byState);
  return {
    days: safeDays,
    total: stateValues.reduce((sum, state) => sum + state.total, 0),
    sent: stateValues.reduce((sum, state) => sum + state.sent, 0),
    issues: stateValues.reduce((sum, state) => sum + state.issues, 0),
    byState,
    daily: [...daily.values()].sort((a, b) => a.day.localeCompare(b.day)),
  };
}
