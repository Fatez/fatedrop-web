import type { CanonicalAlert } from "@/lib/canonical-alerts";

export const MANIFESTED_REMINDER_INTERVAL_SECONDS = 30 * 60;
export const MANIFESTED_REMINDER_MIN_LIVE_AGE_SECONDS = 30 * 60;
export const MANIFESTED_REMINDER_PRODUCT_COOLDOWN_SECONDS = 6 * 60 * 60;
export const MANIFESTED_REMINDER_MAX_CONFIRMATION_AGE_SECONDS = 20 * 60;

function epoch(iso: string | null | undefined) {
  if (!iso) return 0;
  const value = Math.floor(new Date(iso).getTime() / 1000);
  return Number.isFinite(value) ? value : 0;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function manifestedReminderBucket(measuredAt: number) {
  return Math.floor(measuredAt / MANIFESTED_REMINDER_INTERVAL_SECONDS);
}

export function manifestedReminderConfirmationAgeSeconds(alert: CanonicalAlert, measuredAt: number) {
  const confirmedAt = epoch(alert.liveWindow?.lastConfirmedLiveAt);
  if (!confirmedAt) return null;
  return Math.max(0, measuredAt - confirmedAt);
}

export function manifestedReminderEligible(alert: CanonicalAlert, measuredAt: number) {
  if (alert.fateStage !== "MANIFESTED") return false;
  if (alert.confirmed !== true || alert.interruptEligible !== true) return false;
  if (alert.liveWindow?.vanishedAt) return false;

  const manifestedAt = epoch(alert.liveWindow?.manifestedAt);
  const confirmedAt = epoch(alert.liveWindow?.lastConfirmedLiveAt);
  if (!manifestedAt || !confirmedAt) return false;

  const liveAgeSeconds = measuredAt - manifestedAt;
  const confirmationAgeSeconds = measuredAt - confirmedAt;
  return liveAgeSeconds >= MANIFESTED_REMINDER_MIN_LIVE_AGE_SECONDS
    && confirmationAgeSeconds >= 0
    && confirmationAgeSeconds <= MANIFESTED_REMINDER_MAX_CONFIRMATION_AGE_SECONDS;
}

export function chooseManifestedReminder({
  alerts,
  userId,
  measuredAt,
  excludedProductIds = new Set<string>(),
}: {
  alerts: CanonicalAlert[];
  userId: string;
  measuredAt: number;
  excludedProductIds?: ReadonlySet<string>;
}) {
  const eligible = alerts
    .filter((alert) => manifestedReminderEligible(alert, measuredAt))
    .filter((alert) => !excludedProductIds.has(alert.productId))
    .sort((left, right) => left.id.localeCompare(right.id));

  if (!eligible.length) return null;
  const bucket = manifestedReminderBucket(measuredAt);
  const index = stableHash(`${userId}:${bucket}`) % eligible.length;
  return eligible[index] ?? null;
}
