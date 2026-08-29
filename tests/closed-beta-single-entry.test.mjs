import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const registerPage = read("app/account/register/page.tsx");
const appBetaPage = read("app/app-beta/page.tsx");
const authForm = read("components/account-auth-form.tsx");
const pendingPage = read("app/beta-pending/page.tsx");

test("closed beta has one user-facing application path", () => {
  assert.match(registerPage, /Request FateDrop Closed Beta Access/);
  assert.match(registerPage, /There is no separate App Beta signup and no second account to create/);
  assert.match(registerPage, /One approval unlocks Web \+ App/);
  assert.match(authForm, /Request closed beta access/);
  assert.match(appBetaPage, /redirect\("\/account\/register"\)/);
  assert.doesNotMatch(appBetaPage, /AppBetaForm/);
});

test("pending state explains one canonical approval for Web and App", () => {
  assert.match(pendingPage, /same ID unlocks the FateDrop Web dashboard and App/);
  assert.match(pendingPage, /There is only one closed-beta request/);
  assert.doesNotMatch(pendingPage, /beta signup form/);
});
