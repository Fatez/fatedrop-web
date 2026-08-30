import { fateDropPostgres } from "@/lib/postgres";

const EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts";
const MIN_RECEIPT_AGE_SECONDS = 15 * 60;
const MAX_RECEIPT_AGE_SECONDS = 24 * 60 * 60;
const MAX_RECEIPTS_PER_BATCH = 500;
const MAX_ATTEMPTS = 3;

type ReceiptCandidate = {
  attempt_id: string;
  outbox_id: string;
  provider_message_id: string;
  attempted_at: number;
  attempts: number;
  endpoint_id: string | null;
};

type ExpoReceipt = {
  status?: "ok" | "error";
  message?: string;
  details?: { error?: string };
};

type ExpoReceiptResponse = {
  data?: Record<string, ExpoReceipt>;
  errors?: unknown;
};

export type ExpoReceiptReconciliation = {
  schemaReady: boolean;
  candidates: number;
  checked: number;
  delivered: number;
  failed: number;
  pending: number;
  error: string | null;
};

function detailFor(receipt: ExpoReceipt) {
  return receipt.message || receipt.details?.error || "Expo reported a push receipt failure.";
}

function schemaUnavailable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  return code === "42703" || code === "42P01";
}

export async function ensureExpoPushReceiptSchema() {
  const sql = await fateDropPostgres();
  await sql`ALTER TABLE fatedrop_notification_delivery_attempts ADD COLUMN IF NOT EXISTS receipt_status text`;
  await sql`ALTER TABLE fatedrop_notification_delivery_attempts ADD COLUMN IF NOT EXISTS receipt_checked_at bigint`;
  await sql`ALTER TABLE fatedrop_notification_delivery_attempts ADD COLUMN IF NOT EXISTS receipt_detail text`;
  await sql`CREATE INDEX IF NOT EXISTS fatedrop_notification_delivery_receipt_pending_idx
    ON fatedrop_notification_delivery_attempts (attempted_at ASC)
    WHERE result='sent' AND provider_message_id IS NOT NULL AND receipt_checked_at IS NULL`;
  return { schemaReady: true };
}

async function candidates(now: number, limit: number) {
  const sql = await fateDropPostgres();
  const eligibleBefore = now - MIN_RECEIPT_AGE_SECONDS;
  const oldestAllowed = now - MAX_RECEIPT_AGE_SECONDS;
  const rows = await sql`
    SELECT
      attempt.id AS attempt_id,
      attempt.outbox_id,
      attempt.provider_message_id,
      attempt.attempted_at,
      outbox.attempts,
      NULLIF(outbox.payload_json->>'endpointId','') AS endpoint_id
    FROM fatedrop_notification_delivery_attempts attempt
    JOIN fatedrop_notification_outbox outbox ON outbox.id=attempt.outbox_id
    WHERE attempt.result='sent'
      AND attempt.provider_message_id IS NOT NULL
      AND attempt.receipt_checked_at IS NULL
      AND attempt.attempted_at <= ${eligibleBefore}
      AND attempt.attempted_at >= ${oldestAllowed}
    ORDER BY attempt.attempted_at ASC
    LIMIT ${Math.max(1, Math.min(MAX_RECEIPTS_PER_BATCH, limit))}`;
  return rows as ReceiptCandidate[];
}

async function recordDelivered(candidate: ReceiptCandidate, now: number) {
  const sql = await fateDropPostgres();
  await sql`
    UPDATE fatedrop_notification_delivery_attempts
    SET receipt_status='ok',receipt_checked_at=${now},receipt_detail=NULL
    WHERE id=${candidate.attempt_id}`;
}

async function recordFailed(candidate: ReceiptCandidate, receipt: ExpoReceipt, now: number) {
  const sql = await fateDropPostgres();
  const errorCode = receipt.details?.error || null;
  const detail = detailFor(receipt);
  const deadToken = errorCode === "DeviceNotRegistered";

  await sql`
    UPDATE fatedrop_notification_delivery_attempts
    SET receipt_status='error',receipt_checked_at=${now},receipt_detail=${detail}
    WHERE id=${candidate.attempt_id}`;

  await sql`
    UPDATE fatedrop_notification_outbox
    SET
      state='failed',
      attempts=CASE WHEN ${deadToken} THEN GREATEST(attempts,${MAX_ATTEMPTS}) ELSE attempts END,
      last_error=${detail},
      next_attempt_at=${now},
      updated_at=${now}
    WHERE id=${candidate.outbox_id}`;

  if (candidate.endpoint_id) {
    await sql`
      UPDATE fatedrop_push_endpoints
      SET
        last_failure_at=${now},
        failure_reason=${detail},
        enabled=CASE WHEN ${deadToken} THEN false ELSE enabled END,
        updated_at=${now}
      WHERE id=${candidate.endpoint_id}`;
  }
}

export async function reconcileExpoPushReceipts({
  now = Math.floor(Date.now() / 1000),
  limit = MAX_RECEIPTS_PER_BATCH,
  fetchImpl = fetch,
}: {
  now?: number;
  limit?: number;
  fetchImpl?: typeof fetch;
} = {}): Promise<ExpoReceiptReconciliation> {
  let rows: ReceiptCandidate[];
  try {
    rows = await candidates(now, limit);
  } catch (error) {
    if (schemaUnavailable(error)) {
      return { schemaReady: false, candidates: 0, checked: 0, delivered: 0, failed: 0, pending: 0, error: "receipt_schema_unavailable" };
    }
    const detail = error instanceof Error ? error.message : "Push receipt candidates could not be loaded.";
    return { schemaReady: true, candidates: 0, checked: 0, delivered: 0, failed: 0, pending: 0, error: detail.slice(0, 240) };
  }

  if (!rows.length) {
    return { schemaReady: true, candidates: 0, checked: 0, delivered: 0, failed: 0, pending: 0, error: null };
  }

  const ids = rows.map((row) => row.provider_message_id);
  const headers: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
  if (process.env.EXPO_ACCESS_TOKEN) headers.Authorization = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;

  let responsePayload: ExpoReceiptResponse | null = null;
  try {
    const response = await fetchImpl(EXPO_RECEIPTS_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ ids }),
      signal: AbortSignal.timeout(8_000),
    });
    responsePayload = await response.json().catch(() => null) as ExpoReceiptResponse | null;
    if (!response.ok) throw new Error(`Expo receipt HTTP ${response.status}`);
    if (!responsePayload?.data || typeof responsePayload.data !== "object") {
      throw new Error("Expo receipt response did not contain receipt data.");
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Expo receipt transport failed.";
    return {
      schemaReady: true,
      candidates: rows.length,
      checked: 0,
      delivered: 0,
      failed: 0,
      pending: rows.length,
      error: detail.slice(0, 240),
    };
  }

  let checked = 0;
  let delivered = 0;
  let failed = 0;
  let pending = 0;

  for (const row of rows) {
    const receipt = responsePayload.data?.[row.provider_message_id];
    if (!receipt || (receipt.status !== "ok" && receipt.status !== "error")) {
      pending += 1;
      continue;
    }
    checked += 1;
    if (receipt.status === "ok") {
      delivered += 1;
      await recordDelivered(row, now);
    } else {
      failed += 1;
      await recordFailed(row, receipt, now);
    }
  }

  return { schemaReady: true, candidates: rows.length, checked, delivered, failed, pending, error: null };
}
