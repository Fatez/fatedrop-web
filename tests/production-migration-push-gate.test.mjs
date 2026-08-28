import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migrations = fs.readFileSync(new URL("../lib/production-migrations.ts", import.meta.url), "utf8");
const migrationDir = new URL("../database/", import.meta.url);
const deploy = fs.readFileSync(new URL("../.github/workflows/deploy-production.yml", import.meta.url), "utf8");
const monitor = fs.readFileSync(new URL("../.github/workflows/monitor-push-production.yml", import.meta.url), "utf8");
const pushRoute = fs.readFileSync(new URL("../app/api/dashboard/push-dispatch/route.ts", import.meta.url), "utf8");
const pushHealth = fs.readFileSync(new URL("../lib/push-dispatch-health.ts", import.meta.url), "utf8");

test("every production-era SQL migration is registered in the deployment migration runner", () => {
  const productionEra = fs.readdirSync(migrationDir)
    .filter((name) => /^2026-\d{2}-\d{2}-.+\.sql$/.test(name))
    .filter((name) => name >= "2026-08-28");
  assert.ok(productionEra.length >= 2);
  for (const name of productionEra) assert.match(migrations, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("Vanished preference repair remains exact and conservative", () => {
  assert.match(migrations, /ALTER COLUMN vanished_enabled SET DEFAULT true/);
  assert.match(migrations, /WHERE vanished_enabled = false/);
  assert.match(migrations, /COALESCE\(whisper_enabled, true\) = true/);
  assert.match(migrations, /echo_enabled = true/);
  assert.match(migrations, /manifested_enabled = true/);
});

test("production deployment cannot skip database migration verification or dispatcher exercise", () => {
  const migrateIndex = deploy.indexOf("Apply and verify production database migrations");
  const dispatchIndex = deploy.indexOf("Exercise canonical production push dispatcher");
  assert.ok(migrateIndex > 0);
  assert.ok(dispatchIndex > migrateIndex);
  assert.match(deploy, /\/api\/dashboard\/production-migrations/);
  assert.match(deploy, /\/api\/dashboard\/push-dispatch/);
  assert.match(deploy, /\/api\/health\/push/);
});

test("scheduled production monitor detects a stale push path independently of Cloudflare cron", () => {
  assert.match(monitor, /cron: "\*\/5 \* \* \* \*"/);
  assert.match(monitor, /https:\/\/fatedrop\.co\.uk\/api\/health\/push/);
  assert.match(monitor, /test "\$code" = "204"/);
});

test("canonical push route records heartbeat without introducing a lifecycle-specific sender", () => {
  assert.match(pushRoute, /dispatchCanonicalPushAlerts\(\)/);
  assert.match(pushRoute, /recordPushDispatchHeartbeat/);
  assert.doesNotMatch(pushRoute, /VANISHED/);
  assert.match(pushHealth, /STALE_AFTER_SECONDS = 180/);
  assert.match(pushHealth, /historicalAsymmetryCount === 0/);
  assert.match(pushHealth, /enabledEndpointCount > 0/);
});
