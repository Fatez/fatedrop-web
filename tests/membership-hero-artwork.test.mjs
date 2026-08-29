import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("membership page uses only the approved dedicated balance artwork", async () => {
  const page = await source("app/subscriptions/page.tsx");
  const hero = await source("components/market-story-hero.tsx");

  assert.ok(page.includes('image="/assets/market/membership-balance.webp"'));
  assert.ok(page.includes('focal="center"'));
  assert.ok(hero.includes('new Set(["/assets/market/membership-balance.webp"])'));
  assert.ok(hero.includes('/\\.png(?:\\?|$)/i.test(image)'));
  assert.equal(hero.includes('/\\.(?:png|webp)'), false);
});
