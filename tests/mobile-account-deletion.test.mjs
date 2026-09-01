import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeSource = await readFile(new URL("../app/api/mobile/account/deletion-request/route.ts", import.meta.url), "utf8");
const storageSource = await readFile(new URL("../lib/account-deletion.ts", import.meta.url), "utf8");
const migrationSource = await readFile(new URL("../database/2026-09-01-account-deletion-requests.sql", import.meta.url), "utf8");

test("mobile account deletion is authenticated but does not require beta approval", () => {
  assert.match(routeSource, /getSnapshotForRequest\(request, \{ allowPending: true \}\)/);
  assert.match(routeSource, /status: 401/);
  assert.doesNotMatch(routeSource, /betaAccessIsApproved|accessAllowed|capabilitiesForMembership/);
});

test("mobile account deletion derives the user server-side and accepts no user identity body", () => {
  assert.match(routeSource, /requestAccountDeletion\(snapshot\.account\.id, "mobile_app"\)/);
  assert.doesNotMatch(routeSource, /request\.json\(|readBoundedJson|userId\s*=/);
  assert.match(routeSource, /status: 202/);
  assert.match(routeSource, /accepted: true/);
});

test("deletion requests are idempotent for pending or processing accounts", () => {
  assert.match(storageSource, /ON CONFLICT \(user_id\) DO UPDATE SET/);
  assert.match(storageSource, /status IN \('pending','processing'\)/);
  assert.match(storageSource, /THEN fatedrop_account_deletion_requests\.requested_at/);
  assert.match(storageSource, /RETURNING user_id,status,source,requested_at,updated_at/);
});

test("deletion request schema is user-bound and removed with the deleted account", () => {
  assert.match(migrationSource, /user_id text PRIMARY KEY REFERENCES fatedrop_users\(id\) ON DELETE CASCADE/);
  assert.match(migrationSource, /CHECK \(status IN \('pending', 'processing', 'cancelled'\)\)/);
  assert.match(migrationSource, /status, requested_at ASC/);
});
