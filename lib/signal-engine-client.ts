import { safeExternalHttpsUrl } from "./external-url";

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

export type SignalFateFindOpportunity = {
  rank: number;
  rankingBasis: "rrp_value" | "true_price_rrp_unavailable";
  productId: string | null;
  productTitle: string;
  productType: string | null;
  tcg: string;
  offerId: string | null;
  retailerId: string | null;
  retailerName: string | null;
  url: string | null;
  stockStatus: string;
  lastSeenAt: number | null;
  itemPricePence: number | null;
  deliveryKnown: boolean;
  deliveryPence: number | null;
  truePricePence: number | null;
  rrpResolved: boolean;
  rrpPence: number | null;
  rrpKind: string | null;
  rrpSource: string | null;
  rrpReferenceBasis: string | null;
  rrpReason: string | null;
  rrpApplicabilityReason: string | null;
  itemVsRrpDeltaPence: number | null;
  percentAboveRrp: number | null;
  valueLabel: string | null;
  qualifyingReasons: string[];
};

export type SignalFateFindResponse = {
  success: boolean;
  contractVersion: 1;
  query: string;
  generatedAt: number;
  comparisonStatus: "no_matches" | "ranked_by_rrp_value" | "ranked_without_rrp";
  bestOpportunity: SignalFateFindOpportunity | null;
  rankedOffers: SignalFateFindOpportunity[];
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

export type SignalRetailerMonitoring = {
  configured: boolean;
  healthy: boolean;
  stale: boolean;
  baselineCompleted: boolean;
  productsSeen: number | null;
  lastScanAt: number | null;
  lastSuccessAt: number | null;
};

export type SignalRetailerDirectoryRecord = {
  id: string;
  name: string;
  websiteUrl: string | null;
  logoUrl?: string | null;
  description?: string | null;
  retailerClass: string;
  verification: string;
  tcgs: string[];
  online: boolean;
  physicalStores: boolean | null;
  physicalLocations: number | null;
  monitoring: SignalRetailerMonitoring;
};

export type SignalRetailerLocation = {
  id: string;
  retailerId: string;
  name: string;
  address: string | null;
  postcode: string | null;
  latitude: number;
  longitude: number;
  websiteUrl: string | null;
  phone: string | null;
  verification: string;
};

export type SignalRetailerProfile = SignalRetailerDirectoryRecord & {
  locations: SignalRetailerLocation[];
};

export type SignalRetailerDirectoryResponse = {
  success: boolean;
  retailers: SignalRetailerDirectoryRecord[];
  disclaimer?: string;
};

export type SignalRetailerProfileResponse = {
  success: boolean;
  retailer: SignalRetailerProfile;
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

function safeFateFindOpportunity(offer: SignalFateFindOpportunity): SignalFateFindOpportunity {
  return { ...offer, url: offer.url ? safeExternalHttpsUrl(offer.url) : null };
}

function safeRetailerProfile(profile: SignalRetailerProfile): SignalRetailerProfile {
  return {
    ...profile,
    websiteUrl: safeExternalHttpsUrl(profile.websiteUrl),
    logoUrl: safeExternalHttpsUrl(profile.logoUrl),
    locations: Array.isArray(profile.locations) ? profile.locations.map((location) => ({
      ...location,
      websiteUrl: safeExternalHttpsUrl(location.websiteUrl),
    })) : [],
  };
}

async function retailerFilterForQuery(query: string) {
  const normalized = query.trim().toLocaleLowerCase("en-GB");
  if (!normalized) return null;
  const directory = await getSignalRetailerDirectory();
  const retailer = directory?.retailers.find((item) => item.name.toLocaleLowerCase("en-GB") === normalized);
  return retailer?.id ?? null;
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
  const inferredRetailer = options.retailer ? null : await retailerFilterForQuery(clean);
  const retailerFilter = options.retailer ?? inferredRetailer;
  if (clean.length < 2 && !retailerFilter) return null;

  const params = new URLSearchParams({ limit: String(Math.min(Math.max(options.limit ?? 50, 1), 100)) });
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

export async function searchSignalFateFind(query: string) {
  const clean = query.trim();
  if (clean.length < 2) return null;
  const result = await signalFetch<SignalFateFindResponse>("/api/fatefind", new URLSearchParams({ q: clean }));
  if (!result) return null;
  const rankedOffers = result.rankedOffers.map(safeFateFindOpportunity);
  const bestOpportunity = rankedOffers.find((offer) => offer.rank === 1) ?? null;
  return { ...result, rankedOffers, bestOpportunity };
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

export async function getSignalRetailerProfile(retailerId: string, timeoutMs = 8_000) {
  const cleanId = retailerId.trim();
  if (!cleanId) return null;
  const result = await signalFetch<SignalRetailerProfileResponse>(`/api/retailers/${encodeURIComponent(cleanId)}`, undefined, timeoutMs);
  if (!result?.retailer) return null;
  return { ...result, retailer: safeRetailerProfile(result.retailer) };
}
