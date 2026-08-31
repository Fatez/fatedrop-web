import type { NetworkLocation, NetworkOffer, TruePriceResult } from "./network-domain";
import { distanceKm } from "./location";
import type { TcgCode } from "./tcg-registry";

export type FateMatchScope = "online" | "local" | "either";
export type FateMatchStockRequirement = "in_stock" | "purchasable" | "any";

export type FateMatch = {
  id: string;
  userId: string;
  tcgCode: TcgCode;
  query: string;
  productIdentityId: string | null;
  maxItemPricePence: number | null;
  maxTruePricePence: number | null;
  maxPercentAboveRrp: number | null;
  scope: FateMatchScope;
  radiusKm: number | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  preferredRetailerIds: string[];
  excludedRetailerIds: string[];
  stockRequirement: FateMatchStockRequirement;
  notificationPreferences: Record<string, boolean | string>;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
};

export type FateMatchEvaluation = {
  matched: boolean;
  matchId: string;
  offerId: string;
  reasons: string[];
  rejectedBy: string[];
  distanceKm: number | null;
};

function stockMatches(match: FateMatch, offer: NetworkOffer) {
  if (match.stockRequirement === "any") return true;
  if (match.stockRequirement === "in_stock") return offer.stockState === "in_stock";
  return offer.stockState === "in_stock" || offer.stockState === "preorder";
}

function scopeMatches(match: FateMatch, offer: NetworkOffer, location: NetworkLocation | null) {
  if (match.scope === "online") return { ok: offer.channel === "online", distance: null as number | null };
  if (match.scope === "local" && offer.channel !== "local") return { ok: false, distance: null as number | null };
  if (match.scope === "either" && offer.channel === "online") return { ok: true, distance: null as number | null };
  if (!location || match.latitude === null || match.longitude === null || match.radiusKm === null) return { ok: false, distance: null as number | null };
  const distance = distanceKm(match.latitude, match.longitude, location.latitude, location.longitude);
  return { ok: distance <= match.radiusKm, distance };
}

export function evaluateFateMatch(match: FateMatch, offer: NetworkOffer, truePrice: TruePriceResult, location: NetworkLocation | null = null): FateMatchEvaluation {
  const reasons: string[] = [];
  const rejectedBy: string[] = [];
  if (!match.enabled) rejectedBy.push("FateMatch is paused");
  if (match.productIdentityId && match.productIdentityId !== offer.productIdentityId) rejectedBy.push("Product identity does not match");
  if (match.excludedRetailerIds.includes(offer.retailerId)) rejectedBy.push("Retailer is excluded");
  if (match.preferredRetailerIds.length && !match.preferredRetailerIds.includes(offer.retailerId)) rejectedBy.push("Retailer is outside preferred list");
  if (!stockMatches(match, offer)) rejectedBy.push("Stock requirement not met");

  const scope = scopeMatches(match, offer, location);
  if (!scope.ok) rejectedBy.push(match.scope === "local" ? "Offer is outside local radius" : "Offer channel does not match");

  if (match.maxItemPricePence !== null && offer.itemPricePence > match.maxItemPricePence) rejectedBy.push("Item price exceeds threshold");
  if (match.maxTruePricePence !== null) {
    if (truePrice.deliveredTruePricePence === null) rejectedBy.push("True Price is unknown");
    else if (truePrice.deliveredTruePricePence > match.maxTruePricePence) rejectedBy.push("True Price exceeds threshold");
  }
  if (match.maxPercentAboveRrp !== null) {
    if (truePrice.percentFromRrp === null) rejectedBy.push("RRP percentage is unknown");
    else if (truePrice.percentFromRrp > match.maxPercentAboveRrp) rejectedBy.push("RRP premium exceeds threshold");
  }

  if (!rejectedBy.length) {
    reasons.push("Product criteria matched");
    if (match.maxItemPricePence !== null) reasons.push(`Item price is within £${(match.maxItemPricePence / 100).toFixed(2)}`);
    if (match.maxTruePricePence !== null && truePrice.deliveredTruePricePence !== null) reasons.push(`Delivered True Price is within £${(match.maxTruePricePence / 100).toFixed(2)}`);
    if (match.maxPercentAboveRrp !== null && truePrice.percentFromRrp !== null) reasons.push(`RRP premium is ${truePrice.percentFromRrp.toFixed(1)}%, within the ${match.maxPercentAboveRrp.toFixed(1)}% limit`);
    if (scope.distance !== null) reasons.push(`Local stock is ${scope.distance.toFixed(1)} km away, inside the ${match.radiusKm} km radius`);
    if (match.preferredRetailerIds.includes(offer.retailerId)) reasons.push("Preferred retailer matched");
  }

  return { matched: rejectedBy.length === 0, matchId: match.id, offerId: offer.id, reasons, rejectedBy, distanceKm: scope.distance };
}

export function evaluateActiveFateMatches(matches: FateMatch[], offer: NetworkOffer, truePrice: TruePriceResult, location: NetworkLocation | null = null) {
  return matches.filter((match) => match.enabled).map((match) => evaluateFateMatch(match, offer, truePrice, location)).filter((result) => result.matched);
}
