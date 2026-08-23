import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  niceSignalHealthScale,
  signalHealthChartCoordinates,
} from '../lib/signal-health-chart.ts';

const dashboardSource = await readFile(new URL('../lib/dashboard.ts', import.meta.url), 'utf8');
const trendSource = await readFile(new URL('../lib/signal-trends.ts', import.meta.url), 'utf8');
const pageSource = await readFile(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');

test('seven-day lifecycle headline totals come only from the persisted signal ledger', () => {
  assert.match(dashboardSource, /whisper: signalSummary\?\.whisper\.total \?\? null/);
  assert.match(dashboardSource, /echo: signalSummary\?\.echo\.total \?\? null/);
  assert.match(dashboardSource, /manifested: signalSummary\?\.manifested\.total \?\? null/);
  assert.match(dashboardSource, /vanished: signalSummary\?\.vanished\.total \?\? null/);
  assert.doesNotMatch(dashboardSource, /signalSummary\?\.whisper\.total \?\? network/);
  assert.doesNotMatch(dashboardSource, /signalSummary\?\.manifested\.total \?\? network/);
});

test('delivery ledger keeps sent, policy-disabled suppression and actual issues separate', () => {
  assert.match(trendSource, /if \(result === "sent"\) point\.sent \+= value/);
  assert.match(trendSource, /else if \(result === "skipped" && detail === "disabled"\) point\.policySkipped \+= value/);
  assert.match(trendSource, /else point\.issues \+= value/);
  assert.match(pageSource, /7D SENT/);
  assert.match(pageSource, /POLICY SUPPRESSED/);
  assert.match(pageSource, /DELIVERY ISSUES/);
  assert.doesNotMatch(pageSource, /alerts delivered/i);
});

test('dashboard chart uses a shared honest scale with a real zero baseline', () => {
  assert.equal(niceSignalHealthScale(0), 10);
  assert.equal(niceSignalHealthScale(1), 10);
  assert.equal(niceSignalHealthScale(4), 10);
  assert.equal(niceSignalHealthScale(18), 20);

  const points = [
    { measuredAt: 1, value: 0 },
    { measuredAt: 2, value: 1 },
    { measuredAt: 3, value: 4 },
  ];
  const coordinates = signalHealthChartCoordinates(points, 20);
  assert.equal(coordinates[0].y, 41);
  assert.ok(coordinates[1].y > 35, 'one sent alert must remain visually close to zero on a 20/day shared scale');
  assert.ok(coordinates[2].y > 30, 'four sent alerts must not be drawn at the chart ceiling');

  assert.match(pageSource, /Object\.values\(alertSeries\)\.flat\(\)/);
  assert.match(pageSource, /className="fd-zero-baseline"/);
  assert.doesNotMatch(pageSource, /Math\.max\(1, \.\.\.points\.map\(\(point\) => point\.value\)\)/);
});

test('dashboard is explicit when either operational ledger is unavailable', () => {
  assert.match(pageSource, /7D DETECTED/);
  assert.match(pageSource, /ALERTS SENT \/ UTC DAY/);
  assert.match(pageSource, /Signal ledger unavailable/);
  assert.match(pageSource, /Alert delivery ledger unavailable/);
  assert.match(pageSource, /No sent-alert line is inferred from detections/);
});
