import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../lib/canonical-push.ts', import.meta.url), 'utf8');

test('large Whisper bursts collapse to one truthful push summary per recipient and minute', () => {
  assert.match(source, /WHISPER_BURST_WINDOW_SECONDS = 60/);
  assert.match(source, /WHISPER_BURST_MIN_SIZE = 5/);
  assert.match(source, /push:whisper-burst:\$\{bucket\}:\$\{recipient\.endpoint_id\}/);
  assert.match(source, /event_id: `sig_burst_\$\{bucket\}`/);
  assert.match(source, /title: "Whisper burst detected"/);
  assert.match(source, /summary: true/);
  assert.match(source, /summaryCount: ordered\.length/);
  assert.match(source, /route: "alerts"/);
});

test('non-burst lifecycle alerts remain individual and Local Radar stays separate', () => {
  assert.match(source, /event_type: alert\.fateStage\.toLowerCase\(\)/);
  assert.match(source, /dedupe_key: `push:\$\{alert\.id\}:\$\{recipient\.endpoint_id\}`/);
  assert.match(source, /event_type: `local_radar_\$\{event\.stage\.toLowerCase\(\)\}`/);
  assert.match(source, /dispatchLocalRadarOperatorPush/);
});
