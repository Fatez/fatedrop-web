import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const bootstrap = await readFile(new URL("../lib/temporary-owner-bootstrap.ts", import.meta.url), "utf8");
const route = await readFile(new URL("../app/api/dashboard/production-migrations/route.ts", import.meta.url), "utf8");

function position(source, pattern, label) {
  const index = source.search(pattern);
  assert.notEqual(index, -1, `${label} must be present`);
  return index;
}

test("temporary Owner bootstrap is exact, one-shot and never replaces the canonical hello Owner", () => {
  assert.match(bootstrap, /TEMP_OWNER_EMAIL = "fatedropuk@gmail\.com"/);
  assert.match(bootstrap, /TEMP_OWNER_BOOTSTRAP_ID = "2026-08-29-temporary-gmail-owner-bootstrap"/);
  assert.match(bootstrap, /lower\(u\.email\)='hello@fatedrop\.co\.uk'/);
  assert.match(bootstrap, /canonical FateDrop Owner to remain present and beta-approved/);
  assert.doesNotMatch(bootstrap, /DELETE FROM fatedrop_admin_roles|fatedrop_revoke_owner|UPDATE fatedrop_users[\s\S]*hello@fatedrop\.co\.uk/);
});

test("temporary bootstrap refuses ambiguity and creates only a normal free account when absent", () => {
  assert.match(bootstrap, /if \(existingRows\.length > 1\)/);
  assert.match(bootstrap, /INSERT INTO fatedrop_users/);
  assert.match(bootstrap, /INSERT INTO fatedrop_memberships/);
  assert.match(bootstrap, /SELECT id, 'free', 'free'/);
  assert.match(bootstrap, /passwordHash: "scrypt\$/);
  assert.doesNotMatch(bootstrap, /startSession|stripe_customer|tier, 'pro'|status, 'active'/);
});

test("Owner authority is granted only through the existing audited function and beta approval is verified", () => {
  assert.match(bootstrap, /fatedrop_grant_owner\(\$\{userId\}, \$\{TEMP_OWNER_OPERATOR\}\)/);
  assert.match(bootstrap, /r\.role='owner'/);
  assert.match(bootstrap, /b\.status AS beta_status/);
  assert.match(bootstrap, /String\(verifiedRows\[0\]\.beta_status\) !== "approved"/);
  assert.doesNotMatch(bootstrap, /INSERT INTO fatedrop_admin_roles/);
  assert.doesNotMatch(bootstrap, /INSERT INTO fatedrop_beta_access/);
});

test("one-shot ledger guard runs before account mutation and marker is written only after verification", () => {
  const ledgerRead = position(bootstrap, /WHERE migration_id=\$\{TEMP_OWNER_BOOTSTRAP_ID\}/, "ledger guard");
  const userInsert = position(bootstrap, /INSERT INTO fatedrop_users/, "user insert");
  const verification = position(bootstrap, /Temporary FateDrop Owner bootstrap verification failed/, "verification");
  const ledgerWrite = position(bootstrap, /INSERT INTO fatedrop_schema_migrations/, "ledger marker write");
  assert.ok(ledgerRead < userInsert);
  assert.ok(userInsert < verification);
  assert.ok(verification < ledgerWrite);
  assert.match(bootstrap, /alreadyApplied: true/);
});

test("authenticated production gate runs canonical migrations before the temporary Owner bootstrap", () => {
  const canonical = position(route, /ensureCanonicalOwnerBootstrapAccount\(\)/, "canonical Owner bootstrap");
  const migrations = position(route, /runProductionMigrations\(\)/, "canonical migrations");
  const temporary = position(route, /ensureTemporaryOwnerBootstrap\(\)/, "temporary Owner bootstrap");
  assert.ok(canonical < migrations && migrations < temporary);
  assert.match(route, /FATEDROP_PUSH_CRON_SECRET/);
  assert.match(route, /temporaryOwnerBootstrap/);
});
