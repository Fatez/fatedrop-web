import type { AccountSnapshot } from "./account-storage";
import { listDashboardActivity, getLatestNetworkMetricSnapshot, listNetworkMetricSnapshots, type DashboardActivityEvent, type NetworkSignal } from "./dashboard-storage";
import { siteConfig } from "./site-data";

export type DashboardData = Awaited<ReturnType<typeof buildDashboardData>>;

function startOfUtcDay(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 1000;
}

export async function buildDashboardData(snapshot: AccountSnapshot) {
  const [activity, network, history] = await Promise.all([
    listDashboardActivity(snapshot.account.id, 750),
    getLatestNetworkMetricSnapshot(),
    listNetworkMetricSnapshots(30),
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
  const manifested = (network?.recentSignals ?? []).filter((signal) => signal.state === "manifested").slice(0, 4);
  const whispers = (network?.recentSignals ?? []).filter((signal) => signal.state === "whisper" || signal.state === "echo").slice(0, 4);

  const publishedBaseline = {
    productsTracked: Number(siteConfig.snapshot[0].value.replace(/,/g, "")),
    inStock: Number(siteConfig.snapshot[1].value.replace(/,/g, "")),
    catalogueRetailers: Number(siteConfig.snapshot[2].value),
    healthyMonitors: Number(siteConfig.snapshot[3].value),
  };

  return {
    generatedAt: now,
    network,
    networkHistory: history,
    publishedBaseline,
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
    recentManifested: manifested,
    echoWhispers: whispers,
    upcomingEvents: (network?.upcomingEvents ?? []).filter((item) => item.startsAt >= now - 86_400).sort((a, b) => a.startsAt - b.startsAt).slice(0, 3),
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
        source: network ? network.source : "Awaiting FateDrop Cloud metric feed",
        updatedAt: network?.measuredAt ?? null,
        note: network ? "Derived from the latest persisted network snapshot." : "Until a live feed is connected, lifecycle counters remain unavailable and the published beta catalogue snapshot is shown separately.",
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
  return signal.state.charAt(0).toUpperCase() + signal.state.slice(1);
}

export function activityLabel(event: DashboardActivityEvent) {
  if (event.type === "wishlist_hit") return "Wishlist hit";
  if (event.type === "store_tracked") return "Store tracked";
  if (event.type === "market_saving") return "True Price saving";
  return event.signalState ? event.signalState.charAt(0).toUpperCase() + event.signalState.slice(1) : "Signal seen";
}
