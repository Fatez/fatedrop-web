export type CatalogueProduct = {
  id: string;
  retailerId: string;
  retailerName: string;
  title: string;
  handle: string;
  url: string;
  image?: string;
  pricePence: number;
  available: boolean;
  vendor?: string;
  productType?: string;
  updatedAt?: string;
};

type ShopifyVariant = { price?: string; available?: boolean };
type ShopifyImage = { src?: string };
type ShopifyProduct = {
  id: number | string;
  title: string;
  handle: string;
  vendor?: string;
  product_type?: string;
  updated_at?: string;
  variants?: ShopifyVariant[];
  images?: ShopifyImage[];
};

type ShopifyResponse = { products?: ShopifyProduct[] };

const COB_AND_PIP_BASE = "https://cobandpip.co.uk";

function moneyToPence(value?: string) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

export async function getCobAndPipCatalogue(limit = 250): Promise<CatalogueProduct[]> {
  try {
    const response = await fetch(`${COB_AND_PIP_BASE}/products.json?limit=${Math.min(limit, 250)}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json", "User-Agent": "FateDrop/1.0 catalogue discovery" },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as ShopifyResponse;
    return (data.products ?? []).map((product) => {
      const variants = product.variants ?? [];
      const prices = variants.map((variant) => moneyToPence(variant.price)).filter((price) => price > 0);
      return {
        id: `cob-and-pip:${product.id}`,
        retailerId: "cob-and-pip",
        retailerName: "Cob & Pip",
        title: product.title,
        handle: product.handle,
        url: `${COB_AND_PIP_BASE}/products/${product.handle}`,
        image: product.images?.[0]?.src,
        pricePence: prices.length ? Math.min(...prices) : 0,
        available: variants.some((variant) => variant.available === true),
        vendor: product.vendor,
        productType: product.product_type,
        updatedAt: product.updated_at,
      };
    }).filter((product) => product.pricePence > 0);
  } catch {
    return [];
  }
}

export function formatGBP(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

export function calculateDeliveredPrice(pricePence: number, freeDeliveryThresholdPence?: number, knownDeliveryPence?: number) {
  if (freeDeliveryThresholdPence && pricePence >= freeDeliveryThresholdPence) return { deliveredPence: pricePence, deliveryPence: 0, known: true };
  if (typeof knownDeliveryPence === "number") return { deliveredPence: pricePence + knownDeliveryPence, deliveryPence: knownDeliveryPence, known: true };
  return { deliveredPence: pricePence, deliveryPence: null, known: false };
}

export function calculateMarkup(pricePence: number, rrpPence?: number) {
  if (!rrpPence || rrpPence <= 0) return null;
  return ((pricePence - rrpPence) / rrpPence) * 100;
}
