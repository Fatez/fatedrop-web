import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/app-beta/page.tsx", import.meta.url), "utf8");
const registerPage = fs.readFileSync(new URL("../app/account/register/page.tsx", import.meta.url), "utf8");
const authForm = fs.readFileSync(new URL("../components/account-auth-form.tsx", import.meta.url), "utf8");
const pendingPage = fs.readFileSync(new URL("../app/beta-pending/page.tsx", import.meta.url), "utf8");

test("legacy App Beta URL redirects to the one canonical closed beta request", () => {
  assert.match(page, /redirect\("\/account\/register"\)/);
  assert.doesNotMatch(page, /AppBetaForm|\/api\/leads|app-beta-page\.module\.css/);
});

test("closed beta registration creates one FateDrop ID for Web and App", () => {
  assert.match(registerPage, /FATEDROP CLOSED BETA/);
  assert.match(registerPage, /One request/);
  assert.match(registerPage, /no separate App Beta signup/i);
  assert.match(registerPage, /One approval unlocks Web \+ App/);
  assert.match(authForm, /Request closed beta access/);
  assert.match(authForm, /router\.push\("\/beta-pending"\)/);
});

test("pending copy keeps Web and App under the same canonical approval", () => {
  assert.match(pendingPage, /same ID unlocks the FateDrop Web dashboard and App/);
  assert.match(pendingPage, /Web \+ App together/);
  assert.match(pendingPage, /only one closed-beta request/);
  assert.match(pendingPage, /install link or paid membership does not bypass account approval/);
});
