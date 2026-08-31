import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const receiptSource = await readFile(new URL('../lib/expo-push-receipts.ts', import.meta.url), 'utf8');
const dispatchRoute = await readFile(new URL('../app/api/dashboard/push-dispatch/route.ts', import.meta.url), 'utf8');
const migrationRoute = await readFile(new URL('../app/api/dashboard/production-migrations/route.ts', import.meta.url), 'utf8');

test('Expo tickets are followed by receipt verification instead of being treated as device delivery', () => {
  assert.match(receiptSource, /push\/getReceipts/);
  assert.match(receiptSource, /MIN_RECEIPT_AGE_SECONDS = 15 \* 60/);
  assert.match(receiptSource, /receipt_status='ok'/);
  assert.match(receiptSource, /receipt_status='error'/);
  assert.match(receiptSource, /DeviceNotRegistered/);
  assert.match(receiptSource, /enabled=CASE WHEN \$\{deadToken\} THEN false ELSE enabled END/);
});

test('receipt failures restore retryable outbox truth while dead tokens are retired', () => {
  assert.match(receiptSource, /state='failed'/);
  assert.match(receiptSource, /permanentFailure/);
  assert.match(receiptSource, /MessageRateExceeded|nextAttempt/);
  assert.match(receiptSource, /GREATEST\(attempts,\$\{MAX_ATTEMPTS\}\)/);
  assert.match(receiptSource, /WHERE id=\$\{candidate\.outbox_id\} AND state='sent'/);
});

test('only the latest attempt can reconcile an outbox row and missing receipts cannot disappear silently', () => {
  assert.match(receiptSource, /SELECT DISTINCT ON \(attempt\.outbox_id\)/);
  assert.match(receiptSource, /ORDER BY attempt\.outbox_id,attempt\.attempted_at DESC,attempt\.id DESC/);
  assert.match(receiptSource, /receipt_status='unverified_expired'/);
  assert.match(receiptSource, /24-hour retention window expired/);
});

test('production migration gate provisions receipt columns before receipt polling is relied on', () => {
  assert.match(migrationRoute, /ensureExpoPushReceiptSchema/);
  assert.match(receiptSource, /ADD COLUMN IF NOT EXISTS receipt_status text/);
  assert.match(receiptSource, /ADD COLUMN IF NOT EXISTS receipt_checked_at bigint/);
  assert.match(receiptSource, /ADD COLUMN IF NOT EXISTS receipt_detail text/);
});

test('canonical push dispatch reconciles receipts without blocking fresh pushes', () => {
  assert.match(dispatchRoute, /reconcileExpoPushReceipts\(\)/);
  assert.match(dispatchRoute, /dispatchCanonicalPushAlerts\(\)/);
  assert.match(dispatchRoute, /failed: result\.failed \+ receipts\.failed/);
  assert.match(dispatchRoute, /receipts\.pending > 0/);
  assert.match(dispatchRoute, /receipts\.expired > 0/);
  assert.match(dispatchRoute, /accepted: true, \.\.\.result, receipts/);
});
