import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const toolGuide = read("components/dashboard-tool-guide.tsx");
const ownerAccess = read("lib/owner-access.ts");
const adminPage = read("app/admin/beta/page.tsx");

test("private beta dashboard tool is presentation-gated to the FateDrop UK operator and canonical Owner authority", () => {
  assert.match(toolGuide, /PRIVATE_BETA_OPERATOR_EMAIL = "fatedropuk@gmail\.com"/);
  assert.match(toolGuide, /snapshot\.account\.email\.trim\(\)\.toLowerCase\(\) === PRIVATE_BETA_OPERATOR_EMAIL/);
  assert.match(toolGuide, /isOwnerUser\(snapshot\.account\.id\)/);
  assert.match(toolGuide, /countPendingBetaRequestsForOwner\(snapshot\.account\.id\)/);
  assert.match(toolGuide, /href="\/admin\/beta"/);
  assert.match(toolGuide, /Beta approvals/);
});

test("dashboard convenience tool does not replace canonical admin authorization", () => {
  assert.match(ownerAccess, /WHERE user_id = \$\{cleanUserId\} AND role = 'owner'/);
  assert.match(adminPage, /isOwnerUser\(snapshot\.account\.id\)/);
  assert.match(adminPage, /notFound\(\)/);
});

test("pending count fails unknown rather than pretending unavailable storage is zero", () => {
  assert.match(toolGuide, /return \{ pending: null \}/);
  assert.match(toolGuide, /Approval queue count unavailable/);
  assert.match(toolGuide, /operator\.pending === null \? "—"/);
});
