import { getSnapshotForRequest } from "@/lib/auth";
import { notificationPreferencesAllowAlert } from "@/lib/alert-preference-filter";
import { betaAccessDeniedResponse, betaAccessIsApproved } from "@/lib/beta-access";
import { listCanonicalAlertWindow, type CanonicalAlert } from "@/lib/canonical-alerts";
import { hasCapability } from "@/lib/entitlements";
import type { CloudLifecycleState } from "@/lib/live-signals";
import { DEFAULT_NOTIFICATION_PREFERENCES, getNotificationPreferences } from "@/lib/notification-preferences";
import { normalizeSelectedTcgCodes, normalizeTcgAlertPreferences } from "@/lib/tcg-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CanonicalAlertForMobile = Omit<CanonicalAlert, "presentation"> & {
  presentation: CanonicalAlert["presentation"] | null;
};

const lifecycleStates = new Set<CloudLifecycleState>(["whisper", "echo", "manifested", "vanished"]);

function freeAlert(alert: CanonicalAlertForMobile): CanonicalAlertForMobile {
  return {
    ...alert,
    presentation: null,
    product: { ...alert.product, rrpPence: null },
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
      data: { ...alert.notification.data, verdict: "NO_FAIR_COMPARISON", lowestKnownUrl: null },
    },
  };
}

function requestedBoolean(value: string | null) {
  return ["1", "true", "yes"].includes((value || "").trim().toLowerCase());
}

export async function GET(request: Request) {
  const snapshot = await getSnapshotForRequest(request, { allowPending: true });
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401, headers: { "cache-control": "private, no-store" } });
  if (!betaAccessIsApproved(snapshot.betaAccess)) return betaAccessDeniedResponse(snapshot.betaAccess);

  try {
    const url = new URL(request.url);
    const requestedId = url.searchParams.get("id")?.trim() || null;
    const requestedStateRaw = url.searchParams.get("state")?.trim().toLowerCase() || null;
    if (requestedStateRaw && !lifecycleStates.has(requestedStateRaw as CloudLifecycleState)) {
      return Response.json({ error: "Invalid lifecycle state." }, { status: 400, headers: { "cache-control": "private, no-store" } });
    }
    const requestedState = requestedStateRaw as CloudLifecycleState | null;
    const currentOnly = requestedBoolean(url.searchParams.get("current"));
    const readBasis = requestedBoolean(url.searchParams.get("readBasis"));
    if (currentOnly && requestedState !== "manifested") {
      return Response.json({ error: "Current availability can only be requested for Manifested." }, { status: 400, headers: { "cache-control": "private, no-store" } });
    }

    const beforeRaw = Number.parseInt(url.searchParams.get("before") || "", 10);
    const requestedBefore = Number.isFinite(beforeRaw) && beforeRaw > 0 ? Math.trunc(beforeRaw) : null;
    const requestedBeforeId = url.searchParams.get("beforeId")?.trim() || null;
    const cursorRequested = requestedBefore !== null || requestedBeforeId !== null;
    if (cursorRequested && (!requestedState || requestedBefore === null || !requestedBeforeId || requestedId || currentOnly || readBasis)) {
      return Response.json({ error: "Alert history cursor requires one lifecycle state and both cursor fields." }, { status: 400, headers: { "cache-control": "private, no-store" } });
    }
    if (readBasis && (requestedId || requestedState || currentOnly)) {
      return Response.json({ error: "Read basis cannot be combined with a lifecycle or alert detail query." }, { status: 400, headers: { "cache-control": "private, no-store" } });
    }

    const requestedLimit = Number.parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Math.max(1, Math.min(100, Number.isFinite(requestedLimit) ? requestedLimit : 50));
    const premium = hasCapability(snapshot.membership, "priority_alerts");

    // Cloud owns canonical lifecycle and product classification truth. Stage filtering
    // is passed to Cloud before LIMIT so one lifecycle burst cannot starve another.
    // User notification preferences remain a downstream visibility filter only.
    const retrievalLimit = readBasis ? 100 : requestedId ? 1 : Math.min(100, Math.max(limit, limit * 3));
    const canonicalAlerts = requestedBefore && requestedBeforeId
      ? await listCanonicalAlertWindow({ id: requestedId, state: requestedState, currentOnly, limitPerStage: retrievalLimit, before: requestedBefore, beforeId: requestedBeforeId })
      : await listCanonicalAlertWindow({ id: requestedId, state: requestedState, currentOnly, limitPerStage: retrievalLimit });
    const preferences = await getNotificationPreferences(snapshot.account.id).catch(() => DEFAULT_NOTIFICATION_PREFERENCES);
    const selectedTcgCodes=normalizeSelectedTcgCodes(snapshot.account.selectedTcgCodes);
    const selectedTcgs=new Set(selectedTcgCodes);
    const tcgAlertPreferences=normalizeTcgAlertPreferences(snapshot.account.tcgAlertPreferences,selectedTcgCodes);
    const eligibleAlerts = canonicalAlerts
      .filter((alert)=>selectedTcgs.has(alert.tcgCode as typeof selectedTcgCodes[number]))
      .filter((alert)=>{const preference=tcgAlertPreferences[alert.tcgCode as typeof selectedTcgCodes[number]];return preference?.mode!=="custom"||preference[alert.fateStage.toLowerCase() as "whisper"|"echo"|"manifested"|"vanished"]!==false;})
      .filter((alert) => notificationPreferencesAllowAlert(alert, preferences));

    if (readBasis) {
      const alertReadBasis = eligibleAlerts.map((alert) => ({
        id: alert.id,
        tcgCode: alert.tcgCode,
        fateStage: alert.fateStage,
        detectedAt: alert.detectedAt,
      }));
      return Response.json({ success: true, readBasis: true, count: alertReadBasis.length, alerts: alertReadBasis }, { headers: { "cache-control": "private, no-store" } });
    }

    const windowAlerts = eligibleAlerts.slice(0, limit);
    const hasMore = Boolean(requestedState && !requestedId && !currentOnly && (eligibleAlerts.length > limit || canonicalAlerts.length >= retrievalLimit));
    const lastAlert = windowAlerts.at(-1) ?? null;
    const lastDetectedAt = lastAlert ? Math.floor(Date.parse(lastAlert.detectedAt) / 1000) : Number.NaN;
    const nextCursor = hasMore && lastAlert && Number.isFinite(lastDetectedAt)
      ? { before: lastDetectedAt, beforeId: lastAlert.id }
      : null;
    const alerts = premium ? windowAlerts : windowAlerts.map(freeAlert);

    return Response.json({ success: true, premium, state: requestedState, currentOnly, count: alerts.length, nextCursor, alerts }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Canonical alert history is temporarily unavailable." }, { status: 503, headers: { "cache-control": "private, no-store" } });
  }
}
