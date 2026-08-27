import { getLiveCloudSignalSummary } from "@/lib/live-signals";

export type CanonicalTrendState = "whisper" | "echo" | "manifested" | "vanished";

export type CanonicalTrendPoint = {
  day: string;
  label: string;
  count: number;
};

export type CanonicalStageTrend = {
  state: CanonicalTrendState;
  total: number;
  points: CanonicalTrendPoint[];
};

export type CanonicalSignalTrend = {
  days: number;
  from: string;
  to: string;
  byState: Record<CanonicalTrendState, CanonicalStageTrend>;
};

const STATES: CanonicalTrendState[] = ["whisper", "echo", "manifested", "vanished"];

function utcDayKey(epochSeconds: number) {
  return new Date(epochSeconds * 1000).toISOString().slice(0, 10);
}

function labelForDay(day: string) {
  const date = new Date(`${day}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export async function getCanonicalSignalTrend(days = 7): Promise<CanonicalSignalTrend> {
  const safeDays = Math.max(2, Math.min(30, Math.floor(days)));
  const response = await getLiveCloudSignalSummary(safeDays);
  if (!response?.success || response.available !== true || response.source !== "FATEDROP_CLOUD" || !response.lifecycle) {
    throw new Error("Canonical Cloud signal trend unavailable");
  }

  const byState = {} as CanonicalSignalTrend["byState"];
  for (const state of STATES) {
    const stage = response.lifecycle[state];
    if (!stage || !Array.isArray(stage.trend)) throw new Error(`Canonical Cloud ${state} trend unavailable`);
    const points = stage.trend.flatMap((point): CanonicalTrendPoint[] => {
      const measuredAt = Number(point.measuredAt);
      const count = Number(point.value);
      if (!Number.isFinite(measuredAt) || measuredAt <= 0 || !Number.isFinite(count) || count < 0) return [];
      const day = utcDayKey(measuredAt);
      return [{ day, label: labelForDay(day), count }];
    });
    byState[state] = {
      state,
      total: Number.isFinite(Number(stage.total)) ? Number(stage.total) : points.reduce((sum, point) => sum + point.count, 0),
      points,
    };
  }

  const allPoints = STATES.flatMap((state) => byState[state].points);
  if (!allPoints.length) throw new Error("Canonical Cloud signal trend contains no points");
  const orderedDays = [...new Set(allPoints.map((point) => point.day))].sort();

  return {
    days: safeDays,
    from: orderedDays[0],
    to: orderedDays[orderedDays.length - 1],
    byState,
  };
}
