import { createHash } from "node:crypto";
import { evaluateActiveFateMatches } from "@/lib/fate-match";
import { listActiveFateMatches, saveFateMatchHit } from "@/lib/fate-match-storage";
import { saveInventoryObservation, saveSignalEvent, upsertNetworkLocation, upsertNetworkOffer, upsertNetworkProduct, upsertNetworkRetailer, upsertProductIdentity } from "@/lib/fate-network-storage";
import type { NetworkInventoryObservation, NetworkLocation, NetworkOffer, NetworkProduct, NetworkProductIdentity, NetworkRetailer, NetworkSignalEvent } from "@/lib/network-domain";
import { calculateTruePrice } from "@/lib/true-price";

function stableId(prefix: string, ...parts: string[]) {
  return `${prefix}_${createHash("sha256").update(parts.join("\u001f")).digest("hex").slice(0, 24)}`;
}

export type NetworkOpportunity = {
  retailer: NetworkRetailer;
  productIdentity: NetworkProductIdentity;
  product?: NetworkProduct | null;
  offer: NetworkOffer;
  inventory?: NetworkInventoryObservation | null;
  location?: NetworkLocation | null;
  signal?: NetworkSignalEvent | null;
};

export async function processNetworkOpportunity(input: NetworkOpportunity) {
  await upsertNetworkRetailer(input.retailer);
  await upsertProductIdentity(input.productIdentity);
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
    officialRrpPence: input.productIdentity.officialRrpPence,
  });
  const matches = await listActiveFateMatches(input.productIdentity.id);
  const results = evaluateActiveFateMatches(matches, input.offer, truePrice, input.location ?? null);
  const occurredAt = input.signal?.occurredAt ?? input.inventory?.observedAt ?? input.offer.observedAt;
  for (const result of results) {
    await saveFateMatchHit({
      id: stableId("fmh", result.matchId, result.offerId, input.signal?.id ?? String(occurredAt)),
      matchId: result.matchId,
      signalEventId: input.signal?.id ?? null,
      offerId: result.offerId,
      reasons: result.reasons,
      occurredAt,
    });
  }
  return { truePrice, matches: results };
}
