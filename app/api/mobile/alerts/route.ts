import { getSnapshotForRequest } from "@/lib/auth";
import { notificationPreferencesAllowAlert } from "@/lib/alert-preference-filter";
import { betaAccessDeniedResponse, betaAccessIsApproved } from "@/lib/beta-access";
import { listCanonicalAlerts, type CanonicalAlert } from "@/lib/canonical-alerts";
import { listCanonicalAlertDeliveries, type CanonicalAlertDelivery } from "@/lib/canonical-alert-delivery";
import { listCanonicalAlertPresentations, type CanonicalAlertPresentation } from "@/lib/canonical-alert-presentation";
import { hasCapability } from "@/lib/entitlements";
import { DEFAULT_NOTIFICATION_PREFERENCES, getNotificationPreferences } from "@/lib/notification-preferences";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CanonicalAlertForMobile = CanonicalAlert & {
  delivery: {
    discord: {
      status: CanonicalAlertDelivery["result"];
      attemptedAt: string;
      issue: string | null;
    } | null;
  };
  presentation: CanonicalAlertPresentation | null;
};

function freeAlert(alert: CanonicalAlertForMobile): CanonicalAlertForMobile {
  return {
    ...alert,
    presentation: null,
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
      body: `${alert.retailer} · ${alert.fateStage === "ECHO" ? "early signal" : alert.fateStage === "MANIFESTED" ? "confirmed availability" : alert.fateStage === "VANISHED" ? "availability lost" : alert.fateStage === "WHISPER" ? "network movement" : "network activity"}`,
      data: {
        ...alert.notification.data,
        verdict: "NO_FAIR_COMPARISON",
        lowestKnownUrl: null,
      },
    },
  };
}

function attachDiscordDelivery(
  alerts: CanonicalAlert[],
  deliveries: CanonicalAlertDelivery[],
  presentations: Map<string, CanonicalAlertPresentation>,
): CanonicalAlertForMobile[] {
  const bySignalId = new Map(deliveries.map((delivery) => [delivery.signalId, delivery]));
  return alerts.map((alert) => {
    const delivery = bySignalId.get(alert.id) ?? null;
    return {
      ...alert,
      presentation: presentations.get(alert.id) ?? null,
      delivery: {
        discord: delivery ? {
          status: delivery.result,
          attemptedAt: new Date(delivery.attemptedAt * 1000).toISOString(),
          issue: delivery.result === "sent" ? null : delivery.detail,
        } : null,
      },
    };
  });
}

export async function GET(request: Request) {
  const snapshot = await getSnapshotForRequest(request);
  if (!snapshot) {
    return Response.json(
      { error: "Authentication required." },
      { status: 401, headers: { "cache-control": "private, no-store" } },
    );
  }
  if (!betaAccessIsApproved(snapshot.betaAccess)) return betaAccessDeniedResponse(snapshot.betaAccess);

  try {
    const url = new URL(request.url);
    const requestedId = url.searchParams.get("id")?.trim() || null;
    const requestedLimit = Number.parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Math.max(1, Math.min(100, Number.isFinite(requestedLimit) ? requestedLimit : 50));
    const premium = hasCapability(snapshot.membership, "priority_alerts");

    // Cloud owns canonical lifecycle and product classification truth. Fetch extra
    // history for inbox depth, then apply only the user's notification preferences
    // at this gateway. Do not reclassify or discard canonical alerts from title text.
    const retrievalLimit = requestedId ? 1 : Math.min(100, Math.max(limit, limit * 3));
    const canonicalAlerts = await listCanonicalAlerts({ id: requestedId, limit: retrievalLimit });
    const [deliveries, presentations] = await Promise.all([
      listCanonicalAlertDeliveries({ id: requestedId, limit: Math.max(retrievalLimit, canonicalAlerts.length) }),
      listCanonicalAlertPresentations({ id: requestedId, limit: retrievalLimit }),
    ]);
    const preferences = await getNotificationPreferences(snapshot.account.id).catch(() => DEFAULT_NOTIFICATION_PREFERENCES);
    const alertsWithDelivery = attachDiscordDelivery(canonicalAlerts, deliveries, presentations)
      .filter((alert) => notificationPreferencesAllowAlert(alert, preferences))
      .slice(0, limit);
    const alerts = premium ? alertsWithDelivery : alertsWithDelivery.map(freeAlert);

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
