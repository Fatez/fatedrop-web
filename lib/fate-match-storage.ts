import type { FateMatch } from "@/lib/fate-match";
import { fateDropPostgres } from "@/lib/postgres";
import { safeExternalHttpsUrl } from "@/lib/external-url";
import { calculateTruePrice } from "@/lib/true-price";
import { isTcgCode } from "@/lib/tcg-registry";

function stringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } }
  return [];
}
function objectValue(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, boolean | string>;
  if (typeof value === "string") { try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" ? parsed as Record<string, boolean | string> : {}; } catch { return {}; } }
  return {};
}
function nullableNumber(value: unknown) { return value === null || value === undefined ? null : Number(value); }
function nullableString(value: unknown) { return value === null || value === undefined ? null : String(value); }

function mapFateMatch(row: Record<string, unknown>): FateMatch {
  return {
    id: String(row.id), userId: String(row.user_id), tcgCode: isTcgCode(row.tcg_code) ? row.tcg_code : "pokemon", query: String(row.query_text ?? ""), productIdentityId: nullableString(row.product_identity_id),
    maxItemPricePence: nullableNumber(row.max_item_price_pence), maxTruePricePence: nullableNumber(row.max_true_price_pence), maxPercentAboveRrp: nullableNumber(row.max_percent_above_rrp),
    scope: String(row.scope) as FateMatch["scope"], radiusKm: nullableNumber(row.radius_km), postcode: nullableString(row.postcode), latitude: nullableNumber(row.latitude), longitude: nullableNumber(row.longitude),
    preferredRetailerIds: stringArray(row.preferred_retailers_json), excludedRetailerIds: stringArray(row.excluded_retailers_json), stockRequirement: String(row.stock_requirement) as FateMatch["stockRequirement"],
    notificationPreferences: objectValue(row.notification_preferences_json), enabled: Boolean(row.enabled), createdAt: Number(row.created_at), updatedAt: Number(row.updated_at),
  };
}

export type FateMatchHitView = {
  id: string;
  matchId: string;
  offerId: string;
  signalEventId: string | null;
  query: string;
  productTitle: string;
  retailerId: string | null;
  retailerName: string;
  productUrl: string | null;
  itemPricePence: number | null;
  deliveryKnown: boolean;
  truePricePence: number | null;
  officialRrpPence: number | null;
  stockState: string | null;
  reasons: string[];
  occurredAt: number;
  offerObservedAt: number | null;
};

function mapFateMatchHit(row: Record<string, unknown>): FateMatchHitView {
  const itemPricePence = nullableNumber(row.item_price_pence);
  const postagePence = nullableNumber(row.mandatory_postage_pence);
  const feesPence = nullableNumber(row.mandatory_fees_pence);
  const officialRrpPence = nullableNumber(row.official_rrp_pence);
  const deliveryKnown = row.delivery_known === true;
  const price = itemPricePence === null ? null : calculateTruePrice({
    itemPricePence,
    mandatoryPostagePence: postagePence,
    mandatoryFeesPence: feesPence,
    deliveryKnown,
    officialRrpPence,
  });

  return {
    id: String(row.id),
    matchId: String(row.match_id),
    offerId: String(row.offer_id),
    signalEventId: nullableString(row.signal_event_id),
    query: String(row.query_text ?? ""),
    productTitle: String(row.offer_title ?? row.identity_title ?? row.query_text ?? "FateMatch"),
    retailerId: nullableString(row.retailer_id),
    retailerName: String(row.retailer_name ?? "Retailer"),
    productUrl: safeExternalHttpsUrl(row.offer_url),
    itemPricePence,
    deliveryKnown,
    truePricePence: price?.deliveredTruePricePence ?? null,
    officialRrpPence,
    stockState: nullableString(row.stock_state),
    reasons: stringArray(row.reasons_json),
    occurredAt: Number(row.occurred_at),
    offerObservedAt: nullableNumber(row.observed_at),
  };
}

export async function createFateMatch(match: FateMatch) {
  const sql = await fateDropPostgres();
  const rows = await sql`INSERT INTO fatedrop_fate_matches (
    id,user_id,tcg_code,query_text,product_identity_id,max_item_price_pence,max_true_price_pence,max_percent_above_rrp,scope,radius_km,postcode,latitude,longitude,
    preferred_retailers_json,excluded_retailers_json,stock_requirement,notification_preferences_json,enabled,created_at,updated_at
  ) VALUES (
    ${match.id},${match.userId},${match.tcgCode},${match.query},${match.productIdentityId},${match.maxItemPricePence},${match.maxTruePricePence},${match.maxPercentAboveRrp},${match.scope},${match.radiusKm},${match.postcode},${match.latitude},${match.longitude},
    ${JSON.stringify(match.preferredRetailerIds)}::jsonb,${JSON.stringify(match.excludedRetailerIds)}::jsonb,${match.stockRequirement},${JSON.stringify(match.notificationPreferences)}::jsonb,${match.enabled},${match.createdAt},${match.updatedAt}
  ) RETURNING *`;
  return rows[0] ? mapFateMatch(rows[0] as Record<string, unknown>) : null;
}

export async function getProductIdentityTcg(productIdentityId: string) {
  const sql = await fateDropPostgres();
  const rows = await sql`SELECT tcg FROM fatedrop_product_identities WHERE id=${productIdentityId} LIMIT 1`;
  return rows[0]?.tcg == null ? null : String(rows[0].tcg);
}

export async function setFateMatchEnabled(userId: string, matchId: string, enabled: boolean, updatedAt = Math.floor(Date.now() / 1000)) {
  const sql = await fateDropPostgres();
  const rows = await sql`UPDATE fatedrop_fate_matches SET enabled=${enabled},updated_at=${updatedAt} WHERE id=${matchId} AND user_id=${userId} RETURNING *`;
  return rows[0] ? mapFateMatch(rows[0] as Record<string, unknown>) : null;
}

export async function deleteFateMatch(userId: string, matchId: string) {
  const sql = await fateDropPostgres();
  const rows = await sql`DELETE FROM fatedrop_fate_matches WHERE id=${matchId} AND user_id=${userId} RETURNING id`;
  return Boolean(rows[0]);
}

export async function listActiveFateMatches(productIdentityId?: string | null) {
  const sql = await fateDropPostgres();
  const rows = productIdentityId
    ? await sql`SELECT * FROM fatedrop_fate_matches WHERE enabled=true AND (product_identity_id=${productIdentityId} OR product_identity_id IS NULL)`
    : await sql`SELECT * FROM fatedrop_fate_matches WHERE enabled=true`;
  return rows.map((row) => mapFateMatch(row as Record<string, unknown>));
}

export async function listUserFateMatches(userId: string) {
  const sql = await fateDropPostgres();
  const rows = await sql`SELECT * FROM fatedrop_fate_matches WHERE user_id=${userId} ORDER BY updated_at DESC`;
  return rows.map((row) => mapFateMatch(row as Record<string, unknown>));
}

export async function getLatestUserFateMatchHit(userId: string, matchId: string) {
  const sql = await fateDropPostgres();
  const rows = await sql`
    SELECT
      h.id,
      h.match_id,
      h.signal_event_id,
      h.offer_id,
      h.reasons_json,
      h.occurred_at,
      m.query_text,
      o.title AS offer_title,
      o.url AS offer_url,
      o.retailer_id,
      o.item_price_pence,
      o.mandatory_postage_pence,
      o.mandatory_fees_pence,
      o.delivery_known,
      o.stock_state,
      o.observed_at,
      r.name AS retailer_name,
      p.title AS identity_title,
      p.official_rrp_pence
    FROM fatedrop_fate_match_hits h
    JOIN fatedrop_fate_matches m ON m.id = h.match_id
    LEFT JOIN fatedrop_offers o ON o.id = h.offer_id
    LEFT JOIN fatedrop_retailers r ON r.id = o.retailer_id
    LEFT JOIN fatedrop_product_identities p ON p.id = o.product_identity_id
    WHERE m.user_id = ${userId} AND h.match_id = ${matchId}
    ORDER BY h.occurred_at DESC
    LIMIT 1
  `;
  return rows[0] ? mapFateMatchHit(rows[0] as Record<string, unknown>) : null;
}

export async function saveFateMatchHit(input: { id: string; matchId: string; signalEventId: string | null; offerId: string; reasons: string[]; occurredAt: number }) {
  const sql = await fateDropPostgres();
  const rows = await sql`INSERT INTO fatedrop_fate_match_hits (id,match_id,signal_event_id,offer_id,reasons_json,occurred_at)
    VALUES (${input.id},${input.matchId},${input.signalEventId},${input.offerId},${JSON.stringify(input.reasons)}::jsonb,${input.occurredAt})
    ON CONFLICT (match_id,offer_id,signal_event_id) DO NOTHING RETURNING id`;
  return Boolean(rows[0]);
}
