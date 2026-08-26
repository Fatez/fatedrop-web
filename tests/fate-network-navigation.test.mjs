import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const nav = fs.readFileSync("components/dashboard-nav.tsx", "utf8");
const hub = fs.readFileSync("app/dashboard/network/page.tsx", "utf8");

test("dashboard groups the locked collector products under Fate Network", () => {
  assert.ok(nav.includes("FATE NETWORK"));
  for (const label of ["FateFind", "FateMatch", "Fate Trader", "Local Radar", "Retailers"]) {
    assert.ok(nav.includes(label), `${label} should appear in Fate Network navigation`);
  }
  assert.ok(nav.includes('"/dashboard/network"'));
  assert.ok(nav.includes('"/dashboard/fatefind"'));
  assert.ok(nav.includes('"/dashboard/watchlist"'));
  assert.ok(nav.includes('"/dashboard/trader"'));
  assert.ok(nav.includes('"/dashboard/local-radar"'));
  assert.ok(nav.includes('"/dashboard/stores"'));
});

test("Search Alerts and Wishlist remain global utilities rather than Fate Network products", () => {
  const primaryBlock = nav.slice(nav.indexOf("const primary"), nav.indexOf("const fateNetwork"));
  for (const label of ["Dashboard", "Search", "Alerts", "Wishlist"]) assert.ok(primaryBlock.includes(label));
  for (const label of ["FateFind", "FateMatch", "Local Radar", "Retailers"]) assert.equal(primaryBlock.includes(label), false);
});

test("Events are not duplicated as a top-level dashboard product", () => {
  const primaryBlock = nav.slice(nav.indexOf("const primary"), nav.indexOf("const fateNetwork"));
  assert.equal(primaryBlock.includes('"Events"'), false);
});

test("Fate Network hub uses the final Retailers and simple Local Radar language", () => {
  assert.ok(hub.includes('title: "Retailers"'));
  assert.equal(hub.includes('title: "Stores"'), false);
  assert.ok(hub.includes("what stock may be arriving or is genuinely confirmed at an exact branch"));
  assert.ok(hub.includes("Search and Wishlist remain universal utilities"));
});
