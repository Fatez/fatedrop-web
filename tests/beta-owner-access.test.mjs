import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const ownerAccess = read("lib/owner-access.ts");
const productionMigrations = read("lib/production-migrations.ts");
const ownerSql = read("database/2026-08-29-beta-owner-access.sql");
const repairSql = read("database/2026-08-29-beta-access-function-ambiguity-repair.sql");
const closedBetaSql = read("database/2026-08-29-closed-beta-access.sql");
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

test("hello owner bootstrap is registered in the one canonical production migration runner", () => {
  assert.match(productionMigrations, /2026-08-29-beta-owner-access\.sql/);
  assert.match(productionMigrations, /OWNER_EMAIL = "hello@fatedrop\.co\.uk"/);
  assert.match(productionMigrations, /ownerRows\.length !== 1/);
  assert.match(productionMigrations, /found \$\{ownerRows\.length\}/);
  assert.doesNotMatch(productionMigrations, /ownerRows\[0\][\s\S]*ownerRows\.length !== 1/);
  assert.match(productionMigrations, /fatedrop_grant_owner/);
  assert.match(productionMigrations, /migration:hello-owner-bootstrap/);
  assert.match(productionMigrations, /fatedrop_schema_migrations/);
  assert.match(productionMigrations, /beta_status/);
  assert.match(ownerSql, /exactly one canonical hello@fatedrop\.co\.uk FateDrop account/);
  assert.doesNotMatch(migrationRoute, /runOwnerProductionMigration/);
  assert.match(migrationRoute, /runProductionMigrations/);
});

test("beta access runtime ambiguity is repaired forward before owner bootstrap", () => {
  const repairId = "2026-08-29-beta-access-function-ambiguity-repair.sql";
  const ownerId = "2026-08-29-beta-owner-access.sql";
  assert.ok(productionMigrations.indexOf(repairId) > productionMigrations.indexOf("2026-08-29-closed-beta-access.sql"));
  assert.ok(productionMigrations.indexOf(repairId) < productionMigrations.indexOf(ownerId));
  assert.match(repairSql, /CREATE OR REPLACE FUNCTION fatedrop_set_beta_access/);
  assert.match(repairSql, /ON CONFLICT ON CONSTRAINT fatedrop_beta_access_pkey/);
  assert.match(productionMigrations, /ON CONFLICT ON CONSTRAINT fatedrop_beta_access_pkey/);
  assert.match(ownerSql, /ON CONFLICT ON CONSTRAINT fatedrop_admin_roles_pkey/);
  assert.match(productionMigrations, /ON CONFLICT ON CONSTRAINT fatedrop_admin_roles_pkey/);
  assert.match(closedBetaSql, /ON CONFLICT \(user_id\) DO UPDATE/);
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
