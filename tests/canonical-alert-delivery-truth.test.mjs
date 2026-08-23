import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const deliverySource = await readFile(new URL('../lib/canonical-alert-delivery.ts', import.meta.url), 'utf8');
const routeSource = await readFile(new URL('../app/api/mobile/alerts/route.ts', import.meta.url), 'utf8');

test('canonical alert inbox is derived from persisted Discord delivery attempts', () => {
  assert.match(deliverySource, /fatedrop_signal_delivery_attempts/);
  assert.match(deliverySource, /channel='discord'/);
  assert.match(deliverySource, /result === "sent" \|\| result === "failed"/);
  assert.match(deliverySource, /missing_bot_token/);
  assert.match(deliverySource, /missing_channel_id/);
  assert.match(deliverySource, /missing_lifecycle_channel_id/);
  assert.match(deliverySource, /CONFIG_ISSUES\.has/);
  assert.doesNotMatch(deliverySource, /reason !== "disabled"/);
  assert.doesNotMatch(deliverySource, /reason !== "duplicate_batch_signal"/);
});

test('shared canonical hydration attaches delivery truth before API redaction', () => {
  assert.match(deliverySource, /listDeliveryBackedCanonicalAlerts/);
  assert.match(deliverySource, /listCanonicalAlerts\(\{ id: delivery\.signalId/);
  assert.match(deliverySource, /status: delivery\.result/);
  assert.match(deliverySource, /issue: delivery\.result === "sent" \? null : delivery\.detail/);
  assert.match(routeSource, /listDeliveryBackedCanonicalAlerts/);
  assert.doesNotMatch(routeSource, /listCanonicalAlerts/);
});
