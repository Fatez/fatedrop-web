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
  assert.match(routeSource, /const windowAlerts = eligibleAlerts\.slice\(0, limit\)/);
  assert.match(routeSource, /windowAlerts\.map\(freeAlert\)/);
});

test('push delivery is feature-gated, deduplicated and honors all four lifecycle preferences', () => {
  assert.match(pushSource, /FATEDROP_PUSH_DISPATCH_ENABLED === "true"/);
  assert.match(pushSource, /whisper_enabled/);
  assert.match(pushSource, /alert\.fateStage === "WHISPER"/);
  assert.match(pushSource, /alert\.fateStage === "ECHO"/);
  assert.match(pushSource, /alert\.fateStage === "MANIFESTED"/);
  assert.match(pushSource, /alert\.fateStage === "VANISHED"/);