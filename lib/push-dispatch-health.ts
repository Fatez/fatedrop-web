import { fateDropPostgres } from "@/lib/postgres";

const HEALTH_ID = "canonical";
const STALE_AFTER_SECONDS = 180;

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
  const [heartbeatRows, defaultRows, asymmetricRows, endpointRows] = await Promise.all([
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
  ]);

  const heartbeat = heartbeatRows[0] as Record<string, unknown> | undefined;
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
    vanishedDefaultVerified: vanishedDefault.includes("true"),
    historicalAsymmetryCount,
    lastQueued: Number(heartbeat?.last_queued ?? 0),
    lastClaimed: Number(heartbeat?.last_claimed ?? 0),
    lastSent: Number(heartbeat?.last_sent ?? 0),
    lastFailed: Number(heartbeat?.last_failed ?? 0),
    lastError: heartbeat?.last_error == null ? null : String(heartbeat.last_error).slice(0, 240),
  };
}
