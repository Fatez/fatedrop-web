import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const trendSource = await readFile(new URL("../lib/canonical-alert-trends.ts", import.meta.url), "utf8");
const componentSource = await readFile(new URL("../components/alert-stage-trend.tsx", import.meta.url), "utf8");
const alertsSource = await readFile(new URL("../app/dashboard/alerts/page.tsx", import.meta.url), "utf8");

test("alert trends are signal-backed and preserve all four canonical states", () => {
  assert.match(trendSource, /FROM fatedrop_signals/);
  assert.match(trendSource, /state IN \('whisper','echo','manifested','vanished'\)/);
  assert.match(trendSource, /Array\.from\(\{ length: safeDays \}/);
  assert.match(trendSource, /count: 0/);
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
