import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("saved FateFinds can read their latest real qualifying offer without crossing user ownership", () => {
  const storage = read("lib/fate-match-storage.ts");
  const route = read("app/api/fate-matches/[id]/route.ts");

  assert.ok(storage.includes("FROM fatedrop_fate_match_hits h"));
  assert.ok(storage.includes("JOIN fatedrop_fate_matches m ON m.id = h.match_id"));
  assert.ok(storage.includes("LEFT JOIN fatedrop_offers o ON o.id = h.offer_id"));
  assert.ok(storage.includes("LEFT JOIN fatedrop_retailers r ON r.id = o.retailer_id"));
  assert.ok(storage.includes("WHERE m.user_id = ${userId} AND h.match_id = ${matchId}"));
  assert.ok(storage.includes("ORDER BY h.occurred_at DESC"));
  assert.ok(storage.includes("safeExternalHttpsUrl(row.offer_url)"));
  assert.ok(storage.includes("calculateTruePrice({"), "FateMatch result price must use the canonical True Price calculation");

  assert.ok(route.includes("getCurrentSnapshot()"));
  assert.ok(route.includes("getLatestUserFateMatchHit(snapshot.account.id, id)"));
  assert.ok(route.includes('"Cache-Control": "private, no-store"'));
});

test("FateFind controls surface a real FateMatch only when hit evidence exists", () => {
  const actions = read("components/fatefind-actions.tsx");
  const observer = read("components/retailer-handoff-observer.tsx");

  assert.ok(actions.includes("/api/fate-matches/${encodeURIComponent(id)}"));
  assert.ok(actions.includes("latestHit ? <div className=\"fd-fatefind-hit\">"));
  assert.ok(actions.includes("FATEMATCH · {latestHit.retailerName}"));
  assert.ok(actions.includes("VIEW MATCH ↗"));
  assert.ok(actions.includes("TRUE PRICE →"));
  assert.ok(actions.includes("data-fd-retailer={latestHit.retailerName}"));
  assert.ok(actions.includes("data-fd-product-title={latestHit.productTitle}"));
  assert.ok(observer.includes('pathname === "/dashboard/watchlist"'));
  assert.ok(observer.includes("anchor.dataset.fdRetailer"));
});

test("FateMatch UI never converts unknown delivery into a fake delivered total", () => {
  const actions = read("components/fatefind-actions.tsx");
  const storage = read("lib/fate-match-storage.ts");

  assert.ok(actions.includes("item · delivery unknown"));
  assert.ok(actions.includes("truePricePence: number | null"));
  assert.ok(storage.includes("truePricePence: price?.deliveredTruePricePence ?? null"));
  assert.ok(!actions.includes("deliveryKnown ? 0"));
});
