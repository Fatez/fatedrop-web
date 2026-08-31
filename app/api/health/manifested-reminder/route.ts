import { betaPremiumEnabled } from "@/lib/beta-premium";
import { listCanonicalAlertWindow } from "@/lib/canonical-alerts";
import {
  MANIFESTED_REMINDER_MAX_CONFIRMATION_AGE_SECONDS,
  MANIFESTED_REMINDER_MIN_LIVE_AGE_SECONDS,
  manifestedReminderEligible,
} from "@/lib/manifested-reminder-policy";
import { fateDropPostgres } from "@/lib/postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function epoch(iso: string | null | undefined) {
  if (!iso) return 0;
  const value = Math.floor(new Date(iso).getTime() / 1000);
  return Number.isFinite(value) ? value : 0;
}

export async function GET() {
  try {
    const now = Math.floor(Date.now() / 1000);
    const temporaryBetaPremium = betaPremiumEnabled();
    const [alerts, sql] = await Promise.all([
      listCanonicalAlertWindow({ state: "manifested", limitPerStage: 100 }),
      fateDropPostgres(),
    ]);

    let confirmedInterruptEligible = 0;
    let completeLiveWindow = 0;
    let eligibleCandidates = 0;
    let tooYoung = 0;
    let staleConfirmation = 0;
    let vanished = 0;

    for (const alert of alerts) {
      if (alert.confirmed === true && alert.interruptEligible === true) confirmedInterruptEligible += 1;
      if (alert.liveWindow?.vanishedAt) vanished += 1;

      const manifestedAt = epoch(alert.liveWindow?.manifestedAt);
      const confirmedAt = epoch(alert.liveWindow?.lastConfirmedLiveAt);
      if (manifestedAt && confirmedAt) completeLiveWindow += 1;

      if (manifestedReminderEligible(alert, now)) {
        eligibleCandidates += 1;
        continue;
      }

      if (!manifestedAt || !confirmedAt || alert.liveWindow?.vanishedAt) continue;
      const liveAge = now - manifestedAt;
      const confirmationAge = now - confirmedAt;
      if (liveAge >= 0 && liveAge < MANIFESTED_REMINDER_MIN_LIVE_AGE_SECONDS) tooYoung += 1;
      if (confirmationAge > MANIFESTED_REMINDER_MAX_CONFIRMATION_AGE_SECONDS) staleConfirmation += 1;
    }

    const [recipientRows, outboxRows, attemptRows, activityRows] = await Promise.all([
      sql`
        SELECT
          COUNT(DISTINCT pe.id)::int AS enabled_endpoints,
          COUNT(DISTINCT pe.user_id)::int AS endpoint_users,
          COUNT(DISTINCT pe.id) FILTER (
            WHERE ba.status='approved'
              AND (
                ${temporaryBetaPremium}=true
                OR (m.status IN ('active','trialing') AND m.tier IN ('plus','pro'))
              )
          )::int AS entitled_endpoints,
          COUNT(DISTINCT pe.user_id) FILTER (
            WHERE ba.status='approved'
              AND (
                ${temporaryBetaPremium}=true
                OR (m.status IN ('active','trialing') AND m.tier IN ('plus','pro'))
              )
              AND COALESCE(np.push_enabled,true)=true
              AND COALESCE(np.manifested_enabled,true)=true
          )::int AS manifested_push_users
        FROM fatedrop_push_endpoints pe
        LEFT JOIN fatedrop_memberships m ON m.user_id=pe.user_id
        LEFT JOIN fatedrop_beta_access ba ON ba.user_id=pe.user_id
        LEFT JOIN fatedrop_notification_preferences np ON np.user_id=pe.user_id
        WHERE pe.enabled=true`,
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
          AND event_type='manifested_reminder'`,
      sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (
            WHERE attempt.result='sent'
              AND attempt.provider_message_id IS NOT NULL
          )::int AS ticket_accepted,
          COUNT(*) FILTER (WHERE attempt.result='failed')::int AS ticket_failed,
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
          AND outbox.event_type='manifested_reminder'`,
      sql`
        SELECT
          COUNT(*) FILTER (
            WHERE event_type IN ('whisper','echo','manifested','vanished')
              AND created_at >= ${now - 30 * 60}
          )::int AS natural_pushes_30m,
          COUNT(DISTINCT user_id) FILTER (
            WHERE event_type IN ('whisper','echo','manifested','vanished')
              AND created_at >= ${now - 30 * 60}
          )::int AS natural_push_users_30m,
          MAX(created_at) FILTER (
            WHERE event_type IN ('whisper','echo','manifested','vanished')
          ) AS latest_natural_created_at
        FROM fatedrop_notification_outbox
        WHERE channel='push'`,
    ]);

    const recipients = recipientRows[0] as Record<string, unknown> | undefined;
    const outbox = outboxRows[0] as Record<string, unknown> | undefined;
    const attempts = attemptRows[0] as Record<string, unknown> | undefined;
    const activity = activityRows[0] as Record<string, unknown> | undefined;
    const latestCreatedAt = Number(outbox?.latest_created_at ?? 0);
    const latestReceiptCheckedAt = Number(attempts?.latest_receipt_checked_at ?? 0);
    const latestNaturalCreatedAt = Number(activity?.latest_natural_created_at ?? 0);

    const manifestedPushUsers = Number(recipients?.manifested_push_users ?? 0);
    const outboxTotal = Number(outbox?.total ?? 0);
    const sent = Number(outbox?.sent ?? 0);
    const receiptOk = Number(attempts?.receipt_ok ?? 0);
    const receiptError = Number(attempts?.receipt_error ?? 0);
    const naturalPushes30m = Number(activity?.natural_pushes_30m ?? 0);

    const likelyBlocker = eligibleCandidates === 0
      ? "no_current_candidate"
      : manifestedPushUsers === 0
        ? "no_manifested_push_recipient"
        : outboxTotal === 0 && naturalPushes30m > 0
          ? "not_enqueued_with_recent_natural_push_activity"
          : outboxTotal === 0
            ? "not_enqueued"
            : sent === 0
              ? "queued_not_sent"
              : receiptError > 0
                ? "provider_receipt_error"
                : receiptOk > 0
                  ? "delivery_path_proven"
                  : "awaiting_provider_receipt";

    return Response.json({
      ok: true,
      measuredAt: now,
      candidates: {
        manifestedWindow: alerts.length,
        confirmedInterruptEligible,
        completeLiveWindow,
        eligible: eligibleCandidates,
        tooYoung,
        staleConfirmation,
        vanished,
      },
      recipients: {
        enabledEndpoints: Number(recipients?.enabled_endpoints ?? 0),
        endpointUsers: Number(recipients?.endpoint_users ?? 0),
        entitledEndpoints: Number(recipients?.entitled_endpoints ?? 0),
        manifestedPushUsers,
      },
      outbox: {
        total: outboxTotal,
        pending: Number(outbox?.pending ?? 0),
        sending: Number(outbox?.sending ?? 0),
        sent,
        failed: Number(outbox?.failed ?? 0),
        latestCreatedAgeSeconds: latestCreatedAt > 0 ? Math.max(0, now - latestCreatedAt) : null,
      },
      delivery: {
        attempts: Number(attempts?.total ?? 0),
        ticketAccepted: Number(attempts?.ticket_accepted ?? 0),
        ticketFailed: Number(attempts?.ticket_failed ?? 0),
        receiptOk,
        receiptError,
        receiptPending: Number(attempts?.receipt_pending ?? 0),
        latestReceiptCheckedAgeSeconds: latestReceiptCheckedAt > 0 ? Math.max(0, now - latestReceiptCheckedAt) : null,
      },
      activity: {
        naturalPushes30m,
        naturalPushUsers30m: Number(activity?.natural_push_users_30m ?? 0),
        latestNaturalPushAgeSeconds: latestNaturalCreatedAt > 0 ? Math.max(0, now - latestNaturalCreatedAt) : null,
      },
      likelyBlocker,
    }, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return Response.json(
      { ok: false, error: "manifested_reminder_health_unavailable" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
