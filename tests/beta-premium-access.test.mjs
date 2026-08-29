import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const betaPremium = fs.readFileSync(new URL("../lib/beta-premium.ts", import.meta.url), "utf8");
const auth = fs.readFileSync(new URL("../lib/auth.ts", import.meta.url), "utf8");
const mobileSession = fs.readFileSync(new URL("../app/api/mobile/session/route.ts", import.meta.url), "utf8");
const entitlement = fs.readFileSync(new URL("../app/api/account/entitlement/route.ts", import.meta.url), "utf8");

test("approved closed-beta accounts receive temporary Plus without rewriting billing records", () => {
  assert.match(betaPremium, /FATEDROP_BETA_PREMIUM_ENABLED/);
  assert.match(betaPremium, /betaAccessIsApproved\(betaAccess\)/);
  assert.match(betaPremium, /tier: "plus"/);
  assert.match(betaPremium, /status: "active"/);
  assert.match(betaPremium, /accessGrant: \{ type: "beta-premium", temporary: true \}/);
  assert.doesNotMatch(betaPremium, /beta_leads|collectorIsInBeta/);
  assert.doesNotMatch(betaPremium, /updateMembership|INSERT INTO fatedrop_memberships|UPDATE fatedrop_memberships/);
});

test("closed-beta full access still fails closed until canonical approval exists", () => {
  const approvalCheck = betaPremium.indexOf("betaAccessIsApproved(betaAccess)");
  const betaModeCheck = betaPremium.indexOf("if (!betaPremiumEnabled())", approvalCheck);
  assert.ok(approvalCheck >= 0 && betaModeCheck > approvalCheck, "approval must be checked before temporary full access");
  assert.match(betaPremium, /return \{ \.\.\.base, accessGrant: null \}/);
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
