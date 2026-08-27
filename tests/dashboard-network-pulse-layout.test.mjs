import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const pulse = fs.readFileSync(path.join(process.cwd(), "components/dashboard-network-pulse.tsx"), "utf8");

test("Network Pulse stays a compact dashboard card rather than becoming a full-width hero", () => {
  assert.doesNotMatch(pulse, /fd-reference-grid>\.fd-network-pulse-card/);
  assert.match(pulse, /grid-template-columns:minmax\(0,1\.15fr\) minmax\(190px,\.85fr\)/);
  assert.match(pulse, /min-height:250px/);
});

test("Network Pulse uses the supplied UK network artwork and canonical metrics", () => {
  assert.match(pulse, /\/assets\/dashboard\/network-pulse-map\.svg/);
  assert.match(pulse, /ACTIVE RETAILERS/);
  assert.match(pulse, /PRODUCTS TRACKED/);
  assert.match(pulse, /SIGNALS · 7D/);
  assert.match(pulse, /metric\(retailers\)/);
  assert.match(pulse, /metric\(products\)/);
  assert.match(pulse, /metric\(signals\)/);
  assert.match(pulse, /Artwork is illustrative; the displayed metrics come from FateDrop network data/);
});

test("Network Pulse never hard-codes displayed network counts", () => {
  assert.doesNotMatch(pulse, />\s*\d+\s*<\/b>/);
  assert.match(pulse, /NETWORK DATA LIVE/);
  assert.match(pulse, /NETWORK DATA UNAVAILABLE/);
});
