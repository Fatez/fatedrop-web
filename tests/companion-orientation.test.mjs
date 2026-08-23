import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("all registered companion GLBs use one front-facing renderer baseline", () => {
  const webgl = read("components/companion-webgl-model.tsx");
  assert.ok(webgl.includes("const FRONT_FACING_YAW = Math.PI;"));
  assert.ok(webgl.includes("FRONT_FACING_YAW + (reducedMotion ? 0 : Math.sin(elapsed * 0.22) * 0.28)"));
  assert.equal(webgl.includes("reducedMotion ? 0 : Math.sin(elapsed * 0.22) * 0.28);"), false);
});

test("Koru remains the default and Oru cannot enter the five-slot selector", () => {
  const contract = read("lib/companion-contract.ts");
  const loadout = read("lib/avatar-loadout.ts");
  const activeLine = contract.split("\n").find((line) => line.includes("ACTIVE_COMPANION_IDS")) || "";
  assert.ok(activeLine.includes('["koru", "fenn", "aeris", "nyxen", "solix"]'));
  assert.equal(activeLine.includes('"oru"'), false);
  assert.ok(loadout.includes('companion: "koru"'));
});

test("verified Koru source clip names remain recorded while binary handoff is pending", () => {
  const contract = read("lib/companion-contract.ts");
  for (const clip of [
    "Armature|Idle_3|baselayer",
    "Armature|Alert|baselayer",
    "Armature|walking_man|baselayer",
    "Armature|Victory_Cheer|baselayer",
  ]) assert.ok(contract.includes(clip), `${clip} missing`);
  assert.ok(contract.includes("retained running clip") === false || contract.includes("metadata-only"));
});
