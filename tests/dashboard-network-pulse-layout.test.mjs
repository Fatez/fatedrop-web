import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const pulse = fs.readFileSync(path.join(process.cwd(), "components/dashboard-network-pulse.tsx"), "utf8");
const freshness = fs.readFileSync(path.join(process.cwd(), "lib/network-snapshot-freshness.ts"), "utf8");

test("Network Pulse keeps its original compact dashboard-card shape", () => {
  assert.match(pulse, /min-height:258px/);
  assert.match(pulse, /grid-template-columns:minmax\(0,1fr\) 128px/);
  assert.doesNotMatch(pulse, /fd-reference-grid>\.fd-network-pulse-card/);
});

test("Network Pulse swaps only the decorative visual for the supplied UK network artwork", () => {
  assert.match(pulse, /\/assets\/dashboard\/network-pulse-map\.svg/);
  assert.match(pulse, /<Image /);
  assert.match(pulse, /The live heartbeat of FateDrop\./);
  assert.match(pulse, /map is illustrative; stale or unavailable snapshot metrics stay unknown/i);
});

test("Network Pulse displays only canonical metric inputs", () => {
  assert.match(pulse, /metric\(visibleRetailers\)/);
  assert.match(pulse, /metric\(visibleProducts\)/);
  assert.match(pulse, /metric\(signals\)/);
  assert.match(pulse, /Retailers<br\/>active/);
  assert.match(pulse, /Products<br\/>tracked/);
  assert.match(pulse, /Signals<br\/>7D/);
  assert.doesNotMatch(pulse, />\s*\d+\s*<\/b>/);
});

test("Network Pulse fails closed after the Cloud snapshot exceeds 15 minutes without using an impure render clock", () => {
  assert.match(freshness, /NETWORK_SNAPSHOT_FRESH_SECONDS = 15 \* 60/);
  assert.match(freshness, /getLatestNetworkMetricSnapshot\(\)/);
  assert.match(freshness, /ageSeconds <= Math\.max\(60, staleAfterSeconds\)/);
  assert.match(pulse, /getLatestFreshNetworkMetricSnapshot\(\)/);
  assert.match(pulse, /visibleRetailers = latestSnapshot \? retailers : null/);
  assert.match(pulse, /visibleProducts = latestSnapshot \? products : null/);
  assert.doesNotMatch(pulse, /Date\.now\(\)/);
  assert.match(pulse, /metric\(signals\)/);
});
