import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const stores = await readFile(new URL("../components/retailer-market-directory.tsx", import.meta.url), "utf8");
const radarPage = await readFile(new URL("../app/dashboard/local-radar/page.tsx", import.meta.url), "utf8");
const radar = await readFile(new URL("../components/local-radar-dashboard.tsx", import.meta.url), "utf8");
const traderPage = await readFile(new URL("../app/dashboard/trader/page.tsx", import.meta.url), "utf8");
const traderSurface = await readFile(new URL("../components/fate-trader-surface.tsx", import.meta.url), "utf8");

test("Stores exposes the locked presence model without inventing Near Me or capability data", () => {
  assert.match(stores, /aria-label="Store presence"/);
  for (const label of [">All<", ">Online<", ">Physical Stores<", ">Near Me "]) assert.match(stores, new RegExp(label));
  assert.match(stores, /RRP \/ Major Retailers/);
  assert.match(stores, /Independent Retailers/);
  assert.match(stores, /Near Me will activate when the shared branch registry exposes a resolved location scope/);
  assert.match(stores, /disabled title="Awaiting canonical retailer capability fields from Cloud\."/);
  assert.match(stores, /no hard-coded classifications/);
  assert.match(stores, /retailer\.physicalStores === true/);
  assert.match(stores, /retailer\.online === true/);
});

test("Local Radar is prepared as Overview, Local Stores and Events using evidence-first language", () => {
  assert.match(radarPage, /LocalRadarDashboard/);
  assert.match(radarPage, /canonical FateDrop Cloud discovery engine/);
  for (const section of ["Overview", "Local Stores", "Events"]) assert.match(radar, new RegExp(`>${section}<`));
  for (const state of ["NEARBY", "ECHO / PREPARATION", "MANIFESTED", "VANISHED"]) assert.match(radar, new RegExp(state.replace("/", "\\/")));
  assert.match(radar, /does <strong>not<\/strong> mean stock is confirmed/);
  assert.match(radar, /missing physical evidence does <strong>not<\/strong> mean a branch is out of stock/);
  assert.match(radar, /distance, freshness, confidence, price, RRP and percentage-vs-RRP/);
  assert.match(radar, /href="\/dashboard\/events"/);
});

test("Fate Trader hides unavailable backend detail behind a clean verified-data product state", () => {
  assert.match(traderPage, /FateTraderSurface/);
  assert.doesNotMatch(traderPage, /FateTraderAudit/);
  assert.match(traderSurface, /\/api\/trader\/card-series\?tcg=pokemon/);
  assert.match(traderSurface, /Verified trading data is not available right now\./);
  assert.match(traderSurface, /No demo cards, fake matches or raw backend errors are shown/);
  assert.match(traderSurface, /return <FateTraderAudit \/>/);
});
