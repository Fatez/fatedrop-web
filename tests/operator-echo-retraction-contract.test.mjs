import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const { parseOperatorEchoRetraction } = await import("../app/api/dashboard/local-radar-operator-alert/retract/route.ts");

const pushSource = fs.readFileSync(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");
const retractionSource = fs.readFileSync(new URL("../lib/operator-echo-retraction.ts", import.meta.url), "utf8");
const migrationSource = fs.readFileSync(new URL("../database/2026-09-05-operator-echo-retractions.sql", import.meta.url), "utf8");
const capabilitySource = fs.readFileSync(new URL("../lib/operator-capabilities.ts", import.meta.url), "utf8");
const ownerRouteSource = fs.readFileSync(new URL("../app/api/mobile/operator-echoes/route.ts", import.meta.url), "utf8");

function command(overrides = {}) {
  return {
    schemaVersion: 2,
    operation: "retract",
    operatorConfirmation: "RETRACT_GLOBAL_ECHO",
    eventId: "local-radar-operator-retraction:902",
    targetEventId: "local-radar-operator:901",
    targetOperatorIssue: 901,
    retractionIssue: 902,
    reason: "The evidence was attributed to the wrong retailer.",
    operatorLogin: "Fatez",
    requestedAt: "2026-09-05T05:00:00.000Z",
    ...overrides,
  };
}

test("the authenticated retraction command identifies one exact manual Echo", () => {
  const parsed = parseOperatorEchoRetraction(command());
  assert.equal(parsed.targetEventId, "local-radar-operator:901");
  assert.equal(parsed.eventId, "local-radar-operator-retraction:902");
  assert.equal(parseOperatorEchoRetraction(command({ operatorConfirmation: "YES" })), null);
  assert.equal(parseOperatorEchoRetraction(command({ targetEventId: "signal:901" })), null);
  assert.equal(parseOperatorEchoRetraction(command({ operatorLogin: "someone-else" })), null);
  assert.equal(parseOperatorEchoRetraction(command({ reason: "wrong" })), null);
});

test("retraction is append-only, suppresses queued delivery, and sends an actionless correction", () => {
  assert.match(migrationSource, /fatedrop_operator_echo_retractions/);
  assert.match(migrationSource, /fatedrop_operator_echo_retraction_audit/);
  assert.doesNotMatch(migrationSource, /DELETE FROM/);
  assert.match(retractionSource, /state IN \('pending','failed','sending'\)/);
  assert.match(retractionSource, /state='suppressed'/);
  assert.match(retractionSource, /This Echo was retracted by FateDrop\./);
  assert.match(retractionSource, /route: "operator-correction"/);
  assert.match(retractionSource, /noAction: true/);
  assert.match(retractionSource, /ON CONFLICT \(dedupe_key\) DO NOTHING/);
  assert.doesNotMatch(retractionSource, /event_type: "manifested"|event_type: "vanished"/);
});

test("dispatcher performs a final durable retraction check before network send", () => {
  assert.match(pushSource, /retractedOperatorEchoIds\(rows\.map\(\(row\) => row\.event_id\)\)/);
  assert.match(pushSource, /operator_echo_retracted_before_send/);
  assert.match(pushSource, /AND state='sending'/);
  assert.match(pushSource, /retraction\.target_event_id=fatedrop_notification_outbox\.event_id/);
});

test("owner authority exposes separate send and retract capabilities and a private active list", () => {
  assert.match(capabilitySource, /canSendGlobalEcho: boolean/);
  assert.match(capabilitySource, /canRetractGlobalEcho: boolean/);
  assert.match(ownerRouteSource, /capabilities\.canRetractGlobalEcho/);
  assert.match(ownerRouteSource, /alert\.signalKind !== "operator_readiness"/);
  assert.match(ownerRouteSource, /availabilityScope !== "online_retailer_readiness"/);
  assert.match(ownerRouteSource, /sourceType !== "operator_manual"/);
  assert.match(ownerRouteSource, /cache-control": "private, no-store"/);
});
