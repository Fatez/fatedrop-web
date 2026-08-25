import { getSnapshotForRequest } from "@/lib/auth";
import { getLatestNetworkMetricSnapshot } from "@/lib/dashboard-storage";
import { getSignalLifecycleSummary } from "@/lib/signal-trends";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const snapshot = await getSnapshotForRequest(request);
  if (!snapshot) {
    return Response.json(
      { error: "Authentication required." },
      { status: 401, headers: { "cache-control": "private, no-store" } },
    );
  }

  try {
    const [network, lifecycle] = await Promise.all([
      getLatestNetworkMetricSnapshot(),
      getSignalLifecycleSummary(7).catch(() => null),
    ]);

    const signals7d = lifecycle
      ? lifecycle.whisper.total + lifecycle.echo.total + lifecycle.manifested.total + lifecycle.vanished.total
      : null;

    return Response.json({
      success: true,
      measuredAt: network?.measuredAt ?? null,
      retailers: network?.metrics.catalogueRetailers ?? null,
      products: network?.metrics.productsTracked ?? null,
      inStock: network?.metrics.inStock ?? null,
      healthyMonitors: network?.metrics.healthyMonitors ?? null,
      signals7d,
    }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return Response.json(
      { error: "Live network pulse is temporarily unavailable." },
      { status: 503, headers: { "cache-control": "private, no-store" } },
    );
  }
}
