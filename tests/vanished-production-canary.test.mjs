import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const canary = fs.readFileSync(path.join(root, "lib/push-canary.ts"), "utf8");
const route = fs.readFileSync(path.join(root, "app/api/dashboard/push-canary/route.ts"), "utf8");
const deploy = fs.readFileSync(path.join(root, ".github/workflows/deploy-production.yml"), "utf8");

test("Vanished production canary reuses the canonical outbox and dispatcher", () => {
  assert.ok(canary.includes("fatedrop_notification_outbox"));
  assert.ok(canary.includes("fatedrop_notification_delivery_attempts"));
  assert.ok(canary.includes("dispatchCanonicalPushAlerts"));
  assert.ok(canary.includes("event_type"));
  assert.ok(canary.includes("'vanished'"));
  assert.ok(canary.includes('route: "alerts"'));
  assert.ok(canary.includes('stage: "VANISHED"'));
  assert.equal(canary.includes("exp.host"), false, "canary must not create a second Expo transport");
});

test("Vanished production canary fails closed instead of choosing between users", () => {
  assert.ok(canary.includes("eligibleUsers.size !== 1"));
  assert.ok(canary.includes("ambiguous_eligible_push_users"));
  assert.ok(canary.includes("vanished_enabled"));
  assert.ok(canary.includes("push_enabled"));
});

test("canary endpoint stays server-authenticated and deployment trigger is one-shot", () => {
  assert.ok(route.includes("FATEDROP_PUSH_CRON_SECRET"));
  assert.ok(route.includes("timingSafeEqual"));
  assert.ok(deploy.includes("[vanished-canary]"));
  assert.ok(deploy.includes("/api/dashboard/push-canary"));
  assert.ok(deploy.includes("providerMessageId"));
});
