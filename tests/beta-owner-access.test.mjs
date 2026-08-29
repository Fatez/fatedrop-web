import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const ownerAccess = read("lib/owner-access.ts");
const ownerMigration = read("lib/owner-production-migration.ts");
const ownerSql = read("database/2026-08-29-beta-owner-access.sql");
const adminApi = read("app/api/admin/beta/route.ts");
const adminPage = read("app/admin/beta/page.tsx");
const register = read("app/api/auth/register/route.ts");
const migrationRoute = read("app/api/dashboard/production-migrations/route.ts");

test("FateDrop company email namespace is reserved from public registration", () => {
  assert.match(register, /COMPANY_EMAIL_DOMAIN = "fatedrop\.co\.uk"/);
  assert.match(register, /isReservedCompanyEmail\(email\)/);
  assert.match(register, /domain === COMPANY_EMAIL_DOMAIN/);
  assert.match(register, /domain\.endsWith\(`\.\$\{COMPANY_EMAIL_DOMAIN\}`\)/);
  assert.match(register, /reserved for FateDrop operations/);
});

test("owner authority is canonical user-id state and fails closed", () => {
  assert.match(ownerAccess, /fatedrop_admin_roles/);
  assert.match(ownerAccess, /WHERE user_id = \$\{cleanUserId\} AND role = 'owner'/);
  assert.match(ownerAccess, /catch \{[\s\S]*return null/);
  assert.doesNotMatch(ownerAccess, /hello@fatedrop\.co\.uk/);
  assert.doesNotMatch(ownerAccess, /WHERE\s+lower\(email\)/i);
});

test("hello owner bootstrap is one-time production migration with exact-account verification", () => {
  assert.match(ownerMigration, /OWNER_EMAIL = "hello@fatedrop\.co\.uk"/);
  assert.match(ownerMigration, /ownerRows\.length !== 1/);
  assert.match(ownerMigration, /fatedrop_grant_owner/);
  assert.match(ownerMigration, /migration:hello-owner-bootstrap/);
  assert.match(ownerMigration, /fatedrop_schema_migrations/);
  assert.match(ownerMigration, /beta_status/);
  assert.match(ownerSql, /exactly one canonical hello@fatedrop\.co\.uk FateDrop account/);
  assert.match(migrationRoute, /runOwnerProductionMigration/);
});

test("owner-only beta console approves and revokes through audited database function", () => {
  assert.match(adminApi, /isOwnerUser\(snapshot\.account\.id\)/);
  assert.match(adminApi, /setBetaAccessAsOwner/);
  assert.match(adminApi, /assertSameOrigin/);
  assert.match(ownerAccess, /fatedrop_set_beta_access/);
  assert.match(ownerAccess, /OWNER_SELF_CHANGE_BLOCKED/);
  assert.match(adminPage, /Owner access itself cannot be changed from this console/);
  assert.match(adminPage, /BetaOwnerConsole/);
});
