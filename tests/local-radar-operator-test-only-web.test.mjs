import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync(new URL("../app/api/dashboard/local-radar-operator-alert/route.ts", import.meta.url), "utf8");
const push = fs.readFileSync(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");

test("Web accepts TEST ONLY operator transport only through an explicit boolean marker", () => {
  assert.match(route, /value\.testOnly !== undefined && typeof value\.testOnly !== "boolean"/);
  assert.match(route, /const testOnly = value\.testOnly === true/);
  assert.match(route, /eventId !== `local-radar-operator-test:\$\{operatorIssue\}`/);
  assert.match(route, /FateDrop · Local Radar · TEST ONLY/);
  assert.match(route, /body\.startsWith\("TEST ONLY · Operator transport verification matched "\)/);
  assert.match(route, /No stock or Local Radar history has been created\./);
});

test("TEST ONLY cannot masquerade as the normal operator event contract", () => {
  assert.match(route, /if \(testOnly\)[\s\S]*local-radar-operator-test:[\s\S]*online_retailer_readiness[\s\S]*local-radar-operator:/);
  assert.match(route, /FateDrop · Echo · Be ready/);
  assert.match(route, /This is readiness evidence, not confirmed stock\./);
});

test("TEST ONLY reuses the real outbox transport with a separate event identity", () => {
  assert.match(route, /dispatchLocalRadarOperatorPush\(event\)/);
  assert.match(push, /dedupe_key: `local-radar:\$\{event\.eventId\}:\$\{recipient\.endpoint_id\}`/);
  assert.match(push, /event_id: event\.eventId/);
  assert.match(push, /title: event\.title/);
  assert.match(push, /body: event\.body/);
});

test("Web TEST ONLY receiver does not write Local Radar stock or history", () => {
  assert.doesNotMatch(route, /upsertLocalStockObservations|INSERT INTO .*local|UPDATE .*local|DELETE FROM .*local/i);
  assert.doesNotMatch(route, /MANIFESTED|VANISHED/);
});
