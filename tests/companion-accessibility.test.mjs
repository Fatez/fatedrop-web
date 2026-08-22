import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

test("live companion WebGL respects reduced-motion without replacing the real model", () => {
  const renderer = read("components/companion-webgl-model.tsx");
  assert.ok(renderer.includes('window.matchMedia("(prefers-reduced-motion: reduce)").matches'));
  assert.ok(renderer.includes("if (reducedMotion) frame(started)"));
  assert.ok(renderer.includes("if (!reducedMotion) frameId = requestAnimationFrame(frame)"));
  assert.ok(renderer.includes('reducedMotion ? 0 : Math.sin(elapsed * 0.22) * 0.28'));
  assert.ok(renderer.includes('reducedMotion ? 0 : Math.sin(elapsed * 1.25) * 0.012'));
  assert.equal(renderer.includes("display:none"), false, "reduced motion must not hide the real 3D model");
});

test("companion controls distinguish signal-state presentation from verified skeletal animation", () => {
  const selector = read("components/companion-selector.tsx");
  assert.ok(selector.includes("SIGNAL STATE PREVIEW"));
  assert.ok(selector.includes("Skeletal clips are only treated as active after browser playback is verified."));
  assert.ok(selector.includes("Registered GLBs render in 3D"));
  assert.ok(selector.includes("aria-pressed={reaction === item.id}"));
  assert.equal(selector.includes("LIVE REACTION PREVIEW"), false);
});
