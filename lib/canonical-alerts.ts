import { getLiveCloudAlerts, type CloudAlertFacets, type CloudLifecycleState } from "@/lib/live-signals";
import type { ProductAlertClassification } from "@/lib/product-alert-intelligence";

export type FatePriceVerdict = "LOWEST_KNOWN" | "BETTER_OFFER_FOUND" | "NO_FAIR_COMPARISON";
export type CanonicalSignalStage = "WHISPER" | "ECHO" | "MANIFESTED" | "VANISHED" | "NETWORK";
export type CanonicalAlertDeliveryPolicy = "interrupt" | "inbox_only" | "history_only" | "anomaly_quarantine";
export type CanonicalAlertFacets = CloudAlertFacets;

export type CanonicalAlertPresentation = {
  referenceKind: string | null;
  referenceBasis: string | null;
  sourceMarket: string | null;
  sourceCurrency: string | null;
  sourceMsrp: string | null;
};

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

export type CanonicalStockEpisode = {
  id:string;
  scopeType:string|null;
  cycleNumber:number|null;
  episodeState:string|null;
  availabilityState:string|null;
  openedAt:string|null;
  manifestedAt:string|null;
  vanishedAt:string|null;
  latestEventAt:string|null;
  eventStage:string|null;
  eventAvailabilityEffect:string|null;
};

export type CanonicalOpportunity = {
  eventKind: "listing_discovered" | "evidence_changed" | "retailer_behaviour_changed" | "availability_started" | "new_retailer_available" | "availability_ended";
  current: boolean;
  currentViewKind: "still_available" | null;
  firstManifestedAt: string | null;
  lastVerifiedAt: string | null;
};

export type CanonicalAlert = {
  id: string;
  tcgCode: string;
  type: string;
  fateStage: CanonicalSignalStage;
  productId: string;
  offerId: string;
  retailerId: string;
  title: string;
  message: string;
  signalKind: string | null;
  deliveryPolicy: CanonicalAlertDeliveryPolicy;
  interruptEligible: boolean;
  facets: CanonicalAlertFacets;
  retailer: string;
  detectedAt: string;
  observedDurationSeconds: number | null;
  liveWindow?: CanonicalLiveWindow | null;
  stockEpisode?: CanonicalStockEpisode | null;
  opportunity?: CanonicalOpportunity | null;
  productIntelligence: ProductAlertClassification;
  confirmed: boolean;
  confirmedRestock: boolean;
  productUrl: string;
  product: {
    title: string;
    tcgCode: string;
    productType: string | null;
    url: string;
    imageUrl: string | null;
    pricePence: number | null;
    rrpPence: number | null;
    deliveredPricePence: number | null;
    stockStatus: string | null;
  };
  presentation: CanonicalAlertPresentation;
  delivery: {
    discord: {
      status: string;
      attemptedAt: string | null;
      issue: string | null;
      providerMessageId: string | null;
    } | null;
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
      tcgCode: string;
      productUrl: string;
      stage: CanonicalSignalStage;
      verdict: FatePriceVerdict;
      lowestKnownUrl: string | null;
      compareQuery: string;
      productCategory: ProductAlertClassification["category"];
      signalKind: string | null;
      languageGroup: CanonicalAlertFacets["languageGroup"] | null;
      setKey: string | null;
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
const priceVerdicts = new Set<FatePriceVerdict>(["LOWEST_KNOWN", "BETTER_OFFER_FOUND", "NO_FAIR_COMPARISON"]);
const deliveryPolicies = new Set<CanonicalAlertDeliveryPolicy>(["interrupt", "inbox_only", "history_only", "anomaly_quarantine"]);
const languageGroups = new Set(["english", "japanese", "korean", "simplified_chinese", "traditional_chinese", "other", "unknown"]);
const marketGroups = new Set(["english", "japanese", "korean", "simplified_chinese", "traditional_chinese", "other", "unknown"]);
const marketStatuses = new Set(["verified", "reused", "candidate", "unknown", "conflict"]);

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

function isCanonicalOpportunity(value: unknown) {
  if (value == null) return true;
  if (!isObject(value)) return false;
  return ["listing_discovered", "evidence_changed", "retailer_behaviour_changed", "availability_started", "new_retailer_available", "availability_ended"].includes(String(value.eventKind))
    && typeof value.current === "boolean"
    && (value.currentViewKind === null || value.currentViewKind === "still_available")
    && nullableString(value.firstManifestedAt)
    && nullableString(value.lastVerifiedAt);
}

function isCanonicalAlertFacets(value: unknown): value is CanonicalAlertFacets {
  if (!isObject(value) || (value.version !== 1 && value.version !== 2)) return false;
  if (typeof value.languageGroup !== "string" || !languageGroups.has(value.languageGroup)) return false;
  if (!nullableString(value.languageCode) || !nullableString(value.marketCode) || typeof value.languageLabel !== "string") return false;
  if (!nullableString(value.setKey) || !nullableString(value.setName)) return false;
  if (!isObject(value.confidence) || typeof value.confidence.language !== "number" || typeof value.confidence.set !== "number") return false;
  if (!isObject(value.source) || typeof value.source.language !== "string" || typeof value.source.set !== "string") return false;
  if (value.version === 1) return true;
  return typeof value.marketGroup === "string"
    && marketGroups.has(value.marketGroup)
    && typeof value.marketStatus === "string"
    && marketStatuses.has(value.marketStatus)
    && typeof value.confidence.market === "number"
    && typeof value.source.market === "string";
}

function isCanonicalPresentation(value: unknown): value is CanonicalAlertPresentation {
  return isObject(value)
    && nullableString(value.referenceKind)
    && nullableString(value.referenceBasis)
    && nullableString(value.sourceMarket)
    && nullableString(value.sourceCurrency)
    && nullableString(value.sourceMsrp);
}

function isCanonicalDelivery(value: unknown) {
  if (!isObject(value)) return false;
  if (value.discord === null) return true;
  return isObject(value.discord)
    && typeof value.discord.status === "string"
    && nullableString(value.discord.attemptedAt)
    && nullableString(value.discord.issue)
    && nullableString(value.discord.providerMessageId);
}

function isCanonicalAlert(value: unknown): value is CanonicalAlert {
  if (!isObject(value)) return false;
  if (typeof value.id !== "string" || !value.id) return false;
  if (typeof value.tcgCode !== "string" || !value.tcgCode) return false;
  if (typeof value.title !== "string" || !value.title) return false;
  if (typeof value.detectedAt !== "string" || !value.detectedAt) return false;
  if (typeof value.fateStage !== "string" || !canonicalStages.has(value.fateStage as CanonicalSignalStage)) return false;
  if (!nullableString(value.signalKind)) return false;
  if (typeof value.deliveryPolicy !== "string" || !deliveryPolicies.has(value.deliveryPolicy as CanonicalAlertDeliveryPolicy)) return false;
  if (typeof value.interruptEligible !== "boolean" || !isCanonicalAlertFacets(value.facets)) return false;
  if (!isCanonicalLiveWindow(value.liveWindow)) return false;
  if (!isCanonicalOpportunity(value.opportunity)) return false;
  if (!isObject(value.product) || !isObject(value.priceIntelligence) || !isObject(value.preparedLinks) || !isObject(value.notification)) return false;
  if (!nullableString(value.product.stockStatus) || !isCanonicalPresentation(value.presentation) || !isCanonicalDelivery(value.delivery)) return false;
  if (typeof value.priceIntelligence.verdict !== "string" || !priceVerdicts.has(value.priceIntelligence.verdict as FatePriceVerdict)) return false;
  if (!Array.isArray(value.signalThread)) return false;
  return true;
}

export async function listCanonicalAlerts({
  id,
  state,
  currentOnly = false,
  limit = 50,
}: {
  id?: string | null;
  state?: CloudLifecycleState | null;
  currentOnly?: boolean;
  limit?: number;
} = {}) {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const response = await getLiveCloudAlerts({ id, state, currentOnly, limit: safeLimit });
  if (!response?.success || response.available !== true || response.source !== "FATEDROP_CLOUD" || !Array.isArray(response.alerts)) {
    throw new Error("Canonical Cloud alert feed unavailable");
  }
  const alerts = response.alerts.filter(isCanonicalAlert);
  const current = currentOnly
    ? alerts.filter((alert) => alert.fateStage === "MANIFESTED"
      && alert.liveWindow?.historyComplete === true
      && alert.liveWindow.vanishedAt === null
      && alert.liveWindow.lastConfirmedLiveAt !== null
      && alert.opportunity?.current !== false)
    : alerts;
  return current.slice(0, safeLimit);
}

const balancedLifecycleStates = ["whisper", "echo", "manifested", "vanished"] as const satisfies readonly CloudLifecycleState[];

export async function listCanonicalAlertWindow({
  id,
  state,
  currentOnly = false,
  limitPerStage = 50,
}: {
  id?: string | null;
  state?: CloudLifecycleState | null;
  currentOnly?: boolean;
  limitPerStage?: number;
} = {}) {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limitPerStage)));
  if (id || state || currentOnly) return listCanonicalAlerts({ id, state, currentOnly, limit: safeLimit });

  const windows = await Promise.all(
    balancedLifecycleStates.map((lifecycleState) => listCanonicalAlerts({ state: lifecycleState, limit: safeLimit })),
  );
  const byId = new Map<string, CanonicalAlert>();
  for (const alert of windows.flat()) byId.set(alert.id, alert);
  return [...byId.values()].sort((left, right) => (
    Date.parse(right.detectedAt) - Date.parse(left.detectedAt) || left.id.localeCompare(right.id)
  ));
}

export async function listCanonicalAlertRecoveryWindow({since,maxPagesPerStage=50}:{since:number;maxPagesPerStage?:number}) {
  const safeSince=Math.max(0,Math.trunc(since));
  const pages=Math.max(1,Math.min(50,Math.trunc(maxPagesPerStage)));
  const byId=new Map<string,CanonicalAlert>();
  await Promise.all(balancedLifecycleStates.map(async(state)=>{
    let before:number|null=null;
    let beforeId:string|null=null;
    let complete=false;
    for(let page=0;page<pages;page+=1){
      const response=await getLiveCloudAlerts({state,since:safeSince,before,beforeId,limit:100});
      if(!response?.success||response.available!==true||response.source!=="FATEDROP_CLOUD"||!Array.isArray(response.alerts))throw new Error("Canonical Cloud alert recovery feed unavailable");
      const alerts=response.alerts.filter(isCanonicalAlert);
      for(const alert of alerts)byId.set(alert.id,alert);
      if(response.alerts.length<100||!alerts.length){complete=true;break;}
      const last=alerts[alerts.length-1];
      const lastEpoch=Math.floor(Date.parse(last.detectedAt)/1000);
      if(!Number.isFinite(lastEpoch))throw new Error("Canonical Cloud alert recovery cursor invalid");
      if(lastEpoch<=safeSince){complete=true;break;}
      before=lastEpoch;beforeId=last.id;
    }
    if(!complete)throw new Error(`Canonical Cloud ${state} recovery window exceeded the safe page budget`);
  }));
  return [...byId.values()].sort((left,right)=>Date.parse(right.detectedAt)-Date.parse(left.detectedAt)||left.id.localeCompare(right.id));
}
