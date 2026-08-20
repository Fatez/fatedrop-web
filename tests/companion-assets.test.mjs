import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { COMPANION_ASSETS, validateCompanionGeometry } = require("../lib/companion-assets.ts");

test("Companion registry keeps each 3D asset in an explicit role", () => {
  assert.equal(COMPANION_ASSETS.male.label, "KAEL");
  assert.equal(COMPANION_ASSETS.male.role, "humanoid");
  assert.equal(COMPANION_ASSETS.male.state, "ready");
  assert.equal(COMPANION_ASSETS.female.label, "NYRA");
  assert.equal(COMPANION_ASSETS.female.role, "humanoid");
  assert.equal(COMPANION_ASSETS.female.state, "ready");
  assert.equal(COMPANION_ASSETS.droid.label, "VØX");
  assert.equal(COMPANION_ASSETS.droid.role, "droid");
  assert.equal(COMPANION_ASSETS.droid.state, "ready");
});

test("humanoid validation accepts KAEL production proportions", () => {
  const error = validateCompanionGeometry(COMPANION_ASSETS.male, {
    min: [-0.38297, 0, -0.16298],
    max: [0.38297, 1.7, 0.16298],
  });
  assert.equal(error, null);
});

test("humanoid validation accepts NYRA production proportions", () => {
  const error = validateCompanionGeometry(COMPANION_ASSETS.female, {
    min: [-0.40873, 0, -0.18528],
    max: [0.40873, 1.7, 0.18528],
  });
  assert.equal(error, null);
});

test("humanoid validation rejects a crossed flat card/prop", () => {
  const error = validateCompanionGeometry(COMPANION_ASSETS.female, {
    min: [-32756, -2802, -20909],
    max: [32767, 2802, 20781],
  });
  assert.match(error ?? "", /humanoid/i);
});

test("familiar validation accepts a volumetric VØX model", () => {
  const error = validateCompanionGeometry(COMPANION_ASSETS.droid, {
    min: [-32767, -28614, -28728],
    max: [32767, 28110, 27267],
  });
  assert.equal(error, null);
});

test("familiar validation rejects a flat prop instead of silently substituting it", () => {
  const error = validateCompanionGeometry(COMPANION_ASSETS.droid, {
    min: [-100, -2, -70],
    max: [100, 2, 70],
  });
  assert.match(error ?? "", /flat prop/i);
});
