import type { ProductIdentity } from "@/lib/product-identity";

export type CanonicalRrpRecord = {
  identityKey: string;
  rrpPence: number;
  source: string;
  verifiedAt: string;
};

/*
 * Canonical RRPs belong to the product identity, never to an individual
 * retailer offer. Only add values that have been verified against a reliable
 * official/reference source. The Pokémon Center collector will be able to
 * populate this reference layer as official catalogue data becomes available.
 */
export const canonicalRrpRegistry: CanonicalRrpRecord[] = [];

const byIdentity = new Map(canonicalRrpRegistry.map((record) => [record.identityKey, record]));

export function getCanonicalRrp(identity: ProductIdentity): CanonicalRrpRecord | null {
  return byIdentity.get(identity.key) ?? null;
}
