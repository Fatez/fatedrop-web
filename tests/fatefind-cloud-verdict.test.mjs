import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const page = read("app/dashboard/true-price/page.tsx");
const compare = read("components/value-compare.tsx");
const client = read("lib/fatefind-verdict-client.ts");
const proxy = read("app/api/fatefind/verdict/route.ts");

test("Web FateFind gets the overall verdict from FateDrop Cloud", () => {
  assert.match(page, /requestFateVerdict\(q\)/);
  assert.match(page, /verdict=\{result\.verdict\}/);
  assert.doesNotMatch(page, /searchSignalTruePrice\(q\)/);
  assert.match(client, /\/api\/fatefind\/matches/);
  assert.match(client, /mode: "verdict"/);
  assert.match(client, /FATEDROP_CLOUD/);
});

test("interactive Web comparison renders Cloud pair verdicts instead of recalculating a winner", () => {
  assert.match(compare, /\/api\/fatefind\/verdict/);
  assert.match(compare, /pairVerdict/);
  assert.doesNotMatch(compare, /function bestOffer/);
  assert.doesNotMatch(compare, /function comparison/);
  assert.doesNotMatch(compare, /rrpPercent:\s*\(\(/);
  assert.match(proxy, /requestFateVerdict/);
});
