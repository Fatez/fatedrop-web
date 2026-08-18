import { fateDropPostgres } from "@/lib/postgres";
import { identifyProduct } from "@/lib/product-identity";
import type { TruePriceRrpLookup } from "@/lib/true-price";

export async function getTruePriceRrpLookup(): Promise<TruePriceRrpLookup> {
  const sql = await fateDropPostgres();
  const rows = await sql`SELECT title, official_rrp_pence, rrp_source, rrp_verified_at
    FROM fatedrop_product_identities
    WHERE official_rrp_pence IS NOT NULL AND rrp_source IS NOT NULL
    ORDER BY rrp_verified_at DESC NULLS LAST, updated_at DESC`;

  const lookup: TruePriceRrpLookup = {};
  for (const row of rows as Record<string, unknown>[]) {
    const title = String(row.title ?? "").trim();
    const rrpPence = Number(row.official_rrp_pence);
    const source = String(row.rrp_source ?? "").trim();
    if (!title || !Number.isFinite(rrpPence) || rrpPence < 0 || !source) continue;
    const identity = identifyProduct(title);
    if (lookup[identity.key]) continue;
    lookup[identity.key] = { rrpPence: Math.round(rrpPence), source };
  }
  return lookup;
}
