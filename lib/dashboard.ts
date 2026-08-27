import type { AccountSnapshot } from "./account-storage";
import { getCanonicalAlertDeliverySummary } from "./canonical-alert-delivery";
import { getCanonicalRecentSignals } from "./canonical-signals";
import { listDashboardActivity, getLatestNetworkMetricSnapshot, listNetworkMetricSnapshots, type DashboardActivityEvent, type NetworkSignal, type NetworkMetricSnapshot } from "./dashboard-storage";
import { getSignalDeliverySummary, getSignalLifecycleSummary } from "./signal-trends";

export type DashboardData = Awaited<ReturnType<typeof buildDashboardData>>;

function startOfUtcDay(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 1000;
}

export function publicSignalLabel(signal: NetworkSignal) {
  if (signal.state === "whisper") return "Whisper";
  if (signal.state === "echo") return "Echo";
  if (signal.state === "manifested") return "Manifested";
  if (signal.state === "vanished") return "Vanished";

  // Legacy fallback only. New canonical ledger reads always carry a lifecycle state.
  const kind = signal.kind ?? signal.state;
  if (kind === "whisper") return "Whisper";
  if (kind === "echo" || kind === "queue" || kind === "security") return "Echo";
  if (kind === "manifested") return "Manifested";
  if (kind === "vanished") return "Vanished";
  if (kind === "drop_pulse") return "Drop Pulse";
  if (kind === "price_change") return "Price change";
  if (kind === "launch_date_change") return "Launch change";
  return "Signal";
}

export function signalCauseLabel(signal: NetworkSignal) {
  const kind = String(signal.kind ?? "");
  if (kind === "catalogue_new") return "Catalogue new";
  if (kind === "catalogue_state_change") return "Catalogue change";
  if (kind === "price_change") return "Price change";
  if (kind === "launch_date_change") return "Launch change";
  if (kind === "queue") return "Queue";
  if (kind === "security") return "Security";
  if (kind === "access_blocked") return "Access control";
  if (kind === "new_listing_live") return "New listing live";
  if (kind === "availability_live") return "Availability live";
  if (kind === "restock") return "Restock";
  if (kind === "sold_out") return "Sold out";
  return null;
}

function signalBackedNetwork(network: NetworkMetricSnapshot | null, recentSignals: NetworkSignal[], now: number): NetworkMetricSnapshot | null {
  if (network) return { ...network, recentSignals };
  if (!recentSignals.length) return null;
  return {
    id: "canonical-signal-ledger",
    sourceEventId: "canonical-signal-ledger",
    source: "FateDrop signal ledger",
    measuredAt: recentSignals[0]?.occurredAt ?? now,
    recordedAt: now,
    metrics: {
      whisper: null,
      manifested: null,
      vanished: null,
      echo: null,
      changes24h: null,
      productsTracked: null,
      inStock: null,
      catalogueRetailers: null,
      healthyMonitors: null,
    },
    recentSignals,
    upcomingEvents: [],
  };
}

export async function buildDashboardData(snapshot: AccountSnapshot) {
  const [activity, storedNetwork, history, signalSummary, signalDeliverySummary, canonicalAlerts, recentSignals] = await Promise.all([
    listDashboardActivity(snapshot.account.id, 750),
    getLatestNetworkMetricSnapshot(),
    listNetworkMetricSnapshots(30),
    getSignalLifecycleSummary(7),
    getSignalDeliverySummary(7),
    getCanonicalAlertDeliverySummary(7).catch(() => null),
    getCanonicalRecentSignals(100).catch(() => []),
  ]);

  const stores = new Map<string, { name: string; count: number; latestAt: number }>();
  for (const event of activity.filter((item) => item.type === "store_tracked")) {
    const key = event.storeId || event.retailer || event.title;
    if (!key) continue;
    const current = stores.get(key);
    stores.set(key, {
      name: event.retailer || event.title || "Tracked store",
      count: (current?.count ?? 0) + 1,
      latestAt: Math.max(current?.latestAt ?? 0, event.occurredAt),
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const network = signalBackedNetwork(storedNetwork, recentSignals, now);
  const day0 = startOfUtcDay(now) - (29 * 86_400);
  const daily = Array.from({ length: 30 }, (_, index) => ({ timestamp: day0 + index * 86_400, value: 0 }));
  for (const event of activity) {
    if (event.type !== "signal_seen" && event.type !== "wishlist_hit") continue;
    const index = Math.floor((startOfUtcDay(event.occurredAt) - day0) / 86_400);
    if (index >= 0 && index < daily.length) daily[index].value += 1;
  }

  const signalsSeen = activity.filter((item) => item.type === "signal_seen").length;
  const wishlistHits = activity.filter((item) => item.type === "wishlist_hit").length;
  const savedPence = activity.filter((item) => item.type === "market_saving").reduce((sum, item) => sum + Math.max(0, item.amountPence ?? 0), 0);
  const favoriteStores = [...stores.values()].sort((a, b) => b.latestAt - a.latestAt).slice(0, 4);
  const watchlist = activity.filter((item) => item.type === "wishlist_hit").slice(0, 4);
  const personalRecent = activity.slice(0, 6);
  const confirmed = recentSignals.filter((signal) => signal.state === "manifested").slice(0, 4);
  const early = recentSignals.filter((signal) => signal.state === "whisper" || signal.state === "echo").slice(0, 4);

  const publishedBaseline = {
    productsTracked: storedNetwork?.metrics.productsTracked ?? null,
    inStock: storedNetwork?.metrics.inStock ?? null,
    catalogueRetailers: storedNetwork?.metrics.catalogueRetailers ?? null,
    healthyMonitors: storedNetwork?.metrics.healthyMonitors ?? null,
  };

  return {
    generatedAt: now,
    network,
    networkHistory: history,
    signalSummary,
    signalDeliverySummary,
    canonicalAlerts,
    publishedBaseline,
    publicSignalMetrics: {
      whisper: signalSummary?.whisper.total ?? null,
      echo: signalSummary?.echo.total ?? null,
      manifested: signalSummary?.manifested.total ?? null,
      vanished: signalSummary?.vanished.total ?? null,
    },
    personal: {
      signalsSeen,
      wishlistHits,
      storesTracked: stores.size,
      savedPence,
      daily,
      favoriteStores,
      watchlist,
      recent: personalRecent,
    },
    recentManifested: confirmed,
    echoWhispers: early,
    upcomingEvents: (storedNetwork?.upcomingEvents ?? []).filter((item) => item.startsAt >= now - 86_400).sort((a, b) => a.startsAt - b.startsAt).slice(0, 3),
    provenance: [
      {
        label: "Member since + network age",
        source: "FateDrop account record",
        updatedAt: snapshot.account.updatedAt,
        note: "Calculated from the immutable account creation timestamp.",
      },
      {
        label: "Plan + trial + billing status",
        source: snapshot.membership.stripeCustomerId ? "Stripe webhook → FateDrop membership" : "FateDrop membership record",
        updatedAt: snapshot.membership.updatedAt,
        note: "Stripe events are signature-verified and written idempotently before the dashboard consumes the membership state.",
      },
      {
        label: "Personal dashboard stats",
        source: "FateDrop activity ledger",
        updatedAt: activity[0]?.recordedAt ?? null,
        note: "Counts are derived from stored user events. No event means zero; the dashboard does not invent activity.",
      },
      {
        label: "Network lifecycle metrics",
        source: signalSummary ? "FateDrop signal ledger" : storedNetwork ? storedNetwork.source : "Awaiting FateDrop Cloud metric feed",
        updatedAt: signalSummary ? now : storedNetwork?.measuredAt ?? null,
        note: signalSummary ? "The four dashboard lifecycle totals are aggregated directly from persisted Whisper, Echo, Manifested and canonically valid Vanished signal rows over the last seven UTC days, including zero-activity days." : storedNetwork ? "Derived from the latest persisted network snapshot." : "Until a live feed is connected, lifecycle counters remain unavailable rather than falling back to invented values.",
      },
      {
        label: "Recent signal feed",
        source: recentSignals.length ? "FateDrop signal ledger" : "Signal ledger unavailable",
        updatedAt: recentSignals[0]?.occurredAt ?? null,
        note: recentSignals.length ? "Recent dashboard signals are read directly from canonical persisted signal rows; stale network snapshots are not used as the signal feed." : "Recent signals remain unavailable rather than falling back to stale snapshot data.",
      },
      {
        label: "Alert delivery health",
        source: signalDeliverySummary ? "FateDrop signal delivery ledger" : "Awaiting signal delivery telemetry",
        updatedAt: signalDeliverySummary ? now : null,
        note: signalDeliverySummary ? "Sent alerts, intentional policy suppression and delivery/configuration issues are aggregated separately from detections so the dashboard never confuses engine activity with successful alert delivery." : "Delivery health remains unavailable rather than being inferred from signal detections.",
      },
      {
        label: "Canonical alert totals",
        source: canonicalAlerts ? "FateDrop delivery ledger" : "Delivery ledger unavailable",
        updatedAt: canonicalAlerts?.daily.at(-1)?.day ? Math.floor(new Date(`${canonicalAlerts.daily.at(-1)!.day}T23:59:59Z`).getTime() / 1000) : null,
        note: canonicalAlerts ? "Counts only delivery-backed alert decisions: Discord sent, provider failures and real routing/configuration issues. Policy-disabled and duplicate-batch suppressions are excluded." : "Canonical alert totals remain unavailable rather than being inferred from raw detections.",
      },
    ],
  };
}

export function moneyFromPence(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value / 100);
}

export function relativeTime(timestamp: number, now = Math.floor(Date.now() / 1000)) {
  const seconds = Math.max(0, now - timestamp);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86_400)}d ago`;
}

export function signalLabel(signal: NetworkSignal) {
  const lifecycle = publicSignalLabel(signal);
  const cause = signalCauseLabel(signal);
  return cause ? `${lifecycle} · ${cause}` : lifecycle;
}

export function activityLabel(event: DashboardActivityEvent) {
  if (event.type === "wishlist_hit") return "FateMatch";
  if (event.type === "store_tracked") return "Store tracked";
  if (event.type === "market_saving") return "True Price saving";
  if (event.signalState === "whisper") return "Whisper";
  if (event.signalState === "echo") return "Echo";
  if (event.signalState === "manifested") return "Manifested";
  if (event.signalState === "vanished") return "Vanished";
  return "Signal seen";
}
