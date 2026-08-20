import { getSnapshotForRequest } from "@/lib/auth";
import { listCanonicalAlerts, type CanonicalAlert } from "@/lib/canonical-alerts";
import { hasCapability } from "@/lib/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function freeAlert(alert: CanonicalAlert): CanonicalAlert {
  return {
    ...alert,
    product: {
      ...alert.product,
      rrpPence: null,
    },
    priceIntelligence: {
      rrpPence: null,
      rrpDeltaPercent: null,
      comparisonBasis: alert.priceIntelligence.comparisonBasis,
      verdict: "NO_FAIR_COMPARISON",
      currentComparisonPence: null,
      lowestKnown: null,
      savingsPence: null,
      savingsPercent: null,
    },
    preparedLinks: {
      primary: alert.preparedLinks.primary,
      lowestKnown: null,
      officialReference: null,
      alternatives: [],
      compareQuery: alert.preparedLinks.compareQuery,
      fateFindQuery: alert.preparedLinks.fateFindQuery,
    },
    notification: {
      title: alert.notification.title,
      body: `${alert.retailer} · ${alert.fateStage === "ECHO" ? "early signal" : alert.fateStage === "MANIFESTED" ? "confirmed availability" : alert.fateStage === "VANISHED" ? "availability lost" : "network activity"}`,
      data: {
        ...alert.notification.data,
        verdict: "NO_FAIR_COMPARISON",
        lowestKnownUrl: null,
      },
    },
  };
}

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
    const premium = hasCapability(snapshot.membership, "priority_alerts");
    const canonicalAlerts = await listCanonicalAlerts({ id: requestedId, limit });
    const alerts = premium ? canonicalAlerts : canonicalAlerts.map(freeAlert);

    return Response.json({
      success: true,
      premium,
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
