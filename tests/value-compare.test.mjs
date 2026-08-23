import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(root, "app/dashboard/true-price/page.tsx"), "utf8");
const compare = fs.readFileSync(path.join(root, "components/value-compare.tsx"), "utf8");
const client = fs.readFileSync(path.join(root, "lib/signal-engine-client.ts"), "utf8");

test("True Price keeps RRP value visible even while delivery remains unknown", () => {
  assert.match(page, /comparisonPrice = offer\.deliveryKnown \? offer\.totalDeliveredGbp : offer\.priceGbp/);
  assert.match(page, /ITEM PRICE · DELIVERY PENDING/);
  assert.match(page, /VS RRP \/ REF/);
});

test("two-item compare chooses value by RRP position before unit cost", () => {
  assert.match(compare, /left\.rrpPercent !== null && right\.rrpPercent !== null/);
  assert.match(compare, /left\.unitCost !== null && right\.unitCost !== null/);
  assert.match(compare, /BEST VALUE FOUND/);
  assert.match(compare, /delivery cost is unknown, so the result is provisional/);
});

test("web client accepts official and component RRP provenance from Cloud", () => {
  assert.match(client, /component_reference/);
  assert.match(client, /pack_reference/);
  assert.match(client, /rrpReferenceBasis/);
  assert.match(client, /unitCount/);
  assert.match(client, /unitRrpGbp/);
});
