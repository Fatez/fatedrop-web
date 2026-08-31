import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const alertsTemplate = fs.readFileSync(path.join(process.cwd(), "app/dashboard/alerts/template.tsx"), "utf8");
const alertsPage = fs.readFileSync(path.join(process.cwd(), "app/dashboard/alerts/page.tsx"), "utf8");

test("Alerts refresh the existing server-owned canonical view every ten seconds while visible", () => {
  assert.match(alertsTemplate, /useRouter/);
  assert.match(alertsTemplate, /router\.refresh\(\)/);
  assert.match(alertsTemplate, /10_000/);
  assert.match(alertsTemplate, /document\.visibilityState/);
  assert.match(alertsTemplate, /visibilitychange/);
  assert.match(alertsTemplate, /clearInterval/);
  assert.doesNotMatch(alertsTemplate, /fetch\(/);
  assert.doesNotMatch(alertsTemplate, /\/api\/dashboard\/signals/);
});

test("Live refresh preserves the Alerts server authority for preferences, premium gating and Cloud alert truth", () => {
  assert.match(alertsPage, /listCanonicalAlertWindow/);
  assert.match(alertsPage, /limitPerStage: 100/);
  assert.match(alertsPage, /getNotificationPreferences/);
  assert.match(alertsPage, /notificationPreferencesAllowAlert/);
  assert.match(alertsPage, /hasPremiumAccess/);
});
