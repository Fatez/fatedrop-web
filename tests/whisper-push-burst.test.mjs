import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../lib/canonical-push.ts', import.meta.url), 'utf8');

test('Manifested is the only lifecycle stage that is never burst-throttled', () => {
  assert.match(source, /type BurstControlledStage = "WHISPER" \| "ECHO" \| "VANISHED"/);
  assert.match(source, /if \(alert\.fateStage === "MANIFESTED"\) \{\s*queueRows\.push\(individualPushRow\(alert, recipient, now\)\)/s);
  assert.doesNotMatch(source, /BurstControlledStage = .*MANIFESTED/);
});

test('controlled stages wait for the minute bucket to close before deciding summary vs individual delivery', () => {
  assert.match(source, /BURST_WINDOW_SECONDS = 60/);
  assert.match(source, /BURST_GRACE_SECONDS = 5/);
  assert.match(source, /BURST_MIN_SIZE = 5/);
  assert.match(source, /burstBucketClosed\(bucket, measuredAt\)/);
  assert.match(source, /if \(!burstBucketClosed\(bucket, measuredAt\)\) continue/);
});

test('large Whisper Echo and Vanished bursts collapse to one truthful feed summary', () => {
  assert.match(source, /push:\$\{stage\.toLowerCase\(\)\}-burst:\$\{bucket\}:\$\{recipient\.endpoint_id\}/);
  assert.match(source, /event_id: `sig_summary_\$\{stage\.toLowerCase\(\)\}_\$\{bucket\}`/);
  assert.match(source, /summary: true/);
  assert.match(source, /summaryCount: ordered\.length/);
  assert.match(source, /summaryFirstAlertId: first\.id/);
  assert.match(source, /route: "alerts"/);
  assert.doesNotMatch(source, /alertId: first\.id/);
});

test('canonical feed truth and manual Local Radar delivery remain separate from burst control', () => {
  assert.match(source, /event_type: alert\.fateStage\.toLowerCase\(\)/);
  assert.match(source, /dedupe_key: `push:\$\{alert\.id\}:\$\{recipient\.endpoint_id\}`/);
  assert.match(source, /event\.route === "alerts" \? `operator_readiness_/);
  assert.match(source, /: `local_radar_\$\{event\.stage\.toLowerCase\(\)\}`/);
  assert.match(source, /dispatchLocalRadarOperatorPush/);
});
