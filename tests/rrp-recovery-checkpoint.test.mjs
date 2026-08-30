import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const route = fs.readFileSync(new URL("../app/api/dashboard/rrp-recovery-checkpoint/route.ts", import.meta.url), "utf8");

test("RRP recovery checkpoint is protected and snapshots canonical identity RRP fields", () => {
  assert.match(route, /export async function POST\(request: Request\)/);
  assert.match(route, /FATEDROP_RRP_AUDIT_SECRET/);
  assert.match(route, /status: 401/);
  assert.match(route, /pre-rrp-2026-08-30-1514/);
  assert.match(route, /CREATE TABLE IF NOT EXISTS fatedrop_rrp_recovery_snapshots/);
  assert.match(route, /INSERT INTO fatedrop_rrp_recovery_snapshots/);
  assert.match(route, /FROM fatedrop_product_identities/);
  assert.match(route, /official_rrp_pence/);
  assert.match(route, /rrp_source/);
  assert.match(route, /rrp_verified_at/);
  assert.match(route, /ON CONFLICT \(checkpoint_id, product_identity_id\) DO NOTHING/);
});

test("RRP recovery checkpoint never mutates canonical product identities", () => {
  assert.doesNotMatch(route, /UPDATE\s+fatedrop_product_identities/i);
  assert.doesNotMatch(route, /DELETE\s+FROM\s+fatedrop_product_identities/i);
  assert.doesNotMatch(route, /ALTER\s+TABLE\s+fatedrop_product_identities/i);
  assert.doesNotMatch(route, /INSERT\s+INTO\s+fatedrop_product_identities/i);
});

test("RRP recovery checkpoint proves one complete capture before accepting", () => {
  assert.match(route, /snapshotCount > 0/);
  assert.match(route, /snapshotCount === expectedIdentityCount/);
  assert.match(route, /captureVersions === 1/);
  assert.match(route, /complete \? 200 : 503/);
});
