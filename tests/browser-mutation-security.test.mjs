import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const apiRoot = path.join(root, "app", "api");

function routeFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return routeFiles(full);
    return entry.name === "route.ts" ? [full] : [];
  });
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

const serverToServer = new Set([
  "app/api/billing/webhook/route.ts",
  "app/api/dashboard/network-snapshot/route.ts",
  "app/api/dashboard/local-radar-operator-alert/route.ts",
  "app/api/dashboard/local-radar-push-canary/route.ts",
  "app/api/dashboard/push-dispatch/route.ts",
  "app/api/dashboard/production-migrations/route.ts",
  "app/api/dashboard/push-canary/route.ts",
  "app/api/dashboard/rrp-recovery-checkpoint/route.ts",
]);

test("every browser-facing API mutation is same-origin guarded", () => {
  const failures = [];
  const audited = [];

  for (const file of routeFiles(apiRoot)) {
    const rel = relative(file);
    const source = fs.readFileSync(file, "utf8");
    const methods = [...source.matchAll(/export async function (POST|PUT|PATCH|DELETE)\s*\(/g)].map((match) => match[1]);
    if (methods.length === 0) continue;

    // Native mobile endpoints use bearer/session authentication rather than browser
    // origin semantics and are audited separately from this Web CSRF boundary.
    if (rel.startsWith("app/api/mobile/")) continue;

    if (serverToServer.has(rel)) {
      audited.push(`${rel} [server-to-server]`);
      continue;
    }

    audited.push(`${rel} [${methods.join(",")}]`);
    if (!source.includes("assertSameOrigin(request)")) failures.push(rel);
  }

  assert.ok(audited.length > 0, "no API mutation routes were discovered");
  assert.deepEqual(failures, [], `browser mutation routes missing assertSameOrigin(request): ${failures.join(", ")}`);
});

test("explicit server-to-server mutation exemptions retain their stronger authentication", () => {
  const stripe = fs.readFileSync(path.join(root, "app/api/billing/webhook/route.ts"), "utf8");
  assert.ok(stripe.includes("verifyStripeWebhook"));
  assert.ok(stripe.includes('request.headers.get("stripe-signature")'));
  assert.ok(stripe.includes("hasProcessedBillingEvent"), "Stripe webhook must remain idempotent");

  const metrics = fs.readFileSync(path.join(root, "app/api/dashboard/network-snapshot/route.ts"), "utf8");
  assert.ok(metrics.includes("timingSafeEqual"));
  assert.ok(metrics.includes("FATEDROP_METRICS_INGEST_SECRET"));
  assert.ok(metrics.includes('authorization.startsWith("Bearer ")'));

  const localRadarOperator = fs.readFileSync(path.join(root, "app/api/dashboard/local-radar-operator-alert/route.ts"), "utf8");
  assert.ok(localRadarOperator.includes("timingSafeEqual"));
  assert.ok(localRadarOperator.includes("FATEDROP_METRICS_INGEST_SECRET"));
  assert.ok(localRadarOperator.includes('authorization.startsWith("Bearer ")'));
  assert.ok(localRadarOperator.includes("dispatchLocalRadarOperatorPush"));

  const localRadarCanary = fs.readFileSync(path.join(root, "app/api/dashboard/local-radar-push-canary/route.ts"), "utf8");
  assert.ok(localRadarCanary.includes("timingSafeEqual"));
  assert.ok(localRadarCanary.includes("FATEDROP_PUSH_CRON_SECRET"));
  assert.ok(localRadarCanary.includes('authorization.startsWith("Bearer ")'));
  assert.ok(localRadarCanary.includes("runLocalRadarProductionCanary"));

  const worker = fs.readFileSync(path.join(root, "custom-worker.mjs"), "utf8");
  assert.ok(worker.includes("FATEDROP_LOCAL_RADAR_CANARY_KEY"));
  assert.ok(worker.includes("LOCAL_RADAR_CANARY_URL"));
  assert.ok(worker.includes("invokeProtectedPost(LOCAL_RADAR_CANARY_URL"));

  const pushDispatch = fs.readFileSync(path.join(root, "app/api/dashboard/push-dispatch/route.ts"), "utf8");
  assert.ok(pushDispatch.includes("timingSafeEqual"));
  assert.ok(pushDispatch.includes("FATEDROP_METRICS_INGEST_SECRET"));
  assert.ok(pushDispatch.includes('authorization.startsWith("Bearer ")'));
  assert.ok(pushDispatch.includes("dispatchCanonicalPushAlerts"));

  const productionMigrations = fs.readFileSync(path.join(root, "app/api/dashboard/production-migrations/route.ts"), "utf8");
  assert.ok(productionMigrations.includes("timingSafeEqual"));
  assert.ok(productionMigrations.includes("FATEDROP_PUSH_CRON_SECRET"));
  assert.ok(productionMigrations.includes('authorization.startsWith("Bearer ")'));
  assert.ok(productionMigrations.includes("runProductionMigrations"));

  const pushCanary = fs.readFileSync(path.join(root, "app/api/dashboard/push-canary/route.ts"), "utf8");
  assert.ok(pushCanary.includes("timingSafeEqual"));
  assert.ok(pushCanary.includes("FATEDROP_PUSH_CRON_SECRET"));
  assert.ok(pushCanary.includes('authorization.startsWith("Bearer ")'));
  assert.ok(pushCanary.includes("runProductionPushCanarySuite"));

  const rrpRecoveryCheckpoint = fs.readFileSync(path.join(root, "app/api/dashboard/rrp-recovery-checkpoint/route.ts"), "utf8");
  assert.ok(rrpRecoveryCheckpoint.includes("timingSafeEqual"));
  assert.ok(rrpRecoveryCheckpoint.includes("FATEDROP_RRP_AUDIT_SECRET"));
  assert.ok(rrpRecoveryCheckpoint.includes('authorization.startsWith("Bearer ")'));
  assert.ok(rrpRecoveryCheckpoint.includes("fatedrop_rrp_recovery_snapshots"));
});
