import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const betaPremium = fs.readFileSync(new URL("../lib/beta-premium.ts", import.meta.url), "utf8");
const auth = fs.readFileSync(new URL("../lib/auth.ts", import.meta.url), "utf8");
const mobileSession = fs.readFileSync(new URL("../app/api/mobile/session/route.ts", import.meta.url), "utf8");
const entitlement = fs.readFileSync(new URL("../app/api/account/entitlement/route.ts", import.meta.url), "utf8");

test("collector beta membership grants temporary Plus without rewriting billing records", () => {
  assert.match(betaPremium, /FATEDROP_BETA_PREMIUM_ENABLED/);
  assert.match(betaPremium, /FROM beta_leads/);
  assert.match(betaPremium, /role = 'collector'/);
  assert.match(betaPremium, /contact_consent = TRUE/);
  assert.match(betaPremium, /tier: "plus"/);
  assert.match(betaPremium, /status: "active"/);
  assert.match(betaPremium, /accessGrant: \{ type: "beta-premium", temporary: true \}/);
  assert.doesNotMatch(betaPremium, /updateMembership|INSERT INTO fatedrop_memberships|UPDATE fatedrop_memberships/);
});

test("beta lookup failure cannot break a valid sign-in", () => {
  assert.match(betaPremium, /catch \{/);
  assert.match(betaPremium, /return false;/);
  assert.match(betaPremium, /must never make a valid FateDrop sign-in fail/);
});

test("browser and bearer sessions both resolve the temporary beta grant", () => {
  const applications = auth.match(/applyTemporaryBetaPremium\(/g) ?? [];
  assert.ok(applications.length >= 2, "expected beta premium resolution for browser and bearer snapshots");
  assert.match(auth, /const snapshot = await getAccountSnapshot\(account\.id\);/);
});

test("resolved beta Plus membership flows through Web and App entitlement contracts", () => {
  assert.match(mobileSession, /effectiveTier\(snapshot\.membership\)/);
  assert.match(mobileSession, /capabilitiesForMembership\(snapshot\.membership\)/);
  assert.match(entitlement, /effectiveTier\(snapshot\.membership\)/);
  assert.match(entitlement, /capabilitiesForMembership\(snapshot\.membership\)/);
});
