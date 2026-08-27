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

type RemoteSignalHealth = {
  available: boolean;
  lifecycle: SignalLifecycleSummary;
  delivery: AlertDeliverySummary;
};

const lifecycleStates: LifecycleState[] = ["whisper", "echo", "manifested", "vanished"];
const defaultSignalEngineUrl = "https://fatedrop-cloud-production.up.railway.app";
const pendingRemoteHealth = new Map<number, Promise<RemoteSignalHealth | null>>();

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

function finite(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRemoteSignalHealth(payload: unknown): RemoteSignalHealth | null {
  if (!payload || typeof payload !== "object") return null;
  const source = payload as Record<string, unknown>;
  if (source.available !== true || !source.lifecycle || !source.delivery) return null;
  const lifecycleSource = source.lifecycle as Record<string, unknown>;
  const deliverySource = source.delivery as Record<string, unknown>;
  const lifecycle = {} as SignalLifecycleSummary;
  const delivery = {} as AlertDeliverySummary;

  for (const state of lifecycleStates) {
    const rawLifecycle = lifecycleSource[state] as Record<string, unknown> | undefined;
    const rawDelivery = deliverySource[state] as Record<string, unknown> | undefined;
    if (!rawLifecycle || !rawDelivery || !Array.isArray(rawLifecycle.trend) || !Array.isArray(rawDelivery.trend)) return null;
    const lifecycleTrend = rawLifecycle.trend.flatMap((point): SignalTrendPoint[] => {
      if (!point || typeof point !== "object") return [];
      const item = point as Record<string, unknown>;
      const measuredAt = finite(item.measuredAt);
      const value = finite(item.value);
      return measuredAt === null || value === null ? [] : [{ measuredAt, value }];
    });
    const deliveryTrend = rawDelivery.trend.flatMap((point): AlertDeliveryTrendPoint[] => {
      if (!point || typeof point !== "object") return [];
      const item = point as Record<string, unknown>;
      const measuredAt = finite(item.measuredAt);
      const sent = finite(item.sent);
      const policySkipped = finite(item.policySkipped);
      const issues = finite(item.issues);
      return measuredAt === null || sent === null || policySkipped === null || issues === null ? [] : [{ measuredAt, sent, policySkipped, issues }];
    });
    const total = finite(rawLifecycle.total);
    const today = finite(rawLifecycle.today);
    const sent = finite(rawDelivery.sent);
    const policySkipped = finite(rawDelivery.policySkipped);
    const issues = finite(rawDelivery.issues);
    const todaySent = finite(rawDelivery.todaySent);
    if ([total, today, sent, policySkipped, issues, todaySent].some((value) => value === null)) return null;
    lifecycle[state] = { total: total!, today: today!, trend: lifecycleTrend };
    delivery[state] = { sent: sent!, policySkipped: policySkipped!, issues: issues!, todaySent: todaySent!, trend: deliveryTrend };
  }
  return { available: true, lifecycle, delivery };
}

async function getRemoteSignalHealth(days: number): Promise<RemoteSignalHealth | null> {
  const safeDays = Math.min(30, Math.max(2, Math.trunc(days)));
  const existing = pendingRemoteHealth.get(safeDays);
  if (existing) return existing;
  const request = (async () => {
    try {
      const base = (process.env.FATEDROP_SIGNAL_ENGINE_URL || defaultSignalEngineUrl).replace(/\/$/, "");
      const apiToken = String(process.env.FATEDROP_SIGNAL_API_TOKEN || "").trim();
      if (!apiToken) return null;
      const headers = new Headers({ Accept: "application/json" });
      headers.set("Authorization", `Bearer ${apiToken}`);
      const response = await fetch(`${base}/api/signal-health?days=${safeDays}`, {
        cache: "no-store",
        headers,
        signal: AbortSignal.timeout(5_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return parseRemoteSignalHealth(await response.json());
    } catch (error) {
      console.warn("[dashboard] optional Signal Engine health fallback unavailable", String(error instanceof Error ? error.message : error));
      return null;
    }
  })();
  pendingRemoteHealth.set(safeDays, request);
  try {
    return await request;
  } finally {
    pendingRemoteHealth.delete(safeDays);
  }
}

export async function getSignalLifecycleSummary(days = 7, now = Math.floor(Date.now() / 1000)): Promise<SignalLifecycleSummary | null> {
  const { safeDays, day0 } = safeWindow(days, now);
  const databaseUrl = getPostgresUrl();

  if (databaseUrl) {
    try {
      const sql = neon(databaseUrl);
      const rows = await sql`
        SELECT
          s.state,
          (FLOOR(s.detected_at / 86400.0) * 86400)::bigint AS measured_at,
          COUNT(*)::int AS count
        FROM fatedrop_signals s
        WHERE s.detected_at >= ${day0}
          AND s.state IN ('whisper', 'echo', 'manifested', 'vanished')
          AND (
            s.state <> 'vanished'
            OR EXISTS (
              SELECT 1
              FROM fatedrop_signals m
              WHERE m.offer_id=s.offer_id
                AND m.state='manifested'
                AND m.detected_at < s.detected_at
                AND NOT EXISTS (
                  SELECT 1
                  FROM fatedrop_signals v
                  WHERE v.offer_id=s.offer_id
                    AND v.state='vanished'
                    AND v.detected_at > m.detected_at
                    AND v.detected_at < s.detected_at
                )
            )
          )
        GROUP BY s.state, measured_at
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
      console.error("[dashboard] direct signal trend aggregation unavailable", String(error instanceof Error ? error.message : error));
    }
  }

  return (await getRemoteSignalHealth(safeDays))?.lifecycle ?? null;
}

export async function getSignalDeliverySummary(days = 7, now = Math.floor(Date.now() / 1000)): Promise<AlertDeliverySummary | null> {
  const { safeDays, day0 } = safeWindow(days, now);
  const databaseUrl = getPostgresUrl();

  if (databaseUrl) {
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
          AND (
            s.state <> 'vanished'
            OR EXISTS (
              SELECT 1
              FROM fatedrop_signals m
              WHERE m.offer_id=s.offer_id
                AND m.state='manifested'
                AND m.detected_at < s.detected_at
                AND NOT EXISTS (
                  SELECT 1
                  FROM fatedrop_signals v
                  WHERE v.offer_id=s.offer_id
                    AND v.state='vanished'
                    AND v.detected_at > m.detected_at
                    AND v.detected_at < s.detected_at
                )
            )
          )
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
      console.error("[dashboard] direct signal delivery aggregation unavailable", String(error instanceof Error ? error.message : error));
    }
  }

  return (await getRemoteSignalHealth(safeDays))?.delivery ?? null;
}
