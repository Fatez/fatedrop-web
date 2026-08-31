import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const recentSource = await readFile(new URL("../lib/canonical-signals.ts", import.meta.url), "utf8");
const dashboardSource = await readFile(new URL("../lib/dashboard.ts", import.meta.url), "utf8");
const trendSource = await readFile(new URL("../lib/signal-trends.ts", import.meta.url), "utf8");
const liveSource = await readFile(new URL("../lib/live-signals.ts", import.meta.url), "utf8");
const signalsApi = await readFile(new URL("../app/api/dashboard/signals/route.ts", import.meta.url), "utf8");

test("dashboard recent signals come from live Cloud rather than network snapshot JSON or direct Neon", () => {
  assert.match(dashboardSource, /getCanonicalRecentSignals\(100\)/);
  assert.match(dashboardSource, /signalBackedNetwork\(storedNetwork, recentSignals, now\)/);
  assert.match(dashboardSource, /confirmed = recentSignals\.filter/);
  assert.match(signalsApi, /getCanonicalRecentSignals\(100\)/);
  assert.doesNotMatch(signalsApi, /getLatestNetworkMetricSnapshot/);
  assert.match(recentSource, /listCanonicalAlertWindow/);
  assert.match(recentSource, /limitPerStage: safeLimit/);
  assert.doesNotMatch(recentSource, /fateDropPostgres|DATABASE_URL|fatedrop_signals|neon\(/);
});

test("Web consumes Cloud lifecycle truth instead of re-implementing Vanished semantics", () => {
  assert.match(recentSource, /lifecycleStates/);
  assert.doesNotMatch(recentSource, /m\.state='manifested'|v\.state='vanished'|s\.state <> 'vanished'/);
  assert.match(recentSource, /knownSignalKind\(row\.signalKind\)/);
  assert.doesNotMatch(recentSource, /signal_kind|evidence_item/);
});

test("seven-day detection and delivery summaries come from the same live Cloud summary", () => {
  assert.match(trendSource, /getLiveCloudSignalSummary/);
  assert.match(trendSource, /getRemoteSignalSummary/);
  assert.doesNotMatch(trendSource, /@neondatabase\/serverless|DATABASE_URL|getPostgresUrl|fatedrop_signal_delivery_attempts|fatedrop_signals/);
});

test("live Cloud signal client is no-store and needs no database or private diagnostic secret", () => {
  assert.match(liveSource, /"\/api\/signals"/);
  assert.match(liveSource, /"\/api\/signal-summary"/);
  assert.match(liveSource, /cache: "no-store"/);
  assert.doesNotMatch(liveSource, /DATABASE_URL|FATEDROP_SIGNAL_API_TOKEN|NEXT_PUBLIC_FATEDROP_SIGNAL_API_TOKEN/);
});
