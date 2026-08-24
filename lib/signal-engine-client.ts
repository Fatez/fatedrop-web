import { safeExternalHttpsUrl } from "./external-url";
import { retailerRegistry } from "./retailer-registry";

const DEFAULT_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";

export type SignalCatalogueOffer = {
  id: string;
  sku: string;
  retailerKey: string;
  retailer: string;
  title: string;
  url: string;
  image?: string | null;
  price?: number;
  shippingGbp?: number;
  availability?: "IN_STOCK" | "PREORDER" | "OUT_OF_STOCK" | "UNKNOWN";
  isCurrentlyListed?: boolean;
  category?: string;
  productId?: string;
  rrpGbp?: number;
  rrpSource?: string;
  rrpKind?: "official" | "component_reference" | "pack_reference";
  rrpObservedAt?: string;
  rrpReferenceBasis?: string;
  unitCount?: number;
  unitKind?: string;
  unitRrpGbp?: number;
  lastSeen?: string;
};

export type SignalCatalogueResponse = {
  success: boolean;
  total: number;
  count: number;
  products: SignalCatalogueOffer[];
  nextCursor: string | null;
  updatedAt: string;
};

export type SignalTruePriceOffer = {
  id: string;
  retailerId: string;
  retailerName: string;
  title: string;
  priceGbp?: number;
  shippingGbp?: number;
  totalDeliveredGbp?: number;
  deliveryKnown: boolean;
  collectionAvailable: boolean;
  productUrl: string;
  imageUrl?: string | null;
  lastCheckedAt?: string;
  stockStatus: "IN_STOCK" | "PREORDER" | "OUT_OF_STOCK" | "UNKNOWN";
  isLowestKnownDelivered: boolean;
};

export type SignalTruePriceGroup = {
  id: string;
  title: string;
  category: string;
  matchingConfidence: number;
  retailerCount: number;
  rrpGbp?: number;
  rrpSource?: string;
  rrpKind?: "official" | "component_reference" | "pack_reference";
  rrpObservedAt?: string;
  rrpReferenceBasis?: string;
  unitCount?: number;
  unitKind?: string;
  unitRrpGbp?: number;
  offers: SignalTruePriceOffer[];
};

export type SignalTruePriceResponse = {
  success: boolean;
  count: number;
  groups: SignalTruePriceGroup[];
  disclaimer: string;
};

export type SignalRetailerState = {
  id: string;
  name: string;
  healthy: boolean;
  lastScanAt: number | null;
  lastSuccessAt: number | null;
  lastError?: string | null;
  productsSeen?: number | null;
  pagesScanned?: number | null;
  baselineCompleted: boolean;
};

export type SignalEngineStatus = {
  success: boolean;
  monitor?: {
    baselineComplete?: boolean;
    productsTracked?: number;
    offersTracked?: number;
    currentlyAvailable?: number;
    retailers?: number;
  };
  state?: {
    retailers?: SignalRetailerState[];
  };
};

export type SignalRetailerDirectoryRecord = {
  id: string;
  name: string;
  websiteUrl: string | null;
  retailerClass: string;
  verification: string;
  tcgs: string[];
  online: boolean;
  physicalStores: boolean | null;
  physicalLocations: number | null;
  monitoring: {
    configured: boolean;
    healthy: boolean;
    stale: boolean;
    baselineCompleted: boolean;
    productsSeen: number | null;
    lastScanAt: number | null;
    lastSuccessAt: number | null;
  };
};

export type SignalRetailerDirectoryResponse = {
  success: boolean;
  retailers: SignalRetailerDirectoryRecord[];
  disclaimer?: string;
};

function signalEngineBaseUrl() {
  return (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
}

async function signalFetch<T>(pathname: string, params?: URLSearchParams, timeoutMs = 8_000): Promise<T | null> {
  const url = new URL(pathname, `${signalEngineBaseUrl()}/`);
  if (params) url.search = params.toString();
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(Math.max(250, timeoutMs)),
    });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

function safeCatalogueOffer(offer: SignalCatalogueOffer): SignalCatalogueOffer | null {
  const url = safeExternalHttpsUrl(offer.url);
  return url ? { ...offer, url } : null;
}

function safeTruePriceOffer(offer: SignalTruePriceOffer): SignalTruePriceOffer | null {
  const productUrl = safeExternalHttpsUrl(offer.productUrl);
  return productUrl ? { ...offer, productUrl } : null;
}

function retailerFilterForQuery(query: string) {
  const normalized = query.trim().toLocaleLowerCase("en-GB");
  if (!normalized) return null;
  const retailer = retailerRegistry.find((item) => item.name.toLocaleLowerCase("en-GB") === normalized);
  return retailer ? (retailer.cloudRetailerId ?? retailer.id) : null;
}

export async function searchSignalCatalogue(query: string, options: {
  inStock?: boolean;
  limit?: number;
  sort?: "relevance" | "recent" | "price" | "title";
  retailer?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  cursor?: string;
} = {}) {
  const clean = query.trim();
  const inferredRetailer = options.retailer ? null : retailerFilterForQuery(clean);
  const retailerFilter = options.retailer ?? inferredRetailer;
  if (clean.length < 2 && !retailerFilter) return null;

  const params = new URLSearchParams({ limit: String(Math.min(Math.max(options.limit ?? 50, 1), 100)) });
  // Store cards currently open Search using the retailer display name. Cloud's q
  // field searches product title/SKU, while retailer is the actual catalogue
  // filter. Resolve an exact known retailer name to that filter instead of
  // pretending the shop name is a product keyword.
  if (clean.length >= 2 && !inferredRetailer) params.set("q", clean);
  if (retailerFilter) params.set("retailer", retailerFilter);
  if (options.inStock) params.set("inStock", "true");
  if (options.sort) params.set("sort", options.sort);
  if (options.category) params.set("category", options.category);
  if (typeof options.minPrice === "number" && Number.isFinite(options.minPrice)) params.set("minPrice", String(options.minPrice));
  if (typeof options.maxPrice === "number" && Number.isFinite(options.maxPrice)) params.set("maxPrice", String(options.maxPrice));
  if (options.cursor) params.set("cursor", options.cursor);
  const result = await signalFetch<SignalCatalogueResponse>("/api/catalogue", params);
  if (!result) return null;
  const products = result.products.flatMap((offer) => {
    const safe = safeCatalogueOffer(offer);
    return safe ? [safe] : [];
  });
  const blocked = Math.max(0, result.products.length - products.length);
  return {
    ...result,
    products,
    count: products.length,
    total: Math.max(products.length, result.total - blocked),
  };
}

export async function searchSignalTruePrice(query: string) {
  const clean = query.trim();
  if (clean.length < 2) return null;
  const result = await signalFetch<SignalTruePriceResponse>("/api/true-price", new URLSearchParams({ q: clean }));
  if (!result) return null;
  const groups = result.groups.flatMap((group) => {
    const offers = group.offers.flatMap((offer) => {
      const safe = safeTruePriceOffer(offer);
      return safe ? [safe] : [];
    });
    return offers.length ? [{ ...group, offers, retailerCount: offers.length }] : [];
  });
  return { ...result, groups, count: groups.length };
}

export function getSignalEngineStatus(timeoutMs = 8_000) {
  return signalFetch<SignalEngineStatus>("/api/status", undefined, timeoutMs);
}

export function getSignalRetailerDirectory(timeoutMs = 8_000) {
  return signalFetch<SignalRetailerDirectoryResponse>("/api/retailers", undefined, timeoutMs);
}
