import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const push = fs.readFileSync(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");
const canonical = fs.readFileSync(new URL("../lib/canonical-alerts.ts", import.meta.url), "utf8");

test("all lifecycle signals have rich stage-scoped retrieval independent of a global latest-100 feed", () => {
  assert.match(canonical, /balancedLifecycleStates = \["whisper", "echo", "manifested", "vanished"\]/);
  assert.match(canonical, /balancedLifecycleStates\.map\(\(lifecycleState\) => listCanonicalAlerts\(\{ state: lifecycleState, limit: safeLimit \}\)\)/);
  assert.match(push, /listCanonicalAlertWindow\(\{ limitPerStage: 100 \}\)/);
});

test("balanced lifecycle rows are merged without duplicate canonical alert ids", () => {
  assert.match(canonical, /new Map<string, CanonicalAlert>\(\)/);
  assert.match(canonical, /for \(const alert of windows\.flat\(\)\) byId\.set\(alert\.id, alert\)/);
});

test("dispatcher consumes only the validated rich canonical alert contract", () => {
  assert.match(canonical, /Canonical Cloud alert feed unavailable/);
  assert.match(canonical, /const windows = await Promise\.all/);
  assert.doesNotMatch(push, /getLiveCloudSignals|getLiveCloudSignalsByState/);
});

test("Manifested remains immediate and is never placed into burst summaries", () => {
  assert.match(push, /if \(alert\.fateStage === "MANIFESTED"\) \{\s*queueRows\.push\(individualPushRow\(alert, recipient, now\)\);\s*continue;/s);
  assert.match(push, /type BurstControlledStage = "WHISPER" \| "ECHO" \| "VANISHED"/);
  assert.doesNotMatch(push, /type BurstControlledStage[^\n]*MANIFESTED/);
});
