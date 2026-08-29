import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const alertsSource = await readFile(new URL("../app/dashboard/alerts/page.tsx", import.meta.url), "utf8");
const searchLayoutSource = await readFile(new URL("../app/dashboard/search/layout.tsx", import.meta.url), "utf8");
const homeSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const homeSearchSource = await readFile(new URL("../components/home-fate-search.tsx", import.meta.url), "utf8");

test("dashboard search removes only the redundant global search bar", () => {
  assert.match(searchLayoutSource, /\.fd-ref-search\{display:none!important\}/);
  assert.match(searchLayoutSource, /\.fd-ref-top-actions\{margin-left:auto\}/);
});

test("alerts describe continuous network observations precisely", () => {
  assert.doesNotMatch(alertsSource, /something changed/);
  assert.match(alertsSource, /Every signal should tell you exactly what the network observed\./);
  assert.match(alertsSource, /network movement detected/);
  assert.match(alertsSource, /retailer readiness detected/);
  assert.match(alertsSource, /stock verified live/);
  assert.match(alertsSource, /stock verified gone/);
});

test("home search is restored directly after the Koru hero with restrained FateFind branding", () => {
  assert.match(homeSource, /<KoruReferenceLanding \/>\s*<HomeFateSearch \/>/);
  assert.match(homeSearchSource, /Find what you&apost;re chasing\.|Find what you&apos;re chasing\./);
  assert.match(homeSearchSource, /action="\/dashboard\/search"/);
  assert.match(homeSearchSource, /#72586b/);
  assert.match(homeSearchSource, /#735b4a/);
  assert.match(homeSearchSource, /#b6977d/);
  assert.match(homeSearchSource, /#eadfd7/);
  assert.doesNotMatch(homeSearchSource, /#7c3aed|#8b5cf6|#a855f7|#9333ea/i);
});
