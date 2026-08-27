import { fateDropPostgres } from "@/lib/postgres";
import type { NetworkSignal, SignalLifecycle } from "@/lib/dashboard-storage";

const lifecycleStates = new Set<SignalLifecycle>(["whisper", "echo", "manifested", "vanished"]);

export async function getCanonicalRecentSignals(limit = 100): Promise<NetworkSignal[]> {
  const sql = await fateDropPostgres();
  const safeLimit = Math.max(1, Math.min(250, Math.trunc(limit)));
  const rows = await sql`
    SELECT
      s.id,
      s.state,
      s.retailer_name,
      s.title,
      s.delivered_price_pence,
      s.confidence,
      s.detected_at,
      s.reason
    FROM fatedrop_signals s
    WHERE s.state IN ('whisper','echo','manifested','vanished')
      AND (
        s.state <> 'vanished'
        OR EXISTS (
          SELECT 1
          FROM fatedrop_signals m
          WHERE m.offer_id=s.offer_id
            AND m.state='manifested'
            AND m.detected_at < s.detected_at
            AND NOT EXISTS (
              SELECT 1
              FROM fatedrop_signals v
              WHERE v.offer_id=s.offer_id
                AND v.state='vanished'
                AND v.detected_at > m.detected_at
                AND v.detected_at < s.detected_at
            )
        )
      )
    ORDER BY s.detected_at DESC
    LIMIT ${safeLimit}`;

  return rows.flatMap((row): NetworkSignal[] => {
    const state = String(row.state || "") as SignalLifecycle;
    const title = String(row.title || "").trim();
    const occurredAt = Number(row.detected_at);
    if (!lifecycleStates.has(state) || !title || !Number.isFinite(occurredAt) || occurredAt <= 0) return [];
    const delivered = row.delivered_price_pence === null || row.delivered_price_pence === undefined
      ? null
      : Number(row.delivered_price_pence);
    const confidence = row.confidence === null || row.confidence === undefined ? null : Number(row.confidence);
    return [{
      id: String(row.id),
      state,
      title,
      retailer: row.retailer_name ? String(row.retailer_name) : null,
      detail: row.reason ? String(row.reason) : null,
      deliveredPricePence: Number.isFinite(delivered) ? delivered : null,
      confidence: Number.isFinite(confidence) ? confidence : null,
      occurredAt,
    }];
  });
}
