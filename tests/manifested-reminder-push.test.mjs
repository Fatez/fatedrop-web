import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const policySource = fs.readFileSync(new URL("../lib/manifested-reminder-policy.ts", import.meta.url), "utf8");
const pushSource = fs.readFileSync(new URL("../lib/manifested-reminder-push.ts", import.meta.url), "utf8");
const routeSource = fs.readFileSync(new URL("../app/api/dashboard/push-dispatch/route.ts", import.meta.url), "utf8");

test("Manifested reminder cadence and freshness are deliberately conservative", () => {
  assert.match(policySource, /MANIFESTED_REMINDER_INTERVAL_SECONDS = 30 \* 60/);
  assert.match(policySource, /MANIFESTED_REMINDER_MIN_LIVE_AGE_SECONDS = 30 \* 60/);
  assert.match(policySource, /MANIFESTED_REMINDER_MAX_CONFIRMATION_AGE_SECONDS = 20 \* 60/);
  assert.match(policySource, /MANIFESTED_REMINDER_PRODUCT_COOLDOWN_SECONDS = 6 \* 60 \* 60/);
  assert.match(policySource, /MANIFESTED_REMINDER_HISTORY_SECONDS = 24 \* 60 \* 60/);
});

test("only sustained, recently re-confirmed, non-vanished Manifested stock is eligible", () => {
  assert.match(policySource, /alert\.fateStage !== "MANIFESTED"/);
  assert.match(policySource, /alert\.confirmed !== true \|\| alert\.interruptEligible !== true/);
  assert.match(policySource, /stockEpisode\?\.availabilityState !== "available"/);
  assert.match(policySource, /stockEpisode\.vanishedAt !== null/);
  assert.match(policySource, /alert\.liveWindow\?\.vanishedAt/);
  assert.match(policySource, /liveWindow\?\.historyComplete !== true/);
  assert.match(policySource, /liveAgeSeconds >= MANIFESTED_REMINDER_MIN_LIVE_AGE_SECONDS/);
  assert.match(policySource, /confirmationAgeSeconds <= MANIFESTED_REMINDER_MAX_CONFIRMATION_AGE_SECONDS/);
});

test("reminder is a separate push-only outbox event and never creates canonical lifecycle truth", () => {
  assert.match(pushSource, /event_type: "manifested_reminder"/);
  assert.match(pushSource, /manifestedReminder: true/);
  assert.match(pushSource, /reminderKind: "still_manifested"/);
  assert.match(pushSource, /stage: "MANIFESTED"/);
  assert.match(pushSource, /title: "Still observed available"/);
  assert.match(pushSource, /manifested_reminders_enabled/);
  assert.match(pushSource, /manifested_reminders_max_per_day/);
  assert.match(pushSource, /stockEpisodeId/);
  assert.doesNotMatch(pushSource, /INSERT INTO .*signal|UPDATE .*signal|INSERT INTO .*lifecycle|UPDATE .*lifecycle/is);
});

test("real lifecycle push activity suppresses the engagement nudge for that dispatch cycle", () => {
  assert.match(routeSource, /const naturalPushActivity = primary\.queued > 0 \|\| primary\.claimed > 0 \|\| primary\.sent > 0 \|\| primary\.failed > 0/);
  assert.match(routeSource, /if \(primary\.enabled && !naturalPushActivity\)/);
  assert.match(routeSource, /enqueueManifestedReminderPush/);
});

test("the nudge respects rolling activity, daily caps and episode idempotency from the existing outbox", () => {
  assert.match(pushSource, /createdAt >= measuredAt - MANIFESTED_REMINDER_INTERVAL_SECONDS/);
  assert.match(pushSource, /NATURAL_LIFECYCLE_EVENT_TYPES\.has\(row\.event_type\)/);
  assert.match(pushSource, /MANIFESTED_REMINDER_HISTORY_SECONDS/);
  assert.match(pushSource, /excludedProductsByUser/);
  assert.match(pushSource, /excludedEpisodesByUser/);
  assert.match(pushSource, /dedupe_key: `manifested-reminder:\$\{chosen\.stockEpisode\?\.id\}/);
});
