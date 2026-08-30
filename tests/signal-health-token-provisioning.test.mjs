import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflow = await readFile(new URL('../.github/workflows/provision-signal-health-token.yml', import.meta.url), 'utf8');
const healthRoute = await readFile(new URL('../app/api/health/signal/route.ts', import.meta.url), 'utf8');

test('production provisioning fails closed when the shared private diagnostic token is absent', () => {
  assert.match(workflow, /FATEDROP_SIGNAL_API_TOKEN: \$\{\{ secrets\.FATEDROP_SIGNAL_API_TOKEN \}\}/);
  assert.match(workflow, /Missing FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(workflow, /wrangler secret put FATEDROP_SIGNAL_API_TOKEN/);
});

test('provisioning verifies the Cloud private boundary and the authenticated Web bridge', () => {
  assert.match(workflow, /CLOUD="https:\/\/fatedrop-cloud-production\.up\.railway\.app"/);
  assert.match(workflow, /cloud_public_status/);
  assert.match(workflow, /test "\$cloud_public_status" = "401"/);
  assert.match(workflow, /WEB="https:\/\/fatedrop\.co\.uk"/);
  assert.match(workflow, /\/api\/health\/signal/);
  assert.match(workflow, /result\.available !== true/);
});

test('Web Signal health route remains authenticated rather than weakening Cloud diagnostics', () => {
  assert.match(healthRoute, /process\.env\.FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(healthRoute, /Authorization: `Bearer \$\{signalToken\}`/);
  assert.match(healthRoute, /missing_web_token/);
  assert.match(healthRoute, /upstream_unauthorized/);
});
