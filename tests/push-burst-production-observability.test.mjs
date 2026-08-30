import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync(new URL("../app/api/health/push-burst/route.ts", import.meta.url), "utf8");
const canonicalPush = fs.readFileSync(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");

test("burst policy observability starts only after PR 189 production deployment", () => {
  assert.match(route, /2026-08-30T06:39:50Z/);
  assert.match(route, /created_at >= \$\{BURST_POLICY_PRODUCTION_START\}/);
  assert.match(route, /cache-control/);
});

test("burst production health exposes only aggregate policy evidence", () => {
  assert.match(route, /event_id LIKE 'sig_summary_%'/);
  assert.match(route, /sig_summary_whisper_/);
  assert.match(route, /sig_summary_echo_/);
  assert.match(route, /sig_summary_vanished_/);
  assert.match(route, /sig_summary_manifested_/);
  assert.match(route, /payload_json->>'summaryCount'/);
  assert.match(route, /invalidSummaryCount/);
  assert.match(route, /minSummaryCount/);
  assert.match(route, /maxSummaryCount/);
  assert.match(route, /controlledIndividual/);
  assert.match(route, /manifestedIndividual/);

  for (const forbidden of [
    "expo_push_token",
    "endpoint_id",
    "user_id",
    "provider_message_id",
    "receipt_detail",
    "retailerName",
    "productTitle",
  ]) {
    assert.doesNotMatch(route, new RegExp(forbidden, "i"));
  }
});

test("summary receipt evidence is mature, redacted and read-only", () => {
  assert.match(route, /RECEIPT_MIN_AGE_SECONDS = 15 \* 60/);
  assert.match(route, /receipt_status='ok'/);
  assert.match(route, /receipt_status='error'/);
  assert.match(route, /receipt_checked_at IS NULL/);
  assert.match(route, /summaryReceiptEligible/);
  assert.match(route, /summaryReceiptOk/);
  assert.match(route, /summaryReceiptError/);
  assert.match(route, /summaryReceiptPending/);
  assert.doesNotMatch(route, /\bINSERT\b/i);
  assert.doesNotMatch(route, /\bUPDATE\b/i);
  assert.doesNotMatch(route, /\bDELETE\b/i);
});

test("production push implementation keeps Manifested individual and only controls Whisper Echo Vanished", () => {
  assert.match(canonicalPush, /const BURST_MIN_SIZE = 5/);
  assert.match(canonicalPush, /type BurstControlledStage = "WHISPER" \| "ECHO" \| "VANISHED"/);
  assert.match(canonicalPush, /if \(alert\.fateStage === "MANIFESTED"\) \{\s*queueRows\.push\(individualPushRow/);
  assert.match(canonicalPush, /bucketAlerts\.length >= BURST_MIN_SIZE/);
  assert.match(canonicalPush, /burstSummaryPushRow/);
  assert.match(canonicalPush, /event_id: `sig_summary_\$\{stage\.toLowerCase\(\)\}_\$\{bucket\}`/);
});
