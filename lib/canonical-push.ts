import { randomUUID } from "node:crypto";
import { betaPremiumEnabled } from "@/lib/beta-premium";
import { listCanonicalAlertRecoveryWindow, type CanonicalAlert, type CanonicalAlertFacets } from "@/lib/canonical-alerts";
import { fateDropPostgres } from "@/lib/postgres";
import { productAlertEnabled } from "@/lib/product-alert-intelligence";
import { expoAndroidIcon, pushNotificationBranding } from "@/lib/push-notification-branding";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_ATTEMPTS = 3;
const SENDING_LEASE_SECONDS = 5 * 60;
const BURST_WINDOW_SECONDS = 60;
const BURST_GRACE_SECONDS = 5;
const BURST_MIN_SIZE = 5;
const CANONICAL_PUSH_RECOVERY_LOOKBACK_SECONDS = 6 * 60 * 60;
const CANONICAL_PUSH_RECOVERY_OVERLAP_SECONDS = 5 * 60;

type BurstControlledStage = "WHISPER" | "ECHO" | "VANISHED";

type RecipientRow = {
  endpoint_id: string;
  user_id: string;
  expo_push_token: string;
  platform: string | null;
  whisper_enabled: boolean;
  echo_enabled: boolean;
  manifested_enabled: boolean;
  vanished_enabled: boolean;
  sealed_tcg_enabled: boolean;
  single_cards_enabled: boolean;
  accessories_enabled: boolean;
  merchandise_enabled: boolean;
  unknown_products_enabled: boolean;
  english_enabled: boolean;
  japanese_enabled: boolean;
  korean_enabled: boolean;
  simplified_chinese_enabled: boolean;
  traditional_chinese_enabled: boolean;
  other_languages_enabled: boolean;
  unknown_language_enabled: boolean;
  all_sets_enabled: boolean;
  selected_set_keys: unknown;
  unknown_sets_enabled: boolean;
  push_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
  selected_tcg_codes: unknown;
  tcg_alert_preferences: unknown;
};

type OutboxRow = {
  id: string;
  user_id: string;
  event_id: string;
  title: string;
  body: string;
  url: string | null;
  payload_json: Record<string, unknown> | string;
  attempts: number;
};

type ExpoTicket = {
  status?: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

export type LocalRadarOperatorPush = {
  eventId: string;
  tcgCode: string;
  stage: "WHISPER" | "ECHO";
  route: "local-radar" | "alerts";
  presentationType: "test_only" | "readiness_echo";
  availabilityScope: "physical_branch" | "online_retailer_readiness";
  availabilityVerified: false;
  title: string;
  body: string;
  retailerId: string;
  retailerName: string;
  productTitle: string;
  expectedFrom: string | null;
  expectedTo: string | null;
  expectedLabel: string | null;
  branchCount: number;
  operatorIssue: number;
  sourceUrl?: string | null;
  evidenceObservedAt?: string | null;
  languageGroup?: CanonicalAlertFacets["languageGroup"];
  setKey?: string | null;
};

function dispatchEnabled() {
  return process.env.FATEDROP_PUSH_DISPATCH_ENABLED === "true";
}

function epoch(iso: string) {
  const value = Math.floor(new Date(iso).getTime() / 1000);
  return Number.isFinite(value) ? value : 0;
}

function burstControlledStage(stage: CanonicalAlert["fateStage"]): stage is BurstControlledStage {
  return stage === "WHISPER" || stage === "ECHO" || stage === "VANISHED";
}

function stageLabel(stage: BurstControlledStage) {
  if (stage === "WHISPER") return "Whisper";
  if (stage === "ECHO") return "Echo";
  return "Vanished";
}

function burstBucketClosed(bucket: number, measuredAt: number) {
  return measuredAt >= ((bucket + 1) * BURST_WINDOW_SECONDS) + BURST_GRACE_SECONDS;
}

function stageEnabled(alert: CanonicalAlert, recipient: RecipientRow) {
  if (!recipient.push_enabled) return false;
  const globallyEnabled=alert.fateStage === "WHISPER" ? recipient.whisper_enabled
    : alert.fateStage === "ECHO" ? recipient.echo_enabled
      : alert.fateStage === "MANIFESTED" ? recipient.manifested_enabled
        : alert.fateStage === "VANISHED" ? recipient.vanished_enabled : false;
  if(!globallyEnabled)return false;
  return tcgStagePreferenceEnabled(alert.tcgCode, alert.fateStage, recipient);
}

function tcgStagePreferenceEnabled(tcgCode: string, stage: CanonicalAlert["fateStage"], recipient: RecipientRow) {
  if (stage === "NETWORK") return false;
  let raw=recipient.tcg_alert_preferences;
  if(typeof raw==="string"){try{raw=JSON.parse(raw);}catch{return false;}}
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return true;
  const entry=(raw as Record<string,unknown>)[tcgCode];
  if(!entry||typeof entry!=="object"||Array.isArray(entry))return true;
  const preference=entry as Record<string,unknown>;
  if(preference.mode!=="custom")return true;
  return preference[stage.toLowerCase()]!==false;
}

function tcgEnabled(tcgCode:string,recipient:RecipientRow){return selectedSetKeys(recipient.selected_tcg_codes).has(tcgCode);}

function manifestedEpisodeStillActionable(alert: CanonicalAlert) {
  if (alert.fateStage !== "MANIFESTED") return true;
  return alert.stockEpisode?.availabilityState === "available"
    && alert.stockEpisode.vanishedAt === null
    && alert.liveWindow?.historyComplete === true
    && alert.liveWindow.lastConfirmedLiveAt !== null;
}

function operatorStageEnabled(event: LocalRadarOperatorPush, recipient: RecipientRow) {
  if (!recipient.push_enabled) return false;
  const globallyEnabled = event.stage === "WHISPER" ? recipient.whisper_enabled : recipient.echo_enabled;
  return globallyEnabled && tcgStagePreferenceEnabled(event.tcgCode, event.stage, recipient);
}

function productEnabled(alert: CanonicalAlert, recipient: RecipientRow) {
  return productAlertEnabled(alert.productIntelligence, {
    sealedTcg: recipient.sealed_tcg_enabled,
    singleCards: recipient.single_cards_enabled,
    accessories: recipient.accessories_enabled,
    merchandise: recipient.merchandise_enabled,
    unknownProducts: recipient.unknown_products_enabled,
  });
}

function selectedSetKeys(value: unknown) {
  let parsed = value;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return new Set<string>(); }
  }
  if (!Array.isArray(parsed)) return new Set<string>();
  return new Set(parsed.filter((item): item is string => typeof item === "string"));
}

function languageGroupEnabled(languageGroup: CanonicalAlertFacets["languageGroup"], recipient: RecipientRow) {
  if (languageGroup === "english") return recipient.english_enabled;
  if (languageGroup === "japanese") return recipient.japanese_enabled;
  if (languageGroup === "korean") return recipient.korean_enabled;
  if (languageGroup === "simplified_chinese") return recipient.simplified_chinese_enabled;
  if (languageGroup === "traditional_chinese") return recipient.traditional_chinese_enabled;
  if (languageGroup === "other") return recipient.other_languages_enabled;
  return recipient.unknown_language_enabled;
}

function facetEnabled(facets: Pick<CanonicalAlertFacets, "languageGroup" | "setKey">, recipient: RecipientRow) {
  if (!languageGroupEnabled(facets.languageGroup, recipient)) return false;
  if (recipient.all_sets_enabled) return true;
  if (!facets.setKey) return recipient.unknown_sets_enabled;
  return selectedSetKeys(recipient.selected_set_keys).has(facets.setKey);
}

function minutesInTimezone(now: Date, timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone || "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
    return hour * 60 + minute;
  } catch {
    return null;
  }
}

function parseClock(value: string | null) {
  if (!value || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function inQuietHours(recipient: RecipientRow, now: Date) {
  if (!recipient.quiet_hours_enabled) return false;
  const current = minutesInTimezone(now, recipient.timezone);
  const start = parseClock(recipient.quiet_hours_start);
  const end = parseClock(recipient.quiet_hours_end);
  if (current == null || start == null || end == null || start === end) return false;
  return start < end ? current >= start && current < end : current >= start || current < end;
}

function payload(value: OutboxRow["payload_json"]) {
  if (typeof value !== "string") return value ?? {};
  try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
}

function retryAt(now: number, attempts: number) {
  return now + Math.min(900, 30 * (2 ** Math.max(0, attempts - 1)));
}

function recoveryCheckpointUnavailable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  return code === "42P01";
}

async function recoverySince(measuredAt: number, lookbackSeconds: number) {
  const fallback = Math.max(0, measuredAt - lookbackSeconds);
  try {
    const sql = await fateDropPostgres();
    const rows = await sql`SELECT last_completed_at FROM fatedrop_push_recovery_checkpoint WHERE id='canonical'`;
    const checkpoint = Number(rows[0]?.last_completed_at ?? 0);
    return Number.isFinite(checkpoint) && checkpoint > 0
      ? Math.max(fallback, checkpoint - CANONICAL_PUSH_RECOVERY_OVERLAP_SECONDS)
      : fallback;
  } catch (error) {
    if (recoveryCheckpointUnavailable(error)) return fallback;
    throw error;
  }
}

async function recordRecoveryCheckpoint(measuredAt: number) {
  try {
    const sql = await fateDropPostgres();
    await sql`
      INSERT INTO fatedrop_push_recovery_checkpoint (id,last_completed_at,updated_at)
      VALUES ('canonical',${measuredAt},${measuredAt})
      ON CONFLICT (id) DO UPDATE SET
        last_completed_at=GREATEST(fatedrop_push_recovery_checkpoint.last_completed_at,EXCLUDED.last_completed_at),
        updated_at=EXCLUDED.updated_at`;
  } catch (error) {
    if (!recoveryCheckpointUnavailable(error)) throw error;
  }
}

function stablePushHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function individualPushRow(alert: CanonicalAlert, recipient: RecipientRow, now: number) {
  return {
    id: randomUUID(),
    dedupe_key: `push:${alert.id}:${recipient.endpoint_id}`,
    user_id: recipient.user_id,
    event_type: alert.fateStage.toLowerCase(),
    event_id: alert.id,
    channel: "push",
    title: alert.notification.title,
    body: alert.notification.body,
    url: alert.productUrl,
    payload_json: {
      ...alert.notification.data,
      stage: alert.fateStage,
      stockEpisodeId: alert.stockEpisode?.id ?? null,
      endpointId: recipient.endpoint_id,
      expoPushToken: recipient.expo_push_token,
      pushPlatform: recipient.platform,
    },
    state: "pending",
    attempts: 0,
    next_attempt_at: now,
    created_at: now,
    updated_at: now,
  };
}

function burstSummaryPushRow(
  stage: BurstControlledStage,
  alerts: CanonicalAlert[],
  recipient: RecipientRow,
  bucket: number,
  now: number,
) {
  const ordered = [...alerts].sort((left, right) => epoch(left.detectedAt) - epoch(right.detectedAt) || left.id.localeCompare(right.id));
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const label = stageLabel(stage);
  return {
    id: randomUUID(),
    dedupe_key: `push:${stage.toLowerCase()}-burst:${bucket}:${recipient.endpoint_id}`,
    user_id: recipient.user_id,
    event_type: stage.toLowerCase(),
    event_id: `sig_summary_${stage.toLowerCase()}_${bucket}`,
    channel: "push",
    title: `${label} activity`,
    body: `${ordered.length} new ${label} signals detected. Open FateDrop to review.`,
    url: null,
    payload_json: {
      route: "alerts",
      stage,
      summary: true,
      summaryCount: ordered.length,
      summaryFirstAlertId: first.id,
      summaryWindowStart: first.detectedAt,
      summaryWindowEnd: last.detectedAt,
      tcgCode: first.tcgCode,
      endpointId: recipient.endpoint_id,
      expoPushToken: recipient.expo_push_token,
      pushPlatform: recipient.platform,
    },
    state: "pending",
    attempts: 0,
    next_attempt_at: now,
    created_at: now,
    updated_at: now,
  };
}

async function eligibleRecipients() {
  const sql = await fateDropPostgres();
  const temporaryBetaPremium = betaPremiumEnabled();
  const rows = await sql`
    SELECT
      pe.id AS endpoint_id,
      pe.user_id,
      pe.expo_push_token,
      pe.platform,
      COALESCE(np.whisper_enabled,true) AS whisper_enabled,
      COALESCE(np.echo_enabled,true) AS echo_enabled,
      COALESCE(np.manifested_enabled,true) AS manifested_enabled,
      COALESCE(np.vanished_enabled,true) AS vanished_enabled,
      COALESCE(np.sealed_tcg_enabled,true) AS sealed_tcg_enabled,
      COALESCE(np.single_cards_enabled,true) AS single_cards_enabled,
      COALESCE(np.accessories_enabled,false) AS accessories_enabled,
      COALESCE(np.merchandise_enabled,false) AS merchandise_enabled,
      COALESCE(np.unknown_products_enabled,true) AS unknown_products_enabled,
      COALESCE(np.english_enabled,true) AS english_enabled,
      COALESCE(np.japanese_enabled,true) AS japanese_enabled,
      COALESCE(np.korean_enabled,true) AS korean_enabled,
      COALESCE(np.simplified_chinese_enabled,true) AS simplified_chinese_enabled,
      COALESCE(np.traditional_chinese_enabled,true) AS traditional_chinese_enabled,
      COALESCE(np.other_languages_enabled,true) AS other_languages_enabled,
      COALESCE(np.unknown_language_enabled,true) AS unknown_language_enabled,
      COALESCE(np.all_sets_enabled,true) AS all_sets_enabled,
      COALESCE(np.selected_set_keys,'[]'::jsonb) AS selected_set_keys,
      COALESCE(np.unknown_sets_enabled,true) AS unknown_sets_enabled,
      COALESCE(np.push_enabled,true) AS push_enabled,
      COALESCE(np.quiet_hours_enabled,false) AS quiet_hours_enabled,
      np.quiet_hours_start,
      np.quiet_hours_end,
      COALESCE(np.timezone,'Europe/London') AS timezone
      ,COALESCE(u.selected_tcg_codes,'["pokemon"]'::jsonb) AS selected_tcg_codes
      ,COALESCE(u.tcg_alert_preferences,'{}'::jsonb) AS tcg_alert_preferences
    FROM fatedrop_push_endpoints pe
    JOIN fatedrop_users u ON u.id=pe.user_id
    JOIN fatedrop_memberships m ON m.user_id=pe.user_id
    JOIN fatedrop_beta_access ba ON ba.user_id=pe.user_id AND ba.status='approved'
    LEFT JOIN fatedrop_notification_preferences np ON np.user_id=pe.user_id
    WHERE pe.enabled=true
      AND (
        ${temporaryBetaPremium}=true
        OR (m.status IN ('active','trialing') AND m.tier IN ('plus','pro'))
      )
    ORDER BY pe.updated_at DESC
    LIMIT 2000`;
  return rows as RecipientRow[];
}

async function enqueueRecentAlerts({ measuredAt, lookbackSeconds = CANONICAL_PUSH_RECOVERY_LOOKBACK_SECONDS }: { measuredAt: number; lookbackSeconds?: number }) {
  const since = await recoverySince(measuredAt, lookbackSeconds);
  const [alerts, recipients] = await Promise.all([
    listCanonicalAlertRecoveryWindow({since}),
    eligibleRecipients(),
  ]);
  if (!alerts.length || !recipients.length) {
    await recordRecoveryCheckpoint(measuredAt);
    return { alerts: 0, recipients: recipients.length, queued: 0 };
  }

  const recent = alerts.filter((alert) => epoch(alert.detectedAt) >= since && epoch(alert.detectedAt) <= measuredAt + 60);
  if (!recent.length) {
    await recordRecoveryCheckpoint(measuredAt);
    return { alerts: 0, recipients: recipients.length, queued: 0 };
  }

  const nowDate = new Date();
  const now = Math.floor(nowDate.getTime() / 1000);
  const queueRows: Array<Record<string, unknown>> = [];

  for (const recipient of recipients) {
    if (inQuietHours(recipient, nowDate)) continue;
    const controlledBuckets = new Map<string, { stage: BurstControlledStage; bucket: number; alerts: CanonicalAlert[] }>();

    for (const alert of recent) {
      if (!alert.interruptEligible || !tcgEnabled(alert.tcgCode,recipient) || !stageEnabled(alert, recipient) || !productEnabled(alert, recipient) || !facetEnabled(alert.facets, recipient)) continue;
      if (!manifestedEpisodeStillActionable(alert)) continue;

      if (alert.fateStage === "MANIFESTED") {
        queueRows.push(individualPushRow(alert, recipient, now));
        continue;
      }

      if (!burstControlledStage(alert.fateStage)) continue;
      const bucket = Math.floor(epoch(alert.detectedAt) / BURST_WINDOW_SECONDS);
      if (!burstBucketClosed(bucket, measuredAt)) continue;
      const key = `${alert.fateStage}:${alert.tcgCode}:${bucket}`;
      const existing = controlledBuckets.get(key) ?? { stage: alert.fateStage, bucket, alerts: [] };
      existing.alerts.push(alert);
      controlledBuckets.set(key, existing);
    }

    for (const { stage, bucket, alerts: bucketAlerts } of controlledBuckets.values()) {
      if (bucketAlerts.length >= BURST_MIN_SIZE) {
        queueRows.push(burstSummaryPushRow(stage, bucketAlerts, recipient, bucket, now));
        continue;
      }
      for (const alert of bucketAlerts) queueRows.push(individualPushRow(alert, recipient, now));
    }
  }

  if (!queueRows.length) {
    await recordRecoveryCheckpoint(measuredAt);
    return { alerts: recent.length, recipients: recipients.length, queued: 0 };
  }
  const sql = await fateDropPostgres();
  const serialized = JSON.stringify(queueRows);
  const inserted = await sql`
    INSERT INTO fatedrop_notification_outbox (
      id,dedupe_key,user_id,event_type,event_id,channel,title,body,url,payload_json,state,attempts,next_attempt_at,created_at,updated_at
    )
    SELECT
      item.id,item.dedupe_key,item.user_id,item.event_type,item.event_id,item.channel,item.title,item.body,item.url,
      item.payload_json,item.state,item.attempts,item.next_attempt_at,item.created_at,item.updated_at
    FROM jsonb_to_recordset(${serialized}::jsonb) AS item(
      id text,dedupe_key text,user_id text,event_type text,event_id text,channel text,title text,body text,url text,
      payload_json jsonb,state text,attempts integer,next_attempt_at bigint,created_at bigint,updated_at bigint
    )
    ON CONFLICT (dedupe_key) DO NOTHING
    RETURNING id`;
  await recordRecoveryCheckpoint(measuredAt);
  return { alerts: recent.length, recipients: recipients.length, queued: inserted.length };
}

async function enqueueLocalRadarOperatorPush(event: LocalRadarOperatorPush) {
  const recipients = await eligibleRecipients();
  if (!recipients.length) return { recipients: 0, queued: 0 };
  const nowDate = new Date();
  const now = Math.floor(nowDate.getTime() / 1000);
  const queueRows: Array<Record<string, unknown>> = [];

  for (const recipient of recipients) {
    const operatorFacets = { languageGroup: event.languageGroup ?? "unknown", setKey: event.setKey ?? null };
    if (!tcgEnabled(event.tcgCode, recipient) || !operatorStageEnabled(event, recipient) || !facetEnabled(operatorFacets, recipient) || inQuietHours(recipient, nowDate)) continue;
    queueRows.push({
      id: randomUUID(),
      dedupe_key: `local-radar:${event.eventId}:${recipient.endpoint_id}`,
      user_id: recipient.user_id,
      event_type: event.route === "alerts" ? `operator_readiness_${event.stage.toLowerCase()}` : `local_radar_${event.stage.toLowerCase()}`,
      event_id: event.eventId,
      channel: "push",
      title: event.title,
      body: event.body,
      url: null,
      payload_json: {
        route: event.route,
        localIntelId: event.eventId,
        presentationType: event.presentationType,
        availabilityScope: event.availabilityScope,
        availabilityVerified: event.availabilityVerified,
        stage: event.stage,
        tcgCode: event.tcgCode,
        retailerId: event.retailerId,
        retailerName: event.retailerName,
        productTitle: event.productTitle,
        expectedFrom: event.expectedFrom,
        expectedTo: event.expectedTo,
        expectedLabel: event.expectedLabel,
        branchCount: event.branchCount,
        operatorIssue: event.operatorIssue,
        sourceUrl: event.sourceUrl ?? null,
        evidenceObservedAt: event.evidenceObservedAt ?? null,
        languageGroup: operatorFacets.languageGroup,
        setKey: operatorFacets.setKey,
        endpointId: recipient.endpoint_id,
        expoPushToken: recipient.expo_push_token,
        pushPlatform: recipient.platform,
      },
      state: "pending",
      attempts: 0,
      next_attempt_at: now,
      created_at: now,
      updated_at: now,
    });
  }

  if (!queueRows.length) return { recipients: recipients.length, queued: 0 };
  const sql = await fateDropPostgres();
  const serialized = JSON.stringify(queueRows);
  const inserted = await sql`
    INSERT INTO fatedrop_notification_outbox (
      id,dedupe_key,user_id,event_type,event_id,channel,title,body,url,payload_json,state,attempts,next_attempt_at,created_at,updated_at
    )
    SELECT
      item.id,item.dedupe_key,item.user_id,item.event_type,item.event_id,item.channel,item.title,item.body,item.url,
      item.payload_json,item.state,item.attempts,item.next_attempt_at,item.created_at,item.updated_at
    FROM jsonb_to_recordset(${serialized}::jsonb) AS item(
      id text,dedupe_key text,user_id text,event_type text,event_id text,channel text,title text,body text,url text,
      payload_json jsonb,state text,attempts integer,next_attempt_at bigint,created_at bigint,updated_at bigint
    )
    ON CONFLICT (dedupe_key) DO NOTHING
    RETURNING id`;
  return { recipients: recipients.length, queued: inserted.length };
}

async function recoverStaleSending() {
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  const staleBefore = now - SENDING_LEASE_SECONDS;
  await sql`
    UPDATE fatedrop_notification_outbox
    SET
      state='failed',
      last_error=COALESCE(last_error,'Push delivery lease expired before a result was recorded.'),
      next_attempt_at=${now},
      updated_at=${now}
    WHERE channel='push'
      AND state='sending'
      AND updated_at <= ${staleBefore}`;
}

async function claimPending(limit = 100) {
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  const rows = await sql`
    WITH candidates AS (
      SELECT id
      FROM fatedrop_notification_outbox
      WHERE channel='push'
        AND state IN ('pending','failed')
        AND attempts < ${MAX_ATTEMPTS}
        AND next_attempt_at <= ${now}
      ORDER BY
        CASE
          WHEN event_type IN ('manifested','fate_match') THEN 0
          WHEN event_type='vanished' THEN 1
          ELSE 2
        END ASC,
        created_at ASC,
        id ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${Math.max(1, Math.min(100, limit))}
    )
    UPDATE fatedrop_notification_outbox outbox
    SET state='sending',attempts=outbox.attempts+1,updated_at=${now}
    FROM candidates
    WHERE outbox.id=candidates.id
    RETURNING outbox.id,outbox.user_id,outbox.event_id,outbox.title,outbox.body,outbox.url,outbox.payload_json,outbox.attempts`;
  return rows as OutboxRow[];
}

async function recordResult(row: OutboxRow, ticket: ExpoTicket, transportError: string | null = null) {
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  const data = payload(row.payload_json);
  const endpointId = typeof data.endpointId === "string" ? data.endpointId : null;
  const ticketOk = !transportError && ticket.status === "ok";
  const providerMessageId = ticket.id || null;
  const errorCode = ticket.details?.error || null;
  const detail = transportError || ticket.message || errorCode || null;
  const deadToken = errorCode === "DeviceNotRegistered";
  const finalFailure = deadToken || row.attempts >= MAX_ATTEMPTS;
  const nextAttempt = finalFailure ? now : retryAt(now, row.attempts);

  await sql`
    UPDATE fatedrop_notification_outbox
    SET
      state=${ticketOk ? "sent" : "failed"},
      sent_at=${ticketOk ? now : null},
      last_error=${ticketOk ? null : detail},
      next_attempt_at=${nextAttempt},
      updated_at=${now}
    WHERE id=${row.id}`;

  await sql`
    INSERT INTO fatedrop_notification_delivery_attempts (
      id,outbox_id,attempted_at,result,provider_message_id,detail
    ) VALUES (
      ${randomUUID()},${row.id},${now},${ticketOk ? "sent" : finalFailure ? "failed" : "retry"},${providerMessageId},${detail}
    )`;

  if (endpointId) {
    if (ticketOk) {
      await sql`
        UPDATE fatedrop_push_endpoints
        SET last_success_at=${now},failure_reason=NULL,updated_at=${now}
        WHERE id=${endpointId}`;
    } else {
      await sql`
        UPDATE fatedrop_push_endpoints
        SET last_failure_at=${now},failure_reason=${detail},enabled=CASE WHEN ${deadToken} THEN false ELSE enabled END,updated_at=${now}
        WHERE id=${endpointId}`;
    }
  }
}

async function sendClaimed(rows: OutboxRow[], fetchImpl: typeof fetch = fetch) {
  if (!rows.length) return { claimed: 0, sent: 0, failed: 0 };

  const messages = rows.map((row) => {
    const data = payload(row.payload_json);
    const branding = pushNotificationBranding({ platform: data.pushPlatform, stage: data.stage, route: data.route });
    const icon = expoAndroidIcon(data.pushPlatform, branding);
    const stage = typeof data.stage === "string" ? data.stage.toUpperCase() : "";
    const manifestedReminder = data.manifestedReminder === true;
    const urgentAvailability = stage === "MANIFESTED" && !manifestedReminder;
    const stockEpisodeId = typeof data.stockEpisodeId === "string" && data.stockEpisodeId ? data.stockEpisodeId : null;
    const tcgCode = typeof data.tcgCode === "string" && data.tcgCode ? data.tcgCode : null;
    const collapseKind = manifestedReminder ? "manifested-reminder" : stage.toLowerCase();
    const episodeCollapseId = stockEpisodeId && collapseKind ? `fatedrop-episode-${stablePushHash(stockEpisodeId)}-${collapseKind}` : null;
    const publicData = Object.fromEntries(
      Object.entries(data).filter(([key]) => !["expoPushToken", "endpointId", "pushPlatform"].includes(key)),
    );
    return {
      to: data.expoPushToken,
      sound: "default",
      priority: urgentAvailability ? "high" : "default",
      ttl: urgentAvailability ? CANONICAL_PUSH_RECOVERY_LOOKBACK_SECONDS : 60 * 60,
      title: row.title,
      body: row.body,
      ...(icon ? { icon } : {}),
      ...(data.pushPlatform === "ios" && urgentAvailability ? { interruptionLevel: "time-sensitive", relevanceScore: 1 } : {}),
      ...(episodeCollapseId ? { collapseId: episodeCollapseId } : {}),
      ...(tcgCode ? { threadId: `fatedrop-${tcgCode}` } : {}),
      data: {
        ...publicData,
        notificationCompanion: branding.companion,
      },
    };
  });

  const headers: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
  if (process.env.EXPO_ACCESS_TOKEN) headers.Authorization = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;

  let tickets: ExpoTicket[] = [];
  let transportError: string | null = null;
  try {
    const response = await fetchImpl(EXPO_PUSH_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(messages),
      signal: AbortSignal.timeout(8_000),
    });
    const result = await response.json().catch(() => null) as { data?: ExpoTicket[] | ExpoTicket; errors?: unknown } | null;
    if (!response.ok) throw new Error(`Expo push HTTP ${response.status}`);
    tickets = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];
    if (tickets.length !== rows.length) throw new Error("Expo push ticket count mismatch");
  } catch (error) {
    transportError = error instanceof Error ? error.message : "Expo push transport failed";
    tickets = rows.map(() => ({ status: "error", message: transportError || undefined }));
  }

  let sent = 0;
  let failed = 0;
  for (let index = 0; index < rows.length; index += 1) {
    const ticket = tickets[index] ?? { status: "error", message: "Missing Expo push ticket" };
    if (!transportError && ticket.status === "ok") sent += 1;
    else failed += 1;
    await recordResult(rows[index], ticket, transportError);
  }
  return { claimed: rows.length, sent, failed };
}

export async function dispatchCanonicalPushAlerts({ measuredAt = Math.floor(Date.now() / 1000), fetchImpl = fetch }: { measuredAt?: number; fetchImpl?: typeof fetch } = {}) {
  if (!dispatchEnabled()) return { enabled: false, queued: 0, claimed: 0, sent: 0, failed: 0 };
  await recoverStaleSending();
  const queued = await enqueueRecentAlerts({ measuredAt });
  const claimed = await claimPending(100);
  const delivery = await sendClaimed(claimed, fetchImpl);
  return { enabled: true, queued: queued.queued, ...delivery };
}

export async function dispatchLocalRadarOperatorPush(event: LocalRadarOperatorPush, { fetchImpl = fetch }: { fetchImpl?: typeof fetch } = {}) {
  if (!dispatchEnabled()) return { enabled: false, recipients: 0, queued: 0, claimed: 0, sent: 0, failed: 0 };
  await recoverStaleSending();
  const queued = await enqueueLocalRadarOperatorPush(event);
  const claimed = await claimPending(100);
  const delivery = await sendClaimed(claimed, fetchImpl);
  return { enabled: true, recipients: queued.recipients, queued: queued.queued, ...delivery };
}
