import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const alertsSource = await readFile(new URL("../app/dashboard/alerts/page.tsx", import.meta.url), "utf8");
const searchLayoutSource = await readFile(new URL("../app/dashboard/search/layout.tsx", import.meta.url), "utf8");
const dashboardSearchSource = await readFile(new URL("../app/dashboard/search/page.tsx", import.meta.url), "utf8");
const homeSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const fateNetworkSource = await readFile(new URL("../components/fate-network-home-section.tsx", import.meta.url), "utf8");

test("dashboard search removes only the redundant global search bar", () => {
  assert.match(searchLayoutSource, /\.fd-ref-search\{display:none!important\}/);
  assert.match(searchLayoutSource, /\.fd-ref-top-actions\{margin-left:auto\}/);
});

test("dashboard network search uses one aligned query control without the legacy double box", () => {
  assert.doesNotMatch(dashboardSearchSource, /className="fd-dashboard-search"/);
  assert.match(dashboardSearchSource, /PRODUCT \/ SET \/ FORMAT/);
  assert.match(dashboardSearchSource, /className="fd-network-query-control"/);
  assert.match(dashboardSearchSource, /\.fd-network-query-control\{/);
  assert.match(dashboardSearchSource, /\.fd-network-query\{grid-column:1\/-1\}/);
});

test("alerts describe continuous network observations precisely", () => {
  assert.doesNotMatch(alertsSource, /something changed/);
  assert.match(alertsSource, /Every signal should tell you exactly what the network observed\./);
  assert.match(alertsSource, /network movement detected/);
  assert.match(alertsSource, /retailer readiness detected/);
  assert.match(alertsSource, /stock verified live/);
  assert.match(alertsSource, /stock verified gone/);
});

test("homepage no longer contains the misplaced standalone FateFind search hero", () => {
  assert.doesNotMatch(homeSource, /HomeFateSearch/);
  assert.match(homeSource, /<KoruReferenceLanding \/>\s*<FateDropValueSectionV2 \/>/);
});

test("Fate Network homepage panel explains the actual FateDrop intelligence journey", () => {
  assert.match(fateNetworkSource, /FATE NETWORK · INTELLIGENCE LAYER/);
  assert.match(fateNetworkSource, /ONE NETWORK → FOUR USEFUL ANSWERS/);
  assert.match(fateNetworkSource, /What exists\?/);
  assert.match(fateNetworkSource, /What is strongest value now\?/);
  assert.match(fateNetworkSource, /When should I act\?/);
  assert.match(fateNetworkSource, /What changed\?/);
  assert.match(fateNetworkSource, /WHISPER/);
  assert.match(fateNetworkSource, /MANIFESTED/);
  assert.match(fateNetworkSource, /CHECKOUT STAYS WITH THE STORE/);
  assert.doesNotMatch(fateNetworkSource, /journey-thumb|Search the connected market/);
});
