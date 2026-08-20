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

test('canonical signal packs use exact offer history and canonical-product alternatives', () => {
  assert.match(moduleSource, /WHERE hs\.offer_id=s\.offer_id/);
  assert.match(moduleSource, /WHERE ro\.product_id=s\.product_id AND ro\.offer_id<>s\.offer_id/);
  assert.match(moduleSource, /signalThread: signalThread\(row\)/);
  assert.match(moduleSource, /preparedLinks: links/);
  assert.match(moduleSource, /INSPECT PRODUCT/);
  assert.match(moduleSource, /BUY \/ VIEW PRODUCT/);
  assert.match(moduleSource, /VIEW LAST PRODUCT PAGE/);
  assert.match(moduleSource, /ro\.retailer_id='pokemon-center-uk'/);
  assert.match(moduleSource, /linksPrepared: true/);
  assert.match(moduleSource, /lowestKnownUrl: links\.lowestKnown\?\.url/);
});

test('mobile API consumes shared alerts and redacts premium intelligence for free accounts', () => {
  assert.match(routeSource, /listCanonicalAlerts/);
  assert.doesNotMatch(routeSource, /fatedrop_retail_offers/);
  assert.match(routeSource, /function freeAlert/);
  assert.match(routeSource, /rrpPence: null/);
  assert.match(routeSource, /lowestKnown: null/);
  assert.match(routeSource, /officialReference: null/);
  assert.match(routeSource, /alternatives: \[\]/);
  assert.match(routeSource, /canonicalAlerts\.map\(freeAlert\)/);
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
