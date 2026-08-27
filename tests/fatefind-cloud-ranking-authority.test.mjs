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

test("FateFind makes only the Cloud-declared winner a visual value leader", () => {
  assert.match(page, /position\.offerId/);
  assert.match(page, /isCloudValueWinner = result\.verdict\.winnerId === group\.id && isGroupSelectedOffer/);
  assert.match(page, /isCloudValueWinner \? "fd-tp-offer value-leader" : "fd-tp-offer"/);
  assert.match(page, /FATEFIND VALUE LEADER/);
  assert.match(page, /CLOUD-RANKED VALUE POSITION/);
});

test("unknown RRP group leaders remain visible without masquerading as best value", () => {
  assert.match(page, /VALUE UNVERIFIED · RRP UNKNOWN/);
  assert.match(page, /LOWEST KNOWN TRUE PRICE · VALUE UNVERIFIED/);
  assert.match(page, /BEST VERIFIED VALUE · FATEDROP CLOUD/);
  assert.match(page, /hasVerifiedValuePosition/);
});

test("interactive value comparison asks Cloud for pairVerdict and has no browser RRP winner maths", () => {
  assert.match(compare, /fetch\("\/api\/fatefind\/verdict"/);
  assert.match(compare, /response\.source !== "FATEDROP_CLOUD"/);
  assert.match(compare, /pairVerdict\?\.winnerId/);
  assert.doesNotMatch(compare, /\(itemPrice - group\.rrpGbp\)/);
  assert.doesNotMatch(compare, /left\.rrpPercent <= right\.rrpPercent/);
  assert.doesNotMatch(compare, /function bestOffer/);
});

test("Web verdict transport calls Cloud, fails closed, and preserves the shared Web/mobile gateway contract", () => {
  assert.match(cloudClient, /\/api\/fatefind\/matches/);
  assert.match(cloudClient, /mode: "verdict"/);
  assert.match(cloudClient, /result\.source !== "FATEDROP_CLOUD"/);
  assert.match(proxy, /assertSameOrigin\(request\)/);
  assert.match(proxy, /Boolean\(leftId\) !== Boolean\(rightId\)/);
  assert.match(proxy, /leftId && rightId \? \{ leftId, rightId \} : \{\}/);
  assert.match(proxy, /return NextResponse\.json\(result/);
  assert.match(proxy, /Cache-Control/);
  assert.match(proxy, /FATEDROP_CLOUD_UNAVAILABLE/);
});
