import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const search = fs.readFileSync("app/dashboard/search/page.tsx", "utf8");

test("Search keeps RRP percentage item-price based and separate from True Price", () => {
  assert.match(search, /const difference = offer\.price - offer\.rrpGbp/);
  assert.doesNotMatch(search, /const difference = delivered - offer\.rrpGbp/);
  assert.match(search, /TRUE PRICE/);
  assert.match(search, /REFERENCE RRP/);
});

test("Search surfaces safe component-reference and unit evidence from Cloud", () => {
  assert.match(search, /offer\.rrpKind === "component_reference"/);
  assert.match(search, /offer\.rrpReferenceBasis/);
  assert.match(search, /offer\.unitCount/);
  assert.match(search, /item\/\$\{unit\}/);
});
