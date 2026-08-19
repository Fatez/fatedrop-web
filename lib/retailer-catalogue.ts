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

type ShopifyStore = { id: string; name: string; baseUrl: string };

const COB_AND_PIP: ShopifyStore = { id: "cob-and-pip", name: "Cob & Pip", baseUrl: "https://cobandpip.co.uk" };
const WISHLIST_COLLECTABLES: ShopifyStore = { id: "wishlist-collectables", name: "Wishlist Collectables", baseUrl: "https://www.wishlistcollectables.co.uk" };
const PAGE_SIZE = 250;
const MAX_PRODUCTS = 2500;

function moneyToPence(value?: string) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function normaliseShopifyProduct(store: ShopifyStore, product: ShopifyProduct): CatalogueProduct | null {
  const variants = product.variants ?? [];
  const prices = variants.map((variant) => moneyToPence(variant.price)).filter((price) => price > 0);
  if (!prices.length) return null;
  return {
    id: `${store.id}:${product.id}`,
    retailerId: store.id,
    retailerName: store.name,
    title: product.title,
    handle: product.handle,
    url: `${store.baseUrl}/products/${product.handle}`,
    image: product.images?.[0]?.src,
    pricePence: Math.min(...prices),
    available: variants.some((variant) => variant.available === true),
    vendor: product.vendor,
    productType: product.product_type,
    updatedAt: product.updated_at,
  };
}

async function getShopifyCatalogue(store: ShopifyStore): Promise<CatalogueProduct[]> {
  try {
    const all: ShopifyProduct[] = [];
    let sinceId: string | number | undefined;
    while (all.length < MAX_PRODUCTS) {
      const suffix = sinceId ? `&since_id=${encodeURIComponent(String(sinceId))}` : "";
      const response = await fetch(`${store.baseUrl}/products.json?limit=${PAGE_SIZE}${suffix}`, {
        next: { revalidate: 300 },
        headers: { Accept: "application/json", "User-Agent": "FateDrop/1.0 catalogue discovery" },
      });
      if (!response.ok) break;
      const data = (await response.json()) as ShopifyResponse;
      const page = data.products ?? [];
      if (!page.length) break;
      all.push(...page);
      if (page.length < PAGE_SIZE) break;
      sinceId = page[page.length - 1]?.id;
      if (!sinceId) break;
    }
    return all.map((product) => normaliseShopifyProduct(store, product)).filter((product): product is CatalogueProduct => product !== null);
  } catch {
    return [];
  }
}

export function getCobAndPipCatalogue() {
  return getShopifyCatalogue(COB_AND_PIP);
}

export function getWishlistCollectablesCatalogue() {
  return getShopifyCatalogue(WISHLIST_COLLECTABLES);
}

export function formatGBP(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

export function calculateDeliveredPrice(pricePence: number, freeDeliveryThresholdPence?: number, knownDeliveryPence?: number) {
  if (freeDeliveryThresholdPence && pricePence >= freeDeliveryThresholdPence) return { deliveredPence: pricePence, deliveryPence: 0, known: true as const };
  if (typeof knownDeliveryPence === "number") return { deliveredPence: pricePence + knownDeliveryPence, deliveryPence: knownDeliveryPence, known: true as const };
  return { deliveredPence: null, deliveryPence: null, known: false as const };
}

export function calculateMarkup(pricePence: number, rrpPence?: number) {
  if (!rrpPence || rrpPence <= 0) return null;
  return ((pricePence - rrpPence) / rrpPence) * 100;
}
