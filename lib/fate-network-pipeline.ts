import { saveInventoryObservation, saveSignalEvent, upsertNetworkLocation, upsertNetworkOffer, upsertNetworkProduct, upsertNetworkRetailer, upsertProductIdentity } from "@/lib/fate-network-storage";
import type { NetworkInventoryObservation, NetworkLocation, NetworkOffer, NetworkProduct, NetworkProductIdentity, NetworkRetailer, NetworkSignalEvent } from "@/lib/network-domain";
import { calculateTruePrice } from "@/lib/true-price";

export type NetworkOpportunity = {
  retailer: NetworkRetailer;
  productIdentity: NetworkProductIdentity;
  product?: NetworkProduct | null;
  offer: NetworkOffer;
  inventory?: NetworkInventoryObservation | null;
  location?: NetworkLocation | null;
  signal?: NetworkSignalEvent | null;
};

export async function processRrpReferenceProduct(productIdentity: NetworkProductIdentity) {
  return upsertProductIdentity(productIdentity);
}

/**
 * Mirror one authoritative Cloud observation into the Web network ledger.
 *
 * IMPORTANT: FateMatch evaluation does not belong here. The hosted Cloud
 * evaluator is the single authority for FateMatch outcomes and notifications;
 * Web only stores/renders those hosted results. Keeping this function free of
 * matcher calls prevents the snapshot bridge from becoming a second, divergent
 * FateMatch engine when Cloud -> Web publishing is enabled.
 */
export async function processNetworkOpportunity(input: NetworkOpportunity) {
  await upsertNetworkRetailer(input.retailer);
  const resolvedProductIdentity = await upsertProductIdentity(input.productIdentity);
  if (input.location) await upsertNetworkLocation(input.location);
  if (input.product) await upsertNetworkProduct(input.product);
  await upsertNetworkOffer(input.offer);
  if (input.inventory) await saveInventoryObservation(input.inventory);
  if (input.signal) await saveSignalEvent(input.signal);

  const truePrice = calculateTruePrice({
    itemPricePence: input.offer.itemPricePence,
    mandatoryPostagePence: input.offer.mandatoryPostagePence,
    mandatoryFeesPence: input.offer.mandatoryFeesPence,
    deliveryKnown: input.offer.deliveryKnown,
    officialRrpPence: resolvedProductIdentity.officialRrpPence,
  });

  // Compatibility field for the existing snapshot response. Web must never
  // manufacture FateMatch outcomes from mirrored observations.
  return { productIdentity: resolvedProductIdentity, truePrice, matches: [], matchAuthority: "cloud" as const };
}
