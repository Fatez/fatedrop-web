import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync(new URL("../app/api/health/push/route.ts", import.meta.url), "utf8");
const health = fs.readFileSync(new URL("../lib/push-dispatch-health.ts", import.meta.url), "utf8");

test("push health preserves the existing 204/503 monitor contract", () => {
  assert.match(route, /status: 204/);
  assert.match(route, /status: 503/);
  assert.match(route, /cache-control/);
});

test("push health exposes safe aggregate dispatcher counters only when detail=1", () => {
  assert.match(route, /searchParams\.get\("detail"\) === "1"/);
  assert.match(route, /Response\.json\(health/);
  assert.match(health, /lastQueued/);
  assert.match(health, /lastClaimed/);
  assert.match(health, /lastSent/);
  assert.match(health, /lastFailed/);
  assert.match(health, /lastError/);
  assert.match(health, /eligibleRecipientCount/);
  assert.match(health, /whisperEnabledRecipientCount/);
  assert.match(health, /sealedTcgEnabledRecipientCount/);
  assert.match(health, /quietHoursEnabledRecipientCount/);
  assert.match(health, /recentWhisperOutboxCount/);
  assert.match(health, /recentOutboxSent/);
  assert.match(health, /recentOutboxFailed/);
  assert.match(health, /outbox24hTotal/);
  assert.match(health, /outbox24hWhisper/);
  assert.match(health, /outbox24hWhisperSent/);
  assert.match(health, /outbox24hWhisperFailed/);
  assert.match(health, /agedManifestedUnsettled/);
  assert.match(health, /oldestManifestedUnsettledAgeSeconds/);
  assert.match(health, /agedManifestedUnsettled === 0/);
  assert.match(health, /naturalOutbox24h/);
  assert.match(health, /canaryOutbox24h/);
  assert.match(health, /naturalWhisperOutbox3h/);
  assert.match(health, /naturalWhisperSent3h/);
  assert.match(health, /naturalWhisperFailed3h/);
  assert.match(health, /latestNaturalSentAgeSeconds/);
  assert.doesNotMatch(route, /expo_push_token/i);
  assert.doesNotMatch(route, /user_id/i);
});

test("push health exposes receipt outcomes for natural pushes without exposing recipient data", () => {
  assert.match(health, /readReceiptDiagnostics/);
  assert.match(health, /receipt_status='ok'/);
  assert.match(health, /receipt_status='error'/);
  assert.match(health, /receipt_checked_at IS NULL/);
  assert.match(health, /outbox\.event_id LIKE 'sig_%'/);
  assert.match(health, /naturalReceiptEligible24h/);
  assert.match(health, /naturalReceiptOk24h/);
  assert.match(health, /naturalReceiptError24h/);
  assert.match(health, /naturalReceiptPending24h/);
  assert.match(health, /naturalWhisperReceiptEligible24h/);
  assert.match(health, /naturalWhisperReceiptOk24h/);
  assert.match(health, /naturalWhisperReceiptError24h/);
  assert.match(health, /naturalWhisperReceiptPending24h/);
  assert.match(health, /latestNaturalReceiptCheckedAgeSeconds/);
  assert.match(health, /receiptSchemaUnavailable/);
  assert.doesNotMatch(route, /provider_message_id/i);
  assert.doesNotMatch(route, /endpoint_id/i);
  assert.doesNotMatch(route, /receipt_detail/i);
});
