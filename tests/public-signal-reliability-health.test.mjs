import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeSource = await readFile(new URL("../app/api/health/signal/route.ts", import.meta.url), "utf8");
const envSource = await readFile(new URL("../.env.example", import.meta.url), "utf8");

test("public signal health authenticates upstream server-side and fails closed", () => {
  assert.match(routeSource, /FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(routeSource, /Authorization: `Bearer \$\{signalToken\}`/);
  assert.match(routeSource, /\/api\/signal-health/);
  assert.match(routeSource, /payload\.available !== true/);
  assert.match(routeSource, /status: 503/);
  assert.match(routeSource, /cache: "no-store"/);
  assert.match(routeSource, /"cache-control": "no-store"/);
  assert.doesNotMatch(routeSource, /NEXT_PUBLIC_FATEDROP_SIGNAL_API_TOKEN/);
});

test("successful public signal health is edge cached to protect private diagnostics", () => {
  assert.match(routeSource, /SUCCESS_CACHE_CONTROL/);
  assert.match(routeSource, /s-maxage=30/);
  assert.match(routeSource, /stale-while-revalidate=120/);
  assert.match(routeSource, /"cache-control": SUCCESS_CACHE_CONTROL/);
});

test("public signal health exposes aggregate reliability only", () => {
  assert.match(routeSource, /orphanedSignals/);
  assert.match(routeSource, /telemetryStoppedWhileSignalsContinue/);
  assert.match(routeSource, /fresh: count\(monitors\.freshRetailers\)/);
  assert.match(routeSource, /stale: count\(monitors\.staleRetailers\)/);
  assert.match(routeSource, /blocked: count\(monitors\.blockedRetailers\)/);
  assert.match(routeSource, /available: discovery\.available === true/);
  assert.match(routeSource, /pending: count\(discovery\.pending\)/);
  assert.match(routeSource, /processed: count\(discovery\.processed\)/);
  assert.match(routeSource, /oldestActiveAt: timestamp\(discovery\.oldestActiveAt\)/);

  for (const forbidden of [
    "orphanedSignalIds",
    "staleRetailerIds",
    "unhealthyRetailerIds",
    "blockedRetailerIds",
    "retailerName",
    "sourceUrl",
    "evidence_id",
    "DATABASE_URL",
    "FATEDROP_PUSH_CRON_SECRET",
  ]) {
    assert.doesNotMatch(routeSource, new RegExp(forbidden));
  }
});

test("signal diagnostic token remains explicitly server-only", () => {
  assert.match(envSource, /Server-only bearer token for private Signal Engine diagnostics/);
  assert.match(envSource, /Never expose it as NEXT_PUBLIC_\*/);
  assert.match(envSource, /FATEDROP_SIGNAL_API_TOKEN/);
});
