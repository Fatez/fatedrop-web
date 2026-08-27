import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const trendSource = await readFile(new URL("../lib/canonical-alert-trends.ts", import.meta.url), "utf8");
const componentSource = await readFile(new URL("../components/alert-stage-trend.tsx", import.meta.url), "utf8");
const alertsSource = await readFile(new URL("../app/dashboard/alerts/page.tsx", import.meta.url), "utf8");

test("alert trends consume Cloud signal truth and preserve all four canonical states", () => {
  assert.match(trendSource, /getLiveCloudSignalSummary/);
  assert.match(trendSource, /"whisper", "echo", "manifested", "vanished"/);
  assert.match(trendSource, /response\.available !== true/);
  assert.match(trendSource, /response\.source !== "FATEDROP_CLOUD"/);
  assert.doesNotMatch(trendSource, /FROM fatedrop_signals/);
  assert.doesNotMatch(trendSource, /fateDropPostgres/);
  assert.doesNotMatch(trendSource, /fatedrop_signal_delivery_attempts/);
});

test("dashboard renders one real activity trend for each companion lifecycle", () => {
  assert.match(alertsSource, /getCanonicalSignalTrend\(7\)/);
  assert.match(alertsSource, /ORU/);
  assert.match(alertsSource, /FENN/);
  assert.match(alertsSource, /KORU/);
  assert.match(alertsSource, /NYXEN/);
  assert.match(alertsSource, /AlertStageTrend/);
  assert.match(componentSource, /CANONICAL SIGNAL ACTIVITY/);
  assert.match(componentSource, /7 DAY SIGNALS/);
});

test("web lifecycle graphs remain artwork-free", () => {
  assert.doesNotMatch(componentSource, /<img/);
  assert.doesNotMatch(componentSource, /artPath/);
  assert.doesNotMatch(alertsSource, /oru-alert/);
  assert.doesNotMatch(alertsSource, /fenn-alert/);
  assert.doesNotMatch(alertsSource, /nyxen-alert/);
});
