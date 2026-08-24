import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(root, "app/dashboard/true-price/page.tsx"), "utf8");
const compare = fs.readFileSync(path.join(root, "components/value-compare.tsx"), "utf8");
const catalogueClient = fs.readFileSync(path.join(root, "lib/signal-engine-client.ts"), "utf8");
const verdictClient = fs.readFileSync(path.join(root, "lib/fatefind-verdict-client.ts"), "utf8");

test("RRP percentage uses item price and stays separate from True Price delivery", () => {
  assert.match(page, /rrpDelta\(offer\.priceGbp, group\.rrpGbp\)/);
  assert.match(page, /ITEM PRICE VS VALUE BASELINE/);
  assert.match(page, /TRUE PRICE/);
  assert.match(page, /VS RRP \/ REF/);
});

test("two-item compare renders the canonical Cloud pair verdict and never recalculates a winner", () => {
  assert.match(compare, /\/api\/fatefind\/verdict/);
  assert.match(compare, /pairVerdict/);
  assert.match(compare, /position\.rrpPercent/);
  assert.match(compare, /position\.unitCost/);
  assert.match(compare, /FATEDROP HEAD-TO-HEAD VERDICT/);
  assert.doesNotMatch(compare, /const itemPrice = offer\.priceGbp/);
  assert.doesNotMatch(compare, /left\.rrpPercent !== null && right\.rrpPercent !== null/);
  assert.doesNotMatch(compare, /left\.unitCost !== null && right\.unitCost !== null/);
  assert.doesNotMatch(compare, /function bestOffer/);
  assert.doesNotMatch(compare, /function comparison/);
});

test("web clients preserve Cloud RRP provenance and canonical Fate Verdict authority", () => {
  assert.match(catalogueClient, /component_reference/);
  assert.match(catalogueClient, /pack_reference/);
  assert.match(catalogueClient, /rrpReferenceBasis/);
  assert.match(catalogueClient, /unitCount/);
  assert.match(catalogueClient, /unitRrpGbp/);
  assert.match(verdictClient, /\/api\/fatefind\/matches/);
  assert.match(verdictClient, /mode: "verdict"/);
  assert.match(verdictClient, /FATEDROP_CLOUD/);
});