import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const pulse = fs.readFileSync(path.join(process.cwd(), "components/dashboard-network-pulse.tsx"), "utf8");

test("Network Pulse is promoted to a full-width first dashboard-grid card", () => {
  assert.match(pulse, /\.fd-reference-grid>\.fd-network-pulse-card\{grid-column:1\/-1;order:-1/);
});

test("Network Pulse presents a UK network visual without inventing metric values", () => {
  assert.match(pulse, /Schematic United Kingdom FateDrop network footprint/);
  assert.match(pulse, /ACTIVE RETAILERS/);
  assert.match(pulse, /PRODUCTS TRACKED/);
  assert.match(pulse, /SIGNALS · 7D/);
  assert.match(pulse, /metric\(retailers\)/);
  assert.match(pulse, /metric\(products\)/);
  assert.match(pulse, /metric\(signals\)/);
  assert.match(pulse, /node density follows the active-retailer count, not exact branch locations/);
});

test("Network Pulse visual density derives from canonical retailer count rather than a hard-coded displayed count", () => {
  assert.match(pulse, /visibleNodeCount = retailers/);
  assert.match(pulse, /Math\.min\(networkNodes\.length/);
  assert.doesNotMatch(pulse, />\s*\d+\s*<\/b><small>Retailers/);
});
