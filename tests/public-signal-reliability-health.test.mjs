import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeSource = await readFile(new URL("../app/api/health/signal/route.ts", import.meta.url), "utf8");
const envSource = await readFile(new URL("../.env.example", import.meta.url), "utf8");
const watchdogSource = await readFile(new URL("../.github/workflows/monitor-signal-production.yml", import.meta.url), "utf8");

test("public signal health consumes the redacted Cloud summary without diagnostic auth", () => {
  assert.match(routeSource, /\/api\/signal-summary/);
  assert.match(routeSource, /payload\.available !== true/);
  assert.match(routeSource, /cache: "no-store"/);
  assert.match(routeSource, /"cache-control": "no-store"/);
  assert.doesNotMatch(routeSource, /FATEDROP_SIGNAL_API_TOKEN/);
  assert.doesNotMatch(routeSource, /FATEDROP_METRICS_INGEST_SECRET/);
  assert.doesNotMatch(routeSource, /Authorization:/);
});

test("public signal health exposes bounded redacted failure reasons", () => {
  for (const reason of [
    "invalid_request",
    "upstream_error",
    "upstream_invalid_response",
    "upstream_unavailable",
    "upstream_timeout",
    "upstream_request_failed",
  ]) {
    assert.match(routeSource, new RegExp(reason));
    assert.match(watchdogSource, new RegExp(reason));
  }

  assert.match(routeSource, /return unavailable\("upstream_invalid_response"\)/);
  assert.match(routeSource, /requestFailureReason\(error\)/);
  assert.match(routeSource, /\{ available: false, reason \}/);

  for (const forbidden of [
    "response.statusText",
    "error.message",
    "upstreamBody",
    "Authorization:",
  ]) {
    assert.doesNotMatch(routeSource, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("production signal watchdog preserves failure bodies and logs only allowlisted reason codes", () => {
  assert.match(watchdogSource, /--output "\$response_file"/);
  assert.match(watchdogSource, /--write-out "%\{http_code\}"/);
  assert.doesNotMatch(watchdogSource, /--fail-with-body/);
  assert.match(watchdogSource, /allowedReasons = new Set/);
  assert.match(watchdogSource, /allowedReasons\.has\(health\.reason\) \? health\.reason : "unknown"/);
  assert.match(watchdogSource, /http=\$\{httpStatus \|\| "unknown"\} reason=\$\{reason\}/);
});

test("successful public signal health is edge cached and query cache-busting is rejected", () => {
  assert.match(routeSource, /SUCCESS_CACHE_CONTROL/);
  assert.match(routeSource, /s-maxage=30/);
  assert.match(routeSource, /stale-while-revalidate=120/);
  assert.match(routeSource, /"cache-control": SUCCESS_CACHE_CONTROL/);
  assert.match(routeSource, /new URL\(request\.url\)/);
  assert.match(routeSource, /requestUrl\.search/);
  assert.match(routeSource, /unavailable\("invalid_request", 400\)/);
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

test("private Signal diagnostic token remains documented for private Cloud endpoints", () => {
  assert.match(envSource, /Server-only bearer token for private Signal Engine diagnostics/);
  assert.match(envSource, /Never expose it as NEXT_PUBLIC_\*/);
  assert.match(envSource, /FATEDROP_SIGNAL_API_TOKEN/);
});
