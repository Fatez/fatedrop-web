import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync(new URL("../app/api/dashboard/push-dispatch/route.ts", import.meta.url), "utf8");
const push = fs.readFileSync(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");

test("lifecycle push trigger reuses the authenticated Cloud-to-Web boundary", () => {
  assert.match(route, /FATEDROP_METRICS_INGEST_SECRET/);
  assert.match(route, /timingSafeEqual/);
  assert.match(route, /authorization\.startsWith\("Bearer "\)/);
  assert.match(route, /dispatchCanonicalPushAlerts\(\)/);
});

test("lifecycle push trigger fails closed when dispatch is disabled", () => {
  assert.match(route, /Push dispatch is not enabled/);
  assert.match(route, /status: 503/);
  assert.match(push, /FATEDROP_PUSH_DISPATCH_ENABLED/);
});

test("canonical lifecycle worker owns enqueue claim and Expo delivery", () => {
  const start = push.indexOf("export async function dispatchCanonicalPushAlerts");
  assert.notEqual(start, -1);
  const worker = push.slice(start);
  assert.match(worker, /await recoverStaleSending\(\)/);
  assert.match(worker, /await enqueueRecentAlerts\(/);
  assert.match(worker, /await claimPending\(100\)/);
  assert.match(worker, /await sendClaimed\(claimed, fetchImpl\)/);
  assert.equal((push.match(/https:\/\/exp\.host\/--\/api\/v2\/push\/send/g) || []).length, 1);
});

test("trigger does not accept arbitrary notification payloads", () => {
  assert.doesNotMatch(route, /request\.json/);
  assert.doesNotMatch(route, /title:/);
  assert.doesNotMatch(route, /body:/);
});
