import type { NeonQueryFunction } from "@neondatabase/serverless";

export type RetailerHandoffInsight = {
  storeId: string;
  retailer: string;
  handoffs: number;
  lastHandoffAt: number;
};

type FileActivity = {
  event_type?: unknown;
  eventType?: unknown;
  retailer?: unknown;
  store_id?: unknown;
  storeId?: unknown;
  occurred_at?: unknown;
  occurredAt?: unknown;
};

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
        ? [{ storeId, retailer, handoffs: Math.max(0, Math.floor(handoffs)), lastHandoffAt: Math.floor(lastHandoffAt) }]
        : [];
    });
  }

  if (mode === "file") return fileInsights(since, limit);
  return [];
}

async function fileInsights(since: number, limit: number) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const file = process.env.FATEDROP_METRIC_FILE ?? process.env.FATEDROP_ACCOUNT_FILE ?? path.join(process.cwd(), "data", "fatedrop-dashboard.json");
  let parsed: { activity?: FileActivity[] } = {};
  try { parsed = JSON.parse(await fs.readFile(file, "utf8")) as { activity?: FileActivity[] }; }
  catch { return []; }

  const grouped = new Map<string, RetailerHandoffInsight>();
  for (const item of parsed.activity ?? []) {
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
      lastHandoffAt: Math.max(current?.lastHandoffAt ?? 0, Math.floor(occurredAt)),
    });
  }

  return [...grouped.values()]
    .sort((a, b) => b.handoffs - a.handoffs || b.lastHandoffAt - a.lastHandoffAt)
    .slice(0, limit);
}

async function postgres(): Promise<NeonQueryFunction<false, false>> {
  const [{ neon }, { getPostgresUrl }] = await Promise.all([import("@neondatabase/serverless"), import("./postgres-url")]);
  const url = getPostgresUrl();
  if (!url) throw new Error("Retailer insights requested but no Postgres URL is configured.");
  return neon(url);
}
