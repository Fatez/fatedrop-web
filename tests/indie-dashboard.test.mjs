import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("Indie dashboard proves retailer value without claiming sales", () => {
  const page = read("app/dashboard/indie/page.tsx");
  assert.ok(page.includes("PRODUCT APPEARANCES"));
  assert.ok(page.includes("FATEFIND APPEARANCES"));
  assert.ok(page.includes("BEST VALUE WINS"));
  assert.ok(page.includes("RETAILER VISITS SENT"));
  assert.ok(page.includes("FATEMATCH HANDOFFS"));
  assert.ok(page.includes("COLLECTOR DEMAND"));
  assert.ok(page.includes("Traffic and intent, not invented sales."));
  assert.ok(page.includes("does not mean a purchase was completed"));
});

test("production retailer workspace access requires a verified FateDrop ID mapping", () => {
  const access = read("lib/retailer-access.ts");
  const migration = read("database/2026-08-25-indie-retailer-workspaces.sql");
  assert.ok(access.includes('process.env.NODE_ENV !== "production"'));
  assert.ok(access.includes("verified_at IS NOT NULL"));
  assert.ok(access.includes("user_id=${userId}"));
  assert.ok(migration.includes("CREATE TABLE IF NOT EXISTS fatedrop_retailer_access"));
  assert.ok(migration.includes("PRIMARY KEY (user_id, retailer_id)"));
});

test("retailer value aggregation never selects collector identity", () => {
  const insights = read("lib/retailer-insights.ts");
  assert.ok(insights.includes("SELECT event_type, title, occurred_at"));
  assert.equal(insights.includes("SELECT user_id, event_type"), false);
  assert.equal(insights.includes("email"), false);
  assert.ok(insights.includes("A retailer visit means FateDrop opened the retailer destination; it does not mean a purchase was completed."));
});

test("Search FateFind storefront and FateMatch events feed one retailer value ledger", () => {
  const observer = read("components/retailer-handoff-observer.tsx");
  const storage = read("lib/dashboard-storage.ts");
  for (const event of ["search_appearance", "fatefind_appearance", "fatefind_best_value", "storefront_view", "fatematch_handoff"]) {
    assert.ok(observer.includes(event));
    assert.ok(storage.includes(event));
  }
  assert.ok(observer.includes('window.location.pathname === "/dashboard/fatefind"'));
  assert.ok(observer.includes("Visible FateFind Value Compare winner"));
});

test("anonymous demand intelligence aggregates FateMatch intent without exposing people", () => {
  const demand = read("lib/retailer-demand.ts");
  assert.ok(demand.includes("COUNT(*)::int AS demand_count"));
  assert.ok(demand.includes("m.enabled=true"));
  assert.equal(demand.includes("m.user_id"), false);
  assert.equal(demand.includes("email"), false);
  assert.ok(demand.includes("retailerCurrentlyStocksIdentity"));
});
