import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const account = read("app/account/page.tsx");
const hub = read("components/closed-beta-access-hub.tsx");
const distribution = read("lib/beta-distribution.ts");
const ownerAccess = read("lib/owner-access.ts");
const envExample = read(".env.example");

test("approved FateDrop ID owns the Web and App handoff", () => {
  assert.match(account, /betaAccessIsApproved\(snapshot\.betaAccess\)/);
  assert.match(account, /ClosedBetaAccessHub/);
  assert.match(hub, /Open Web Dashboard/);
  assert.match(hub, /Install on iPhone/);
  assert.match(hub, /Install on Android/);
  assert.match(hub, /approved \? <div className="fd-beta-destinations">/);
  assert.match(hub, /Locked until approval/);
});

test("beta install URLs are server-controlled and reject unsafe schemes", () => {
  assert.match(distribution, /process\.env\.FATEDROP_IOS_BETA_URL/);
  assert.match(distribution, /process\.env\.FATEDROP_ANDROID_BETA_URL/);
  assert.match(distribution, /url\.protocol !== "https:"/);
  assert.match(distribution, /url\.username \|\| url\.password/);
  assert.doesNotMatch(distribution, /NEXT_PUBLIC/);
  assert.match(envExample, /FATEDROP_IOS_BETA_URL/);
  assert.match(envExample, /FATEDROP_ANDROID_BETA_URL/);
});

test("Owner gets a canonical pending-request badge and admin link", () => {
  assert.match(account, /getOwnerRole\(snapshot\.account\.id\)/);
  assert.match(account, /countPendingBetaRequestsForOwner/);
  assert.match(ownerAccess, /WHERE status = 'pending'/);
  assert.match(hub, /href="\/admin\/beta"/);
  assert.match(hub, /pendingCount > 0/);
});

test("pending account does not get an active dashboard shortcut", () => {
  assert.match(account, /betaApproved \? <Link className="button button-primary" href="\/dashboard"/);
  assert.match(account, /href="\/beta-pending">View beta status/);
});
