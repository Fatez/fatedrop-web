import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(root, "app/dashboard/fatefind/page.tsx"), "utf8");
const compare = fs.readFileSync(path.join(root, "components/value-compare.tsx"), "utf8");
const client = fs.readFileSync(path.join(root, "lib/signal-engine-client.ts"), "utf8");

test("FateFind consumes the shared ranking and presents RRP value separately from True Price", () => {
  assert.match(page, /searchSignalFateFind/);
  assert.match(page, /RRP \/ REFERENCE/);
  assert.match(page, /TRUE PRICE/);
  assert.doesNotMatch(page, /rrpDelta\(/);
});

test("two-item compare chooses value by item-price RRP position before unit cost", () => {
  assert.match(compare, /const itemPrice = offer\.priceGbp/);
  assert.match(compare, /left\.rrpPercent !== null && right\.rrpPercent !== null/);
  assert.match(compare, /left\.unitCost !== null && right\.unitCost !== null/);
  assert.match(compare, /BEST VALUE FOUND/);
  assert.match(compare, /final delivered-cost comparison remains provisional/);
});

test("web client accepts official and component RRP provenance from Cloud", () => {
  assert.match(client, /component_reference/);
  assert.match(client, /pack_reference/);
  assert.match(client, /rrpReferenceBasis/);
  assert.match(client, /unitCount/);
  assert.match(client, /unitRrpGbp/);
});
