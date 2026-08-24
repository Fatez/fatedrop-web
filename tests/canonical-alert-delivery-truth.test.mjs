import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const deliverySource = await readFile(new URL('../lib/canonical-alert-delivery.ts', import.meta.url), 'utf8');
const routeSource = await readFile(new URL('../app/api/mobile/alerts/route.ts', import.meta.url), 'utf8');

test('Discord delivery telemetry remains persisted and independently inspectable', () => {
  assert.match(deliverySource, /fatedrop_signal_delivery_attempts/);
  assert.match(deliverySource, /channel='discord'/);
  assert.match(deliverySource, /result === "sent" \|\| result === "failed"/);
  assert.match(deliverySource, /missing_bot_token/);
  assert.match(deliverySource, /missing_channel_id/);
  assert.match(deliverySource, /missing_lifecycle_channel_id/);
  assert.match(deliverySource, /CONFIG_ISSUES\.has/);
});

test('mobile canonical inbox is signal-backed and Discord delivery is optional metadata', () => {
  assert.match(routeSource, /listCanonicalAlerts/);
  assert.match(routeSource, /listCanonicalAlertDeliveries/);
  assert.match(routeSource, /attachDiscordDelivery/);
  assert.match(routeSource, /discord: delivery \?/);
  assert.match(routeSource, /: null/);
  assert.doesNotMatch(routeSource, /listDeliveryBackedCanonicalAlerts/);
});
