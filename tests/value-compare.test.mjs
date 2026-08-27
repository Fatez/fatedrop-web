import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(root, "app/dashboard/fatefind/page.tsx"), "utf8");
const compare = fs.readFileSync(path.join(root, "components/value-compare.tsx"), "utf8");
const client = fs.readFileSync(path.join(root, "lib/signal-engine-client.ts"), "utf8");
const verdictClient = fs.readFileSync(path.join(root, "lib/fatefind-verdict.ts"), "utf8");

test("FateFind uses the canonical Cloud RRP verdict and presents True Price separately", () => {
  assert.match(page, /searchSignalFateVerdict/);
  assert.match(page, /winner\.rrpPercent/);
  assert.match(page, /VS RRP \/ REF/);
  assert.match(page, /TRUE PRICE/);
  assert.doesNotMatch(page, /rrpDelta\(/);
  assert.match(verdictClient, /mode: "verdict"/);
});

test("two-item compare displays Cloud's value position without calculating a browser winner", () => {
  assert.match(compare, /fetch\("\/api\/fatefind\/verdict"/);
  assert.match(compare, /pairVerdict\?\.winnerId/);
  assert.match(compare, /position\.rrpPercent/);
  assert.match(compare, /position\.unitCost/);
  assert.match(compare, /BEST VALUE FOUND/);
  assert.match(compare, /delivery cost is unknown/);
  assert.doesNotMatch(compare, /const itemPrice = offer\.priceGbp/);
  assert.doesNotMatch(compare, /left\.rrpPercent !== null && right\.rrpPercent !== null/);
});

test("web client accepts official and component RRP provenance from Cloud", () => {
  assert.match(client, /component_reference/);
  assert.match(client, /pack_reference/);
  assert.match(client, /rrpReferenceBasis/);
  assert.match(client, /unitCount/);
  assert.match(client, /unitRrpGbp/);
});
