import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("membership page uses only the approved dedicated balance artwork", async () => {
  const page = await source("app/subscriptions/page.tsx");
  const hero = await source("components/market-story-hero.tsx");

  const membershipImage = "/assets/membership/fatedrop-balance-membership.webp?v=20260829";
  assert.ok(page.includes(`image="${membershipImage}"`));
  assert.ok(page.includes('focal="center"'));
  assert.ok(hero.includes(`new Set(["${membershipImage}"])`));
  assert.ok(hero.includes('/\\.png(?:\\?|$)/i.test(image)'));
  assert.equal(hero.includes('/\\.(?:png|webp)'), false);
  await access(new URL("public/assets/membership/fatedrop-balance-membership.webp", root));
});
