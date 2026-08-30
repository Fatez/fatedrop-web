import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const healthRoute = await readFile(new URL('../app/api/health/signal/route.ts', import.meta.url), 'utf8');

test('Web Signal health consumes the canonical redacted public Cloud summary', () => {
  assert.match(healthRoute, /"\/api\/signal-summary"/);
  assert.match(healthRoute, /fetchSignalSummary/);
  assert.match(healthRoute, /cache: "no-store"/);
  assert.match(healthRoute, /headers: \{ Accept: "application\/json" \}/);
});

test('Web Signal health no longer depends on cross-platform diagnostic secrets', () => {
  assert.doesNotMatch(healthRoute, /FATEDROP_SIGNAL_API_TOKEN/);
  assert.doesNotMatch(healthRoute, /FATEDROP_METRICS_INGEST_SECRET/);
  assert.doesNotMatch(healthRoute, /createHmac/);
  assert.doesNotMatch(healthRoute, /Authorization:/);
  assert.doesNotMatch(healthRoute, /Bearer/);
});

test('Web Signal health still fails closed on unavailable or malformed upstream health', () => {
  assert.match(healthRoute, /if \(!response\.ok\) return unavailable\("upstream_error"\)/);
  assert.match(healthRoute, /return unavailable\("upstream_invalid_response"\)/);
  assert.match(healthRoute, /payload\.available !== true/);
  assert.match(healthRoute, /return unavailable\("upstream_unavailable"\)/);
});

test('Web accepts the ISO generatedAt emitted by the public Cloud contract', () => {
  assert.match(healthRoute, /Date\.parse\(value\)/);
  assert.match(healthRoute, /Math\.floor\(parsed \/ 1000\)/);
});
