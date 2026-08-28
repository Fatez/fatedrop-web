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
  "app/api/dashboard/push-dispatch/route.ts",
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

  const pushDispatch = fs.readFileSync(path.join(root, "app/api/dashboard/push-dispatch/route.ts"), "utf8");
  assert.ok(pushDispatch.includes("timingSafeEqual"));
  assert.ok(pushDispatch.includes("FATEDROP_METRICS_INGEST_SECRET"));
  assert.ok(pushDispatch.includes('authorization.startsWith("Bearer ")'));
  assert.ok(pushDispatch.includes("dispatchCanonicalPushAlerts"));
});
