import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const classifier = await readFile(new URL('../lib/product-alert-intelligence.ts', import.meta.url), 'utf8');
const preferences = await readFile(new URL('../lib/notification-preferences.ts', import.meta.url), 'utf8');
const preferenceRoute = await readFile(new URL('../app/api/notification-preferences/route.ts', import.meta.url), 'utf8');
const mobileAlerts = await readFile(new URL('../app/api/mobile/alerts/route.ts', import.meta.url), 'utf8');
const push = await readFile(new URL('../lib/canonical-push.ts', import.meta.url), 'utf8');
const canonical = await readFile(new URL('../lib/canonical-alerts.ts', import.meta.url), 'utf8');
const webAlerts = await readFile(new URL('../app/dashboard/alerts/page.tsx', import.meta.url), 'utf8');

test('product alert intelligence distinguishes collector products from noise', () => {
  assert.match(classifier, /"SEALED_TCG"/);
  assert.match(classifier, /"SINGLE_CARD"/);
  assert.match(classifier, /"ACCESSORY"/);
  assert.match(classifier, /"MERCHANDISE"/);
  assert.match(classifier, /"UNKNOWN"/);
  assert.match(classifier, /merchandiseEvidence/);
  assert.match(classifier, /accessoryEvidence/);
  assert.match(classifier, /strongSealedEvidence/);
  assert.match(classifier, /tcgCollectionEvidence/);
  assert.match(classifier, /singleCardEvidence/);
});

test('precision defaults reduce noise without silently dropping unknown products', () => {
  assert.match(preferences, /sealedTcg: true/);
  assert.match(preferences, /singleCards: true/);
  assert.match(preferences, /accessories: false/);
  assert.match(preferences, /merchandise: false/);
  assert.match(preferences, /unknownProducts: true/);
  for (const key of ['sealedTcg','singleCards','accessories','merchandise','unknownProducts']) {
    assert.match(preferenceRoute, new RegExp(`${key}: boolean\\(payload\\.${key}`));
  }
});

test('mobile inbox and push both apply the shared precision gate', () => {
  assert.match(mobileAlerts, /notificationPreferencesAllowAlert/);
  assert.match(mobileAlerts, /getNotificationPreferences\(snapshot\.account\.id\)/);
  assert.match(push, /productAlertEnabled/);
  assert.match(push, /sealed_tcg_enabled/);
  assert.match(push, /single_cards_enabled/);
  assert.match(push, /accessories_enabled/);
  assert.match(push, /merchandise_enabled/);
  assert.match(push, /unknown_products_enabled/);
  assert.match(push, /!productEnabled\(alert, recipient\)/);
});

test('web inbox applies preferences while raw seven-day network trends remain independent', () => {
  assert.match(webAlerts, /notificationPreferencesAllowAlert/);
  assert.match(webAlerts, /rawAlerts\.filter/);
  assert.match(webAlerts, /getCanonicalSignalTrend\(7\)/);
});

test('observed live time is a Vanished-only closed-window fact', () => {
  assert.match(canonical, /s\.state='vanished'/);
  assert.match(canonical, /hs\.state='manifested'/);
  assert.match(canonical, /hv\.state='vanished'/);
  assert.match(canonical, /Observed live for/);
  assert.match(canonical, /row\.state === "vanished" \? row\.observed_duration_seconds : null/);
  assert.match(webAlerts, /alert\.fateStage === "VANISHED"/);
  assert.match(webAlerts, /OBSERVED LIVE/);
});
