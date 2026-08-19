import { getLatestNetworkMetricSnapshot } from "@/lib/dashboard-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getLatestNetworkMetricSnapshot();
    if (!snapshot) {
      return Response.json(
        { available: false, measuredAt: null, source: null, metrics: null },
        { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=120" } },
      );
    }

    return Response.json(
      {
        available: true,
        measuredAt: snapshot.measuredAt,
        source: snapshot.source,
        metrics: {
          productsTracked: snapshot.metrics.productsTracked,
          inStock: snapshot.metrics.inStock,
          catalogueRetailers: snapshot.metrics.catalogueRetailers,
          healthyMonitors: snapshot.metrics.healthyMonitors,
        },
      },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=120" } },
    );
  } catch {
    return Response.json(
      { available: false, measuredAt: null, source: null, metrics: null },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
