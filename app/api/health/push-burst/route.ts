import { fateDropPostgres } from "@/lib/postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PR #189 finished its successful production deployment at this boundary.
const BURST_POLICY_PRODUCTION_START = Math.floor(Date.parse("2026-08-30T06:39:50Z") / 1000);
const RECEIPT_MIN_AGE_SECONDS = 15 * 60;

export async function GET() {
  try {
    const sql = await fateDropPostgres();
    const now = Math.floor(Date.now() / 1000);
    const receiptEligibleBefore = Math.max(BURST_POLICY_PRODUCTION_START, now - RECEIPT_MIN_AGE_SECONDS);

    const [outboxRows, receiptRows] = await Promise.all([
      sql`
        SELECT
          COUNT(*) FILTER (WHERE event_id LIKE 'sig_summary_%')::int AS summary_total,
          COUNT(*) FILTER (WHERE event_id LIKE 'sig_summary_whisper_%')::int AS whisper_summary,
          COUNT(*) FILTER (WHERE event_id LIKE 'sig_summary_echo_%')::int AS echo_summary,
          COUNT(*) FILTER (WHERE event_id LIKE 'sig_summary_vanished_%')::int AS vanished_summary,
          COUNT(*) FILTER (WHERE event_id LIKE 'sig_summary_manifested_%')::int AS manifested_summary,
          COUNT(*) FILTER (
            WHERE event_type IN ('whisper','echo','vanished')
              AND event_id LIKE 'sig_%'
              AND event_id NOT LIKE 'sig_summary_%'
          )::int AS controlled_individual,
          COUNT(*) FILTER (
            WHERE event_type='manifested'
              AND event_id LIKE 'sig_%'
              AND event_id NOT LIKE 'sig_summary_%'
          )::int AS manifested_individual,
          COUNT(*) FILTER (WHERE event_id LIKE 'sig_summary_%' AND state='pending')::int AS summary_pending,
          COUNT(*) FILTER (WHERE event_id LIKE 'sig_summary_%' AND state='sending')::int AS summary_sending,
          COUNT(*) FILTER (WHERE event_id LIKE 'sig_summary_%' AND state='sent')::int AS summary_sent,
          COUNT(*) FILTER (WHERE event_id LIKE 'sig_summary_%' AND state='failed')::int AS summary_failed,
          COUNT(*) FILTER (
            WHERE event_id LIKE 'sig_summary_%'
              AND (
                COALESCE(payload_json->>'summaryCount','') !~ '^[0-9]+$'
                OR (payload_json->>'summaryCount')::int < 5
              )
          )::int AS invalid_summary_count,
          MIN(
            CASE
              WHEN event_id LIKE 'sig_summary_%' AND COALESCE(payload_json->>'summaryCount','') ~ '^[0-9]+$'
              THEN (payload_json->>'summaryCount')::int
              ELSE NULL
            END
          )::int AS min_summary_count,
          MAX(
            CASE
              WHEN event_id LIKE 'sig_summary_%' AND COALESCE(payload_json->>'summaryCount','') ~ '^[0-9]+$'
              THEN (payload_json->>'summaryCount')::int
              ELSE NULL
            END
          )::int AS max_summary_count,
          MAX(created_at) FILTER (WHERE event_id LIKE 'sig_summary_%') AS latest_summary_created_at
        FROM fatedrop_notification_outbox
        WHERE channel='push'
          AND created_at >= ${BURST_POLICY_PRODUCTION_START}`,
      sql`
        WITH latest_summary_attempt AS (
          SELECT DISTINCT ON (attempt.outbox_id)
            attempt.outbox_id,
            attempt.receipt_status,
            attempt.receipt_checked_at,
            attempt.attempted_at
          FROM fatedrop_notification_delivery_attempts attempt
          JOIN fatedrop_notification_outbox outbox ON outbox.id=attempt.outbox_id
          WHERE outbox.channel='push'
            AND outbox.event_id LIKE 'sig_summary_%'
            AND outbox.created_at >= ${BURST_POLICY_PRODUCTION_START}
            AND attempt.result='sent'
          ORDER BY attempt.outbox_id,attempt.attempted_at DESC
        )
        SELECT
          COUNT(*) FILTER (WHERE attempted_at <= ${receiptEligibleBefore})::int AS eligible,
          COUNT(*) FILTER (WHERE attempted_at <= ${receiptEligibleBefore} AND receipt_status='ok')::int AS ok,
          COUNT(*) FILTER (WHERE attempted_at <= ${receiptEligibleBefore} AND receipt_status='error')::int AS error,
          COUNT(*) FILTER (WHERE attempted_at <= ${receiptEligibleBefore} AND receipt_checked_at IS NULL)::int AS pending,
          MAX(receipt_checked_at) FILTER (WHERE attempted_at <= ${receiptEligibleBefore}) AS latest_checked_at
        FROM latest_summary_attempt`,
    ]);

    const outbox = outboxRows[0] as Record<string, unknown> | undefined;
    const receipt = receiptRows[0] as Record<string, unknown> | undefined;
    const latestSummaryCreatedAt = Number(outbox?.latest_summary_created_at ?? 0);
    const latestReceiptCheckedAt = Number(receipt?.latest_checked_at ?? 0);

    return Response.json({
      ok: true,
      observationStart: BURST_POLICY_PRODUCTION_START,
      observationAgeSeconds: Math.max(0, now - BURST_POLICY_PRODUCTION_START),
      summaryTotal: Number(outbox?.summary_total ?? 0),
      whisperSummary: Number(outbox?.whisper_summary ?? 0),
      echoSummary: Number(outbox?.echo_summary ?? 0),
      vanishedSummary: Number(outbox?.vanished_summary ?? 0),
      manifestedSummary: Number(outbox?.manifested_summary ?? 0),
      controlledIndividual: Number(outbox?.controlled_individual ?? 0),
      manifestedIndividual: Number(outbox?.manifested_individual ?? 0),
      summaryPending: Number(outbox?.summary_pending ?? 0),
      summarySending: Number(outbox?.summary_sending ?? 0),
      summarySent: Number(outbox?.summary_sent ?? 0),
      summaryFailed: Number(outbox?.summary_failed ?? 0),
      invalidSummaryCount: Number(outbox?.invalid_summary_count ?? 0),
      minSummaryCount: outbox?.min_summary_count == null ? null : Number(outbox.min_summary_count),
      maxSummaryCount: outbox?.max_summary_count == null ? null : Number(outbox.max_summary_count),
      latestSummaryCreatedAgeSeconds: latestSummaryCreatedAt > 0 ? Math.max(0, now - latestSummaryCreatedAt) : null,
      summaryReceiptEligible: Number(receipt?.eligible ?? 0),
      summaryReceiptOk: Number(receipt?.ok ?? 0),
      summaryReceiptError: Number(receipt?.error ?? 0),
      summaryReceiptPending: Number(receipt?.pending ?? 0),
      latestSummaryReceiptCheckedAgeSeconds: latestReceiptCheckedAt > 0 ? Math.max(0, now - latestReceiptCheckedAt) : null,
    }, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return Response.json(
      { ok: false, status: "error", error: "push_burst_health_unavailable" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
