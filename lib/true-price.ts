import type { CatalogueProduct } from "@/lib/retailer-catalogue";
import { calculateDeliveredPrice, calculateMarkup } from "@/lib/retailer-catalogue";
import { getCanonicalRrp } from "@/lib/canonical-rrp";
import { identifyProduct } from "@/lib/product-identity";
import { retailerRegistry } from "@/lib/retailer-registry";

export type TruePriceOffer = CatalogueProduct & {
  identityKey: string;
  rrpPence: number | null;
  rrpSource: string | null;
  itemMarkupPence: number | null;
  itemMarkupPercent: number | null;
  deliveryPence: number | null;
  deliveryKnown: boolean;
  deliveredPence: number | null;
  deliveredPremiumPence: number | null;
  deliveredPremiumPercent: number | null;
};

export function buildTruePriceOffer(product: CatalogueProduct): TruePriceOffer {
  const identity = identifyProduct(product.title);
  const rrp = getCanonicalRrp(identity);
  const retailer = retailerRegistry.find((item) => item.id === product.retailerId);
  const delivery = calculateDeliveredPrice(
    product.pricePence,
    retailer?.freeDeliveryThresholdPence,
    retailer?.standardDeliveryPence,
  );

  const deliveredPence = delivery.known ? delivery.deliveredPence : null;
  const itemMarkupPence = rrp ? product.pricePence - rrp.rrpPence : null;
  const itemMarkupPercent = rrp ? calculateMarkup(product.pricePence, rrp.rrpPence) : null;
  const deliveredPremiumPence = rrp && deliveredPence !== null ? deliveredPence - rrp.rrpPence : null;
  const deliveredPremiumPercent = rrp && deliveredPence !== null ? calculateMarkup(deliveredPence, rrp.rrpPence) : null;

  return {
    ...product,
    identityKey: identity.key,
    rrpPence: rrp?.rrpPence ?? null,
    rrpSource: rrp?.source ?? null,
    itemMarkupPence,
    itemMarkupPercent,
    deliveryPence: delivery.deliveryPence,
    deliveryKnown: delivery.known,
    deliveredPence,
    deliveredPremiumPence,
    deliveredPremiumPercent,
  };
}

export function buildTruePriceOffers(products: CatalogueProduct[]) {
  return products.map(buildTruePriceOffer).sort(compareTruePriceOffers);
}

export function compareTruePriceOffers(a: TruePriceOffer, b: TruePriceOffer) {
  if (a.deliveryKnown !== b.deliveryKnown) return a.deliveryKnown ? -1 : 1;
  const aTotal = a.deliveredPence ?? a.pricePence;
  const bTotal = b.deliveredPence ?? b.pricePence;
  if (aTotal !== bTotal) return aTotal - bTotal;
  return a.pricePence - b.pricePence;
}

export function formatSignedGBP(pence: number) {
  const sign = pence > 0 ? "+" : pence < 0 ? "−" : "";
  return `${sign}£${(Math.abs(pence) / 100).toFixed(2)}`;
}

export function formatSignedPercent(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}
