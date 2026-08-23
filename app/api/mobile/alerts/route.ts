import { getSnapshotForRequest } from "@/lib/auth";
import { listCanonicalAlertDeliveries } from "@/lib/canonical-alert-delivery";
import { listCanonicalAlerts, type CanonicalAlert } from "@/lib/canonical-alerts";
import { hasCapability } from "@/lib/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CanonicalAlertWithDelivery = CanonicalAlert & {
  delivery: {
    discord: {
      status: "sent" | "failed" | "skipped";
      attemptedAt: string;
      issue: string | null;
    };
  };
};

function freeAlert(alert: CanonicalAlertWithDelivery): CanonicalAlertWithDelivery {
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

async function hydrateCanonicalAlerts(requestedId: string | null, limit: number) {
  const deliveries = await listCanonicalAlertDeliveries({ id: requestedId, limit });
  const alerts = await Promise.all(deliveries.map(async (delivery) => {
    const [alert] = await listCanonicalAlerts({ id: delivery.signalId, limit: 1 });
    if (!alert) return null;
    return {
      ...alert,
      delivery: {
        discord: {
          status: delivery.result,
          attemptedAt: new Date(delivery.attemptedAt * 1000).toISOString(),
          issue: delivery.result === "sent" ? null : delivery.detail,
        },
      },
    } satisfies CanonicalAlertWithDelivery;
  }));
  return alerts.filter((alert): alert is CanonicalAlertWithDelivery => Boolean(alert));
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
    const canonicalAlerts = await hydrateCanonicalAlerts(requestedId, limit);
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
