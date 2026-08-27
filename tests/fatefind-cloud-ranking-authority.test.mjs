import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync("app/dashboard/fatefind/page.tsx", "utf8");
const compare = fs.readFileSync("components/value-compare.tsx", "utf8");
const cloudClient = fs.readFileSync("lib/fatefind-verdict.ts", "utf8");
const proxy = fs.readFileSync("app/api/fatefind/verdict/route.ts", "utf8");

test("FateFind page consumes the canonical Cloud verdict instead of ranking True Price groups itself", () => {
  assert.match(page, /searchSignalFateVerdict\(q\)/);
  assert.match(page, /result\?\.verdict\.ranking/);
  assert.match(page, /result\?\.verdict\.winnerId/);
  assert.match(page, /winner\.rrpPercent/);
  assert.doesNotMatch(page, /searchSignalTruePrice/);
  assert.doesNotMatch(page, /rrpDelta\(/);
  assert.doesNotMatch(page, /deliveryKnown !== b\.deliveryKnown/);
});

test("FateFind makes the Cloud-selected value leader the first retailer row without recalculating a winner", () => {
  assert.match(page, /position\.offerId/);
  assert.match(page, /FATEFIND VALUE LEADER/);
  assert.match(page, /CLOUD-RANKED VALUE POSITION/);
  assert.match(page, /BEST VALUE · FATEDROP CLOUD/);
});

test("interactive value comparison asks Cloud for pairVerdict and has no browser RRP winner maths", () => {
  assert.match(compare, /fetch\("\/api\/fatefind\/verdict"/);
  assert.match(compare, /response\.source !== "FATEDROP_CLOUD"/);
  assert.match(compare, /pairVerdict\?\.winnerId/);
  assert.doesNotMatch(compare, /\(itemPrice - group\.rrpGbp\)/);
  assert.doesNotMatch(compare, /left\.rrpPercent <= right\.rrpPercent/);
  assert.doesNotMatch(compare, /function bestOffer/);
});

test("Web verdict transport calls the canonical live Cloud POST contract and fails closed", () => {
  assert.match(cloudClient, /\/api\/fatefind\/matches/);
  assert.match(cloudClient, /mode: "verdict"/);
  assert.match(cloudClient, /result\.source !== "FATEDROP_CLOUD"/);
  assert.match(proxy, /searchSignalFateVerdict\(query, \{ leftId, rightId \}\)/);
  assert.match(proxy, /FATEDROP_CLOUD_UNAVAILABLE/);
});
