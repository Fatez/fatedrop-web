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
  offers: SignalTruePriceOffer[];
};

export type SignalTruePriceResponse = {
  success: boolean;
  count: number;
  groups: SignalTruePriceGroup[];
  disclaimer: string;
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
};

function signalEngineBaseUrl() {
  return (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
}

async function signalFetch<T>(pathname: string, params?: URLSearchParams): Promise<T | null> {
  const url = new URL(pathname, `${signalEngineBaseUrl()}/`);
  if (params) url.search = params.toString();
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export async function searchSignalCatalogue(query: string, options: {
  inStock?: boolean;
  limit?: number;
  sort?: "price" | "title";
  retailer?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  cursor?: string;
} = {}) {
  const clean = query.trim();
  if (clean.length < 2) return null;
  const params = new URLSearchParams({ q: clean, limit: String(Math.min(Math.max(options.limit ?? 50, 1), 100)) });
  if (options.inStock) params.set("inStock", "true");
  if (options.sort) params.set("sort", options.sort);
  if (options.retailer) params.set("retailer", options.retailer);
  if (options.category) params.set("category", options.category);
  if (typeof options.minPrice === "number" && Number.isFinite(options.minPrice)) params.set("minPrice", String(options.minPrice));
  if (typeof options.maxPrice === "number" && Number.isFinite(options.maxPrice)) params.set("maxPrice", String(options.maxPrice));
  if (options.cursor) params.set("cursor", options.cursor);
  return signalFetch<SignalCatalogueResponse>("/api/catalogue", params);
}

export async function searchSignalTruePrice(query: string) {
  const clean = query.trim();
  if (clean.length < 2) return null;
  return signalFetch<SignalTruePriceResponse>("/api/true-price", new URLSearchParams({ q: clean }));
}

export function getSignalEngineStatus() {
  return signalFetch<SignalEngineStatus>("/api/status");
}
