import { listCanonicalAlertWindow } from "@/lib/canonical-alerts";
import type { NetworkSignal, SignalKind, SignalLifecycle } from "@/lib/dashboard-storage";

const lifecycleStates = new Set<SignalLifecycle>(["whisper", "echo", "manifested", "vanished"]);
const signalKinds = new Set<SignalKind>([
  "whisper", "echo", "manifested", "vanished", "catalogue_new", "catalogue_state_change", "catalogue_price_change",
  "inventory_quantity_change", "product_evidence_change", "stock_watch_refresh", "price_change", "launch_date_change",
  "queue", "security", "access_blocked", "new_listing_live", "availability_live", "restock", "sold_out",
  "lifecycle_unspecified", "drop_pulse",
]);

function knownSignalKind(value: string | null): SignalKind | undefined {
  return value && signalKinds.has(value as SignalKind) ? value as SignalKind : undefined;
}

export async function getCanonicalRecentSignals(limit = 100): Promise<NetworkSignal[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const alerts = await listCanonicalAlertWindow({ limitPerStage: safeLimit });

  return alerts.flatMap((row): NetworkSignal[] => {
    const state = row.fateStage.toLowerCase() as SignalLifecycle;
    const title = row.title.trim();
    const occurredAtMs = Date.parse(row.detectedAt);
    const occurredAt = Number.isFinite(occurredAtMs) ? Math.floor(occurredAtMs / 1000) : NaN;
    if (!lifecycleStates.has(state) || !title || !Number.isFinite(occurredAt) || occurredAt <= 0) return [];

    return [{
      id: row.id,
      state,
      kind: knownSignalKind(row.signalKind),
      title,
      retailer: row.retailer || null,
      detail: row.message || null,
      deliveredPricePence: row.product.deliveredPricePence,
      confidence: Number.isFinite(row.confidence) ? row.confidence : null,
      occurredAt,
    }];
  }).sort((left, right) => right.occurredAt - left.occurredAt || left.id.localeCompare(right.id)).slice(0, safeLimit);
}
