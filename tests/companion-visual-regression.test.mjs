import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("Koru companion fallback uses the approved current Koru artwork", () => {
  const brand = read("lib/koru-brand.ts");
  assert.ok(brand.includes('/assets/home/koru-home-hero.png?v=20260822-koru-final'));
  assert.equal(brand.includes('portrait: "/assets/companions/koru-portrait.webp"'), false);
  assert.equal(brand.includes('fullArtwork: "/assets/companions/koru-signal-companion.webp"'), false);
});

test("companion presentation keeps live GLBs readable and Koru focused", () => {
  const layout = read("app/layout.tsx");
  const css = read("app/companion-presentation.css");
  assert.ok(layout.includes('import "./companion-presentation.css"'));
  assert.ok(css.includes(".koru-mascot .koru-frame img"));
  assert.ok(css.includes("object-position: 66% center"));
  assert.ok(css.includes(".companion-webgl canvas"));
  assert.ok(css.includes("brightness(1.24)"));
  assert.ok(css.includes(".companion-webgl.compact canvas"));
});

test("pending companion packs and state preview copy are explicit rather than looking broken", () => {
  const renderer = read("components/companion-renderer.tsx");
  const selector = read("components/companion-selector.tsx");
  assert.ok(renderer.includes("3D model upload pending"));
  assert.equal(renderer.includes("3D model slot ready"), false);
  assert.ok(selector.includes("Registered GLBs render in 3D"));
  assert.ok(selector.includes("fall back honestly"));
  assert.equal(selector.includes("The live 3D stage changes presentation"), false);
});
