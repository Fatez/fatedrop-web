import { fateDropPostgres } from "@/lib/postgres";

export type WishlistItem = {
  id: string;
  userId: string;
  productIdentityId: string | null;
  query: string;
  title: string;
  tcg: string | null;
  imageUrl: string | null;
  source: "website" | "app" | "import";
  createdAt: number;
  updatedAt: number;
};

function nullableString(value: unknown) { return value === null || value === undefined ? null : String(value); }
function mapWishlist(row: Record<string, unknown>): WishlistItem {
  return {
    id: String(row.id), userId: String(row.user_id), productIdentityId: nullableString(row.product_identity_id),
    query: String(row.query_text ?? ""), title: String(row.display_title ?? row.query_text ?? "Saved product"),
    tcg: nullableString(row.tcg), imageUrl: nullableString(row.image_url), source: String(row.source ?? "website") as WishlistItem["source"],
    createdAt: Number(row.created_at), updatedAt: Number(row.updated_at),
  };
}

export async function listWishlist(userId: string) {
  const sql = await fateDropPostgres();
  const rows = await sql`SELECT * FROM fatedrop_wishlist_items WHERE user_id=${userId} ORDER BY updated_at DESC`;
  return rows.map((row) => mapWishlist(row as Record<string, unknown>));
}

export async function upsertWishlistItem(item: WishlistItem) {
  const sql = await fateDropPostgres();
  const rows = item.productIdentityId
    ? await sql`INSERT INTO fatedrop_wishlist_items (id,user_id,product_identity_id,query_text,display_title,tcg,image_url,source,created_at,updated_at)
      VALUES (${item.id},${item.userId},${item.productIdentityId},${item.query},${item.title},${item.tcg},${item.imageUrl},${item.source},${item.createdAt},${item.updatedAt})
      ON CONFLICT (user_id,product_identity_id) WHERE product_identity_id IS NOT NULL DO UPDATE SET query_text=EXCLUDED.query_text,display_title=EXCLUDED.display_title,tcg=EXCLUDED.tcg,image_url=COALESCE(EXCLUDED.image_url,fatedrop_wishlist_items.image_url),source=EXCLUDED.source,updated_at=EXCLUDED.updated_at RETURNING *`
    : await sql`INSERT INTO fatedrop_wishlist_items (id,user_id,product_identity_id,query_text,display_title,tcg,image_url,source,created_at,updated_at)
      VALUES (${item.id},${item.userId},NULL,${item.query},${item.title},${item.tcg},${item.imageUrl},${item.source},${item.createdAt},${item.updatedAt})
      ON CONFLICT (user_id,lower(query_text)) WHERE product_identity_id IS NULL DO UPDATE SET display_title=EXCLUDED.display_title,tcg=EXCLUDED.tcg,image_url=COALESCE(EXCLUDED.image_url,fatedrop_wishlist_items.image_url),source=EXCLUDED.source,updated_at=EXCLUDED.updated_at RETURNING *`;
  return rows[0] ? mapWishlist(rows[0] as Record<string, unknown>) : null;
}

export async function removeWishlistItem(userId: string, itemId: string) {
  const sql = await fateDropPostgres();
  const rows = await sql`DELETE FROM fatedrop_wishlist_items WHERE id=${itemId} AND user_id=${userId} RETURNING id`;
  return Boolean(rows[0]);
}
