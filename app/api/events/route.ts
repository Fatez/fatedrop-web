import { getLatestNetworkMetricSnapshot } from "@/lib/dashboard-storage";
import { serverNowSeconds } from "@/lib/server-time";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const snapshot = await getLatestNetworkMetricSnapshot();
  const now = serverNowSeconds();
  const events = (snapshot?.upcomingEvents ?? [])
    .filter((event) => event.startsAt >= now - 86_400)
    .sort((a, b) => a.startsAt - b.startsAt);

  return Response.json({
    success: true,
    source: snapshot?.source ?? null,
    measuredAt: snapshot?.measuredAt ?? null,
    count: events.length,
    events,
    status: snapshot ? "network" : "awaiting-network-feed",
  }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
