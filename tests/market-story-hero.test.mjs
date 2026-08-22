import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("public heroes use the same static artwork boundary that fixed Home", async () => {
  const hero = await source("components/market-story-hero.tsx");
  assert.ok(hero.includes("prh-image"));
  assert.ok(hero.includes("prh-shade"));
  assert.ok(hero.includes("prh-copy"));
  assert.ok(hero.includes("prh-proof"));
  assert.ok(hero.includes("FALLBACK_HERO"));
  assert.ok(hero.includes("/assets/fatedrop-header.png"));
  assert.ok(hero.includes("reliableHeroSource"));
  assert.equal(hero.includes("market-story-visual"), false);
  assert.equal(hero.includes("market-story-signal-field"), false);
  assert.equal(hero.includes("grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr)"), false);
  assert.equal(hero.includes("reveal"), false);
});

test("public hero renderer refuses converted JPG WebP and AVIF artwork", async () => {
  const hero = await source("components/market-story-hero.tsx");
  assert.ok(hero.includes("/\\.png(?:\\?|$)/i.test(image)"));
  assert.equal(hero.includes("next/image"), false);
  assert.equal(hero.includes('loading="eager"'), false);
});

test("public market pages share the rebuilt static hero boundary", async () => {
  for (const path of ["app/collectors/page.tsx", "app/businesses/page.tsx", "app/events/page.tsx"]) {
    const page = await source(path);
    assert.ok(page.includes("<MarketStoryHero"), `${path} must use MarketStoryHero`);
  }
});
