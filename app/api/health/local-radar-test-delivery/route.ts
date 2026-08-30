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
        targetEndpointExists: false,
        targetEndpointEnabled: false,
        targetPlatform: null,
        targetEndpointCreatedAgeSeconds: null,
        targetEndpointUpdatedAgeSeconds: null,
        enabledEndpointCount: 0,
        newerEnabledEndpointCount: 0,
        enabledEndpointUpdatedWithin24hCount: 0,
        targetIsNewestEnabledEndpoint: false,
        targetHasFailureReason: false,
      }, {
        headers: { "cache-control": "no-store" },
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const [outboxRows, attemptRows, endpointRows] = await Promise.all([
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
      sql`
        WITH target_outbox AS (
          SELECT payload_json->>'endpointId' AS target_endpoint_id
          FROM fatedrop_notification_outbox
          WHERE channel='push'
            AND event_id=${eventId}
          ORDER BY created_at DESC
          LIMIT 1
        ), target AS (
          SELECT
            endpoint.id,
            endpoint.user_id,
            endpoint.enabled,
            endpoint.platform,
            endpoint.created_at,
            endpoint.updated_at,
            endpoint.failure_reason
          FROM target_outbox
          JOIN fatedrop_push_endpoints endpoint
            ON endpoint.id=target_outbox.target_endpoint_id
          LIMIT 1
        )
        SELECT
          EXISTS(SELECT 1 FROM target)::boolean AS target_exists,
          COALESCE((SELECT enabled FROM target LIMIT 1), false)::boolean AS target_enabled,
          (SELECT platform FROM target LIMIT 1) AS target_platform,
          (SELECT created_at FROM target LIMIT 1) AS target_created_at,
          (SELECT updated_at FROM target LIMIT 1) AS target_updated_at,
          COALESCE((
            SELECT COUNT(*)::int
            FROM fatedrop_push_endpoints peer
            WHERE peer.user_id=(SELECT user_id FROM target LIMIT 1)
              AND peer.enabled=true
          ), 0)::int AS enabled_endpoint_count,
          COALESCE((
            SELECT COUNT(*)::int
            FROM fatedrop_push_endpoints peer
            WHERE peer.user_id=(SELECT user_id FROM target LIMIT 1)
              AND peer.enabled=true
              AND peer.updated_at>(SELECT updated_at FROM target LIMIT 1)
          ), 0)::int AS newer_enabled_endpoint_count,
          COALESCE((
            SELECT COUNT(*)::int
            FROM fatedrop_push_endpoints peer
            WHERE peer.user_id=(SELECT user_id FROM target LIMIT 1)
              AND peer.enabled=true
              AND peer.updated_at>=${now - 24 * 60 * 60}
          ), 0)::int AS updated_within_24h_count,
          COALESCE((
            SELECT (target.updated_at=(
              SELECT MAX(peer.updated_at)
              FROM fatedrop_push_endpoints peer
              WHERE peer.user_id=target.user_id
                AND peer.enabled=true
            ))
            FROM target
          ), false)::boolean AS target_is_newest_enabled,
          COALESCE((SELECT failure_reason IS NOT NULL FROM target LIMIT 1), false)::boolean AS target_has_failure_reason`,
    ]);

    const outbox = outboxRows[0] as Record<string, unknown> | undefined;
    const attempts = attemptRows[0] as Record<string, unknown> | undefined;
    const endpoint = endpointRows[0] as Record<string, unknown> | undefined;
    const latestCreatedAt = Number(outbox?.latest_created_at ?? 0);
    const latestReceiptCheckedAt = Number(attempts?.latest_receipt_checked_at ?? 0);
    const targetCreatedAt = Number(endpoint?.target_created_at ?? 0);
    const targetUpdatedAt = Number(endpoint?.target_updated_at ?? 0);

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
      targetEndpointExists: endpoint?.target_exists === true,
      targetEndpointEnabled: endpoint?.target_enabled === true,
      targetPlatform: typeof endpoint?.target_platform === "string" ? endpoint.target_platform : null,
      targetEndpointCreatedAgeSeconds: targetCreatedAt > 0 ? Math.max(0, now - targetCreatedAt) : null,
      targetEndpointUpdatedAgeSeconds: targetUpdatedAt > 0 ? Math.max(0, now - targetUpdatedAt) : null,
      enabledEndpointCount: Number(endpoint?.enabled_endpoint_count ?? 0),
      newerEnabledEndpointCount: Number(endpoint?.newer_enabled_endpoint_count ?? 0),
      enabledEndpointUpdatedWithin24hCount: Number(endpoint?.updated_within_24h_count ?? 0),
      targetIsNewestEnabledEndpoint: endpoint?.target_is_newest_enabled === true,
      targetHasFailureReason: endpoint?.target_has_failure_reason === true,
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
