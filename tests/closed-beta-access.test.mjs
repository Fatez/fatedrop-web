import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const betaAccess = read("lib/beta-access.ts");
const betaPremium = read("lib/beta-premium.ts");
const auth = read("lib/auth.ts");
const migrations = read("lib/production-migrations.ts");
const migrationSql = read("database/2026-08-29-closed-beta-access.sql");
const register = read("app/api/auth/register/route.ts");
const authForm = read("components/account-auth-form.tsx");
const dashboardLayout = read("app/dashboard/layout.tsx");
const pendingPage = read("app/beta-pending/page.tsx");
const mobileSession = read("app/api/mobile/session/route.ts");
const mobileAlerts = read("app/api/mobile/alerts/route.ts");
const mobilePush = read("app/api/mobile/push/route.ts");
const mobileSync = read("app/api/mobile/sync/route.ts");
const entitlement = read("app/api/account/entitlement/route.ts");
const discordConnect = read("app/api/discord/connect/route.ts");
const discordSync = read("app/api/discord/sync/route.ts");
const billingCheckout = read("app/api/billing/checkout/route.ts");

test("closed beta has canonical pending approved and revoked states and fails closed", () => {
  assert.match(betaAccess, /"pending" \| "approved" \| "revoked"/);
  assert.match(betaAccess, /status === "approved" && access\.approved === true/);
  assert.match(betaAccess, /catch \{[\s\S]*return pendingBetaAccess\(\)/);
  assert.match(betaAccess, /BETA_PENDING/);
  assert.match(betaAccess, /BETA_REVOKED/);
});

test("production migration preserves existing testers but creates every new account pending", () => {
  assert.match(migrations, /2026-08-29-closed-beta-access\.sql/);
  assert.match(migrationSql, /SELECT id, 'approved', created_at/);
  assert.match(migrationSql, /migration:pre-closed-beta/);
  assert.match(migrationSql, /AFTER INSERT ON fatedrop_users/);
  assert.match(migrationSql, /VALUES \(NEW\.id, 'pending'/);
  assert.match(migrationSql, /migration:pre-closed-beta-reconcile/);
  assert.ok(migrationSql.indexOf("migration:pre-closed-beta-reconcile") > migrationSql.indexOf("AFTER INSERT ON fatedrop_users"));
  assert.match(migrations, /betaAccessMissingCount/);
});

test("operator approval and revoke are database-side and audited", () => {
  assert.match(migrationSql, /fatedrop_beta_access_audit/);
  assert.match(migrationSql, /fatedrop_set_beta_access/);
  assert.match(migrationSql, /previous_status/);
  assert.match(migrationSql, /next_status/);
  assert.match(migrationSql, /operator/);
  assert.match(migrationSql, /changed_at/);
  assert.doesNotMatch(migrationSql, /email\s*=|lower\(email\)/i);
});

test("signup means beta request, not approval", () => {
  assert.match(register, /accessAllowed: false/);
  assert.match(register, /status: "pending"/);
  assert.match(authForm, /Request beta access/);
  assert.match(authForm, /router\.push\("\/beta-pending"\)/);
  assert.doesNotMatch(register, /status: "approved"/);
});

test("approval grants full beta access while paid membership and checkout cannot bypass approval", () => {
  const approvalCheck = betaPremium.indexOf("betaAccessIsApproved(betaAccess)");
  const betaModeCheck = betaPremium.indexOf("betaPremiumEnabled()");
  assert.ok(approvalCheck >= 0 && betaModeCheck > approvalCheck, "approval must be checked before temporary full beta access");
  assert.match(betaPremium, /tier: "plus"/);
  assert.match(betaPremium, /status: "active"/);
  assert.doesNotMatch(betaPremium, /beta_leads|collectorIsInBeta/);
  assert.match(entitlement, /capabilities = betaApproved \? \[\.\.\.capabilitiesForMembership/);
  const checkoutApproval = billingCheckout.indexOf("betaAccessIsApproved(snapshot.betaAccess)");
  const betaCheckoutBlock = billingCheckout.indexOf("betaPremiumEnabled()");
  const checkoutCreation = billingCheckout.indexOf("createCheckoutSession({");
  assert.ok(checkoutApproval >= 0 && betaCheckoutBlock > checkoutApproval && checkoutCreation > betaCheckoutBlock, "checkout must require approval and remain disabled during full-access beta mode");
  assert.match(billingCheckout, /Subscriptions are not required during the FateDrop closed beta/);
});

test("dashboard and Discord stay closed until approval", () => {
  assert.match(dashboardLayout, /betaAccessIsApproved\(snapshot\.betaAccess\)/);
  assert.match(dashboardLayout, /redirect\("\/beta-pending"\)/);
  assert.match(discordConnect, /betaAccessIsApproved\(snapshot\.betaAccess\)/);
  assert.match(discordConnect, /\/beta-pending/);
  assert.match(discordSync, /betaAccessDeniedResponse\(snapshot\.betaAccess\)/);
  assert.match(pendingPage, /TestFlight link, paid membership or beta signup form does not bypass approval/);
});

test("mobile session reports pending state but grants zero capabilities", () => {
  assert.match(mobileSession, /allowPending: true/);
  assert.match(mobileSession, /accessAllowed: betaApproved/);
  assert.match(mobileSession, /betaAccess: snapshot\.betaAccess/);
  assert.match(mobileSession, /betaApproved \? \[\.\.\.capabilitiesForMembership\(snapshot\.membership\)\]\.sort\(\) : \[\]/);
});

test("mobile product APIs explicitly deny pending or revoked accounts", () => {
  for (const source of [mobileAlerts, mobilePush, mobileSync]) {
    assert.match(source, /allowPending: true/);
    assert.match(source, /betaAccessIsApproved\(snapshot\.betaAccess\)/);
    assert.match(source, /betaAccessDeniedResponse\(snapshot\.betaAccess\)/);
  }
});

test("shared bearer/API auth requires approval unless a status endpoint opts in", () => {
  assert.match(auth, /options: \{ allowPending\?: boolean \} = \{\}/);
  assert.match(auth, /!options\.allowPending && !betaAccessIsApproved\(snapshot\.betaAccess\)/);
  assert.match(entitlement, /allowPending: true/);
  assert.match(entitlement, /accessAllowed: betaApproved/);
});
