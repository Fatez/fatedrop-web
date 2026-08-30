import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const moduleSource = await readFile(new URL('../lib/canonical-alerts.ts', import.meta.url), 'utf8');
const liveSignalSource = await readFile(new URL('../lib/live-signals.ts', import.meta.url), 'utf8');
const deliverySource = await readFile(new URL('../lib/canonical-alert-delivery.ts', import.meta.url), 'utf8');
const pushSource = await readFile(new URL('../lib/canonical-push.ts', import.meta.url), 'utf8');
const routeSource = await readFile(new URL('../app/api/mobile/alerts/route.ts', import.meta.url), 'utf8');
const ingestSource = await readFile(new URL('../app/api/dashboard/network-snapshot/route.ts', import.meta.url), 'utf8');
const webAlertsSource = await readFile(new URL('../app/dashboard/alerts/page.tsx', import.meta.url), 'utf8');
const webPackSource = await readFile(new URL('../components/canonical-alert-signal-pack.tsx', import.meta.url), 'utf8');

test('canonical Alerts consume Cloud-owned RRP and best-offer intelligence', () => {
  assert.match(moduleSource, /getLiveCloudAlerts/);
  assert.match(moduleSource, /rrpDeltaPercent/);
  assert.match(moduleSource, /BETTER_OFFER_FOUND/);
  assert.match(moduleSource, /LOWEST_KNOWN/);
  assert.match(moduleSource, /NO_FAIR_COMPARISON/);
  assert.match(moduleSource, /preparedLinks/);
  assert.match(moduleSource, /signalThread/);
  assert.doesNotMatch(moduleSource, /fatedrop_retail_offers/);
  assert.doesNotMatch(moduleSource, /fatedrop_signals/);
});

test('RRP and delivered-price comparison fields remain distinct at the client boundary', () => {
  assert.match(moduleSource, /rrpPence: number \| null/);
  assert.match(moduleSource, /rrpDeltaPercent: number \| null/);
  assert.match(moduleSource, /comparisonBasis: "item" \| "delivered"/);
  assert.match(moduleSource, /currentComparisonPence: number \| null/);
  assert.match(moduleSource, /deliveredPricePence: number \| null/);
});

test('Alerts require the versioned FATEDROP_CLOUD rich contract and fail closed on drift', () => {
  assert.match(liveSignalSource, /detail: "alerts"/);
  assert.match(liveSignalSource, /PUBLIC_SIGNAL_CONTRACT_VERSION = 1/);
  assert.match(liveSignalSource, /result\.source === "FATEDROP_CLOUD"/);
  assert.match(moduleSource, /response\.available !== true/);
  assert.match(moduleSource, /Canonical Cloud alert feed unavailable/);
  assert.doesNotMatch(moduleSource, /api\/signal-health/);
  assert.doesNotMatch(moduleSource, /api\/status/);
});

test('canonical alerts preserve the final four-stage lifecycle', () => {
  assert.match(moduleSource, /"WHISPER" \| "ECHO" \| "MANIFESTED" \| "VANISHED"/);
  assert.match(moduleSource, /state === "whisper"\) return "WHISPER"/);
  assert.match(moduleSource, /state === "echo"\) return "ECHO"/);
  assert.match(moduleSource, /state === "manifested"\) return "MANIFESTED"/);
  assert.match(moduleSource, /state === "vanished"\) return "VANISHED"/);
  assert.doesNotMatch(moduleSource, /state === "whisper"\) return "ECHO"/);
});

test('canonical signal packs preserve Cloud-supplied history, comparisons and prepared links', () => {
  assert.match(moduleSource, /signalThread: CanonicalSignalThreadEntry\[\]/);
  assert.match(moduleSource, /lowestKnown: CanonicalOfferLink \| null/);
  assert.match(moduleSource, /officialReference: CanonicalOfferLink \| null/);
  assert.match(moduleSource, /alternatives: CanonicalOfferLink\[\]/);
  assert.match(moduleSource, /linksPrepared: true/);
  assert.match(webPackSource, /SIGNAL TRAIL/);
  assert.match(webPackSource, /STILL LIVE ELSEWHERE/);
  assert.match(webPackSource, /COMPARE ALL OFFERS/);
  assert.match(webPackSource, /CREATE FATEFIND/);
});

test('web Alerts exposes lifecycle-aware signal packs for Whisper and Echo separately', () => {
  assert.match(webAlertsSource, /alert\.fateStage === "WHISPER"/);
  assert.match(webAlertsSource, /alert\.fateStage === "ECHO"/);
  assert.match(webAlertsSource, /alert\.fateStage === "VANISHED"/);
  assert.match(webPackSource, /Catalogue or product movement has been detected/);
  assert.match(webPackSource, /Queue, traffic, security or access readiness has changed/);
});

test('mobile API consumes the complete shared Cloud alert envelope and redacts premium intelligence for free accounts', () => {
  assert.match(routeSource, /listCanonicalAlertWindow/);
  assert.match(moduleSource, /presentation: CanonicalAlertPresentation/);
  assert.match(moduleSource, /delivery: \{/);
  assert.match(deliverySource, /fatedrop_signal_delivery_attempts/);
  assert.doesNotMatch(routeSource, /listCanonicalAlertDeliveries|listCanonicalAlertPresentations|attachDiscordDelivery/);
  assert.doesNotMatch(routeSource, /listDeliveryBackedCanonicalAlerts/);
  assert.doesNotMatch(routeSource, /fatedrop_retail_offers/);
  assert.match(routeSource, /function freeAlert/);
  assert.match(routeSource, /rrpPence: null/);
  assert.match(routeSource, /lowestKnown: null/);
  assert.match(routeSource, /officialReference: null/);
  assert.match(routeSource, /alternatives: \[\]/);
  assert.match(routeSource, /alertsWithDelivery\.map\(freeAlert\)/);
});

test('push delivery is feature-gated, deduplicated and honors all four lifecycle preferences', () => {
  assert.match(pushSource, /FATEDROP_PUSH_DISPATCH_ENABLED === "true"/);
  assert.match(pushSource, /whisper_enabled/);
  assert.match(pushSource, /alert\.fateStage === "WHISPER"/);
  assert.match(pushSource, /alert\.fateStage === "ECHO"/);
  assert.match(pushSource, /alert\.fateStage === "MANIFESTED"/);
  assert.match(pushSource, /alert\.fateStage === "VANISHED"/);
  assert.match(pushSource, /fatedrop_notification_outbox/);
  assert.match(pushSource, /ON CONFLICT \(dedupe_key\) DO NOTHING/);
  assert.match(pushSource, /fatedrop_notification_delivery_attempts/);
  assert.match(pushSource, /DeviceNotRegistered/);
  assert.match(pushSource, /quiet_hours_enabled/);
  assert.match(pushSource, /m\.tier IN \('plus','pro'\)/);
  assert.match(ingestSource, /dispatchCanonicalPushAlerts\(\{ measuredAt \}\)\.catch/);
});
