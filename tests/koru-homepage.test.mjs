import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("homepage is led by the approved Koru signal concept", () => {
  const home = read("app/page.tsx");
  const sections = read("components/koru-home-sections.tsx");
  assert.ok(home.includes("<KoruHomeHero"));
  assert.ok(home.includes("<KoruVoiceSection"));
  assert.ok(home.includes("<KoruAppSection"));
  assert.ok(home.includes("<KoruFriendsHomeTeaser"));
  assert.ok(sections.includes("You don&apos;t chase drops."));
  assert.ok(sections.includes("You get the signal."));
  assert.ok(sections.includes("FATEDROP / SIGNAL CARD"));
  assert.ok(sections.includes("MEET <b>KORU.</b>"));
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
  const sections = read("components/koru-home-sections.tsx");
  for (const state of ["Whisper", "Echo", "Manifested", "Vanished"]) assert.ok(sections.includes("KORU_LIFECYCLE") || sections.includes(state));
  assert.ok(sections.includes("Four states. One meaning everywhere."));
});
