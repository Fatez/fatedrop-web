import { fateDropPostgres } from "@/lib/postgres";

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

function utcDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function labelForDay(day: string) {
  const date = new Date(`${day}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function emptyStage(state: CanonicalTrendState, days: string[]): CanonicalStageTrend {
  return {
    state,
    total: 0,
    points: days.map((day) => ({ day, label: labelForDay(day), count: 0 })),
  };
}

export async function getCanonicalSignalTrend(days = 7): Promise<CanonicalSignalTrend> {
  const sql = await fateDropPostgres();
  const safeDays = Math.max(2, Math.min(30, Math.floor(days)));
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayKeys = Array.from({ length: safeDays }, (_, index) => {
    const date = new Date(todayUtc);
    date.setUTCDate(todayUtc.getUTCDate() - (safeDays - 1 - index));
    return utcDayKey(date);
  });
  const cutoff = Math.floor(new Date(`${dayKeys[0]}T00:00:00.000Z`).getTime() / 1000);

  const rows = await sql`
    SELECT
      state,
      to_char(to_timestamp(detected_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
      COUNT(*)::int AS count
    FROM fatedrop_signals
    WHERE detected_at >= ${cutoff}
      AND state IN ('whisper','echo','manifested','vanished')
    GROUP BY state,day
    ORDER BY day ASC`;

  const byState: CanonicalSignalTrend["byState"] = {
    whisper: emptyStage("whisper", dayKeys),
    echo: emptyStage("echo", dayKeys),
    manifested: emptyStage("manifested", dayKeys),
    vanished: emptyStage("vanished", dayKeys),
  };

  const pointIndex = new Map<string, CanonicalTrendPoint>();
  for (const state of STATES) {
    for (const point of byState[state].points) pointIndex.set(`${state}:${point.day}`, point);
  }

  for (const row of rows) {
    const state = String(row.state) as CanonicalTrendState;
    const day = String(row.day);
    const count = Number(row.count);
    if (!STATES.includes(state) || !Number.isFinite(count) || count < 0) continue;
    const point = pointIndex.get(`${state}:${day}`);
    if (!point) continue;
    point.count = count;
    byState[state].total += count;
  }

  return {
    days: safeDays,
    from: dayKeys[0],
    to: dayKeys[dayKeys.length - 1],
    byState,
  };
}
