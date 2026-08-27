import type { NetworkSignal, SignalLifecycle } from "@/lib/dashboard-storage";
import { getLiveCloudSignals } from "@/lib/live-signals";

const lifecycleStates = new Set<SignalLifecycle>(["whisper", "echo", "manifested", "vanished"]);

export async function getCanonicalRecentSignals(limit = 100): Promise<NetworkSignal[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const response = await getLiveCloudSignals(safeLimit);
  if (!response?.success || !Array.isArray(response.signals)) return [];

  return response.signals.flatMap((row): NetworkSignal[] => {
    const state = String(row.state || "") as SignalLifecycle;
    const title = String(row.title || "").trim();
    const occurredAtMs = Date.parse(String(row.detectedAt || ""));
    const occurredAt = Number.isFinite(occurredAtMs) ? Math.floor(occurredAtMs / 1000) : NaN;
    if (!lifecycleStates.has(state) || !title || !Number.isFinite(occurredAt) || occurredAt <= 0) return [];

    const deliveredGbp = row.deliveredPriceGbp === null || row.deliveredPriceGbp === undefined
      ? null
      : Number(row.deliveredPriceGbp);
    const confidence = row.confidence === null || row.confidence === undefined ? null : Number(row.confidence);

    return [{
      id: String(row.id),
      state,
      title,
      retailer: row.retailerName ? String(row.retailerName) : null,
      detail: row.reason ? String(row.reason) : null,
      deliveredPricePence: deliveredGbp !== null && Number.isFinite(deliveredGbp) ? Math.round(deliveredGbp * 100) : null,
      confidence: confidence !== null && Number.isFinite(confidence) ? confidence : null,
      occurredAt,
    }];
  });
}
