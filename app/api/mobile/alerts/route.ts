import { getSnapshotForRequest } from "@/lib/auth";
import { listCanonicalAlerts } from "@/lib/canonical-alerts";
import { hasCapability } from "@/lib/entitlements";

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
    const url = new URL(request.url);
    const requestedId = url.searchParams.get("id")?.trim() || null;
    const requestedLimit = Number.parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Math.max(1, Math.min(100, Number.isFinite(requestedLimit) ? requestedLimit : 50));
    const alerts = await listCanonicalAlerts({ id: requestedId, limit });

    return Response.json({
      success: true,
      premium: hasCapability(snapshot.membership, "priority_alerts"),
      count: alerts.length,
      alerts,
    }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return Response.json(
      { error: "Canonical alert history is temporarily unavailable." },
      { status: 503, headers: { "cache-control": "private, no-store" } },
    );
  }
}
