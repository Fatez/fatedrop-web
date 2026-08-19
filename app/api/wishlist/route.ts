import { randomUUID } from "node:crypto";
import { assertSameOrigin, getCurrentSnapshot } from "@/lib/auth";
import { listWishlist, removeWishlistItem, upsertWishlistItem, type WishlistItem } from "@/lib/wishlist-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
  try { return Response.json({ wishlist: await listWishlist(snapshot.account.id) }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return Response.json({ wishlist: [], pendingMigration: true }, { headers: { "Cache-Control": "private, no-store" } }); }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
    const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!payload) return Response.json({ error: "Invalid wishlist payload." }, { status: 400 });
    const query = typeof payload.query === "string" ? payload.query.trim().slice(0, 180) : "";
    const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 220) : query;
    const productIdentityId = typeof payload.productIdentityId === "string" && payload.productIdentityId.trim() ? payload.productIdentityId.trim().slice(0, 180) : null;
    if (!query && !productIdentityId) return Response.json({ error: "A product identity or search title is required." }, { status: 400 });
    const now = Math.floor(Date.now() / 1000);
    const item: WishlistItem = {
      id: randomUUID(), userId: snapshot.account.id, productIdentityId, query: query || title, title: title || query,
      tcg: typeof payload.tcg === "string" ? payload.tcg.trim().slice(0, 50) || null : null,
      imageUrl: typeof payload.imageUrl === "string" && /^https?:\/\//i.test(payload.imageUrl) ? payload.imageUrl.slice(0, 1000) : null,
      source: "website", createdAt: now, updatedAt: now,
    };
    const saved = await upsertWishlistItem(item);
    return Response.json({ wishlistItem: saved }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Wishlist storage is not ready. Apply the collector preference migration first." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
    const payload = await request.json().catch(() => null) as { id?: unknown } | null;
    const id = typeof payload?.id === "string" ? payload.id.trim().slice(0, 180) : "";
    if (!id) return Response.json({ error: "Wishlist item ID is required." }, { status: 400 });
    return Response.json({ removed: await removeWishlistItem(snapshot.account.id, id) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Wishlist item could not be removed." }, { status: 500 });
  }
}
