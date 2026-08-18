import { createHash } from "node:crypto";
import type { NetworkOpportunity } from "@/lib/fate-network-pipeline";
import type { NetworkProductIdentity, SignalKind, StockState } from "@/lib/network-domain";

function stableId(prefix: string, ...parts: string[]) {
  return `${prefix}_${createHash("sha256").update(parts.join("\u001f")).digest("hex").slice(0, 24)}`;
}
function text(value: unknown, max = 300) { return typeof value === "string" ? value.trim().slice(0, max) || null : null; }
function numberOrNull(value: unknown) { if (value === null || value === undefined || value === "") return null; const number = Number(value); return Number.isFinite(number) ? number : null; }
function object(value: unknown) { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }

function stockState(value: unknown): StockState {
  const state = String(value ?? "unknown").toLowerCase();
  if (state === "in_stock" || state === "low_stock") return "in_stock";
  if (state === "out_of_stock" || state === "sold_out") return "out_of_stock";
  if (state === "preorder" || state === "pre_order") return "preorder";
  return "unknown";
}
function signalKind(value: unknown): SignalKind | null {
  const state = String(value ?? "").toLowerCase();
  if (["whisper","echo","manifested","vanished","price_change","launch_date_change","queue","security","drop_pulse"].includes(state)) return state as SignalKind;
  return null;
}

export function parseRrpReferenceProduct(raw: unknown, fallbackObservedAt = Math.floor(Date.now() / 1000)): NetworkProductIdentity | null {
  const product = object(raw);
  const id = text(product.id, 180);
  const canonicalKey = text(product.canonicalKey, 240);
  const title = text(product.title, 240);
  const rrpSource = text(product.rrpSource, 180);
  const officialRrpPence = numberOrNull(product.officialRrpPence);
  const verifiedAt = numberOrNull(product.rrpObservedAt ?? product.rrpVerifiedAt) ?? fallbackObservedAt;
  if (!id || !canonicalKey || !title || !rrpSource || officialRrpPence === null || officialRrpPence < 0) return null;
  return {
    id,
    tcg: text(product.tcg, 80) ?? "pokemon",
    canonicalKey,
    title,
    productType: text(product.productType, 120),
    setName: text(product.setName, 180),
    edition: text(product.edition, 120),
    officialRrpPence: Math.round(officialRrpPence),
    rrpSource,
    rrpVerifiedAt: Math.floor(verifiedAt),
  };
}

export function parseNetworkOpportunity(raw: unknown, fallbackObservedAt = Math.floor(Date.now() / 1000)): NetworkOpportunity | null {
  const root = object(raw);
  const retailerRaw = object(root.retailer);
  const productRaw = object(root.product);
  const offerRaw = object(root.offer);
  const signalRaw = object(root.signal);
  const retailerId = text(retailerRaw.id, 160) ?? text(offerRaw.retailerId, 160);
  const retailerName = text(retailerRaw.name, 180) ?? text(offerRaw.retailerName, 180);
  const identityId = text(productRaw.id, 180) ?? text(offerRaw.productId, 180);
  const canonicalKey = text(productRaw.canonicalKey, 240);
  const offerId = text(offerRaw.offerId, 180) ?? text(offerRaw.id, 180);
  const title = text(offerRaw.title, 240) ?? text(productRaw.title, 240);
  const url = text(offerRaw.url, 800);
  const pricePence = numberOrNull(offerRaw.pricePence ?? offerRaw.itemPricePence);
  if (!retailerId || !retailerName || !identityId || !canonicalKey || !offerId || !title || !url || pricePence === null || pricePence < 0) return null;

  const observedAt = Math.floor(numberOrNull(offerRaw.lastSeenAt ?? offerRaw.observedAt) ?? fallbackObservedAt);
  const retailerSku = text(offerRaw.retailerSku, 180);
  const productListingId = stableId("listing", retailerId, retailerSku ?? offerId);
  const postage = numberOrNull(offerRaw.postagePence ?? offerRaw.mandatoryPostagePence);
  const fees = numberOrNull(offerRaw.mandatoryFeesPence) ?? 0;
  const stock = stockState(offerRaw.stockStatus ?? offerRaw.stockState);
  const signalState = signalKind(signalRaw.state ?? signalRaw.kind);
  const signalId = text(signalRaw.id, 180);

  return {
    retailer: {
      id: retailerId,
      name: retailerName,
      website: text(retailerRaw.website, 800),
      verification: retailerRaw.verification === "verified" ? "verified" : "network",
      catalogueConnected: true,
    },
    productIdentity: {
      id: identityId,
      tcg: text(productRaw.tcg, 80) ?? "pokemon",
      canonicalKey,
      title: text(productRaw.title, 240) ?? title,
      productType: text(productRaw.productType, 120),
      setName: text(productRaw.setName, 180),
      edition: text(productRaw.edition, 120),
      officialRrpPence: numberOrNull(productRaw.officialRrpPence ?? offerRaw.rrpPence),
      rrpSource: text(productRaw.rrpSource, 180),
      rrpVerifiedAt: numberOrNull(productRaw.rrpObservedAt ?? productRaw.rrpVerifiedAt),
    },
    product: {
      id: productListingId,
      retailerId,
      productIdentityId: identityId,
      retailerSku,
      title,
      url,
      imageUrl: text(offerRaw.imageUrl, 800),
      createdAt: Math.floor(numberOrNull(offerRaw.firstSeenAt) ?? observedAt),
      updatedAt: observedAt,
    },
    offer: {
      id: offerId,
      productId: productListingId,
      retailerId,
      locationId: null,
      productIdentityId: identityId,
      retailerSku,
      title,
      url,
      channel: "online",
      itemPricePence: Math.round(pricePence),
      mandatoryPostagePence: postage === null ? null : Math.round(postage),
      mandatoryFeesPence: Math.round(fees),
      deliveryKnown: postage !== null,
      stockState: stock,
      stockQuantity: numberOrNull(offerRaw.stockQuantity),
      observedAt,
    },
    inventory: {
      id: stableId("inv", offerId, String(observedAt), stock, String(pricePence)),
      offerId,
      locationId: null,
      sourceEventId: signalId,
      stockState: stock,
      quantity: numberOrNull(offerRaw.stockQuantity),
      observedAt,
    },
    signal: signalId && signalState ? {
      id: signalId,
      kind: signalState,
      productIdentityId: identityId,
      offerId,
      retailerId,
      locationId: null,
      occurredAt: Math.floor(numberOrNull(signalRaw.detectedAt ?? signalRaw.occurredAt) ?? observedAt),
      evidence: { reason: text(signalRaw.reason, 500), confidence: numberOrNull(signalRaw.confidence), evidence: signalRaw.evidence ?? [] },
    } : null,
  };
}
