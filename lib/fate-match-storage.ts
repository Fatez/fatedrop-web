import type { FateMatch } from "@/lib/fate-match";
import { fateDropPostgres } from "@/lib/postgres";

function stringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } }
  return [];
}
function objectValue(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, boolean>;
  if (typeof value === "string") { try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" ? parsed as Record<string, boolean> : {}; } catch { return {}; } }
  return {};
}
function nullableNumber(value: unknown) { return value === null || value === undefined ? null : Number(value); }
function nullableString(value: unknown) { return value === null || value === undefined ? null : String(value); }

function mapFateMatch(row: Record<string, unknown>): FateMatch {
  return {
    id: String(row.id), userId: String(row.user_id), query: String(row.query_text ?? ""), productIdentityId: nullableString(row.product_identity_id),
    maxItemPricePence: nullableNumber(row.max_item_price_pence), maxTruePricePence: nullableNumber(row.max_true_price_pence), maxPercentAboveRrp: nullableNumber(row.max_percent_above_rrp),
    scope: String(row.scope) as FateMatch["scope"], radiusKm: nullableNumber(row.radius_km), postcode: nullableString(row.postcode), latitude: nullableNumber(row.latitude), longitude: nullableNumber(row.longitude),
    preferredRetailerIds: stringArray(row.preferred_retailers_json), excludedRetailerIds: stringArray(row.excluded_retailers_json), stockRequirement: String(row.stock_requirement) as FateMatch["stockRequirement"],
    notificationPreferences: objectValue(row.notification_preferences_json), enabled: Boolean(row.enabled), createdAt: Number(row.created_at), updatedAt: Number(row.updated_at),
  };
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

export async function saveFateMatchHit(input: { id: string; matchId: string; signalEventId: string | null; offerId: string; reasons: string[]; occurredAt: number }) {
  const sql = await fateDropPostgres();
  const rows = await sql`INSERT INTO fatedrop_fate_match_hits (id,match_id,signal_event_id,offer_id,reasons_json,occurred_at)
    VALUES (${input.id},${input.matchId},${input.signalEventId},${input.offerId},${JSON.stringify(input.reasons)}::jsonb,${input.occurredAt})
    ON CONFLICT (match_id,offer_id,signal_event_id) DO NOTHING RETURNING id`;
  return Boolean(rows[0]);
}
