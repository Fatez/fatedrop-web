import type { NeonQueryFunction } from "@neondatabase/serverless";
import type { RetailerRecord } from "@/lib/retailer-registry";
import { retailerStoreKey } from "@/lib/retailer-access";

export type RetailerHandoffInsight = {
  storeId: string;
  retailer: string;
  handoffs: number;
  lastHandoffDay: string;
};

export type RetailerValueMetrics = {
  productAppearances: number;
  searchAppearances: number;
  fateFindAppearances: number;
  bestValueWins: number;
  outboundClicks: number;
  storefrontViews: number;
  fateMatchHandoffs: number;
};

export type RetailerTopProduct = {
  title: string;
  appearances: number;
  searchAppearances: number;
  fateFindAppearances: number;
  bestValueWins: number;
  outboundClicks: number;
  fateMatchHandoffs: number;
};

export type RetailerDailyValue = {
  day: string;
  appearances: number;
  outboundClicks: number;
  fateMatchHandoffs: number;
};

export type RetailerValueDashboard = {
  retailerId: string;
  retailer: string;
  storeId: string;
  windowDays: number;
  metrics: RetailerValueMetrics;
  topProducts: RetailerTopProduct[];
  trend: RetailerDailyValue[];
  lastActivityDay: string | null;
  definition: string;
};

type FileActivity = {
  event_type?: unknown;
  eventType?: unknown;
  retailer?: unknown;
  store_id?: unknown;
  storeId?: unknown;
  title?: unknown;
  occurred_at?: unknown;
  occurredAt?: unknown;
};

type FileAggregate = {
  storeId: string;
  retailer: string;
  handoffs: number;
  lastSeenAt: number;
};

type ValueRow = {
  eventType: string;
  title: string | null;
  occurredAt: number;
};

const VALUE_EVENT_TYPES = new Set([
  "store_tracked",
  "search_appearance",
  "fatefind_appearance",
  "fatefind_best_value",
  "storefront_view",
  "fatematch_handoff",
]);

function storageMode() {
  return process.env.FATEDROP_METRIC_STORE ?? process.env.FATEDROP_ACCOUNT_STORE ?? (process.env.NODE_ENV === "development" ? "file" : "disabled");
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function dayBucket(epochSeconds: number) {
  const day = Math.floor(epochSeconds / 86_400) * 86_400;
  return new Date(day * 1000).toISOString().slice(0, 10);
}

function emptyMetrics(): RetailerValueMetrics {
  return { productAppearances: 0, searchAppearances: 0, fateFindAppearances: 0, bestValueWins: 0, outboundClicks: 0, storefrontViews: 0, fateMatchHandoffs: 0 };
}

function aggregateValueRows(retailer: RetailerRecord, rows: ValueRow[], days: number): RetailerValueDashboard {
  const metrics = emptyMetrics();
  const productMap = new Map<string, RetailerTopProduct>();
  const dayMap = new Map<string, RetailerDailyValue>();
  let lastActivityAt = 0;

  for (const row of rows) {
    if (!VALUE_EVENT_TYPES.has(row.eventType)) continue;
    lastActivityAt = Math.max(lastActivityAt, row.occurredAt);
    const isAppearance = row.eventType === "search_appearance" || row.eventType === "fatefind_appearance";
    if (isAppearance) metrics.productAppearances += 1;
    if (row.eventType === "search_appearance") metrics.searchAppearances += 1;
    if (row.eventType === "fatefind_appearance") metrics.fateFindAppearances += 1;
    if (row.eventType === "fatefind_best_value") metrics.bestValueWins += 1;
    if (row.eventType === "store_tracked") metrics.outboundClicks += 1;
    if (row.eventType === "storefront_view") metrics.storefrontViews += 1;
    if (row.eventType === "fatematch_handoff") metrics.fateMatchHandoffs += 1;

    const day = dayBucket(row.occurredAt);
    const point = dayMap.get(day) ?? { day, appearances: 0, outboundClicks: 0, fateMatchHandoffs: 0 };
    if (isAppearance) point.appearances += 1;
    if (row.eventType === "store_tracked") point.outboundClicks += 1;
    if (row.eventType === "fatematch_handoff") point.fateMatchHandoffs += 1;
    dayMap.set(day, point);

    if (!row.title || row.eventType === "storefront_view") continue;
    const product = productMap.get(row.title) ?? { title: row.title, appearances: 0, searchAppearances: 0, fateFindAppearances: 0, bestValueWins: 0, outboundClicks: 0, fateMatchHandoffs: 0 };
    if (isAppearance) product.appearances += 1;
    if (row.eventType === "search_appearance") product.searchAppearances += 1;
    if (row.eventType === "fatefind_appearance") product.fateFindAppearances += 1;
    if (row.eventType === "fatefind_best_value") product.bestValueWins += 1;
    if (row.eventType === "store_tracked") product.outboundClicks += 1;
    if (row.eventType === "fatematch_handoff") product.fateMatchHandoffs += 1;
    productMap.set(row.title, product);
  }

  const topProducts = [...productMap.values()]
    .sort((a, b) => (b.outboundClicks + b.fateMatchHandoffs * 2 + b.bestValueWins * 2 + b.appearances) - (a.outboundClicks + a.fateMatchHandoffs * 2 + a.bestValueWins * 2 + a.appearances))
    .slice(0, 10);

  return {
    retailerId: retailer.id,
    retailer: retailer.name,
    storeId: retailerStoreKey(retailer),
    windowDays: days,
    metrics,
    topProducts,
    trend: [...dayMap.values()].sort((a, b) => a.day.localeCompare(b.day)),
    lastActivityDay: lastActivityAt ? dayBucket(lastActivityAt) : null,
    definition: "FateDrop measures network visibility and retailer handoffs. A retailer visit means FateDrop opened the retailer destination; it does not mean a purchase was completed.",
  };
}

export async function getRetailerValueDashboard(retailer: RetailerRecord, options: { days?: number } = {}): Promise<RetailerValueDashboard> {
  const days = Math.min(Math.max(Math.floor(options.days ?? 30), 1), 90);
  const since = Math.floor(Date.now() / 1000) - (days * 86_400);
  const mode = storageMode();
  const storeKey = retailerStoreKey(retailer);
  const wwwStoreKey = `www.${storeKey}`;

  if (mode === "postgres") {
    const sql = await postgres();
    const rows = await sql`
      SELECT event_type, title, occurred_at
      FROM fatedrop_activity_events
      WHERE occurred_at >= ${since}
        AND (store_id = ${storeKey} OR store_id = ${wwwStoreKey} OR retailer = ${retailer.name})
        AND event_type IN ('store_tracked','search_appearance','fatefind_appearance','fatefind_best_value','storefront_view','fatematch_handoff')
      ORDER BY occurred_at DESC
      LIMIT 10000
    `;
    return aggregateValueRows(retailer, rows.flatMap((row) => {
      const record = row as Record<string, unknown>;
      const eventType = text(record.event_type);
      const occurredAt = number(record.occurred_at);
      return eventType && occurredAt !== null ? [{ eventType, title: text(record.title), occurredAt }] : [];
    }), days);
  }

  if (mode === "file") {
    const activity = await fileActivity();
    const rows = activity.flatMap((item) => {
      const eventType = text(item.eventType ?? item.event_type);
      const occurredAt = number(item.occurredAt ?? item.occurred_at);
      const itemStore = text(item.storeId ?? item.store_id)?.toLowerCase().replace(/^www\./, "") ?? null;
      const itemRetailer = text(item.retailer);
      if (!eventType || occurredAt === null || occurredAt < since || (itemStore !== storeKey && itemRetailer !== retailer.name)) return [];
      return [{ eventType, title: text(item.title), occurredAt }];
    });
    return aggregateValueRows(retailer, rows, days);
  }

  return aggregateValueRows(retailer, [], days);
}

export async function listRetailerHandoffInsights(options: { days?: number; limit?: number } = {}): Promise<RetailerHandoffInsight[]> {
  const days = Math.min(Math.max(Math.floor(options.days ?? 30), 1), 90);
  const limit = Math.min(Math.max(Math.floor(options.limit ?? 50), 1), 100);
  const since = Math.floor(Date.now() / 1000) - (days * 86_400);
  const mode = storageMode();

  if (mode === "postgres") {
    const sql = await postgres();
    const rows = await sql`
      SELECT
        COALESCE(NULLIF(store_id, ''), NULLIF(retailer, '')) AS store_key,
        COALESCE(MAX(NULLIF(retailer, '')), COALESCE(NULLIF(store_id, ''), NULLIF(retailer, ''))) AS retailer_name,
        COUNT(*)::int AS handoffs,
        MAX(occurred_at)::bigint AS last_handoff_at
      FROM fatedrop_activity_events
      WHERE event_type = 'store_tracked'
        AND occurred_at >= ${since}
        AND (NULLIF(store_id, '') IS NOT NULL OR NULLIF(retailer, '') IS NOT NULL)
      GROUP BY COALESCE(NULLIF(store_id, ''), NULLIF(retailer, ''))
      ORDER BY COUNT(*) DESC, MAX(occurred_at) DESC
      LIMIT ${limit}
    `;
    return rows.flatMap((row) => {
      const record = row as Record<string, unknown>;
      const storeId = text(record.store_key);
      const retailer = text(record.retailer_name);
      const handoffs = number(record.handoffs);
      const lastHandoffAt = number(record.last_handoff_at);
      return storeId && retailer && handoffs !== null && lastHandoffAt !== null
        ? [{ storeId, retailer, handoffs: Math.max(0, Math.floor(handoffs)), lastHandoffDay: dayBucket(lastHandoffAt) }]
        : [];
    });
  }

  if (mode === "file") return fileInsights(since, limit);
  return [];
}

async function fileActivity() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const file = process.env.FATEDROP_METRIC_FILE ?? process.env.FATEDROP_ACCOUNT_FILE ?? path.join(process.cwd(), "data", "fatedrop-dashboard.json");
  let parsed: { activity?: FileActivity[] } = {};
  try { parsed = JSON.parse(await fs.readFile(file, "utf8")) as { activity?: FileActivity[] }; }
  catch { return []; }
  return parsed.activity ?? [];
}

async function fileInsights(since: number, limit: number) {
  const grouped = new Map<string, FileAggregate>();
  for (const item of await fileActivity()) {
    const eventType = text(item.eventType ?? item.event_type);
    const occurredAt = number(item.occurredAt ?? item.occurred_at);
    if (eventType !== "store_tracked" || occurredAt === null || occurredAt < since) continue;
    const retailer = text(item.retailer);
    const storeId = text(item.storeId ?? item.store_id) ?? retailer;
    if (!storeId || !retailer) continue;
    const current = grouped.get(storeId);
    grouped.set(storeId, {
      storeId,
      retailer,
      handoffs: (current?.handoffs ?? 0) + 1,
      lastSeenAt: Math.max(current?.lastSeenAt ?? 0, Math.floor(occurredAt)),
    });
  }

  return [...grouped.values()]
    .sort((a, b) => b.handoffs - a.handoffs || b.lastSeenAt - a.lastSeenAt)
    .slice(0, limit)
    .map(({ storeId, retailer, handoffs, lastSeenAt }) => ({ storeId, retailer, handoffs, lastHandoffDay: dayBucket(lastSeenAt) }));
}

async function postgres(): Promise<NeonQueryFunction<false, false>> {
  const [{ neon }, { getPostgresUrl }] = await Promise.all([import("@neondatabase/serverless"), import("./postgres-url")]);
  const url = getPostgresUrl();
  if (!url) throw new Error("Retailer insights requested but no Postgres URL is configured.");
  return neon(url);
}
