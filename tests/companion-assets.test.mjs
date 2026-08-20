import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { COMPANION_ASSETS, validateCompanionGeometry } = require("../lib/companion-assets.ts");

test("Companion registry keeps each 3D asset in an explicit role", () => {
  assert.equal(COMPANION_ASSETS.male.role, "humanoid");
  assert.equal(COMPANION_ASSETS.male.state, "ready");
  assert.equal(COMPANION_ASSETS.droid.role, "droid");
  assert.equal(COMPANION_ASSETS.droid.state, "ready");
  assert.equal(COMPANION_ASSETS.female.role, "humanoid");
  assert.equal(COMPANION_ASSETS.female.state, "quarantined");
});

test("humanoid validation accepts the Scout proportions", () => {
  const error = validateCompanionGeometry(COMPANION_ASSETS.male, {
    min: [-17063, -32594, -5689],
    max: [17063, 32767, 8831],
  });
  assert.equal(error, null);
});

test("humanoid validation rejects the crossed Warden card/prop geometry", () => {
  const error = validateCompanionGeometry(COMPANION_ASSETS.female, {
    min: [-32756, -2802, -20909],
    max: [32767, 2802, 20781],
  });
  assert.match(error ?? "", /humanoid/i);
});

test("droid validation accepts a volumetric Signal Droid", () => {
  const error = validateCompanionGeometry(COMPANION_ASSETS.droid, {
    min: [-32767, -28614, -28728],
    max: [32767, 28110, 27267],
  });
  assert.equal(error, null);
});

test("droid validation rejects a flat prop instead of silently substituting it", () => {
  const error = validateCompanionGeometry(COMPANION_ASSETS.droid, {
    min: [-100, -2, -70],
    max: [100, 2, 70],
  });
  assert.match(error ?? "", /flat prop/i);
});
