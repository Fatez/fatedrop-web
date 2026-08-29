import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("membership hero stays page-specific and independent from shared hero fallback logic", async () => {
  const page = await source("app/subscriptions/page.tsx");
  const membershipHero = await source("components/membership-hero.tsx");

  assert.equal(page.includes('from "@/components/market-story-hero"'), false);
  assert.ok(page.includes('from "@/components/membership-hero"'));
  assert.ok(membershipHero.includes("<img"));
  assert.ok(membershipHero.includes('src={MEMBERSHIP_ART}'));
  assert.ok(membershipHero.includes('href="#collectors"'));
  assert.ok(membershipHero.includes('href="#retailers"'));
});
