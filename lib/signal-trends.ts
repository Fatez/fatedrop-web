import { getLiveCloudSignalSummary } from "./live-signals";

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

type RemoteSignalSummary = {
  available: boolean;
  lifecycle: SignalLifecycleSummary;
  delivery: AlertDeliverySummary;
};

const lifecycleStates: LifecycleState[] = ["whisper", "echo", "manifested", "vanished"];
const pendingRemoteSummary = new Map<number, Promise<RemoteSignalSummary | null>>();

function finite(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRemoteSignalSummary(payload: unknown): RemoteSignalSummary | null {
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
      return measuredAt === null || sent === null || policySkipped === null || issues === null
        ? []
        : [{ measuredAt, sent, policySkipped, issues }];
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

async function getRemoteSignalSummary(days: number): Promise<RemoteSignalSummary | null> {
  const safeDays = Math.min(30, Math.max(2, Math.trunc(days)));
  const existing = pendingRemoteSummary.get(safeDays);
  if (existing) return existing;

  const request = getLiveCloudSignalSummary(safeDays)
    .then((payload) => parseRemoteSignalSummary(payload))
    .catch(() => null);

  pendingRemoteSummary.set(safeDays, request);
  try {
    return await request;
  } finally {
    pendingRemoteSummary.delete(safeDays);
  }
}

export async function getSignalLifecycleSummary(days = 7, now = Math.floor(Date.now() / 1000)): Promise<SignalLifecycleSummary | null> {
  void now;
  return (await getRemoteSignalSummary(days))?.lifecycle ?? null;
}

export async function getSignalDeliverySummary(days = 7, now = Math.floor(Date.now() / 1000)): Promise<AlertDeliverySummary | null> {
  void now;
  return (await getRemoteSignalSummary(days))?.delivery ?? null;
}
