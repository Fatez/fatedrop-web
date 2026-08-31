import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  MANIFESTED_REMINDER_INTERVAL_SECONDS,
  MANIFESTED_REMINDER_MAX_CONFIRMATION_AGE_SECONDS,
  MANIFESTED_REMINDER_MIN_LIVE_AGE_SECONDS,
  MANIFESTED_REMINDER_PRODUCT_COOLDOWN_SECONDS,
  manifestedReminderEligible,
} from "../lib/manifested-reminder-policy.ts";

const pushSource = fs.readFileSync(new URL("../lib/manifested-reminder-push.ts", import.meta.url), "utf8");
const routeSource = fs.readFileSync(new URL("../app/api/dashboard/push-dispatch/route.ts", import.meta.url), "utf8");

function alertAt({ now, manifestedAgo, confirmedAgo, vanishedAt = null, stage = "MANIFESTED" }) {
  return {
    fateStage: stage,
    confirmed: true,
    interruptEligible: true,
    liveWindow: {
      manifestedAt: new Date((now - manifestedAgo) * 1000).toISOString(),
      lastConfirmedLiveAt: new Date((now - confirmedAgo) * 1000).toISOString(),
      vanishedAt,
    },
  };
}

test("Manifested reminder cadence and freshness are deliberately conservative", () => {
  assert.equal(MANIFESTED_REMINDER_INTERVAL_SECONDS, 30 * 60);
  assert.equal(MANIFESTED_REMINDER_MIN_LIVE_AGE_SECONDS, 30 * 60);
  assert.equal(MANIFESTED_REMINDER_MAX_CONFIRMATION_AGE_SECONDS, 20 * 60);
  assert.equal(MANIFESTED_REMINDER_PRODUCT_COOLDOWN_SECONDS, 6 * 60 * 60);
});

test("only sustained, recently re-confirmed, non-vanished Manifested stock is eligible", () => {
  const now = 2_000_000_000;
  assert.equal(manifestedReminderEligible(alertAt({ now, manifestedAgo: 31 * 60, confirmedAgo: 5 * 60 }), now), true);
  assert.equal(manifestedReminderEligible(alertAt({ now, manifestedAgo: 29 * 60, confirmedAgo: 5 * 60 }), now), false);
  assert.equal(manifestedReminderEligible(alertAt({ now, manifestedAgo: 60 * 60, confirmedAgo: 21 * 60 }), now), false);
  assert.equal(manifestedReminderEligible(alertAt({ now, manifestedAgo: 60 * 60, confirmedAgo: 5 * 60, vanishedAt: new Date(now * 1000).toISOString() }), now), false);
  assert.equal(manifestedReminderEligible(alertAt({ now, manifestedAgo: 60 * 60, confirmedAgo: 5 * 60, stage: "ECHO" }), now), false);
});

test("reminder is a separate push-only outbox event and never creates canonical lifecycle truth", () => {
  assert.match(pushSource, /event_type: "manifested_reminder"/);
  assert.match(pushSource, /manifestedReminder: true/);
  assert.match(pushSource, /reminderKind: "still_manifested"/);
  assert.match(pushSource, /stage: "MANIFESTED"/);
  assert.match(pushSource, /title: "Still Manifested"/);
  assert.doesNotMatch(pushSource, /INSERT INTO .*signal|UPDATE .*signal|INSERT INTO .*lifecycle|UPDATE .*lifecycle/is);
});

test("real lifecycle push activity suppresses the engagement nudge for that dispatch cycle", () => {
  assert.match(routeSource, /const naturalPushActivity = primary\.queued > 0 \|\| primary\.claimed > 0 \|\| primary\.sent > 0 \|\| primary\.failed > 0/);
  assert.match(routeSource, /if \(primary\.enabled && !naturalPushActivity\)/);
  assert.match(routeSource, /enqueueManifestedReminderPush/);
});

test("the nudge respects rolling activity and per-product cooldown from the existing outbox", () => {
  assert.match(pushSource, /createdAt >= measuredAt - MANIFESTED_REMINDER_INTERVAL_SECONDS/);
  assert.match(pushSource, /NATURAL_LIFECYCLE_EVENT_TYPES\.has\(row\.event_type\)/);
  assert.match(pushSource, /MANIFESTED_REMINDER_PRODUCT_COOLDOWN_SECONDS/);
  assert.match(pushSource, /excludedProductsByUser/);
});
