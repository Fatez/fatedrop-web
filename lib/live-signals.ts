export type CloudLifecycleState = "whisper" | "echo" | "manifested" | "vanished";

export type CloudPublicSignal = {
  id: string;
  tcgCode?: string;
  state: CloudLifecycleState;
  kind?: string | null;
  deliveryPolicy?: "interrupt" | "inbox_only" | "history_only" | "anomaly_quarantine";
  interruptEligible?: boolean;
  facets?: CloudAlertFacets;
  productId: string | null;
  offerId: string | null;
  retailerId: string | null;
  retailerName: string | null;
  title: string;
  productType: string | null;
  productUrl: string | null;
  imageUrl: string | null;
  priceGbp?: number;
  deliveredPriceGbp?: number;
  rrpGbp?: number;
  markupPercent?: number;
  stockStatus?: string;
  confidence?: number;
  detectedAt?: string;
  reason: string | null;
  target?: {
    type?: string;
    productId?: string | null;
    offerId?: string | null;
    retailerId?: string | null;
    productUrl?: string | null;
    query?: string;
  };
};

export type CloudAlertLanguageGroup = "english" | "japanese" | "korean" | "simplified_chinese" | "traditional_chinese" | "other" | "unknown";
export type CloudAlertMarketGroup = "english" | "japanese" | "korean" | "simplified_chinese" | "traditional_chinese" | "other" | "unknown";
export type CloudAlertMarketStatus = "verified" | "reused" | "candidate" | "unknown" | "conflict";

export type CloudAlertFacets = {
  version: number;
  languageGroup: CloudAlertLanguageGroup;
  languageCode: string | null;
  marketCode: string | null;
  marketGroup?: CloudAlertMarketGroup;
  marketStatus?: CloudAlertMarketStatus;
  languageLabel: string;
  setKey: string | null;
  setName: string | null;
  confidence: { language: number; market?: number; set: number };
  source: { language: string; market?: string; set: string };
};

export type CloudSignalResponse = {
  success: boolean;
  contractVersion: number;
  source?: string;
  count: number;
  generatedAt: string;
  signals: CloudPublicSignal[];
};

export type CloudAlertResponse = {
  success: boolean;
  available: boolean;
  contractVersion: number;
  source?: string;
  count: number;
  generatedAt: string;
  alerts: unknown[];
};

export type CloudAlertFacetOptionsResponse = {
  success: boolean;
  available: boolean;
  contractVersion: number;
  source?: string;
  generatedAt: string;
  version: number;
  languages: Array<{ key: CloudAlertLanguageGroup; label: string }>;
  markets?: Array<{ key: CloudAlertMarketGroup; label: string }>;
  sets: Array<{ key: string; name: string }>;
};

export type CloudSignalTrendPoint = { measuredAt: number; value: number };
export type CloudDeliveryTrendPoint = {
  measuredAt: number;
  sent: number;
  policySkipped: number;
  duplicateSuppressed?: number;
  issues: number;
};

export type CloudSignalSummaryResponse = {
  success: boolean;
  available: boolean;
  contractVersion: number;
  source?: string;
  generatedAt: string;
  days?: number;
  day0?: number;
  lifecycle?: Record<CloudLifecycleState, {
    total: number;
    today: number;
    trend: CloudSignalTrendPoint[];
  }>;
  delivery?: Record<CloudLifecycleState, {
    sent: number;
    policySkipped: number;
    duplicateSuppressed?: number;
    issues: number;
    todaySent: number;
    trend: CloudDeliveryTrendPoint[];
  }>;
};

const DEFAULT_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";
const PUBLIC_SIGNAL_CONTRACT_VERSION = 1;

function signalEngineBaseUrl() {
  return (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
}

async function liveFetch<T>(pathname: string, params: URLSearchParams, timeoutMs = 8_000): Promise<T | null> {
  const url = new URL(pathname, `${signalEngineBaseUrl()}/`);
  url.search = params.toString();
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(Math.max(500, timeoutMs)),
    });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

function validCloudContract(result: { contractVersion?: number; source?: string } | null | undefined) {
  return result?.contractVersion === PUBLIC_SIGNAL_CONTRACT_VERSION && result.source === "FATEDROP_CLOUD";
}

export async function getLiveCloudSignals(limit = 100, timeoutMs = 8_000) {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const result = await liveFetch<CloudSignalResponse>("/api/signals", new URLSearchParams({ limit: String(safeLimit) }), timeoutMs);
  return validCloudContract(result) ? result : null;
}

export async function getLiveCloudSignalsByState({
  state,
  since = 0,
  limit = 100,
  timeoutMs = 8_000,
}: {
  state: CloudLifecycleState;
  since?: number;
  limit?: number;
  timeoutMs?: number;
}) {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const safeSince = Math.max(0, Math.trunc(since));
  const result = await liveFetch<CloudSignalResponse>(
    "/api/signals",
    new URLSearchParams({ state, since: String(safeSince), limit: String(safeLimit) }),
    timeoutMs,
  );
  return validCloudContract(result) ? result : null;
}

export async function getLiveCloudAlerts({
  id,
  state,
  since,
  before,
  beforeId,
  limit = 50,
  timeoutMs = 8_000,
}: {
  id?: string | null;
  state?: CloudLifecycleState | null;
  since?: number | null;
  before?: number | null;
  beforeId?: string | null;
  limit?: number;
  timeoutMs?: number;
} = {}) {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const params = new URLSearchParams({ detail: "alerts", limit: String(safeLimit) });
  if (id) params.set("id", id);
  if (state) params.set("state", state);
  if (since && since > 0) params.set("since",String(Math.trunc(since)));
  if (before && before > 0) params.set("before",String(Math.trunc(before)));
  if (beforeId) params.set("beforeId",beforeId);
  const result = await liveFetch<CloudAlertResponse>("/api/signals", params, timeoutMs);
  return validCloudContract(result) ? result : null;
}

export async function getLiveCloudAlertFacets(timeoutMs = 8_000) {
  const result = await liveFetch<CloudAlertFacetOptionsResponse>("/api/alert-facets", new URLSearchParams(), timeoutMs);
  if (!validCloudContract(result) || result?.available !== true || !Array.isArray(result.languages) || !Array.isArray(result.sets)) return null;
  return result;
}

export async function getLiveCloudSignalSummary(days = 7, timeoutMs = 8_000) {
  const safeDays = Math.max(2, Math.min(30, Math.trunc(days)));
  const result = await liveFetch<CloudSignalSummaryResponse>("/api/signal-summary", new URLSearchParams({ days: String(safeDays) }), timeoutMs);
  return validCloudContract(result) ? result : null;
}
