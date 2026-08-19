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

export async function searchSignalCatalogue(query: string, options: { inStock?: boolean; limit?: number; sort?: "price" | "title" } = {}) {
  const clean = query.trim();
  if (clean.length < 2) return null;
  const params = new URLSearchParams({ q: clean, limit: String(Math.min(Math.max(options.limit ?? 50, 1), 100)) });
  if (options.inStock) params.set("inStock", "true");
  if (options.sort) params.set("sort", options.sort);
  return signalFetch<SignalCatalogueResponse>("/api/catalogue", params);
}

export function getSignalEngineStatus() {
  return signalFetch<SignalEngineStatus>("/api/status");
}
