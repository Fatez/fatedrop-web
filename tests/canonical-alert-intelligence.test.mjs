import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const moduleSource = await readFile(new URL('../lib/canonical-alerts.ts', import.meta.url), 'utf8');
const routeSource = await readFile(new URL('../app/api/mobile/alerts/route.ts', import.meta.url), 'utf8');

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
