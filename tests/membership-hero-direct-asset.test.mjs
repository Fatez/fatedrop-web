import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("membership hero does not depend on generic image resolution", async () => {
  const sourceText = await source("components/membership-hero.tsx");
  assert.ok(sourceText.includes('const MEMBERSHIP_ART = "/assets/membership/fatedrop-balance-membership.webp"'));
  assert.equal(sourceText.includes("reliableHeroSource"), false);
  assert.equal(sourceText.includes("fallback"), false);
});
