import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const dashboardSource = await readFile(new URL('../lib/dashboard.ts', import.meta.url), 'utf8');
const trendSource = await readFile(new URL('../lib/signal-trends.ts', import.meta.url), 'utf8');
const liveSource = await readFile(new URL('../lib/live-signals.ts', import.meta.url), 'utf8');
const chartSource = await readFile(new URL('../lib/signal-health-chart.ts', import.meta.url), 'utf8');
const pageSource = await readFile(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');

test('seven-day lifecycle headline totals come only from canonical live signal truth', () => {
  assert.match(dashboardSource, /whisper: signalSummary\?\.whisper\.total \?\? null/);
  assert.match(dashboardSource, /echo: signalSummary\?\.echo\.total \?\? null/);
  assert.match(dashboardSource, /manifested: signalSummary\?\.manifested\.total \?\? null/);
  assert.match(dashboardSource, /vanished: signalSummary\?\.vanished\.total \?\? null/);
  assert.doesNotMatch(dashboardSource, /signalSummary\?\.whisper\.total \?\? network/);
  assert.doesNotMatch(dashboardSource, /signalSummary\?\.manifested\.total \?\? network/);
});

test('dashboard uses the live Cloud aggregate without local Neon credentials or private diagnostic auth', () => {
  assert.match(liveSource, /DEFAULT_SIGNAL_ENGINE_URL = "https:\/\/fatedrop-cloud-production\.up\.railway\.app"/);
  assert.match(liveSource, /"\/api\/signal-summary"/);
  assert.match(liveSource, /cache: "no-store"/);
  assert.doesNotMatch(liveSource, /DATABASE_URL|FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(trendSource, /getLiveCloudSignalSummary\(safeDays\)/);
  assert.match(trendSource, /source\.available !== true/);
});

test('delivery ledger keeps sent, policy-disabled suppression and actual issues separate', () => {
  assert.match(trendSource, /const sent = finite\(rawDelivery\.sent\)/);
  assert.match(trendSource, /const policySkipped = finite\(rawDelivery\.policySkipped\)/);
  assert.match(trendSource, /const issues = finite\(rawDelivery\.issues\)/);
  assert.match(trendSource, /delivery\[state\] = \{ sent: sent!, policySkipped: policySkipped!, issues: issues!/);
  assert.match(pageSource, /7D SENT/);
  assert.match(pageSource, /POLICY SUPPRESSED/);
  assert.match(pageSource, /DELIVERY ISSUES/);
  assert.doesNotMatch(pageSource, /alerts delivered/i);
});

test('dashboard chart uses a shared honest scale with a real zero baseline', () => {
  assert.match(chartSource, /export function niceSignalHealthScale/);
  assert.match(chartSource, /const requested = Math\.max\(minimum/);
  assert.match(chartSource, /if \(requested <= 10\) return 10/);
  assert.match(chartSource, /const baselineY = height - bottomPadding/);
  assert.match(chartSource, /scaledY = baselineY - \(Math\.max\(0, point\.value\) \/ safeScaleMax\) \* drawableHeight/);
  assert.match(chartSource, /y: Math\.min\(baselineY, Math\.max\(topPadding, scaledY\)\)/);

  assert.match(pageSource, /Object\.values\(alertSeries\)\.flat\(\)/);
  assert.match(pageSource, /niceSignalHealthScale\(Math\.max\(0,/);
  assert.match(pageSource, /className="fd-zero-baseline"/);
  assert.doesNotMatch(pageSource, /Math\.max\(1, \.\.\.points\.map\(\(point\) => point\.value\)\)/);
});

test('dashboard is explicit only when live operational signal paths are unavailable', () => {
  assert.match(pageSource, /7D DETECTED/);
  assert.match(pageSource, /ALERTS SENT \/ UTC DAY/);
  assert.match(pageSource, /Signal ledger unavailable/);
  assert.match(pageSource, /Alert delivery ledger unavailable/);
  assert.match(pageSource, /No sent-alert line is inferred from detections/);
});
