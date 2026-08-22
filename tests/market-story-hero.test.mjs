import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

function heroImage(page) {
  const match = page.match(/image="([^"]+)"/);
  assert.ok(match, "page must declare a hero image");
  return match[1];
}

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

test("Collectors Retailers and Events use their final distinct full PNG hero sources", async () => {
  const collectors = await source("app/collectors/page.tsx");
  const retailers = await source("app/businesses/page.tsx");
  const events = await source("app/events/page.tsx");

  const images = [heroImage(collectors), heroImage(retailers), heroImage(events)];
  assert.deepEqual(images, [
    "/assets/market/collectors.png",
    "/assets/market/retailers.png",
    "/assets/market/events.png",
  ]);
  for (const image of images) assert.match(image, /\.png(?:\?|$)/i);
  assert.equal(new Set(images).size, 3);
});
