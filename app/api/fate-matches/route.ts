import { randomUUID } from "node:crypto";
import { assertSameOrigin, getSnapshotForRequest } from "@/lib/auth";
import type { FateMatch } from "@/lib/fate-match";
import { createFateMatch, deleteFateMatch, listUserFateMatches, setFateMatchEnabled } from "@/lib/fate-match-storage";
import { hasCapability } from "@/lib/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function finiteOrNull(value: unknown, options: { min?: number; max?: number } = {}) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  if (options.min !== undefined && number < options.min) return null;
  if (options.max !== undefined && number > options.max) return null;
  return number;
}
function strings(value: unknown) { return Array.isArray(value) ? value.map(String).map((item)=>item.trim()).filter(Boolean).slice(0, 50) : []; }
function notifications(value: unknown) {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return {
    website: input.website !== false,
    discord: input.discord === true,
    app: input.app === true,
  };
}

export async function GET(request: Request) {
  const snapshot = await getSnapshotForRequest(request);
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
  try {
    const fateFinds = await listUserFateMatches(snapshot.account.id);
    return Response.json({ fateFinds, matches: fateFinds }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ fateFinds: [], matches: [], pendingMigration: true }, { headers: { "Cache-Control": "private, no-store" } });
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getSnapshotForRequest(request);
    if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
    if (!hasCapability(snapshot.membership, "advanced_fate_match")) return Response.json({ error: "Premium FateFind monitoring is required." }, { status: 403 });
    const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!payload) return Response.json({ error: "Invalid FateFind payload." }, { status: 400 });
    const query = typeof payload.query === "string" ? payload.query.trim().slice(0, 180) : "";
    const productIdentityId = typeof payload.productIdentityId === "string" && payload.productIdentityId.trim() ? payload.productIdentityId.trim().slice(0, 180) : null;
    if (!query && !productIdentityId) return Response.json({ error: "A product search or product identity is required." }, { status: 400 });
    const scope = payload.scope === "online" || payload.scope === "local" || payload.scope === "either" ? payload.scope : "either";
    const stockRequirement = payload.stockRequirement === "any" || payload.stockRequirement === "purchasable" || payload.stockRequirement === "in_stock" ? payload.stockRequirement : "in_stock";
    const now = Math.floor(Date.now() / 1000);
    const match: FateMatch = {
      id: randomUUID(), userId: snapshot.account.id, query, productIdentityId,
      maxItemPricePence: finiteOrNull(payload.maxItemPricePence, { min: 0, max: 10_000_000 }),
      maxTruePricePence: finiteOrNull(payload.maxTruePricePence, { min: 0, max: 10_000_000 }),
      maxPercentAboveRrp: finiteOrNull(payload.maxPercentAboveRrp, { min: 0, max: 1000 }),
      scope,
      radiusKm: finiteOrNull(payload.radiusKm, { min: 1, max: 250 }),
      postcode: typeof payload.postcode === "string" ? payload.postcode.trim().toUpperCase().slice(0, 12) || null : null,
      latitude: finiteOrNull(payload.latitude, { min: -90, max: 90 }),
      longitude: finiteOrNull(payload.longitude, { min: -180, max: 180 }),
      preferredRetailerIds: strings(payload.preferredRetailerIds),
      excludedRetailerIds: strings(payload.excludedRetailerIds),
      stockRequirement,
      notificationPreferences: notifications(payload.notificationPreferences),
      enabled: true, createdAt: now, updatedAt: now,
    };
    if (scope === "local" && (match.radiusKm === null || match.latitude === null || match.longitude === null)) {
      return Response.json({ error: "Local FateFind monitoring requires a resolved location and radius." }, { status: 400 });
    }
    if (scope === "either" && match.radiusKm !== null && (match.latitude === null || match.longitude === null)) {
      return Response.json({ error: "A local radius can only be saved after location is resolved." }, { status: 400 });
    }
    try {
      const saved = await createFateMatch(match);
      return Response.json({ fateFind: saved, match: saved, message: "FateFind saved. A qualifying observed result can become a FateMatch." }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
    } catch {
      return Response.json({ error: "FateFind storage is not ready. Apply the Fate Network migration first." }, { status: 503 });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "FateFind could not be saved." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getSnapshotForRequest(request);
    if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
    const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
    const id = typeof payload?.id === "string" ? payload.id.trim() : "";
    if (!id || typeof payload?.enabled !== "boolean") return Response.json({ error: "FateFind id and enabled state are required." }, { status: 400 });
    try {
      const updated = await setFateMatchEnabled(snapshot.account.id, id, payload.enabled);
      if (!updated) return Response.json({ error: "FateFind not found." }, { status: 404 });
      return Response.json({ fateFind: updated, message: updated.enabled ? "FateFind resumed." : "FateFind paused." }, { headers: { "Cache-Control": "private, no-store" } });
    } catch {
      return Response.json({ error: "FateFind could not be updated." }, { status: 503 });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "FateFind could not be updated." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getSnapshotForRequest(request);
    if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
    const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
    const id = typeof payload?.id === "string" ? payload.id.trim() : "";
    if (!id) return Response.json({ error: "FateFind id is required." }, { status: 400 });
    try {
      const deleted = await deleteFateMatch(snapshot.account.id, id);
      if (!deleted) return Response.json({ error: "FateFind not found." }, { status: 404 });
      return Response.json({ deleted: true, message: "FateFind deleted." }, { headers: { "Cache-Control": "private, no-store" } });
    } catch {
      return Response.json({ error: "FateFind could not be deleted." }, { status: 503 });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "FateFind could not be deleted." }, { status: 500 });
  }
}
