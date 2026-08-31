import { randomUUID } from "node:crypto";

import { betaPremiumEnabled } from "@/lib/beta-premium";
import { listCanonicalAlertWindow, type CanonicalAlert, type CanonicalAlertFacets } from "@/lib/canonical-alerts";
import {
  MANIFESTED_REMINDER_INTERVAL_SECONDS,
  MANIFESTED_REMINDER_PRODUCT_COOLDOWN_SECONDS,
  chooseManifestedReminder,
  manifestedReminderBucket,
  manifestedReminderConfirmationAgeSeconds,
} from "@/lib/manifested-reminder-policy";
import { fateDropPostgres } from "@/lib/postgres";
import { productAlertEnabled } from "@/lib/product-alert-intelligence";

type RecipientRow = {
  endpoint_id: string;
  user_id: string;
  expo_push_token: string;
  platform: string | null;
  manifested_enabled: boolean;
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
};

type HistoryRow = {
  user_id: string;
  event_type: string;
  created_at: number | string;
  payload_json: Record<string, unknown> | string | null;
};

const NATURAL_LIFECYCLE_EVENT_TYPES = new Set(["whisper", "echo", "manifested", "vanished"]);

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

function facetEnabled(alert: CanonicalAlert, recipient: RecipientRow) {
  if (!languageGroupEnabled(alert.facets.languageGroup, recipient)) return false;
  if (recipient.all_sets_enabled) return true;
  if (!alert.facets.setKey) return recipient.unknown_sets_enabled;
  return selectedSetKeys(recipient.selected_set_keys).has(alert.facets.setKey);
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

function payload(value: HistoryRow["payload_json"]) {
  if (!value) return {};
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
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
      COALESCE(np.manifested_enabled,true) AS manifested_enabled,
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
    FROM fatedrop_push_endpoints pe
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

function confirmationLabel(alert: CanonicalAlert, measuredAt: number) {
  const ageSeconds = manifestedReminderConfirmationAgeSeconds(alert, measuredAt);
  if (ageSeconds == null || ageSeconds < 90) return "Re-confirmed moments ago.";
  const minutes = Math.max(1, Math.floor(ageSeconds / 60));
  return `Re-confirmed ${minutes} min ago.`;
}

export async function enqueueManifestedReminderPush({ measuredAt = Math.floor(Date.now() / 1000) }: { measuredAt?: number } = {}) {
  const [alerts, recipients] = await Promise.all([
    listCanonicalAlertWindow({ state: "manifested", limitPerStage: 100 }),
    eligibleRecipients(),
  ]);
  if (!alerts.length || !recipients.length) return { candidates: alerts.length, recipients: recipients.length, queued: 0 };

  const sql = await fateDropPostgres();
  const historyCutoff = measuredAt - MANIFESTED_REMINDER_PRODUCT_COOLDOWN_SECONDS;
  const history = await sql`
    SELECT user_id,event_type,created_at,payload_json
    FROM fatedrop_notification_outbox
    WHERE channel='push'
      AND created_at >= ${historyCutoff}
      AND state IN ('pending','sending','sent','failed')
    ORDER BY created_at DESC
    LIMIT 10000` as HistoryRow[];

  const recentActivityUsers = new Set<string>();
  const excludedProductsByUser = new Map<string, Set<string>>();
  for (const row of history) {
    const createdAt = Number(row.created_at);
    if (!Number.isFinite(createdAt)) continue;
    if (createdAt >= measuredAt - MANIFESTED_REMINDER_INTERVAL_SECONDS
      && (row.event_type === "manifested_reminder" || NATURAL_LIFECYCLE_EVENT_TYPES.has(row.event_type))) {
      recentActivityUsers.add(row.user_id);
    }
    if (row.event_type !== "manifested_reminder") continue;
    const productId = payload(row.payload_json).productId;
    if (typeof productId !== "string" || !productId) continue;
    const products = excludedProductsByUser.get(row.user_id) ?? new Set<string>();
    products.add(productId);
    excludedProductsByUser.set(row.user_id, products);
  }

  const nowDate = new Date(measuredAt * 1000);
  const recipientsByUser = new Map<string, RecipientRow[]>();
  for (const recipient of recipients) {
    const entries = recipientsByUser.get(recipient.user_id) ?? [];
    entries.push(recipient);
    recipientsByUser.set(recipient.user_id, entries);
  }

  const queueRows: Array<Record<string, unknown>> = [];
  const bucket = manifestedReminderBucket(measuredAt);

  for (const [userId, endpoints] of recipientsByUser) {
    if (recentActivityUsers.has(userId)) continue;
    const preference = endpoints[0];
    if (!preference.push_enabled || !preference.manifested_enabled || inQuietHours(preference, nowDate)) continue;

    const filtered = alerts.filter((alert) => productEnabled(alert, preference) && facetEnabled(alert, preference));
    const chosen = chooseManifestedReminder({
      alerts: filtered,
      userId,
      measuredAt,
      excludedProductIds: excludedProductsByUser.get(userId) ?? new Set<string>(),
    });
    if (!chosen) continue;

    const productTitle = chosen.product.title || chosen.title;
    const retailer = chosen.retailer || "a tracked retailer";
    for (const endpoint of endpoints) {
      queueRows.push({
        id: randomUUID(),
        dedupe_key: `manifested-reminder:${bucket}:${endpoint.endpoint_id}`,
        user_id: endpoint.user_id,
        event_type: "manifested_reminder",
        event_id: `manifested_reminder:${chosen.id}:${bucket}`,
        channel: "push",
        title: "Still Manifested",
        body: `${productTitle} is still available at ${retailer}. ${confirmationLabel(chosen, measuredAt)}`,
        url: chosen.productUrl,
        payload_json: {
          ...chosen.notification.data,
          route: "alerts",
          stage: "MANIFESTED",
          manifestedReminder: true,
          reminderKind: "still_manifested",
          canonicalAlertId: chosen.id,
          productId: chosen.productId,
          retailerId: chosen.retailerId,
          lastConfirmedLiveAt: chosen.liveWindow?.lastConfirmedLiveAt ?? null,
          endpointId: endpoint.endpoint_id,
          expoPushToken: endpoint.expo_push_token,
          pushPlatform: endpoint.platform,
        },
        state: "pending",
        attempts: 0,
        next_attempt_at: measuredAt,
        created_at: measuredAt,
        updated_at: measuredAt,
      });
    }
  }

  if (!queueRows.length) return { candidates: alerts.length, recipients: recipients.length, queued: 0 };
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
  return { candidates: alerts.length, recipients: recipients.length, queued: inserted.length };
}
