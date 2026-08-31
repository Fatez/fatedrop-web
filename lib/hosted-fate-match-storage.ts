import { fateDropPostgres } from "@/lib/postgres";

export type HostedFateMatch = {
  id: string;
  tcgCode: string;
  fateFindId: string;
  userId: string;
  offerId: string;
  productId: string;
  retailerId: string;
  retailerName: string;
  title: string;
  url: string;
  itemPricePence: number | null;
  postagePence: number | null;
  deliveredPricePence: number | null;
  rrpPence: number | null;
  percentAboveRrp: number | null;
  stockStatus: string;
  reasons: string[];
  matchedAt: number;
  lastObservedAt: number;
};

export async function listHostedFateMatches(userId: string, limit = 100): Promise<HostedFateMatch[]> {
  const sql = await fateDropPostgres();
  const safeLimit = Math.min(250, Math.max(1, limit));
  const rows = await sql`
    SELECT * FROM fatedrop_hosted_fate_matches
    WHERE user_id=${userId}
    ORDER BY matched_at DESC
    LIMIT ${safeLimit}
  ` as unknown as Record<string, unknown>[];
  return rows.map((row) => ({
    id: String(row.id), tcgCode: String(row.tcg_code ?? "pokemon"), fateFindId: String(row.fate_find_id), userId: String(row.user_id), offerId: String(row.signal_offer_id), productId: String(row.signal_product_id),
    retailerId: String(row.retailer_id), retailerName: String(row.retailer_name), title: String(row.title), url: String(row.url),
    itemPricePence: row.item_price_pence == null ? null : Number(row.item_price_pence), postagePence: row.postage_pence == null ? null : Number(row.postage_pence),
    deliveredPricePence: row.delivered_price_pence == null ? null : Number(row.delivered_price_pence), rrpPence: row.rrp_pence == null ? null : Number(row.rrp_pence),
    percentAboveRrp: row.percent_above_rrp == null ? null : Number(row.percent_above_rrp), stockStatus: String(row.stock_status), reasons: Array.isArray(row.reasons_json) ? row.reasons_json.map(String) : [],
    matchedAt: Number(row.matched_at), lastObservedAt: Number(row.last_observed_at),
  }));
}
