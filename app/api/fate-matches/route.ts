import { randomUUID } from "node:crypto";
import { getCurrentSnapshot } from "@/lib/auth";
import type { FateMatch } from "@/lib/fate-match";
import { createFateMatch, listUserFateMatches } from "@/lib/fate-match-storage";
import { hasCapability } from "@/lib/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function finiteOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
function strings(value: unknown) { return Array.isArray(value) ? value.map(String).filter(Boolean).slice(0, 50) : []; }

export async function GET() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
  try { return Response.json({ matches: await listUserFateMatches(snapshot.account.id) }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return Response.json({ matches: [], pendingMigration: true }, { headers: { "Cache-Control": "private, no-store" } }); }
}

export async function POST(request: Request) {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
  if (!hasCapability(snapshot.membership, "advanced_fate_match")) return Response.json({ error: "Premium FateMatch entitlement required." }, { status: 403 });
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!payload) return Response.json({ error: "Invalid FateMatch payload." }, { status: 400 });
  const query = typeof payload.query === "string" ? payload.query.trim().slice(0, 180) : "";
  const productIdentityId = typeof payload.productIdentityId === "string" && payload.productIdentityId.trim() ? payload.productIdentityId.trim().slice(0, 180) : null;
  if (!query && !productIdentityId) return Response.json({ error: "A product search or product identity is required." }, { status: 400 });
  const scope = payload.scope === "online" || payload.scope === "local" || payload.scope === "either" ? payload.scope : "either";
  const stockRequirement = payload.stockRequirement === "any" || payload.stockRequirement === "purchasable" || payload.stockRequirement === "in_stock" ? payload.stockRequirement : "in_stock";
  const now = Math.floor(Date.now() / 1000);
  const match: FateMatch = {
    id: randomUUID(), userId: snapshot.account.id, query, productIdentityId,
    maxItemPricePence: finiteOrNull(payload.maxItemPricePence), maxTruePricePence: finiteOrNull(payload.maxTruePricePence), maxPercentAboveRrp: finiteOrNull(payload.maxPercentAboveRrp),
    scope, radiusKm: finiteOrNull(payload.radiusKm), postcode: typeof payload.postcode === "string" ? payload.postcode.trim().toUpperCase().slice(0, 12) || null : null,
    latitude: finiteOrNull(payload.latitude), longitude: finiteOrNull(payload.longitude), preferredRetailerIds: strings(payload.preferredRetailerIds), excludedRetailerIds: strings(payload.excludedRetailerIds),
    stockRequirement, notificationPreferences: payload.notificationPreferences && typeof payload.notificationPreferences === "object" && !Array.isArray(payload.notificationPreferences) ? payload.notificationPreferences as Record<string, boolean> : { website: true },
    enabled: true, createdAt: now, updatedAt: now,
  };
  if ((scope === "local" || scope === "either") && match.radiusKm !== null && (match.latitude === null || match.longitude === null)) return Response.json({ error: "Local radius matching requires a resolved location." }, { status: 400 });
  try { return Response.json({ match: await createFateMatch(match) }, { status: 201 }); }
  catch { return Response.json({ error: "FateMatch storage is not ready. Apply the Fate Network migration first." }, { status: 503 }); }
}
