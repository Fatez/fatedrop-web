import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("collector retailer and events heroes use one full-bleed artwork layer", async () => {
  const hero = await source("components/market-story-hero.tsx");
  assert.ok(hero.includes("position:absolute;z-index:0;inset:0"));
  assert.ok(hero.includes("market-story-visual-shade"));
  assert.ok(hero.includes("market-story-copy"));
  assert.ok(hero.includes("market-story-proof"));
  assert.equal(hero.includes("grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr)"), false);
});

test("public market pages all share the rebuilt hero boundary", async () => {
  for (const path of ["app/collectors/page.tsx", "app/businesses/page.tsx", "app/events/page.tsx"]) {
    const page = await source(path);
    assert.ok(page.includes("<MarketStoryHero"), `${path} must use MarketStoryHero`);
  }
});
