import type { CatalogueProduct } from "./retailer-catalogue";
import { calculateDeliveredPrice, calculateMarkup } from "./retailer-catalogue";
import { getCanonicalRrp } from "./canonical-rrp";
import { identifyProduct } from "./product-identity";
import { retailerRegistry } from "./retailer-registry";
import type { TruePriceResult } from "./network-domain";

export type TruePriceInput = {
  itemPricePence: number;
  mandatoryPostagePence: number | null;
  mandatoryFeesPence?: number | null;
  deliveryKnown: boolean;
  officialRrpPence: number | null;
};

export function truePriceLabel(percentFromRrp: number | null): TruePriceResult["label"] {
  if (percentFromRrp === null) return "RRP unknown";
  if (percentFromRrp < -0.5) return "Below RRP";
  if (Math.abs(percentFromRrp) <= 0.5) return "RRP";
  if (percentFromRrp <= 10) return "Fair";
  if (percentFromRrp <= 25) return "Elevated";
  return "High Premium";
}

export function calculateTruePrice(input: TruePriceInput): TruePriceResult {
  const fees = input.mandatoryFeesPence ?? 0;
  const deliveredTruePricePence = input.deliveryKnown && input.mandatoryPostagePence !== null
    ? input.itemPricePence + input.mandatoryPostagePence + fees
    : null;
  const differenceFromRrpPence = input.officialRrpPence !== null && deliveredTruePricePence !== null
    ? deliveredTruePricePence - input.officialRrpPence
    : null;
  const percentFromRrp = input.officialRrpPence !== null && deliveredTruePricePence !== null
    ? calculateMarkup(deliveredTruePricePence, input.officialRrpPence)
    : null;
  return {
    itemPricePence: input.itemPricePence,
    mandatoryPostagePence: input.mandatoryPostagePence,
    mandatoryFeesPence: input.mandatoryFeesPence ?? 0,
    deliveryKnown: input.deliveryKnown,
    deliveredTruePricePence,
    rrpPence: input.officialRrpPence,
    differenceFromRrpPence,
    percentFromRrp,
    label: truePriceLabel(percentFromRrp),
  };
}

export type TruePriceOffer = CatalogueProduct & {
  identityKey: string;
  rrpPence: number | null;
  rrpSource: string | null;
  itemMarkupPence: number | null;
  itemMarkupPercent: number | null;
  deliveryPence: number | null;
  mandatoryFeesPence: number;
  deliveryKnown: boolean;
  deliveredPence: number | null;
  deliveredPremiumPence: number | null;
  deliveredPremiumPercent: number | null;
  truePriceLabel: TruePriceResult["label"];
};

export function buildTruePriceOffer(product: CatalogueProduct): TruePriceOffer {
  const identity = identifyProduct(product.title);
  const rrp = getCanonicalRrp(identity);
  const retailer = retailerRegistry.find((item) => item.id === product.retailerId);
  const delivery = calculateDeliveredPrice(product.pricePence, retailer?.freeDeliveryThresholdPence, retailer?.standardDeliveryPence);
  const result = calculateTruePrice({
    itemPricePence: product.pricePence,
    mandatoryPostagePence: delivery.deliveryPence,
    mandatoryFeesPence: 0,
    deliveryKnown: delivery.known,
    officialRrpPence: rrp?.rrpPence ?? null,
  });
  const itemMarkupPence = rrp ? product.pricePence - rrp.rrpPence : null;
  const itemMarkupPercent = rrp ? calculateMarkup(product.pricePence, rrp.rrpPence) : null;
  return {
    ...product,
    identityKey: identity.key,
    rrpPence: rrp?.rrpPence ?? null,
    rrpSource: rrp?.source ?? null,
    itemMarkupPence,
    itemMarkupPercent,
    deliveryPence: result.mandatoryPostagePence,
    mandatoryFeesPence: result.mandatoryFeesPence ?? 0,
    deliveryKnown: result.deliveryKnown,
    deliveredPence: result.deliveredTruePricePence,
    deliveredPremiumPence: result.differenceFromRrpPence,
    deliveredPremiumPercent: result.percentFromRrp,
    truePriceLabel: result.label,
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
