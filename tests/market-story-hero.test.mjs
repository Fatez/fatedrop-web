import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("public heroes use the same simple full-image construction as the approved homepage", async () => {
  const hero = await source("components/market-story-hero.tsx");
  assert.ok(hero.includes("prh-shell"));
  assert.ok(hero.includes("prh-hero"));
  assert.ok(hero.includes("prh-image"));
  assert.ok(hero.includes("prh-shade"));
  assert.ok(hero.includes("prh-copy"));
  assert.ok(hero.includes("prh-proof"));
  assert.ok(hero.includes("position:absolute;z-index:0;inset:0"));
  assert.equal(hero.includes("market-story-visual"), false);
  assert.equal(hero.includes("market-story-signal-field"), false);
  assert.equal(hero.includes("grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr)"), false);
});

test("all market pages share only the rebuilt homepage-style hero boundary", async () => {
  for (const path of ["app/collectors/page.tsx", "app/businesses/page.tsx", "app/events/page.tsx", "app/trust/page.tsx", "app/about/page.tsx", "app/subscriptions/page.tsx"]) {
    const page = await source(path);
    assert.ok(page.includes("<MarketStoryHero"), `${path} must use the rebuilt public hero`);
  }
});
