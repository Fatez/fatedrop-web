import { fateDropPostgres } from "@/lib/postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requestedTestEventId(request: Request) {
  const raw = new URL(request.url).searchParams.get("issue");
  if (raw === null) return null;
  if (!/^[1-9][0-9]*$/.test(raw)) return undefined;
  return `local-radar-operator-test:${raw}`;
}

export async function GET(request: Request) {
  try {
    const requestedEventId = requestedTestEventId(request);
    if (requestedEventId === undefined) {
      return Response.json(
        { ok: false, error: "invalid_test_issue" },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    }

    const sql = await fateDropPostgres();
    let eventId = requestedEventId;

    if (!eventId) {
      const latestRows = await sql`
        SELECT event_id
        FROM fatedrop_notification_outbox
        WHERE channel='push'
          AND event_id LIKE 'local-radar-operator-test:%'
        ORDER BY created_at DESC
        LIMIT 1`;
      eventId = typeof latestRows[0]?.event_id === "string" ? latestRows[0].event_id : null;
    }

    if (!eventId) {
      return Response.json({
        ok: true,
        eventId: null,
        outboxTotal: 0,
        pending: 0,
        sending: 0,
        sent: 0,
        failed: 0,
        attemptTotal: 0,
        ticketAccepted: 0,
        ticketFailed: 0,
        ticketRetry: 0,
        receiptChecked: 0,
        receiptOk: 0,
        receiptError: 0,
        receiptPending: 0,
        latestOutboxCreatedAgeSeconds: null,
        latestReceiptCheckedAgeSeconds: null,
      }, {
        headers: { "cache-control": "no-store" },
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const [outboxRows, attemptRows] = await Promise.all([
      sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE state='pending')::int AS pending,
          COUNT(*) FILTER (WHERE state='sending')::int AS sending,
          COUNT(*) FILTER (WHERE state='sent')::int AS sent,
          COUNT(*) FILTER (WHERE state='failed')::int AS failed,
          MAX(created_at) AS latest_created_at
        FROM fatedrop_notification_outbox
        WHERE channel='push'
          AND event_id=${eventId}`,
      sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (
            WHERE attempt.result='sent'
              AND attempt.provider_message_id IS NOT NULL
          )::int AS ticket_accepted,
          COUNT(*) FILTER (WHERE attempt.result='failed')::int AS ticket_failed,
          COUNT(*) FILTER (WHERE attempt.result='retry')::int AS ticket_retry,
          COUNT(*) FILTER (WHERE attempt.receipt_checked_at IS NOT NULL)::int AS receipt_checked,
          COUNT(*) FILTER (WHERE attempt.receipt_status='ok')::int AS receipt_ok,
          COUNT(*) FILTER (WHERE attempt.receipt_status='error')::int AS receipt_error,
          COUNT(*) FILTER (
            WHERE attempt.result='sent'
              AND attempt.provider_message_id IS NOT NULL
              AND attempt.receipt_status IS NULL
          )::int AS receipt_pending,
          MAX(attempt.receipt_checked_at) AS latest_receipt_checked_at
        FROM fatedrop_notification_delivery_attempts attempt
        JOIN fatedrop_notification_outbox outbox ON outbox.id=attempt.outbox_id
        WHERE outbox.channel='push'
          AND outbox.event_id=${eventId}`,
    ]);

    const outbox = outboxRows[0] as Record<string, unknown> | undefined;
    const attempts = attemptRows[0] as Record<string, unknown> | undefined;
    const latestCreatedAt = Number(outbox?.latest_created_at ?? 0);
    const latestReceiptCheckedAt = Number(attempts?.latest_receipt_checked_at ?? 0);

    return Response.json({
      ok: true,
      eventId,
      outboxTotal: Number(outbox?.total ?? 0),
      pending: Number(outbox?.pending ?? 0),
      sending: Number(outbox?.sending ?? 0),
      sent: Number(outbox?.sent ?? 0),
      failed: Number(outbox?.failed ?? 0),
      attemptTotal: Number(attempts?.total ?? 0),
      ticketAccepted: Number(attempts?.ticket_accepted ?? 0),
      ticketFailed: Number(attempts?.ticket_failed ?? 0),
      ticketRetry: Number(attempts?.ticket_retry ?? 0),
      receiptChecked: Number(attempts?.receipt_checked ?? 0),
      receiptOk: Number(attempts?.receipt_ok ?? 0),
      receiptError: Number(attempts?.receipt_error ?? 0),
      receiptPending: Number(attempts?.receipt_pending ?? 0),
      latestOutboxCreatedAgeSeconds: latestCreatedAt > 0 ? Math.max(0, now - latestCreatedAt) : null,
      latestReceiptCheckedAgeSeconds: latestReceiptCheckedAt > 0 ? Math.max(0, now - latestReceiptCheckedAt) : null,
    }, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return Response.json(
      { ok: false, error: "local_radar_test_delivery_unavailable" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
