import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("Web FateFind consumes the shared Cloud ranking and does not save monitoring rules", () => {
  const page = read("app/dashboard/fatefind/page.tsx");
  const client = read("lib/signal-engine-client.ts");
  assert.ok(page.includes("searchSignalFateFind"));
  assert.ok(page.includes("Best value now"));
  assert.ok(page.includes("BEST VALUE NOW"));
  assert.ok(client.includes('"/api/fatefind"'));
  assert.equal(page.includes('fetch("/api/fate-matches"'), false);
});

test("Web FateMatch owns stock watches, conditions and companion assignment", () => {
  const page = read("app/dashboard/watchlist/page.tsx");
  const builder = read("components/fate-match-builder.tsx");
  const route = read("app/api/fate-matches/route.ts");
  assert.ok(page.includes('title="FateMatch"'));
  assert.ok(page.includes("let me know when this is in stock"));
  assert.ok(builder.includes("START FATEMATCH WATCH"));
  assert.ok(builder.includes("companionId"));
  assert.ok(builder.includes('fetch("/api/fate-matches"'));
  assert.ok(route.includes("fateMatchHunts, fateFinds: fateMatchHunts"));
});

test("Search exposes best-value-now and watch-for-me as separate actions", () => {
  const search = read("app/dashboard/search/page.tsx");
  assert.ok(search.includes("/dashboard/fatefind?q="));
  assert.ok(search.includes("FATEFIND · BEST VALUE NOW"));
  assert.ok(search.includes("/dashboard/watchlist?q="));
  assert.ok(search.includes("FATEMATCH · WATCH MY CONDITIONS"));
});

test("FateMatch RRP percentage remains item price vs RRP, not delivered True Price vs RRP", () => {
  const actions = read("components/fatefind-actions.tsx");
  assert.ok(actions.includes("hit.itemPricePence === null"));
  assert.ok(actions.includes("(hit.itemPricePence - hit.officialRrpPence)"));
  assert.equal(actions.includes("(hit.truePricePence - hit.officialRrpPence)"), false);
});

test("repository product truth locks one shared meaning across App and Web", () => {
  const truth = read("docs/fatedrop-product-truth.md");
  assert.ok(truth.includes("FateFind = best value available now; FateMatch = watch it and alert me when it qualifies."));
  assert.ok(truth.includes("one canonical result contract consumed by both App and Web"));
  assert.ok(truth.includes("FATEMATCH — LIVE NOW"));
});
