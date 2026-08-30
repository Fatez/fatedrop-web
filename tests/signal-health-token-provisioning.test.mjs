import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const healthRoute = await readFile(new URL('../app/api/health/signal/route.ts', import.meta.url), 'utf8');

test('Web Signal health prefers the dedicated token when explicitly configured', () => {
  assert.match(healthRoute, /process\.env\.FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(healthRoute, /if \(dedicated\) return dedicated/);
});

test('Web Signal health derives the same scoped HMAC credential as Cloud when the dedicated token is absent', () => {
  assert.match(healthRoute, /createHmac\("sha256", shared\)/);
  assert.match(healthRoute, /fatedrop:private-diagnostics:v1/);
  assert.match(healthRoute, /process\.env\.FATEDROP_METRICS_INGEST_SECRET/);
  assert.match(healthRoute, /\.digest\("hex"\)/);
});

test('Web Signal health remains fail-closed without either credential', () => {
  assert.match(healthRoute, /if \(!shared\) return ""/);
  assert.match(healthRoute, /if \(!signalToken\) return unavailable\("missing_web_token"\)/);
  assert.match(healthRoute, /upstream_unauthorized/);
});

test('Web never sends the raw metrics secret to Cloud', () => {
  assert.match(healthRoute, /Authorization: `Bearer \$\{signalToken\}`/);
  assert.doesNotMatch(healthRoute, /Authorization: `Bearer \$\{shared\}`/);
});
