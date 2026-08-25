import { fateDropPostgres } from "@/lib/postgres";
import type { RetailerRecord } from "@/lib/retailer-registry";

export type RetailerDemandInsight = {
  productIdentityId: string;
  title: string;
  activeFateMatches: number;
  onlineDemand: number;
  localDemand: number;
  underRrpOrBetter: number;
  upToFivePercentAboveRrp: number;
  upToTenPercentAboveRrp: number;
  aboveTenPercentAboveRrp: number;
  unspecifiedPriceTolerance: number;
  retailerStockKnown: boolean;
  retailerCurrentlyStocksIdentity: boolean | null;
};

export async function listAnonymousRetailerDemand(retailer: RetailerRecord, limit = 10): Promise<RetailerDemandInsight[]> {
  const sql = await fateDropPostgres();
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 25);
  const retailerIds = [retailer.id, retailer.cloudRetailerId].filter((value): value is string => Boolean(value));
  const primaryRetailerId = retailerIds[0] ?? retailer.id;
  const alternateRetailerId = retailerIds[1] ?? primaryRetailerId;

  const retailerRows = await sql`
    SELECT id FROM fatedrop_retailers
    WHERE id=${primaryRetailerId} OR id=${alternateRetailerId}
    LIMIT 1
  `;
  const retailerStockKnown = Boolean(retailerRows[0]);

  const rows = await sql`
    SELECT
      m.product_identity_id,
      COALESCE(MAX(p.title), MAX(NULLIF(m.query_text, '')), m.product_identity_id) AS product_title,
      COUNT(*)::int AS demand_count,
      COUNT(*) FILTER (WHERE m.scope IN ('online','either'))::int AS online_demand,
      COUNT(*) FILTER (WHERE m.scope IN ('local','either'))::int AS local_demand,
      COUNT(*) FILTER (WHERE m.max_percent_above_rrp IS NOT NULL AND m.max_percent_above_rrp <= 0)::int AS under_rrp,
      COUNT(*) FILTER (WHERE m.max_percent_above_rrp > 0 AND m.max_percent_above_rrp <= 5)::int AS up_to_five,
      COUNT(*) FILTER (WHERE m.max_percent_above_rrp > 5 AND m.max_percent_above_rrp <= 10)::int AS up_to_ten,
      COUNT(*) FILTER (WHERE m.max_percent_above_rrp > 10)::int AS above_ten,
      COUNT(*) FILTER (WHERE m.max_percent_above_rrp IS NULL)::int AS unspecified,
      EXISTS (
        SELECT 1 FROM fatedrop_offers o
        WHERE o.product_identity_id=m.product_identity_id
          AND (o.retailer_id=${primaryRetailerId} OR o.retailer_id=${alternateRetailerId})
          AND o.stock_state IN ('in_stock','low_stock','preorder')
      ) AS currently_stocked
    FROM fatedrop_fate_matches m
    LEFT JOIN fatedrop_product_identities p ON p.id=m.product_identity_id
    WHERE m.enabled=true AND m.product_identity_id IS NOT NULL
    GROUP BY m.product_identity_id
    ORDER BY COUNT(*) DESC, MAX(m.updated_at) DESC
    LIMIT ${safeLimit}
  `;

  return rows.map((row) => {
    const record = row as Record<string, unknown>;
    return {
      productIdentityId: String(record.product_identity_id),
      title: String(record.product_title ?? record.product_identity_id),
      activeFateMatches: Number(record.demand_count) || 0,
      onlineDemand: Number(record.online_demand) || 0,
      localDemand: Number(record.local_demand) || 0,
      underRrpOrBetter: Number(record.under_rrp) || 0,
      upToFivePercentAboveRrp: Number(record.up_to_five) || 0,
      upToTenPercentAboveRrp: Number(record.up_to_ten) || 0,
      aboveTenPercentAboveRrp: Number(record.above_ten) || 0,
      unspecifiedPriceTolerance: Number(record.unspecified) || 0,
      retailerStockKnown,
      retailerCurrentlyStocksIdentity: retailerStockKnown ? Boolean(record.currently_stocked) : null,
    };
  });
}
