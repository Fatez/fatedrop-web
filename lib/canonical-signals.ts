import { listCanonicalAlerts } from "@/lib/canonical-alerts";
import type { NetworkSignal, SignalLifecycle } from "@/lib/dashboard-storage";

const lifecycleStates = new Set<SignalLifecycle>(["whisper", "echo", "manifested", "vanished"]);

export async function getCanonicalRecentSignals(limit = 100): Promise<NetworkSignal[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));

  // Dashboard "Recent Signals" is a user-facing lifecycle surface, so it reads
  // the same canonical rich alert windows as Alerts and Mobile. Raw public signal
  // telemetry can include history-only lifecycle anchors and is not a second UI
  // authority.
  const alerts = await listCanonicalAlerts({ limit: safeLimit }).catch(() => []);

  return alerts.flatMap((alert): NetworkSignal[] => {
    const state = String(alert.fateStage || "").toLowerCase() as SignalLifecycle;
    const title = String(alert.title || "").trim();
    const occurredAtMs = Date.parse(String(alert.detectedAt || ""));
    const occurredAt = Number.isFinite(occurredAtMs) ? Math.floor(occurredAtMs / 1000) : NaN;
    if (!lifecycleStates.has(state) || !title || !Number.isFinite(occurredAt) || occurredAt <= 0) return [];

    const deliveredPricePence = alert.product.deliveredPricePence;
    const confidence = Number(alert.confidence);

    return [{
      id: String(alert.id),
      state,
      title,
      retailer: alert.retailer ? String(alert.retailer) : null,
      detail: alert.message ? String(alert.message) : null,
      deliveredPricePence: deliveredPricePence !== null && Number.isFinite(deliveredPricePence) ? deliveredPricePence : null,
      confidence: Number.isFinite(confidence) ? confidence : null,
      occurredAt,
    }];
  }).slice(0, safeLimit);
}
