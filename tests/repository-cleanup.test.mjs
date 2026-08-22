import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

test("obsolete development patch dumps do not live in the active repository root", () => {
  const patches = fs.readdirSync(root).filter((name) => name.endsWith(".patch"));
  assert.deepEqual(patches, []);
});

test("superseded homepage and companion implementations stay removed", () => {
  for (const file of [
    "components/koru-home-sections.tsx",
    "components/avatar-builder.tsx",
    "components/avatar-preview.tsx",
    "components/avatar-option-thumbnail.tsx",
    "components/avatar-anime-character.tsx",
    "components/avatar-layered-character.tsx",
    "components/companion-3d-stage.tsx",
    "lib/avatar-assets.ts",
    "lib/companion-assets.ts",
    "public/assets/avatar-v2/avatar-sprites.svg",
    "public/assets/avatar-v2/catalogue.json",
  ]) assert.equal(fs.existsSync(path.join(root, file)), false, `${file} should remain removed`);
});

test("superseded JPG market heroes stay removed after the final PNG handoff", () => {
  for (const file of [
    "public/assets/market/collectors-hero.jpg",
    "public/assets/market/retailers-hero.jpg",
  ]) assert.equal(fs.existsSync(path.join(root, file)), false, `${file} should remain removed`);
});

test("current homepage has one explicit composition path", () => {
  const page = fs.readFileSync(path.join(root, "app/page.tsx"), "utf8");
  assert.ok(page.includes('from "@/components/koru-home-reference"'));
  assert.ok(page.includes('from "@/components/koru-final-sections"'));
  assert.equal(page.includes("koru-home-sections"), false);
});
