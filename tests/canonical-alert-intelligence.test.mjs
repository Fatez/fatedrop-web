import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const moduleSource = await readFile(new URL('../lib/canonical-alerts.ts', import.meta.url), 'utf8');
const pushSource = await readFile(new URL('../lib/canonical-push.ts', import.meta.url), 'utf8');
const routeSource = await readFile(new URL('../app/api/mobile/alerts/route.ts', import.meta.url), 'utf8');
const ingestSource = await readFile(new URL('../app/api/dashboard/network-snapshot/route.ts', import.meta.url), 'utf8');

test('canonical alerts expose RRP and best-offer intelligence', () => {
  assert.match(moduleSource, /official_rrp_pence/);
  assert.match(moduleSource, /rrpDeltaPercent/);
  assert.match(moduleSource, /BETTER_OFFER_FOUND/);
  assert.match(moduleSource, /LOWEST_KNOWN/);
  assert.match(moduleSource, /NO_FAIR_COMPARISON/);
  assert.match(moduleSource, /fatedrop_retail_offers/);
  assert.match(moduleSource, /alertId: row\.id/);
  assert.match(moduleSource, /notification: notificationCopy/);
});

test('RRP and delivered-price comparisons remain separate', () => {
  assert.match(moduleSource, /percentage\(row\.price_pence, rrpPence\)/);
  assert.match(moduleSource, /comparisonBasis = row\.delivered_price_pence != null/);
  assert.match(moduleSource, /ro\.postage_pence IS NOT NULL/);
});

test('mobile API consumes the shared canonical alert module', () => {
  assert.match(routeSource, /listCanonicalAlerts/);
  assert.doesNotMatch(routeSource, /fatedrop_retail_offers/);
});

test('push delivery is feature-gated, deduplicated and failure-isolated', () => {
  assert.match(pushSource, /FATEDROP_PUSH_DISPATCH_ENABLED === "true"/);
  assert.match(pushSource, /fatedrop_notification_outbox/);
  assert.match(pushSource, /ON CONFLICT \(dedupe_key\) DO NOTHING/);
  assert.match(pushSource, /fatedrop_notification_delivery_attempts/);
  assert.match(pushSource, /DeviceNotRegistered/);
  assert.match(pushSource, /quiet_hours_enabled/);
  assert.match(pushSource, /m\.tier IN \('plus','pro'\)/);
  assert.match(ingestSource, /dispatchCanonicalPushAlerts\(\{ measuredAt \}\)\.catch/);
});
