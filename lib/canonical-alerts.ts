import { getLiveCloudSignals, type CloudPublicSignal } from "@/lib/live-signals";
import { classifyProductAlert, type ProductAlertClassification } from "@/lib/product-alert-intelligence";

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

function pence(value: number | null | undefined) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

function roundOne(value: number | null) {
  return value == null || !Number.isFinite(value) ? null : Math.round(value * 10) / 10;
}

function percentage(value: number | null, reference: number | null) {
  if (value == null || reference == null || reference <= 0) return null;
  return ((value - reference) / reference) * 100;
}

function detectedEpoch(signal: CloudPublicSignal) {
  const parsed = Date.parse(String(signal.detectedAt || ""));
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : null;
}

function identity(signal: CloudPublicSignal) {
  return {
    productId: String(signal.productId || signal.target?.productId || ""),
    offerId: String(signal.offerId || signal.target?.offerId || ""),
    retailerId: String(signal.retailerId || signal.target?.retailerId || ""),
    retailer: String(signal.retailerName || "Connected retailer"),
    productUrl: String(signal.productUrl || signal.target?.productUrl || ""),
  };
}

function observedDurationSeconds(signal: CloudPublicSignal, all: CloudPublicSignal[]) {
  if (signal.state !== "vanished") return null;
  const currentAt = detectedEpoch(signal);
  const offerId = identity(signal).offerId;
  if (currentAt == null || !offerId) return null;
  const manifestedAt = all
    .filter((item) => identity(item).offerId === offerId && item.state === "manifested")
    .map(detectedEpoch)
    .filter((value): value is number => value != null && value < currentAt)
    .sort((a, b) => b - a)[0];
  return manifestedAt == null ? null : Math.max(0, currentAt - manifestedAt);
}

function signalThread(signal: CloudPublicSignal, all: CloudPublicSignal[]): CanonicalSignalThreadEntry[] {
  const offerId = identity(signal).offerId;
  if (!offerId) return [];
  return all
    .filter((item) => identity(item).offerId === offerId)
    .flatMap((item): CanonicalSignalThreadEntry[] => {
      const occurredAt = String(item.detectedAt || "");
      const itemIdentity = identity(item);
      if (!occurredAt || !itemIdentity.productUrl) return [];
      return [{
        id: String(item.id),
        state: String(item.state),
        fateStage: publicStage(item.state),
        retailer: itemIdentity.retailer,
        occurredAt,
        reason: String(item.reason || ""),
        pricePence: pence(item.priceGbp),
        stockStatus: item.stockStatus ? String(item.stockStatus) : null,
        previousStockStatus: null,
        url: itemIdentity.productUrl,
      }];
    })
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt))
    .slice(-12);
}

function preparedLinks(signal: CloudPublicSignal, stage: CanonicalSignalStage): CanonicalPreparedLinks {
  const ids = identity(signal);
  return {
    primary: {
      offerId: ids.offerId,
      retailerId: ids.retailerId,
      retailer: ids.retailer,
      url: ids.productUrl,
      itemPricePence: pence(signal.priceGbp),
      deliveredPricePence: pence(signal.deliveredPriceGbp),
      stockStatus: signal.stockStatus ? String(signal.stockStatus) : null,
      intent: stage === "MANIFESTED" ? "buy" : "inspect",
      label: stage === "MANIFESTED" ? "BUY / VIEW PRODUCT" : stage === "VANISHED" ? "VIEW LAST PRODUCT PAGE" : "INSPECT PRODUCT",
    },
    lowestKnown: null,
    officialReference: null,
    alternatives: [],
    compareQuery: signal.title,
    fateFindQuery: signal.title,
  };
}

function notificationCopy(
  signal: CloudPublicSignal,
  stage: CanonicalSignalStage,
  productIntelligence: ProductAlertClassification,
  observedDuration: number | null,
  productUrl: string,
): CanonicalAlert["notification"] {
  const stageLabel = stage === "WHISPER" ? "Whisper" : stage === "ECHO" ? "Echo" : stage === "MANIFESTED" ? "Manifested" : stage === "VANISHED" ? "Vanished" : "Signal";
  const retailer = String(signal.retailerName || "Connected retailer");
  const pricePence = pence(signal.priceGbp);
  const rrpPence = pence(signal.rrpGbp);
  const delta = Number.isFinite(signal.markupPercent) ? Number(signal.markupPercent) : roundOne(percentage(pricePence, rrpPence));
  const lines: string[] = [pricePence == null ? retailer : `${retailer} · £${(pricePence / 100).toFixed(2)}`];

  if (stage === "WHISPER") lines.push("Catalogue or product movement detected · stock is not confirmed");
  if (stage === "ECHO") lines.push("Retailer readiness changed · get ready · stock is not confirmed");
  if (stage === "VANISHED") lines.push("Previously verified availability is no longer present");
  if (rrpPence != null && delta != null) {
    const direction = delta === 0 ? "at RRP" : delta > 0 ? `${delta.toFixed(1)}% over RRP` : `${Math.abs(delta).toFixed(1)}% below RRP`;
    lines.push(`${direction} · RRP £${(rrpPence / 100).toFixed(2)}`);
  }

  return {
    title: `FateDrop · ${stageLabel} · ${signal.title}`,
    body: lines.join("\n"),
    data: {
      route: "alerts",
      alertId: signal.id,
      productUrl,
      stage,
      verdict: "NO_FAIR_COMPARISON",
      lowestKnownUrl: null,
      compareQuery: signal.title,
      productCategory: productIntelligence.category,
      observedDurationSeconds: observedDuration,
      linksPrepared: true,
    },
  };
}

function toCanonicalAlert(signal: CloudPublicSignal, all: CloudPublicSignal[]): CanonicalAlert | null {
  const ids = identity(signal);
  const detectedAt = String(signal.detectedAt || "");
  const stage = publicStage(signal.state);
  if (!signal.id || stage === "NETWORK" || !signal.title || !detectedAt) return null;

  const itemPricePence = pence(signal.priceGbp);
  const deliveredPricePence = pence(signal.deliveredPriceGbp);
  const rrpPence = pence(signal.rrpGbp);
  const productIntelligence = classifyProductAlert({ title: signal.title, productType: signal.productType });
  const observedDuration = observedDurationSeconds(signal, all);
  const links = preparedLinks(signal, stage);
  const rrpDeltaPercent = Number.isFinite(signal.markupPercent)
    ? roundOne(Number(signal.markupPercent))
    : roundOne(percentage(itemPricePence, rrpPence));
  const confidence = Number(signal.confidence);

  return {
    id: String(signal.id),
    type: signal.state.toUpperCase(),
    fateStage: stage,
    productId: ids.productId,
    offerId: ids.offerId,
    retailerId: ids.retailerId,
    title: signal.title,
    message: String(signal.reason || ""),
    retailer: ids.retailer,
    detectedAt,
    observedDurationSeconds: observedDuration,
    productIntelligence,
    confirmed: stage === "MANIFESTED",
    confirmedRestock: stage === "MANIFESTED",
    productUrl: ids.productUrl,
    product: {
      title: signal.title,
      productType: signal.productType || null,
      url: ids.productUrl,
      imageUrl: signal.imageUrl || null,
      pricePence: itemPricePence,
      rrpPence,
      deliveredPricePence,
    },
    priceIntelligence: {
      rrpPence,
      rrpDeltaPercent,
      comparisonBasis: deliveredPricePence != null ? "delivered" : "item",
      verdict: "NO_FAIR_COMPARISON",
      currentComparisonPence: deliveredPricePence ?? itemPricePence,
      lowestKnown: null,
      savingsPence: null,
      savingsPercent: null,
    },
    signalThread: signalThread(signal, all),
    preparedLinks: links,
    notification: notificationCopy(signal, stage, productIntelligence, observedDuration, ids.productUrl),
    confidence: Number.isFinite(confidence) ? confidence : 0,
  };
}

export async function listCanonicalAlerts({ id, limit = 50 }: { id?: string | null; limit?: number } = {}) {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const response = await getLiveCloudSignals(100);
  if (!response?.success || response.source !== "FATEDROP_CLOUD" || !Array.isArray(response.signals)) {
    throw new Error("Canonical Cloud alert feed unavailable");
  }

  const all = response.signals;
  const alerts = all.flatMap((signal): CanonicalAlert[] => {
    const alert = toCanonicalAlert(signal, all);
    return alert ? [alert] : [];
  });
  const filtered = id ? alerts.filter((alert) => alert.id === id) : alerts;
  return filtered.slice(0, safeLimit);
}
