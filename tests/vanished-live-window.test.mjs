import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const canonicalAlerts = fs.readFileSync(path.join(process.cwd(), "lib/canonical-alerts.ts"), "utf8");
const signalPack = fs.readFileSync(path.join(process.cwd(), "components/canonical-alert-signal-pack.tsx"), "utf8");
const mobileAlerts = fs.readFileSync(path.join(process.cwd(), "app/api/mobile/alerts/route.ts"), "utf8");

test("Web accepts the additive canonical Vanished live-window contract during staged rollout", () => {
  assert.match(canonicalAlerts, /export type CanonicalLiveWindow/);
  assert.match(canonicalAlerts, /manifestedAt: string \| null/);
  assert.match(canonicalAlerts, /lastConfirmedLiveAt: string \| null/);
  assert.match(canonicalAlerts, /vanishedAt: string \| null/);
  assert.match(canonicalAlerts, /historyComplete: boolean/);
  assert.match(canonicalAlerts, /liveWindow\?: CanonicalLiveWindow \| null/);
  assert.match(canonicalAlerts, /isCanonicalLiveWindow\(value\.liveWindow\)/);
});

test("Vanished detail renders Cloud timestamps and refuses to invent incomplete history", () => {
  assert.match(signalPack, /OBSERVED LIVE WINDOW/);
  assert.match(signalPack, /MANIFESTED/);
  assert.match(signalPack, /LAST CONFIRMED LIVE/);
  assert.match(signalPack, /VANISHED/);
  assert.match(signalPack, /Start not recorded/);
  assert.match(signalPack, /Duration unavailable/);
  assert.match(signalPack, /FateDrop will not guess a missing start time or duration/);
  assert.match(signalPack, /liveWindow\.observedDurationSeconds/);
  assert.doesNotMatch(signalPack, /everAvailableAt|firstAvailableAt/);
});

test("mobile API remains a pass-through for canonical live-window truth", () => {
  assert.match(mobileAlerts, /type CanonicalAlertForMobile = CanonicalAlert &/);
  assert.match(mobileAlerts, /\.\.\.alert/);
  assert.doesNotMatch(mobileAlerts, /liveSinceAt|everAvailableAt|firstAvailableAt/);
});
