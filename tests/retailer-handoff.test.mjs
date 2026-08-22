import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("dashboard instruments the collector to indie retailer handoff without rewriting stable offer pages", () => {
  const layout = read("app/dashboard/layout.tsx");
  const observer = read("components/retailer-handoff-observer.tsx");

  assert.ok(layout.includes("RetailerHandoffObserver"));
  assert.ok(observer.includes('pathname === "/dashboard/search"'));
  assert.ok(observer.includes('pathname === "/dashboard/true-price"'));
  assert.ok(observer.includes('pathname === "/dashboard/stores"'));
  assert.ok(observer.includes('destination.protocol !== "https:"'));
  assert.ok(observer.includes('type: "store_tracked"'));
  assert.ok(observer.includes('subtitle: `Retailer handoff · ${context}`'));
  assert.ok(observer.includes('keepalive: true'));
  assert.ok(observer.includes('credentials: "same-origin"'));
});

test("retailer handoff evidence remains a referral signal rather than a purchase claim", () => {
  const observer = read("components/retailer-handoff-observer.tsx").toLowerCase();
  const storage = read("lib/dashboard-storage.ts");
  const dashboard = read("lib/dashboard.ts");

  assert.ok(storage.includes('"store_tracked"'));
  assert.ok(dashboard.includes('item.type === "store_tracked"'));
  assert.ok(dashboard.includes("favoriteStores"));
  assert.ok(!observer.includes("purchased"));
  assert.ok(!observer.includes("purchase confirmed"));
  assert.ok(!observer.includes("checkout completed"));
});
