import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync(new URL("../app/api/dashboard/production-migrations/route.ts", import.meta.url), "utf8");
const migration = fs.readFileSync(new URL("../lib/local-radar-production-migration.ts", import.meta.url), "utf8");

test("production migration endpoint includes the Local Radar schema gate", () => {
  assert.match(route, /runProductionMigrationsWithLocalRadar/);
  assert.match(migration, /2026-08-31-local-radar-location-evidence\.sql/);
});

test("Local Radar migration is schema-only and proves canonical location count is unchanged", () => {
  assert.match(migration, /SELECT COUNT\(\*\)::int AS count FROM fatedrop_retailer_locations/);
  assert.match(migration, /changed canonical retailer location count/);
  assert.match(migration, /localRadarLocationCountBefore/);
  assert.match(migration, /localRadarLocationCountAfter/);
  assert.doesNotMatch(migration, /INSERT INTO fatedrop_retailer_locations/i);
  assert.doesNotMatch(migration, /DELETE FROM fatedrop_retailer_locations/i);
});

test("Local Radar schema verification requires evidence columns, tables, constraints and indexes", () => {
  for (const token of [
    "retailer_category",
    "tcg_seller_status",
    "identity_status",
    "fatedrop_retailer_location_sources",
    "fatedrop_retailer_location_conflicts",
    "fatedrop_retailer_locations_bounds_idx",
    "fatedrop_retailer_locations_radar_eligibility_idx",
  ]) assert.match(migration, new RegExp(token));
});
