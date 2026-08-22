import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("companion account writes accept only the final five IDs", () => {
  const contract = read("lib/companion-contract.ts");
  const api = read("app/api/account/avatar/route.ts");
  assert.ok(contract.includes("export function isCompanionId"));
  assert.ok(api.includes("if (!isCompanionId(payload.companionId))"));
  assert.ok(api.includes('error: "Unknown Koru & Friends companion."'));
  assert.ok(api.includes("{ companion: companionId }"));
  assert.equal(api.includes("normalizeCompanionId(payload.companionId)"), false);
});

test("legacy reads remain forgiving without reopening legacy companion cosmetics", () => {
  const loadout = read("lib/avatar-loadout.ts");
  const api = read("app/api/account/avatar/route.ts");
  assert.ok(loadout.includes("normalizeCompanionId(raw.companion)"));
  assert.ok(api.includes("Legacy client compatibility"));
  assert.ok(api.includes("New web UI"));
  assert.equal(loadout.includes("AVATAR_OUTFITS"), false);
  assert.equal(loadout.includes("radar-drone"), false);
});
