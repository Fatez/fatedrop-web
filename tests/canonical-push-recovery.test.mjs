import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const push = await readFile(new URL('../lib/canonical-push.ts', import.meta.url), 'utf8');
const alerts = await readFile(new URL('../lib/canonical-alerts.ts', import.meta.url), 'utf8');
const live = await readFile(new URL('../lib/live-signals.ts', import.meta.url), 'utf8');
const migrations = await readFile(new URL('../lib/production-migrations.ts', import.meta.url), 'utf8');

test('missed lifecycle alarms recover for six hours through stable cursor pagination', () => {
  assert.match(push, /CANONICAL_PUSH_RECOVERY_LOOKBACK_SECONDS = 6 \* 60 \* 60/);
  assert.match(push, /listCanonicalAlertRecoveryWindow\(\{since\}\)/);
  assert.match(alerts, /maxPagesPerStage=50/);
  assert.match(alerts, /before=lastEpoch;beforeId=last\.id/);
  assert.match(alerts, /recovery window exceeded the safe page budget/);
  assert.match(live, /params\.set\("beforeId",beforeId\)/);
  assert.match(push, /ON CONFLICT \(dedupe_key\) DO NOTHING/);
});

test('recovered Manifested alarms require a canonical episode and freshly verified live offer', () => {
  assert.match(push, /manifestedEpisodeStillActionable/);
  assert.match(push, /availabilityState === "available"/);
  assert.match(push, /stockEpisode\.vanishedAt === null/);
  assert.match(push, /liveWindow\?\.historyComplete === true/);
  assert.match(push, /liveWindow\.lastConfirmedLiveAt !== null/);
  assert.match(push, /if \(!manifestedEpisodeStillActionable\(alert\)\) continue/);
});

test('successful scans checkpoint with overlap while failed scans retain the full fallback window', () => {
  assert.match(push, /CANONICAL_PUSH_RECOVERY_OVERLAP_SECONDS = 5 \* 60/);
  assert.match(push, /fatedrop_push_recovery_checkpoint/);
  assert.match(push, /checkpoint - CANONICAL_PUSH_RECOVERY_OVERLAP_SECONDS/);
  assert.match(push, /recordRecoveryCheckpoint\(measuredAt\)/);
  assert.match(migrations, /2026-08-31-push-recovery-checkpoint\.sql/);
});

test('canonical Manifested alarms receive urgent iOS delivery without upgrading reminders', () => {
  assert.match(push, /urgentAvailability = stage === "MANIFESTED" && !manifestedReminder/);
  assert.match(push, /priority: urgentAvailability \? "high" : "default"/);
  assert.match(push, /interruptionLevel: "time-sensitive"/);
  assert.match(push, /ttl: urgentAvailability \? CANONICAL_PUSH_RECOVERY_LOOKBACK_SECONDS/);
  assert.match(push, /stockEpisodeId: alert\.stockEpisode\?\.id \?\? null/);
  assert.match(push, /const collapseKind = manifestedReminder \? "manifested-reminder" : stage\.toLowerCase\(\)/);
  assert.match(push, /collapseId: episodeCollapseId/);
});

test('provider collapse cannot replace a Manifested alarm with a reminder or Vanished transition', () => {
  assert.match(push, /`fatedrop-episode-\$\{stablePushHash\(stockEpisodeId\)\}-\$\{collapseKind\}`/);
  assert.match(push, /manifested-reminder/);
  assert.match(push, /stage\.toLowerCase\(\)/);
});

test('Manifested and FateMatch alarms cannot sit behind non-urgent push backlog', () => {
  assert.match(push, /WHEN event_type IN \('manifested','fate_match'\) THEN 0/);
  assert.match(push, /WHEN event_type='vanished' THEN 1/);
  assert.match(push, /created_at ASC,/);
  assert.match(push, /id ASC/);
});

test('burst summaries are separated by TCG and cannot contaminate another game', () => {
  assert.match(push, /`\$\{alert\.fateStage\}:\$\{alert\.tcgCode\}:\$\{bucket\}`/);
  assert.match(push, /tcgCode: first\.tcgCode/);
});
