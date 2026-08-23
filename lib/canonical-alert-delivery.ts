import { fateDropPostgres } from "@/lib/postgres";

export type CanonicalAlertDelivery = {
  signalId: string;
  result: "sent" | "failed" | "skipped";
  detail: string | null;
  providerMessageId: string | null;
  attemptedAt: number;
};

function isAlertWorthyAttempt(result: string, detail: string | null) {
  if (result === "sent" || result === "failed") return true;
  if (result !== "skipped") return false;
  const reason = String(detail || "").trim();
  return reason !== "disabled" && reason !== "duplicate_batch_signal";
}

export async function listCanonicalAlertDeliveries({
  id,
  limit = 50,
}: {
  id?: string | null;
  limit?: number;
} = {}): Promise<CanonicalAlertDelivery[]> {
  const sql = await fateDropPostgres();
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));

  const rows = id
    ? await sql`
        SELECT s.id AS signal_id,d.result,d.detail,d.provider_message_id,d.attempted_at
        FROM fatedrop_signals s
        JOIN LATERAL (
          SELECT result,detail,provider_message_id,attempted_at
          FROM fatedrop_signal_delivery_attempts
          WHERE signal_id=s.id AND channel='discord'
          ORDER BY attempted_at DESC
          LIMIT 1
        ) d ON true
        WHERE s.id=${id}
        LIMIT 1`
    : await sql`
        SELECT s.id AS signal_id,d.result,d.detail,d.provider_message_id,d.attempted_at
        FROM fatedrop_signals s
        JOIN LATERAL (
          SELECT result,detail,provider_message_id,attempted_at
          FROM fatedrop_signal_delivery_attempts
          WHERE signal_id=s.id AND channel='discord'
          ORDER BY attempted_at DESC
          LIMIT 1
        ) d ON true
        ORDER BY s.detected_at DESC
        LIMIT 500`;

  return rows
    .map((row) => ({
      signalId: String(row.signal_id),
      result: String(row.result) as CanonicalAlertDelivery["result"],
      detail: row.detail == null ? null : String(row.detail),
      providerMessageId: row.provider_message_id == null ? null : String(row.provider_message_id),
      attemptedAt: Number(row.attempted_at),
    }))
    .filter((attempt) => isAlertWorthyAttempt(attempt.result, attempt.detail))
    .slice(0, safeLimit);
}
