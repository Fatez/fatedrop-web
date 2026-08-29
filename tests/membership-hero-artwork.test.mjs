import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("membership page owns a direct dedicated artwork hero", async () => {
  const page = await source("app/subscriptions/page.tsx");
  const hero = await source("components/membership-hero.tsx");

  assert.ok(page.includes('import { MembershipHero } from "@/components/membership-hero"'));
  assert.ok(page.includes("<MembershipHero />"));
  assert.equal(page.includes("MarketStoryHero"), false);

  assert.ok(hero.includes('const MEMBERSHIP_ART = "/assets/membership/fatedrop-balance-membership.webp"'));
  assert.ok(hero.includes("src={MEMBERSHIP_ART}"));
  assert.equal(hero.includes("FALLBACK_HERO"), false);
  assert.equal(hero.includes("APPROVED_NON_PNG_HEROES"), false);
  assert.equal(hero.includes("reliableHeroSource"), false);
  assert.ok(hero.includes("object-position:center 18%"));

  await access(new URL("public/assets/membership/fatedrop-balance-membership.webp", root));
});
