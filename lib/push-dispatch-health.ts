import { betaPremiumEnabled } from "@/lib/beta-premium";
import { fateDropPostgres } from "@/lib/postgres";

const HEALTH_ID = "canonical";
const STALE_AFTER_SECONDS = 180;
const DIAGNOSTIC_LOOKBACK_SECONDS = 15 * 60;

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

export async function readPushProductionHealth(now = Math.floor(Date.now() / 1000)) {
  const sql = await fateDropPostgres();
  const temporaryBetaPremium = betaPremiumEnabled();
  const recentSince = Math.max(0, now - DIAGNOSTIC_LOOKBACK_SECONDS);
  const [heartbeatRows, defaultRows, asymmetricRows, endpointRows, recipientRows, recentOutboxRows] = await Promise.all([
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
  ]);

  const heartbeat = heartbeatRows[0] as Record<string, unknown> | undefined;
  const recipient = recipientRows[0] as Record<string, unknown> | undefined;
  const recentOutbox = recentOutboxRows[0] as Record<string, unknown> | undefined;
  const completedAt = Number(heartbeat?.last_completed_at ?? 0);
  const status = String(heartbeat?.last_status ?? "missing");
  const ageSeconds = completedAt > 0 ? Math.max(0, now - completedAt) : null;
  const vanishedDefault = String(defaultRows[0]?.column_default ?? "").toLowerCase();
  const historicalAsymmetryCount = Number(asymmetricRows[0]?.count ?? 0);
  const enabledEndpointCount = Number(endpointRows[0]?.count ?? 0);
  const dispatchEnabled = process.env.FATEDROP_PUSH_DISPATCH_ENABLED === "true";

  const ok = dispatchEnabled
    && status === "ok"
    && ageSeconds !== null
    && ageSeconds <= STALE_AFTER_SECONDS
    && vanishedDefault.includes("true")
    && historicalAsymmetryCount === 0
    && enabledEndpointCount > 0;

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
    vanishedDefaultVerified: vanishedDefault.includes("true"),
    historicalAsymmetryCount,
    lastQueued: Number(heartbeat?.last_queued ?? 0),
    lastClaimed: Number(heartbeat?.last_claimed ?? 0),
    lastSent: Number(heartbeat?.last_sent ?? 0),
    lastFailed: Number(heartbeat?.last_failed ?? 0),
    lastError: heartbeat?.last_error == null ? null : String(heartbeat.last_error).slice(0, 240),
  };
}
