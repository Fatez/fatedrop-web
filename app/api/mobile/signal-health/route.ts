import { getCanonicalSignalTrend, type CanonicalTrendState } from "@/lib/canonical-alert-trends";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const lifecycleStates: CanonicalTrendState[] = ["whisper", "echo", "manifested", "vanished"];

function dayToEpoch(day: string) {
  return Math.floor(new Date(`${day}T00:00:00.000Z`).getTime() / 1000);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedDays = Number.parseInt(url.searchParams.get("days") || "7", 10);
  const days = Math.max(2, Math.min(30, Number.isFinite(requestedDays) ? requestedDays : 7));

  try {
    const canonical = await getCanonicalSignalTrend(days);
    const lifecycle = Object.fromEntries(lifecycleStates.map((state) => {
      const stage = canonical.byState[state];
      return [state, {
        total: stage.total,
        today: stage.points.at(-1)?.count ?? 0,
        trend: stage.points.map((point) => ({ measuredAt: dayToEpoch(point.day), value: point.count })),
      }];
    }));

    return Response.json(
      { available: true, lifecycle },
      {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("[mobile-signal-health] canonical lifecycle unavailable", String(error instanceof Error ? error.message : error));
    return Response.json(
      { available: false, lifecycle: null },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
