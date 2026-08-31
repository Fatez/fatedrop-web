import { betaPremiumEnabled } from "@/lib/beta-premium";
import { fateDropPostgres } from "@/lib/postgres";

const HEALTH_ID = "canonical";
const STALE_AFTER_SECONDS = 180;
const DIAGNOSTIC_LOOKBACK_SECONDS = 15 * 60;
const DIAGNOSTIC_HISTORY_SECONDS = 24 * 60 * 60;
const DIAGNOSTIC_OUTAGE_WINDOW_SECONDS = 3 * 60 * 60;
const RECEIPT_MIN_AGE_SECONDS = 15 * 60;
const MANIFESTED_BACKLOG_GRACE_SECONDS = 2 * 60;

export type PushDispatchHeartbeat = {
  startedAt: number;
  completedAt: number | null;
  status: "ok" | "error" | "disabled";
  queued: number;
  claimed: number;
  sent: number;
  failed: number;
  error: string | null;
};

export async function recordPushDispatchHeartbeat(heartbeat: PushDispatchHeartbeat) {
  const sql = await fateDropPostgres();
  await sql`
    INSERT INTO fatedrop_push_dispatch_health (
      id,last_started_at,last_completed_at,last_status,last_queued,last_claimed,last_sent,last_failed,last_error,updated_at
    ) VALUES (
      ${HEALTH_ID},${heartbeat.startedAt},${heartbeat.completedAt},${heartbeat.status},${heartbeat.queued},${heartbeat.claimed},${heartbeat.sent},${heartbeat.failed},${heartbeat.error},${Math.floor(Date.now() / 1000)}
    )
    ON CONFLICT (id) DO UPDATE SET
      last_started_at=EXCLUDED.last_started_at,
      last_completed_at=EXCLUDED.last_completed_at,
      last_status=EXCLUDED.last_status,
      last_queued=EXCLUDED.last_queued,
      last_claimed=EXCLUDED.last_claimed,
      last_sent=EXCLUDED.last_sent,
      last_failed=EXCLUDED.last_failed,
      last_error=EXCLUDED.last_error,
      updated_at=EXCLUDED.updated_at`;
}

function receiptSchemaUnavailable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  return code === "42703" || code === "42P01";
}

async function readReceiptDiagnostics(
  sql: Awaited<ReturnType<typeof fateDropPostgres>>,
  { historySince, eligibleBefore }: { historySince: number; eligibleBefore: number },
) {
  try {
    const rows = await sql`
      WITH latest_sent_attempt AS (
        SELECT DISTINCT ON (attempt.outbox_id)
          attempt.outbox_id,
          attempt.receipt_status,
          attempt.receipt_checked_at,
          attempt.attempted_at,
          outbox.event_type
        FROM fatedrop_notification_delivery_attempts attempt
        JOIN fatedrop_notification_outbox outbox ON outbox.id=attempt.outbox_id
        WHERE outbox.channel='push'
          AND outbox.event_id LIKE 'sig_%'
          AND attempt.result='sent'
          AND attempt.attempted_at >= ${historySince}
        ORDER BY attempt.outbox_id,attempt.attempted_at DESC
      )
      SELECT
        COUNT(*) FILTER (WHERE attempted_at <= ${eligibleBefore})::int AS eligible_24h,
        COUNT(*) FILTER (WHERE attempted_at <= ${eligibleBefore} AND receipt_status='ok')::int AS ok_24h,
        COUNT(*) FILTER (WHERE attempted_at <= ${eligibleBefore} AND receipt_status='error')::int AS error_24h,
        COUNT(*) FILTER (WHERE attempted_at <= ${eligibleBefore} AND receipt_status='unverified_expired')::int AS expired_24h,
        COUNT(*) FILTER (WHERE attempted_at <= ${eligibleBefore} AND receipt_checked_at IS NULL)::int AS pending_24h,
        COUNT(*) FILTER (WHERE attempted_at <= ${eligibleBefore} AND event_type='whisper')::int AS whisper_eligible_24h,
        COUNT(*) FILTER (WHERE attempted_at <= ${eligibleBefore} AND event_type='whisper' AND receipt_status='ok')::int AS whisper_ok_24h,
        COUNT(*) FILTER (WHERE attempted_at <= ${eligibleBefore} AND event_type='whisper' AND receipt_status='error')::int AS whisper_error_24h,
        COUNT(*) FILTER (WHERE attempted_at <= ${eligibleBefore} AND event_type='whisper' AND receipt_status='unverified_expired')::int AS whisper_expired_24h,
        COUNT(*) FILTER (WHERE attempted_at <= ${eligibleBefore} AND event_type='whisper' AND receipt_checked_at IS NULL)::int AS whisper_pending_24h,
        MAX(receipt_checked_at) FILTER (WHERE attempted_at <= ${eligibleBefore}) AS latest_checked_at
      FROM latest_sent_attempt`;
    return { schemaReady: true, ...(rows[0] as Record<string, unknown> | undefined) };
  } catch (error) {
    if (receiptSchemaUnavailable(error)) return { schemaReady: false };
    throw error;
  }
}

export async function readPushProductionHealth(now = Math.floor(Date.now() / 1000)) {
  const sql = await fateDropPostgres();
  const temporaryBetaPremium = betaPremiumEnabled();
  const recentSince = Math.max(0, now - DIAGNOSTIC_LOOKBACK_SECONDS);
  const historySince = Math.max(0, now - DIAGNOSTIC_HISTORY_SECONDS);
  const outageSince = Math.max(0, now - DIAGNOSTIC_OUTAGE_WINDOW_SECONDS);
  const receiptEligibleBefore = Math.max(0, now - RECEIPT_MIN_AGE_SECONDS);
  const manifestedBacklogBefore = Math.max(0, now - MANIFESTED_BACKLOG_GRACE_SECONDS);
  const [heartbeatRows, defaultRows, asymmetricRows, endpointRows, recipientRows, recentOutboxRows, historyOutboxRows, provenanceRows, receiptDiagnostics] = await Promise.all([
    sql`
      SELECT last_completed_at,last_status,last_queued,last_claimed,last_sent,last_failed,last_error
      FROM fatedrop_push_dispatch_health
      WHERE id=${HEALTH_ID}`,
    sql`
      SELECT column_default
      FROM information_schema.columns
      WHERE table_schema='public'
        AND table_name='fatedrop_notification_preferences'
        AND column_name='vanished_enabled'`,
    sql`
      SELECT COUNT(*)::int AS count
      FROM fatedrop_notification_preferences
      WHERE vanished_enabled=false
        AND COALESCE(whisper_enabled,true)=true
        AND echo_enabled=true
        AND manifested_enabled=true`,
    sql`SELECT COUNT(*)::int AS count FROM fatedrop_push_endpoints WHERE enabled=true`,
    sql`
      SELECT
        COUNT(*)::int AS eligible_count,
        COUNT(*) FILTER (WHERE COALESCE(np.push_enabled,true)=true)::int AS push_enabled_count,
        COUNT(*) FILTER (WHERE COALESCE(np.whisper_enabled,true)=true)::int AS whisper_enabled_count,
        COUNT(*) FILTER (WHERE COALESCE(np.sealed_tcg_enabled,true)=true)::int AS sealed_tcg_enabled_count,
        COUNT(*) FILTER (WHERE COALESCE(np.quiet_hours_enabled,false)=true)::int AS quiet_hours_enabled_count
      FROM fatedrop_push_endpoints pe
      JOIN fatedrop_memberships m ON m.user_id=pe.user_id
      JOIN fatedrop_beta_access ba ON ba.user_id=pe.user_id AND ba.status='approved'
      LEFT JOIN fatedrop_notification_preferences np ON np.user_id=pe.user_id
      WHERE pe.enabled=true
        AND (
          ${temporaryBetaPremium}=true
          OR (m.status IN ('active','trialing') AND m.tier IN ('plus','pro'))
        )`,
    sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE event_type='whisper')::int AS whisper,
        COUNT(*) FILTER (WHERE state='pending')::int AS pending,
        COUNT(*) FILTER (WHERE state='sending')::int AS sending,
        COUNT(*) FILTER (WHERE state='sent')::int AS sent,
        COUNT(*) FILTER (WHERE state='failed')::int AS failed
      FROM fatedrop_notification_outbox
      WHERE channel='push'
        AND created_at >= ${recentSince}`,
    sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE event_type='whisper')::int AS whisper,
        COUNT(*) FILTER (WHERE event_type='echo')::int AS echo,
        COUNT(*) FILTER (WHERE event_type='manifested')::int AS manifested,
        COUNT(*) FILTER (WHERE event_type='vanished')::int AS vanished,
        COUNT(*) FILTER (WHERE event_type LIKE 'local_radar_%')::int AS local_radar,
        COUNT(*) FILTER (WHERE state='pending')::int AS pending,
        COUNT(*) FILTER (WHERE state='sending')::int AS sending,
        COUNT(*) FILTER (WHERE state='sent')::int AS sent,
        COUNT(*) FILTER (WHERE state='failed')::int AS failed,
        COUNT(*) FILTER (
          WHERE event_type='manifested'
            AND state IN ('pending','sending','failed')
            AND created_at <= ${manifestedBacklogBefore}
        )::int AS aged_manifested_unsettled,
        MIN(created_at) FILTER (
          WHERE event_type='manifested'
            AND state IN ('pending','sending','failed')
            AND created_at <= ${manifestedBacklogBefore}
        ) AS oldest_manifested_unsettled_at,
        COUNT(*) FILTER (WHERE event_type='whisper' AND state='sent')::int AS whisper_sent,
        COUNT(*) FILTER (WHERE event_type='whisper' AND state='failed')::int AS whisper_failed
      FROM fatedrop_notification_outbox
      WHERE channel='push'
        AND created_at >= ${historySince}`,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE event_id LIKE 'sig_%' AND created_at >= ${historySince})::int AS natural_24h,
        COUNT(*) FILTER (WHERE event_id LIKE 'canary:%' AND created_at >= ${historySince})::int AS canary_24h,
        COUNT(*) FILTER (WHERE event_id LIKE 'sig_%' AND event_type='whisper' AND created_at >= ${historySince})::int AS natural_whisper_24h,
        COUNT(*) FILTER (WHERE event_id LIKE 'canary:%' AND event_type='whisper' AND created_at >= ${historySince})::int AS canary_whisper_24h,
        COUNT(*) FILTER (WHERE event_id LIKE 'sig_%' AND created_at >= ${outageSince})::int AS natural_3h,
        COUNT(*) FILTER (WHERE event_id LIKE 'sig_%' AND event_type='whisper' AND created_at >= ${outageSince})::int AS natural_whisper_3h,
        COUNT(*) FILTER (WHERE event_id LIKE 'sig_%' AND event_type='whisper' AND state='sent' AND created_at >= ${outageSince})::int AS natural_whisper_sent_3h,
        COUNT(*) FILTER (WHERE event_id LIKE 'sig_%' AND event_type='whisper' AND state='failed' AND created_at >= ${outageSince})::int AS natural_whisper_failed_3h,
        COUNT(*) FILTER (WHERE event_id LIKE 'canary:%' AND created_at >= ${outageSince})::int AS canary_3h,
        MAX(created_at) FILTER (WHERE event_id LIKE 'sig_%') AS latest_natural_created_at,
        MAX(sent_at) FILTER (WHERE event_id LIKE 'sig_%' AND state='sent') AS latest_natural_sent_at
      FROM fatedrop_notification_outbox
      WHERE channel='push'`,
    readReceiptDiagnostics(sql, { historySince, eligibleBefore: receiptEligibleBefore }),
  ]);

  const heartbeat = heartbeatRows[0] as Record<string, unknown> | undefined;
  const recipient = recipientRows[0] as Record<string, unknown> | undefined;
  const recentOutbox = recentOutboxRows[0] as Record<string, unknown> | undefined;
  const historyOutbox = historyOutboxRows[0] as Record<string, unknown> | undefined;
  const provenance = provenanceRows[0] as Record<string, unknown> | undefined;
  const receipt = receiptDiagnostics as Record<string, unknown>;
  const completedAt = Number(heartbeat?.last_completed_at ?? 0);
  const status = String(heartbeat?.last_status ?? "missing");
  const ageSeconds = completedAt > 0 ? Math.max(0, now - completedAt) : null;
  const vanishedDefault = String(defaultRows[0]?.column_default ?? "").toLowerCase();
  const historicalAsymmetryCount = Number(asymmetricRows[0]?.count ?? 0);
  const enabledEndpointCount = Number(endpointRows[0]?.count ?? 0);
  const dispatchEnabled = process.env.FATEDROP_PUSH_DISPATCH_ENABLED === "true";
  const latestNaturalCreatedAt = Number(provenance?.latest_natural_created_at ?? 0);
  const latestNaturalSentAt = Number(provenance?.latest_natural_sent_at ?? 0);
  const latestReceiptCheckedAt = Number(receipt?.latest_checked_at ?? 0);
  const receiptErrorCount = Number(receipt?.error_24h ?? 0);
  const receiptExpiredCount = Number(receipt?.expired_24h ?? 0);
  const receiptPendingCount = Number(receipt?.pending_24h ?? 0);
  const agedManifestedUnsettled = Number(historyOutbox?.aged_manifested_unsettled ?? 0);
  const oldestManifestedUnsettledAt = Number(historyOutbox?.oldest_manifested_unsettled_at ?? 0);

  const ok = dispatchEnabled
    && status === "ok"
    && ageSeconds !== null
    && ageSeconds <= STALE_AFTER_SECONDS
    && vanishedDefault.includes("true")
    && historicalAsymmetryCount === 0
    && enabledEndpointCount > 0
    && receipt?.schemaReady === true
    && receiptErrorCount === 0
    && receiptExpiredCount === 0
    && receiptPendingCount === 0
    && agedManifestedUnsettled === 0;

  return {
    ok,
    dispatchEnabled,
    status,
    ageSeconds,
    enabledEndpointCount,
    eligibleRecipientCount: Number(recipient?.eligible_count ?? 0),
    pushEnabledRecipientCount: Number(recipient?.push_enabled_count ?? 0),
    whisperEnabledRecipientCount: Number(recipient?.whisper_enabled_count ?? 0),
    sealedTcgEnabledRecipientCount: Number(recipient?.sealed_tcg_enabled_count ?? 0),
    quietHoursEnabledRecipientCount: Number(recipient?.quiet_hours_enabled_count ?? 0),
    recentOutboxTotal: Number(recentOutbox?.total ?? 0),
    recentWhisperOutboxCount: Number(recentOutbox?.whisper ?? 0),
    recentOutboxPending: Number(recentOutbox?.pending ?? 0),
    recentOutboxSending: Number(recentOutbox?.sending ?? 0),
    recentOutboxSent: Number(recentOutbox?.sent ?? 0),
    recentOutboxFailed: Number(recentOutbox?.failed ?? 0),
    outbox24hTotal: Number(historyOutbox?.total ?? 0),
    outbox24hWhisper: Number(historyOutbox?.whisper ?? 0),
    outbox24hEcho: Number(historyOutbox?.echo ?? 0),
    outbox24hManifested: Number(historyOutbox?.manifested ?? 0),
    outbox24hVanished: Number(historyOutbox?.vanished ?? 0),
    outbox24hLocalRadar: Number(historyOutbox?.local_radar ?? 0),
    outbox24hPending: Number(historyOutbox?.pending ?? 0),
    outbox24hSending: Number(historyOutbox?.sending ?? 0),
    outbox24hSent: Number(historyOutbox?.sent ?? 0),
    outbox24hFailed: Number(historyOutbox?.failed ?? 0),
    agedManifestedUnsettled,
    oldestManifestedUnsettledAgeSeconds: oldestManifestedUnsettledAt > 0 ? Math.max(0, now - oldestManifestedUnsettledAt) : null,
    outbox24hWhisperSent: Number(historyOutbox?.whisper_sent ?? 0),
    outbox24hWhisperFailed: Number(historyOutbox?.whisper_failed ?? 0),
    naturalOutbox24h: Number(provenance?.natural_24h ?? 0),
    canaryOutbox24h: Number(provenance?.canary_24h ?? 0),
    naturalWhisperOutbox24h: Number(provenance?.natural_whisper_24h ?? 0),
    canaryWhisperOutbox24h: Number(provenance?.canary_whisper_24h ?? 0),
    naturalOutbox3h: Number(provenance?.natural_3h ?? 0),
    naturalWhisperOutbox3h: Number(provenance?.natural_whisper_3h ?? 0),
    naturalWhisperSent3h: Number(provenance?.natural_whisper_sent_3h ?? 0),
    naturalWhisperFailed3h: Number(provenance?.natural_whisper_failed_3h ?? 0),
    canaryOutbox3h: Number(provenance?.canary_3h ?? 0),
    latestNaturalCreatedAgeSeconds: latestNaturalCreatedAt > 0 ? Math.max(0, now - latestNaturalCreatedAt) : null,
    latestNaturalSentAgeSeconds: latestNaturalSentAt > 0 ? Math.max(0, now - latestNaturalSentAt) : null,
    receiptSchemaReady: receipt?.schemaReady === true,
    naturalReceiptEligible24h: Number(receipt?.eligible_24h ?? 0),
    naturalReceiptOk24h: Number(receipt?.ok_24h ?? 0),
    naturalReceiptError24h: receiptErrorCount,
    naturalReceiptExpired24h: receiptExpiredCount,
    naturalReceiptPending24h: receiptPendingCount,
    naturalWhisperReceiptEligible24h: Number(receipt?.whisper_eligible_24h ?? 0),
    naturalWhisperReceiptOk24h: Number(receipt?.whisper_ok_24h ?? 0),
    naturalWhisperReceiptError24h: Number(receipt?.whisper_error_24h ?? 0),
    naturalWhisperReceiptExpired24h: Number(receipt?.whisper_expired_24h ?? 0),
    naturalWhisperReceiptPending24h: Number(receipt?.whisper_pending_24h ?? 0),
    latestNaturalReceiptCheckedAgeSeconds: latestReceiptCheckedAt > 0 ? Math.max(0, now - latestReceiptCheckedAt) : null,
    vanishedDefaultVerified: vanishedDefault.includes("true"),
    historicalAsymmetryCount,
    lastQueued: Number(heartbeat?.last_queued ?? 0),
    lastClaimed: Number(heartbeat?.last_claimed ?? 0),
    lastSent: Number(heartbeat?.last_sent ?? 0),
    lastFailed: Number(heartbeat?.last_failed ?? 0),
    lastError: heartbeat?.last_error == null ? null : String(heartbeat.last_error).slice(0, 240),
  };
}
