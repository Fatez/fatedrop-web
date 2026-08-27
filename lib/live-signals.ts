export type CloudLifecycleState = "whisper" | "echo" | "manifested" | "vanished";

export type CloudPublicSignal = {
  id: string;
  state: CloudLifecycleState;
  retailerName: string | null;
  title: string;
  deliveredPriceGbp?: number;
  confidence?: number;
  detectedAt?: string;
  reason: string | null;
};

export type CloudSignalResponse = {
  success: boolean;
  contractVersion: number;
  source?: string;
  count: number;
  generatedAt: string;
  signals: CloudPublicSignal[];
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

export async function getLiveCloudSignals(limit = 100, timeoutMs = 8_000) {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const result = await liveFetch<CloudSignalResponse>("/api/signals", new URLSearchParams({ limit: String(safeLimit) }), timeoutMs);
  return result?.contractVersion === PUBLIC_SIGNAL_CONTRACT_VERSION ? result : null;
}

export async function getLiveCloudSignalSummary(days = 7, timeoutMs = 8_000) {
  const safeDays = Math.max(2, Math.min(30, Math.trunc(days)));
  const result = await liveFetch<CloudSignalSummaryResponse>("/api/signal-summary", new URLSearchParams({ days: String(safeDays) }), timeoutMs);
  return result?.contractVersion === PUBLIC_SIGNAL_CONTRACT_VERSION ? result : null;
}
