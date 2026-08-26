import { getSignalLifecycleSummary } from "@/lib/signal-trends";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedDays = Number.parseInt(url.searchParams.get("days") || "7", 10);
  const days = Math.max(2, Math.min(30, Number.isFinite(requestedDays) ? requestedDays : 7));
  const lifecycle = await getSignalLifecycleSummary(days);

  if (!lifecycle) {
    return Response.json(
      { available: false, lifecycle: null },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { available: true, lifecycle },
    {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=120",
      },
    },
  );
}
