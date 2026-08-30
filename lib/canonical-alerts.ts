import { getLiveCloudAlerts, type CloudLifecycleState } from "@/lib/live-signals";
import type { ProductAlertClassification } from "@/lib/product-alert-intelligence";

export type FatePriceVerdict = "LOWEST_KNOWN" | "BETTER_OFFER_FOUND" | "NO_FAIR_COMPARISON";
export type CanonicalSignalStage = "WHISPER" | "ECHO" | "MANIFESTED" | "VANISHED" | "NETWORK";

export type CanonicalOfferLink = {
  offerId: string;
  retailerId: string;
  retailer: string;
  url: string;
  itemPricePence: number | null;
  deliveredPricePence: number | null;
  stockStatus: string | null;
};

export type CanonicalSignalThreadEntry = {
  id: string;
  state: string;
  fateStage: CanonicalSignalStage;
  retailer: string;
  occurredAt: string;
  reason: string;
  pricePence: number | null;
  stockStatus: string | null;
  previousStockStatus: string | null;
  url: string;
};

export type CanonicalPreparedLinks = {
  primary: CanonicalOfferLink & {
    intent: "inspect" | "buy";
    label: string;
  };
  lowestKnown: CanonicalOfferLink | null;
  officialReference: CanonicalOfferLink | null;
  alternatives: CanonicalOfferLink[];
  compareQuery: string;
  fateFindQuery: string;
};

export type CanonicalLiveWindow = {
  manifestedAt: string | null;
  lastConfirmedLiveAt: string | null;
  vanishedAt: string | null;
  observedDurationSeconds: number | null;
  historyComplete: boolean;
};

export type CanonicalAlert = {
  id: string;
  type: string;
  fateStage: CanonicalSignalStage;
  productId: string;
  offerId: string;
  retailerId: string;
  title: string;
  message: string;
  retailer: string;
  detectedAt: string;
  observedDurationSeconds: number | null;
  liveWindow?: CanonicalLiveWindow | null;
  productIntelligence: ProductAlertClassification;
  confirmed: boolean;
  confirmedRestock: boolean;
  productUrl: string;
  product: {
    title: string;
    productType: string | null;
    url: string;
    imageUrl: string | null;
    pricePence: number | null;
    rrpPence: number | null;
    deliveredPricePence: number | null;
  };
  priceIntelligence: {
    rrpPence: number | null;
    rrpDeltaPercent: number | null;
    comparisonBasis: "item" | "delivered";
    verdict: FatePriceVerdict;
    currentComparisonPence: number | null;
    lowestKnown: {
      offerId: string | null;
      retailerId: string | null;
      retailer: string | null;
      url: string | null;
      itemPricePence: number | null;
      deliveredPricePence: number | null;
      comparisonPricePence: number | null;
      stockStatus: string | null;
    } | null;
    savingsPence: number | null;
    savingsPercent: number | null;
  };
  signalThread: CanonicalSignalThreadEntry[];
  preparedLinks: CanonicalPreparedLinks;
  notification: {
    title: string;
    body: string;
    data: {
      route: "alerts";
      alertId: string;
      productUrl: string;
      stage: CanonicalSignalStage;
      verdict: FatePriceVerdict;
      lowestKnownUrl: string | null;
      compareQuery: string;
      productCategory: ProductAlertClassification["category"];
      observedDurationSeconds: number | null;
      linksPrepared: true;
    };
  };
  confidence: number;
};

export function publicStage(state: string): CanonicalSignalStage {
  if (state === "whisper") return "WHISPER";
  if (state === "echo") return "ECHO";
  if (state === "manifested") return "MANIFESTED";
  if (state === "vanished") return "VANISHED";
  return "NETWORK";
}

const canonicalStages = new Set<CanonicalSignalStage>(["WHISPER", "ECHO", "MANIFESTED", "VANISHED"]);
const canonicalLifecycleStates: readonly CloudLifecycleState[] = ["whisper", "echo", "manifested", "vanished"];
const priceVerdicts = new Set<FatePriceVerdict>(["LOWEST_KNOWN", "BETTER_OFFER_FOUND", "NO_FAIR_COMPARISON"]);

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nullableString(value: unknown) {
  return value === null || typeof value === "string";
}

function nullableFiniteNumber(value: unknown) {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isCanonicalLiveWindow(value: unknown) {
  if (value == null) return true;
  if (!isObject(value)) return false;
  return nullableString(value.manifestedAt)
    && nullableString(value.lastConfirmedLiveAt)
    && nullableString(value.vanishedAt)
    && nullableFiniteNumber(value.observedDurationSeconds)
    && typeof value.historyComplete === "boolean";
}

function isCanonicalAlert(value: unknown): value is CanonicalAlert {
  if (!isObject(value)) return false;
  if (typeof value.id !== "string" || !value.id) return false;
  if (typeof value.title !== "string" || !value.title) return false;
  if (typeof value.detectedAt !== "string" || !value.detectedAt) return false;
  if (typeof value.fateStage !== "string" || !canonicalStages.has(value.fateStage as CanonicalSignalStage)) return false;
  if (!isCanonicalLiveWindow(value.liveWindow)) return false;
  if (!isObject(value.product) || !isObject(value.priceIntelligence) || !isObject(value.preparedLinks) || !isObject(value.notification)) return false;
  if (typeof value.priceIntelligence.verdict !== "string" || !priceVerdicts.has(value.priceIntelligence.verdict as FatePriceVerdict)) return false;
  if (!Array.isArray(value.signalThread)) return false;
  return true;
}

function sortNewestFirst(alerts: CanonicalAlert[]) {
  return alerts.sort((left, right) => {
    const rightAt = Date.parse(right.detectedAt);
    const leftAt = Date.parse(left.detectedAt);
    return (Number.isFinite(rightAt) ? rightAt : 0) - (Number.isFinite(leftAt) ? leftAt : 0);
  });
}

async function readCanonicalAlertWindow({
  id,
  state,
  limit,
}: {
  id?: string | null;
  state?: CloudLifecycleState | null;
  limit: number;
}) {
  const response = await getLiveCloudAlerts({ id, state, limit });
  if (!response?.success || response.available !== true || response.source !== "FATEDROP_CLOUD" || !Array.isArray(response.alerts)) {
    throw new Error("Canonical Cloud alert feed unavailable");
  }
  return response.alerts.filter(isCanonicalAlert).slice(0, limit);
}

export async function listCanonicalAlerts({
  id,
  state,
  limit = 50,
}: {
  id?: string | null;
  state?: CloudLifecycleState | null;
  limit?: number;
} = {}) {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));

  // A specific alert or lifecycle always uses one Cloud-owned stage window.
  if (id || state) return readCanonicalAlertWindow({ id, state, limit: safeLimit });

  // Unscoped lifecycle consumers must never read one mixed newest-N window and
  // bucket it afterwards. Read the same four canonical stage windows used by
  // Mobile, then compose them for "All" views. This makes Web and App share the
  // same lifecycle source semantics while keeping Cloud as the only authority.
  const windows = await Promise.all(
    canonicalLifecycleStates.map((lifecycleState) => readCanonicalAlertWindow({ state: lifecycleState, limit: safeLimit })),
  );
  const byId = new Map<string, CanonicalAlert>();
  for (const window of windows) {
    for (const alert of window) byId.set(alert.id, alert);
  }
  return sortNewestFirst([...byId.values()]);
}
