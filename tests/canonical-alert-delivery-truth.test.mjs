import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const deliverySource = await readFile(new URL('../lib/canonical-alert-delivery.ts', import.meta.url), 'utf8');
const routeSource = await readFile(new URL('../app/api/mobile/alerts/route.ts', import.meta.url), 'utf8');

test('canonical alert inbox is derived from persisted Discord delivery attempts', () => {
  assert.match(deliverySource, /fatedrop_signal_delivery_attempts/);
  assert.match(deliverySource, /channel='discord'/);
  assert.match(deliverySource, /result === "sent" \|\| result === "failed"/);
  assert.match(deliverySource, /reason !== "disabled"/);
  assert.match(deliverySource, /reason !== "duplicate_batch_signal"/);
});

test('mobile alert API hydrates only canonical delivery-backed signal IDs', () => {
  assert.match(routeSource, /listCanonicalAlertDeliveries/);
  assert.match(routeSource, /listCanonicalAlerts\(\{ id: delivery\.signalId/);
  assert.match(routeSource, /status: delivery\.result/);
  assert.match(routeSource, /issue: delivery\.result === "sent" \? null : delivery\.detail/);
});
