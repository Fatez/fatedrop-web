import { neon } from "@neondatabase/serverless";
import { getPostgresUrl } from "./postgres-url";

export type LifecycleState = "whisper" | "echo" | "manifested" | "vanished";
export type SignalTrendPoint = { measuredAt: number; value: number };
export type SignalLifecycleSummary = Record<LifecycleState, {
  total: number;
  today: number;
  trend: SignalTrendPoint[];
}>;

export type AlertDeliveryTrendPoint = {
  measuredAt: number;
  sent: number;
  policySkipped: number;
  issues: number;
};

export type AlertDeliverySummary = Record<LifecycleState, {
  sent: number;
  policySkipped: number;
  issues: number;
  todaySent: number;
  trend: AlertDeliveryTrendPoint[];
}>;

const lifecycleStates: LifecycleState[] = ["whisper", "echo", "manifested", "vanished"];

function startOfUtcDay(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 1000;
}

function safeWindow(days: number, now: number) {
  const safeDays = Math.min(30, Math.max(2, Math.trunc(days)));
  const day0 = startOfUtcDay(now) - ((safeDays - 1) * 86_400);
  return { safeDays, day0 };
}

function emptySummary(day0: number, days: number): SignalLifecycleSummary {
  const trend = Array.from({ length: days }, (_, index) => ({ measuredAt: day0 + index * 86_400, value: 0 }));
  return Object.fromEntries(lifecycleStates.map((state) => [state, { total: 0, today: 0, trend: trend.map((point) => ({ ...point })) }])) as SignalLifecycleSummary;
}

function emptyDeliverySummary(day0: number, days: number): AlertDeliverySummary {
  const trend = Array.from({ length: days }, (_, index) => ({
    measuredAt: day0 + index * 86_400,
    sent: 0,
    policySkipped: 0,
    issues: 0,
  }));
  return Object.fromEntries(lifecycleStates.map((state) => [state, {
    sent: 0,
    policySkipped: 0,
    issues: 0,
    todaySent: 0,
    trend: trend.map((point) => ({ ...point })),
  }])) as AlertDeliverySummary;
}

export async function getSignalLifecycleSummary(days = 7, now = Math.floor(Date.now() / 1000)): Promise<SignalLifecycleSummary | null> {
  const { safeDays, day0 } = safeWindow(days, now);
  const databaseUrl = getPostgresUrl();
  if (!databaseUrl) return null;

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT
        state,
        (FLOOR(detected_at / 86400.0) * 86400)::bigint AS measured_at,
        COUNT(*)::int AS count
      FROM fatedrop_signals
      WHERE detected_at >= ${day0}
        AND state IN ('whisper', 'echo', 'manifested', 'vanished')
      GROUP BY state, measured_at
      ORDER BY measured_at ASC
    `;

    const summary = emptySummary(day0, safeDays);
    for (const row of rows as Array<Record<string, unknown>>) {
      const state = String(row.state) as LifecycleState;
      if (!lifecycleStates.includes(state)) continue;
      const measuredAt = Number(row.measured_at);
      const value = Number(row.count);
      if (!Number.isFinite(measuredAt) || !Number.isFinite(value)) continue;
      const index = Math.floor((measuredAt - day0) / 86_400);
      if (index < 0 || index >= safeDays) continue;
      summary[state].trend[index] = { measuredAt: day0 + index * 86_400, value };
    }

    for (const state of lifecycleStates) {
      summary[state].total = summary[state].trend.reduce((sum, point) => sum + point.value, 0);
      summary[state].today = summary[state].trend.at(-1)?.value ?? 0;
    }

    return summary;
  } catch (error) {
    console.error("[dashboard] signal trend aggregation unavailable", String(error instanceof Error ? error.message : error));
    return null;
  }
}

export async function getSignalDeliverySummary(days = 7, now = Math.floor(Date.now() / 1000)): Promise<AlertDeliverySummary | null> {
  const { safeDays, day0 } = safeWindow(days, now);
  const databaseUrl = getPostgresUrl();
  if (!databaseUrl) return null;

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT
        s.state,
        (FLOOR(a.attempted_at / 86400.0) * 86400)::bigint AS measured_at,
        a.result,
        COALESCE(a.detail, '') AS detail,
        COUNT(*)::int AS count
      FROM fatedrop_signal_delivery_attempts a
      INNER JOIN fatedrop_signals s ON s.id = a.signal_id
      WHERE a.attempted_at >= ${day0}
        AND s.state IN ('whisper', 'echo', 'manifested', 'vanished')
      GROUP BY s.state, measured_at, a.result, a.detail
      ORDER BY measured_at ASC
    `;

    const summary = emptyDeliverySummary(day0, safeDays);
    for (const row of rows as Array<Record<string, unknown>>) {
      const state = String(row.state) as LifecycleState;
      if (!lifecycleStates.includes(state)) continue;
      const measuredAt = Number(row.measured_at);
      const value = Number(row.count);
      if (!Number.isFinite(measuredAt) || !Number.isFinite(value)) continue;
      const index = Math.floor((measuredAt - day0) / 86_400);
      if (index < 0 || index >= safeDays) continue;

      const result = String(row.result ?? "").toLowerCase();
      const detail = String(row.detail ?? "").toLowerCase();
      const point = summary[state].trend[index];
      if (result === "sent") point.sent += value;
      else if (result === "skipped" && detail === "disabled") point.policySkipped += value;
      else point.issues += value;
    }

    for (const state of lifecycleStates) {
      summary[state].sent = summary[state].trend.reduce((sum, point) => sum + point.sent, 0);
      summary[state].policySkipped = summary[state].trend.reduce((sum, point) => sum + point.policySkipped, 0);
      summary[state].issues = summary[state].trend.reduce((sum, point) => sum + point.issues, 0);
      summary[state].todaySent = summary[state].trend.at(-1)?.sent ?? 0;
    }

    return summary;
  } catch (error) {
    console.error("[dashboard] signal delivery aggregation unavailable", String(error instanceof Error ? error.message : error));
    return null;
  }
}
