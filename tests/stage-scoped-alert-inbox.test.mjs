import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const liveSignals = fs.readFileSync(path.join(process.cwd(), "lib/live-signals.ts"), "utf8");
const canonicalAlerts = fs.readFileSync(path.join(process.cwd(), "lib/canonical-alerts.ts"), "utf8");
const mobileRoute = fs.readFileSync(path.join(process.cwd(), "app/api/mobile/alerts/route.ts"), "utf8");

test("rich Cloud alert reads can be scoped by lifecycle before Cloud LIMIT", () => {
  assert.match(liveSignals, /state\?: CloudLifecycleState/);
  assert.match(liveSignals, /if \(state\) params\.set\("state", state\)/);
  assert.match(canonicalAlerts, /state\?: CloudLifecycleState/);
  assert.match(canonicalAlerts, /getLiveCloudAlerts\(\{ id, state, limit: safeLimit \}\)/);
});

test("mobile gateway passes a validated lifecycle state into the canonical Cloud read", () => {
  assert.match(mobileRoute, /lifecycleStates = new Set<CloudLifecycleState>/);
  assert.match(mobileRoute, /requestedStateRaw/);
  assert.match(mobileRoute, /listCanonicalAlertWindow\(\{ id: requestedId, state: requestedState, limitPerStage: retrievalLimit \}\)/);
  assert.match(mobileRoute, /one lifecycle burst cannot starve another/);
});
