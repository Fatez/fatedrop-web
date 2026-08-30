import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const healthRoute = await readFile(new URL('../app/api/health/signal/route.ts', import.meta.url), 'utf8');

test('Web Signal health keeps both dedicated and scoped derived credentials when configured', () => {
  assert.match(healthRoute, /process\.env\.FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(healthRoute, /process\.env\.FATEDROP_METRICS_INGEST_SECRET/);
  assert.match(healthRoute, /return \[\.\.\.new Set\(\[dedicated, derived\]\.filter\(Boolean\)\)\]/);
});

test('Web Signal health derives the same scoped HMAC credential as Cloud', () => {
  assert.match(healthRoute, /createHmac\("sha256", shared\)/);
  assert.match(healthRoute, /fatedrop:private-diagnostics:v1/);
  assert.match(healthRoute, /\.digest\("hex"\)/);
});

test('Web retries the scoped credential only when an earlier credential is unauthorized', () => {
  assert.match(healthRoute, /candidateResponse\.status === 401 \|\| candidateResponse\.status === 403/);
  assert.match(healthRoute, /if \(index < signalTokens\.length - 1\) continue/);
  assert.match(healthRoute, /if \(!response\.ok\) return unavailable\("upstream_error"\)/);
});

test('Web Signal health remains fail-closed without any credential', () => {
  assert.match(healthRoute, /if \(signalTokens\.length === 0\) return unavailable\("missing_web_token"\)/);
  assert.match(healthRoute, /upstream_unauthorized/);
});

test('Web never sends the raw metrics secret to Cloud', () => {
  assert.match(healthRoute, /Authorization: `Bearer \$\{signalToken\}`/);
  assert.doesNotMatch(healthRoute, /Authorization: `Bearer \$\{shared\}`/);
});
