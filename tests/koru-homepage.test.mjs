import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("homepage is led by the approved Koru signal concept", () => {
  const home = read("app/page.tsx");
  const reference = read("components/koru-home-reference.tsx");
  assert.ok(home.includes("<KoruReferenceLanding"));
  assert.ok(home.includes("<KoruAppSection"));
  assert.ok(reference.includes("You don&apos;t chase drops."));
  assert.ok(reference.includes("You get the signal."));
  assert.ok(reference.includes("THE NETWORK LANGUAGE"));
  assert.ok(reference.includes("MEET THE VOICE OF FATEDROP"));
});

test("homepage landing uses the clean Koru hero asset", () => {
  const reference = read("components/koru-home-reference.tsx");
  assert.ok(reference.includes("/assets/home/koru-home-hero.avif"));
  assert.ok(fs.existsSync("public/assets/home/koru-home-hero.avif"));
  assert.equal(reference.includes("koru-home-hero-embedded.svg"), false);
});

test("homepage art treatment is matte and TCG-aware rather than neon-only", () => {
  const sections = read("components/koru-home-sections.tsx");
  assert.ok(sections.includes("saturate(.48)"));
  assert.ok(sections.includes("sepia(.07)"));
  assert.ok(sections.includes("koru-card-signal"));
  assert.ok(sections.includes("mini-card-stack"));
  assert.ok(sections.includes("Product cards, RRP and retailer evidence stay central"));
});

test("Koru remains fixed while personal collector identity stays separate", () => {
  const home = read("app/page.tsx");
  const sections = read("components/koru-home-sections.tsx");
  assert.ok(home.includes("Koru remains the fixed FateDrop signal companion"));
  assert.ok(sections.includes("One mascot across every TCG"));
  assert.equal(home.includes("Customise Companion"), false);
  assert.equal(home.includes("account-selected character"), false);
});

test("homepage retains the final four-stage lifecycle contract", () => {
  const reference = read("components/koru-home-reference.tsx");
  assert.ok(reference.includes("KORU_LIFECYCLE"));
  assert.ok(reference.includes("Four states. One meaning everywhere."));
});
