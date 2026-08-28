import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");

function position(pattern, label) {
  const index = source.search(pattern);
  assert.notEqual(index, -1, `${label} must be present`);
  return index;
}

test("claimed push rows have a bounded sending lease and stale rows are made retryable", () => {
  assert.match(source, /const SENDING_LEASE_SECONDS = 5 \* 60/);
  assert.match(source, /async function recoverStaleSending\(\)/);
  assert.match(source, /state='sending'/);
  assert.match(source, /updated_at <= \$\{staleBefore\}/);
  assert.match(source, /state='failed'/);
  assert.match(source, /next_attempt_at=\$\{now\}/);
  assert.match(source, /Push delivery lease expired before a result was recorded\./);
});

test("stale sending recovery runs before the dispatcher claims more work", () => {
  const recovery = position(/await recoverStaleSending\(\)/, "stale lease recovery");
  const enqueue = position(/const queued = await enqueueRecentAlerts/, "alert enqueue");
  const claim = position(/const claimed = await claimPending\(100\)/, "outbox claim");
  assert.ok(recovery < enqueue && enqueue < claim);
});

test("normal retry and attempt ceilings remain authoritative after lease recovery", () => {
  assert.match(source, /const MAX_ATTEMPTS = 3/);
  assert.match(source, /state IN \('pending','failed'\)/);
  assert.match(source, /attempts < \$\{MAX_ATTEMPTS\}/);
  assert.match(source, /SET state='sending',attempts=outbox\.attempts\+1/);
});
