import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync(new URL("../app/api/dashboard/local-radar-operator-alert/route.ts", import.meta.url), "utf8");
const push = fs.readFileSync(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");

test("Local Radar operator route reuses the authenticated Cloud-to-Web boundary", () => {
  assert.match(route, /FATEDROP_METRICS_INGEST_SECRET/);
  assert.match(route, /timingSafeEqual/);
  assert.match(route, /authorization\.startsWith\("Bearer "\)/);
  assert.match(route, /dispatchLocalRadarOperatorPush/);
});

test("operator route accepts advisory lifecycle only and fails closed when dispatch is disabled", () => {
  assert.match(route, /value\.stage === "WHISPER" \|\| value\.stage === "ECHO"/);
  assert.doesNotMatch(route, /value\.stage === "MANIFESTED"/);
  assert.doesNotMatch(route, /value\.stage === "VANISHED"/);
  assert.match(route, /Push dispatch is not enabled/);
  assert.match(route, /status: 503/);
});

test("operator push uses the existing canonical outbox and Expo sender", () => {
  assert.equal((push.match(/https:\/\/exp\.host\/--\/api\/v2\/push\/send/g) || []).length, 1);
  assert.match(push, /enqueueLocalRadarOperatorPush/);
  assert.match(push, /INSERT INTO fatedrop_notification_outbox/);
  assert.match(push, /const claimed = await claimPending\(100\)/);
  assert.match(push, /const delivery = await sendClaimed\(claimed, fetchImpl\)/);
});

test("operator notification is deduped per exact event and endpoint and routes into Local Radar", () => {
  assert.match(push, /dedupe_key: `local-radar:\$\{event\.eventId\}:\$\{recipient\.endpoint_id\}`/);
  assert.match(push, /route: event\.route/);
  assert.match(push, /localIntelId: event\.eventId/);
  assert.match(push, /branchCount: event\.branchCount/);
  assert.match(push, /operatorIssue: event\.operatorIssue/);
});

test("operator delivery keeps membership, lifecycle preference and quiet-hours gates", () => {
  assert.match(push, /m\.tier IN \('plus','pro'\)/);
  assert.match(push, /tcgEnabled\(event\.tcgCode, recipient\)/);
  assert.match(push, /event\.stage === "WHISPER".*recipient\.whisper_enabled/s);
  assert.match(push, /recipient\.echo_enabled/);
  assert.match(push, /tcgStagePreferenceEnabled\(event\.tcgCode, event\.stage, recipient\)/);
  assert.match(push, /inQuietHours\(recipient, nowDate\)/);
});

test("operator dispatch inherits stale-sending lease recovery before claiming work", () => {
  const start = push.indexOf("export async function dispatchLocalRadarOperatorPush");
  assert.notEqual(start, -1);
  const operatorDispatch = push.slice(start);
  const recover = operatorDispatch.indexOf("await recoverStaleSending()");
  const enqueue = operatorDispatch.indexOf("const queued = await enqueueLocalRadarOperatorPush(event)");
  const claim = operatorDispatch.indexOf("const claimed = await claimPending(100)");
  assert.ok(recover >= 0 && recover < enqueue && enqueue < claim);
  assert.match(push, /const SENDING_LEASE_SECONDS = 5 \* 60/);
});

test("Web validates online readiness Echo copy and rejects physical national interruption", () => {
  assert.match(route, /FateDrop · Echo · Be ready/);
  assert.match(route, /This is readiness evidence, not confirmed stock\./);
  assert.match(route, /eventId !== `local-radar-operator:\$\{operatorIssue\}`/);
  assert.match(route, /availabilityScope === "online_retailer_readiness"/);
  assert.match(route, /Physical Big Fate intelligence is consumed from Cloud through radius-filtered/);
  assert.doesNotMatch(route, /FateDrop · Local Radar · Incoming stock/);
});

test("readiness Echo preserves alert routing and advisory provenance in the canonical outbox", () => {
  assert.match(push, /event\.route === "alerts" \? `operator_readiness_/);
  assert.match(push, /presentationType: event\.presentationType/);
  assert.match(push, /availabilityScope: event\.availabilityScope/);
  assert.match(push, /availabilityVerified: event\.availabilityVerified/);
  assert.match(push, /tcgCode: event\.tcgCode/);
  assert.match(push, /sourceUrl: event\.sourceUrl \?\? null/);
});
