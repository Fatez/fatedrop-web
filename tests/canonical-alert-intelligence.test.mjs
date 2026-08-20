import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const route = await readFile(new URL('../app/api/mobile/alerts/route.ts', import.meta.url), 'utf8');

test('canonical mobile alerts expose RRP and best-offer intelligence', () => {
  assert.match(route, /official_rrp_pence/);
  assert.match(route, /rrpDeltaPercent/);
  assert.match(route, /BETTER_OFFER_FOUND/);
  assert.match(route, /LOWEST_KNOWN/);
  assert.match(route, /NO_FAIR_COMPARISON/);
  assert.match(route, /fatedrop_retail_offers/);
  assert.match(route, /alertId: row\.id/);
  assert.match(route, /notification: notificationCopy/);
});

test('RRP and delivered-price comparisons remain separate', () => {
  assert.match(route, /percentage\(row\.price_pence, rrpPence\)/);
  assert.match(route, /comparisonBasis = row\.delivered_price_pence != null/);
  assert.match(route, /ro\.postage_pence IS NOT NULL/);
});
