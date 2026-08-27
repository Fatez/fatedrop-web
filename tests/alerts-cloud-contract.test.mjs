import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const canonicalAlerts = fs.readFileSync(path.join(process.cwd(), "lib/canonical-alerts.ts"), "utf8");
const liveSignals = fs.readFileSync(path.join(process.cwd(), "lib/live-signals.ts"), "utf8");

test("Alerts read rich canonical alert truth from the public Cloud contract", () => {
  assert.match(canonicalAlerts, /getLiveCloudAlerts/);
  assert.match(canonicalAlerts, /FATEDROP_CLOUD/);
  assert.doesNotMatch(canonicalAlerts, /fateDropPostgres/);
  assert.doesNotMatch(canonicalAlerts, /FROM fatedrop_signals/);
  assert.doesNotMatch(canonicalAlerts, /api\/signal-health/);
  assert.doesNotMatch(canonicalAlerts, /api\/status/);
});

test("Cloud alert client rejects unexpected source or contract drift", () => {
  assert.match(liveSignals, /PUBLIC_SIGNAL_CONTRACT_VERSION = 1/);
  assert.match(liveSignals, /detail: "alerts"/);
  assert.match(liveSignals, /result\.source === "FATEDROP_CLOUD"/);
});
