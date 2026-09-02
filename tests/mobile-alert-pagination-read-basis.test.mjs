import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const liveSignals = fs.readFileSync(path.join(process.cwd(), "lib/live-signals.ts"), "utf8");
const canonicalAlerts = fs.readFileSync(path.join(process.cwd(), "lib/canonical-alerts.ts"), "utf8");
const mobileRoute = fs.readFileSync(path.join(process.cwd(), "app/api/mobile/alerts/route.ts"), "utf8");

test("mobile lifecycle history exposes the existing canonical Cloud cursor without a new endpoint", () => {
  assert.match(liveSignals, /before\?: number \| null/);
  assert.match(liveSignals, /beforeId\?: string \| null/);
  assert.match(liveSignals, /params\.set\("before",String\(Math\.trunc\(before\)\)\)/);
  assert.match(canonicalAlerts, /getLiveCloudAlerts\(\{ id, state, before, beforeId, currentOnly, limit: safeLimit \}\)/);
  assert.match(mobileRoute, /Alert history cursor requires one lifecycle state and both cursor fields/);
  assert.match(mobileRoute, /nextCursor/);
});

test("mobile pagination is stage-scoped and returns a cursor from the last delivered alert", () => {
  assert.match(mobileRoute, /requestedState && !requestedId && !currentOnly/);
  assert.match(mobileRoute, /lastAlert = windowAlerts\.at\(-1\)/);
  assert.match(mobileRoute, /before: lastDetectedAt, beforeId: lastAlert\.id/);
  assert.doesNotMatch(mobileRoute, /offset=/);
});

test("read basis preserves the previous 100-per-lifecycle unread window with one lightweight App response", () => {
  assert.match(mobileRoute, /retrievalLimit = readBasis \? 100/);
  assert.match(mobileRoute, /listCanonicalAlertWindow/);
  assert.match(mobileRoute, /alertReadBasis = eligibleAlerts\.map\(\(alert\) => \(\{ id: alert\.id, fateStage: alert\.fateStage, detectedAt: alert\.detectedAt \}\)\)/);
  assert.match(mobileRoute, /readBasis: true/);
  assert.doesNotMatch(mobileRoute, /readBasis[\s\S]{0,300}product:/);
});

test("cursor and read-basis modes remain authenticated preference-filtered views of Cloud truth", () => {
  assert.match(mobileRoute, /getSnapshotForRequest/);
  assert.match(mobileRoute, /notificationPreferencesAllowAlert/);
  assert.match(mobileRoute, /normalizeTcgAlertPreferences/);
  assert.match(mobileRoute, /Cloud owns canonical lifecycle and product classification truth/);
});