import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const canonicalAlerts = fs.readFileSync(path.join(root, 'lib/canonical-alerts.ts'), 'utf8');
const alertsPage = fs.readFileSync(path.join(root, 'app/dashboard/alerts/page.tsx'), 'utf8');

test('unscoped Web lifecycle reads compose independent canonical stage windows', () => {
  assert.match(canonicalAlerts, /canonicalLifecycleStates:[^=]+= \["whisper", "echo", "manifested", "vanished"\]/s);
  assert.match(canonicalAlerts, /Promise\.all\([\s\S]*canonicalLifecycleStates\.map\([\s\S]*readCanonicalAlertWindow\(\{ state: lifecycleState, limit: safeLimit \}\)/);
  assert.match(canonicalAlerts, /if \(id \|\| state\) return readCanonicalAlertWindow/);
  assert.match(canonicalAlerts, /return sortNewestFirst\(\[\.\.\.byId\.values\(\)\]\)/);
});

test('Alerts dashboard relies on the shared canonical alert reader rather than a raw signal feed', () => {
  assert.match(alertsPage, /listCanonicalAlerts\(\{ limit: 100 \}\)/);
  assert.doesNotMatch(alertsPage, /getLiveCloudSignals|getCanonicalRecentSignals|\/api\/signals/);
});
