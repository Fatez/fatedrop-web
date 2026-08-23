import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

test("final Koru and Friends selector ships five real GLB display assets", () => {
  const contract = read("lib/companion-contract.ts");
  const webgl = read("components/companion-webgl-model.tsx");
  const loadout = read("lib/avatar-loadout.ts");

  assert.ok(contract.includes('ACTIVE_COMPANION_IDS = ["koru", "fenn", "aeris", "nyxen", "solix"]'));
  assert.equal(contract.includes('id: "oru"'), false, "Oru is a world character, not a sixth selectable companion");

  for (const id of ["koru", "fenn", "aeris", "nyxen", "solix"]) {
    const asset = `public/assets/companions/${id}/${id}.glb`;
    assert.equal(fs.existsSync(asset), true, `${asset} missing`);
    assert.ok(contract.includes(`/assets/companions/${id}/${id}.glb`), `${id} is not registered at its stable path`);
  }

  const koruLine = contract.split("\n").find((line) => line.includes('id: "koru"')) || "";
  const fennLine = contract.split("\n").find((line) => line.includes('id: "fenn"')) || "";
  assert.ok(koruLine.includes("isMascot: true"));
  assert.ok(fennLine.includes("isMascot: false"));
  assert.ok(loadout.includes('companion: "koru"'));
  assert.ok(webgl.includes("FRONT_FACING_YAW = Math.PI"));
  assert.ok(webgl.includes("FRONT_FACING_YAW +"));
});
