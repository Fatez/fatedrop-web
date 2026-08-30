import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const push = fs.readFileSync(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");
const live = fs.readFileSync(new URL("../lib/live-signals.ts", import.meta.url), "utf8");

test("priority lifecycle signals have stage-scoped retrieval independent of the global latest-100 feed", () => {
  assert.match(live, /getLiveCloudSignalsByState/);
  assert.match(live, /new URLSearchParams\(\{ state, since: String\(safeSince\), limit: String\(safeLimit\) \}\)/);
  assert.match(push, /STARVATION_PROTECTED_STATES = \["echo", "manifested", "vanished"\]/);
  assert.match(push, /getLiveCloudSignalsByState\(\{ state, since, limit: 100 \}\)/);
});

test("protected lifecycle ids are hydrated to the canonical alert contract and merged without duplicates", () => {
  assert.match(push, /listCanonicalAlerts\(\{ id, limit: 1 \}\)/);
  assert.match(push, /new Map<string, CanonicalAlert>\(\)/);
  assert.match(push, /for \(const alert of \[\.\.\.baseAlerts, \.\.\.protectedAlerts\]\) alertById\.set\(alert\.id, alert\)/);
});

test("dispatcher fails closed if priority lifecycle retrieval is unavailable", () => {
  assert.match(push, /Protected lifecycle signal feed unavailable; refusing to risk dropping priority pushes\./);
  assert.match(push, /feed\?\.success !== true \|\| !Array\.isArray\(feed\.signals\)/);
});

test("Manifested remains immediate and is never placed into burst summaries", () => {
  assert.match(push, /if \(alert\.fateStage === "MANIFESTED"\) \{\s*queueRows\.push\(individualPushRow\(alert, recipient, now\)\);\s*continue;/s);
  assert.match(push, /type BurstControlledStage = "WHISPER" \| "ECHO" \| "VANISHED"/);
  assert.doesNotMatch(push, /type BurstControlledStage[^\n]*MANIFESTED/);
});
