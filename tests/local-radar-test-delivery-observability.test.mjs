import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const route = await readFile(new URL('../app/api/health/local-radar-test-delivery/route.ts', import.meta.url), 'utf8');

test('Local Radar TEST ONLY delivery health is read-only and scoped to test event ids', () => {
  assert.match(route, /export async function GET\(request: Request\)/);
  assert.match(route, /local-radar-operator-test:/);
  assert.match(route, /event_id LIKE 'local-radar-operator-test:%'/);
  assert.match(route, /fatedrop_notification_outbox/);
  assert.match(route, /fatedrop_notification_delivery_attempts/);
  assert.doesNotMatch(route, /\bINSERT\b/i);
  assert.doesNotMatch(route, /\bUPDATE\b/i);
  assert.doesNotMatch(route, /\bDELETE\b/i);
  assert.doesNotMatch(route, /dispatchLocalRadarOperatorPush/);
  assert.doesNotMatch(route, /upsertLocalStockObservations/);
});

test('Local Radar TEST ONLY delivery health exposes redacted queue ticket and receipt aggregates', () => {
  assert.match(route, /outboxTotal/);
  assert.match(route, /ticketAccepted/);
  assert.match(route, /ticketFailed/);
  assert.match(route, /ticketRetry/);
  assert.match(route, /receiptChecked/);
  assert.match(route, /receiptOk/);
  assert.match(route, /receiptError/);
  assert.match(route, /receiptPending/);
  assert.match(route, /"cache-control": "no-store"/);
  assert.doesNotMatch(route, /expoPushToken/);
});

test('Local Radar TEST ONLY delivery health exposes only redacted endpoint freshness evidence', () => {
  assert.match(route, /targetEndpointExists/);
  assert.match(route, /targetEndpointEnabled/);
  assert.match(route, /targetPlatform/);
  assert.match(route, /targetEndpointCreatedAgeSeconds/);
  assert.match(route, /targetEndpointUpdatedAgeSeconds/);
  assert.match(route, /enabledEndpointCount/);
  assert.match(route, /newerEnabledEndpointCount/);
  assert.match(route, /enabledEndpointUpdatedWithin24hCount/);
  assert.match(route, /targetIsNewestEnabledEndpoint/);
  assert.match(route, /targetHasFailureReason/);
  assert.doesNotMatch(route, /\buserId\b/);
  assert.doesNotMatch(route, /\bendpointId\b\s*:/);
  assert.doesNotMatch(route, /expo_push_token/);
});

test('explicit issue lookup only accepts positive integer TEST ONLY issue ids', () => {
  assert.match(route, /\^\[1-9\]\[0-9\]\*\$/);
  assert.match(route, /invalid_test_issue/);
  assert.match(route, /`local-radar-operator-test:\$\{raw\}`/);
});
