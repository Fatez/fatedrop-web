import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("app/dashboard/local-radar/page.tsx", "utf8");
const search = fs.readFileSync("components/local-radar-search.tsx", "utf8");
const map = fs.readFileSync("components/local-radar-map.tsx", "utf8");
const api = fs.readFileSync("app/api/local-radar/route.ts", "utf8");
const config = fs.readFileSync("next.config.ts", "utf8");

test("Local Radar Web renders a real geographic map from the shared Cloud coordinates", () => {
  assert.ok(search.includes("LocalRadarMap"));
  assert.ok(search.includes("latitude"));
  assert.ok(search.includes("longitude"));
  assert.ok(map.includes("tile.openstreetmap.org/{z}/{x}/{y}.png"));
  assert.ok(map.includes("© OpenStreetMap contributors"));
  assert.ok(map.includes("project(coordinate"));
  assert.ok(map.includes("fd-map-marker"));
  assert.ok(map.includes("chooseZoom"));
  assert.equal(map.includes("fake"), false);
  assert.equal(map.includes("sample store"), false);
});

test("Local Radar map stays compatible with the production CSP", () => {
  assert.ok(config.includes("script-src 'self' 'unsafe-inline'"));
  assert.ok(config.includes("img-src 'self' data: blob: https:"));
  assert.equal(map.includes("unpkg.com"), false, "map must not depend on an external executable script CDN");
  assert.equal(map.toLowerCase().includes("leaflet"), false, "map should not require Leaflet runtime assets outside the production CSP");
  assert.ok(map.includes("NEXT_PUBLIC_LOCAL_RADAR_TILE_URL"), "tile provider must remain replaceable without rewriting map logic");
});

test("Web and App stay behind the same canonical Local Radar Cloud route", () => {
  assert.ok(search.includes('fetch("/api/local-radar?"'));
  assert.ok(api.includes('new URL("/api/local-radar"'));
  assert.ok(api.includes("return Response.json(payload"));
  assert.ok(search.includes("canonical Cloud branch coordinates"));
});

test("Local Radar renders the simple STORE EXPECTED CONFIRMED UNKNOWN consumer model", () => {
  assert.ok(page.includes("STORE"));
  assert.ok(page.includes("EXPECTED"));
  assert.ok(page.includes("CONFIRMED"));
  assert.ok(page.includes("UNKNOWN"));
  assert.ok(search.includes("localAvailability"));
  assert.ok(search.includes('status?: "expected" | "confirmed" | "unknown"'));
  assert.ok(search.includes("EXPECTED STOCK"));
  assert.ok(search.includes("CONFIRMED PHYSICAL STOCK"));
  assert.ok(search.includes("CURRENT STOCK · UNKNOWN"));
  for (const oldLabel of ["LOCAL MANIFESTED", "LOCAL ECHO", "LOCAL WHISPER", "LOCAL VANISHED"]) {
    assert.equal(search.includes(oldLabel), false, `${oldLabel} must remain internal rather than collector-facing`);
    assert.equal(page.includes(oldLabel), false, `${oldLabel} must remain internal rather than collector-facing`);
  }
});

test("expected retailer-chain intelligence cannot masquerade as confirmed branch stock", () => {
  assert.ok(search.includes('scope === "retailer_chain"'));
  assert.ok(search.includes("Retailer-wide intelligence · not confirmed for this specific store."));
  assert.ok(search.includes("Expected stock is indicative, not guaranteed."));
  assert.ok(search.includes("Online stock never becomes confirmed store stock automatically."));
});

test("Local Radar dashboard uses one consistent collector flow", () => {
  assert.ok(page.includes("Find nearby stores. See what may be arriving."));
  assert.ok(page.includes("canonical FateDrop Cloud discovery engine"));
  assert.ok(search.includes("YOUR AREA"));
  assert.ok(search.includes("LOCAL RADAR MAP"));
  assert.ok(search.includes("NEARBY STORES"));
  assert.ok(search.includes("EVENTS"));
  assert.ok(search.includes("Physical truth stays physical."));
});
