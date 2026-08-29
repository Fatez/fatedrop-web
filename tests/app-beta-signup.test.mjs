import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const closedBetaPage = fs.readFileSync(new URL("../app/closed-beta/page.tsx", import.meta.url), "utf8");
const appBetaPage = fs.readFileSync(new URL("../app/app-beta/page.tsx", import.meta.url), "utf8");
const registerPage = fs.readFileSync(new URL("../app/account/register/page.tsx", import.meta.url), "utf8");
const authForm = fs.readFileSync(new URL("../components/account-auth-form.tsx", import.meta.url), "utf8");
const registerRoute = fs.readFileSync(new URL("../app/api/auth/register/route.ts", import.meta.url), "utf8");
const pendingPage = fs.readFileSync(new URL("../app/beta-pending/page.tsx", import.meta.url), "utf8");
const home = fs.readFileSync(new URL("../components/koru-home-reference.tsx", import.meta.url), "utf8");
const nav = fs.readFileSync(new URL("../components/nav.tsx", import.meta.url), "utf8");

test("closed beta hub is the one public collector entry", () => {
  assert.match(closedBetaPage, /FATEDROP CLOSED BETA/);
  assert.match(closedBetaPage, /AccountAuthForm mode="register"/);
  assert.match(closedBetaPage, /Web \+ App unlock together/);
  assert.match(appBetaPage, /redirect\("\/closed-beta"\)/);
  assert.match(registerPage, /redirect\("\/closed-beta"\)/);
  assert.match(home, /href="\/closed-beta"/);
  assert.match(nav, /href="\/closed-beta"/);
  assert.doesNotMatch(nav, /Create FateDrop ID|Join App Beta/);
});

test("beta request creates real sign-in credentials and canonical Pending access", () => {
  assert.match(authForm, /name="email"/);
  assert.match(authForm, /name="password"/);
  assert.match(authForm, /name="confirmPassword"/);
  assert.match(authForm, /Request closed beta access/);
  assert.doesNotMatch(authForm, /name="displayName"/);
  assert.match(registerRoute, /hashPassword\(password\)/);
  assert.match(registerRoute, /startSession\(account\.id\)/);
  assert.match(registerRoute, /betaAccess: \{ status: "pending", approved: false \}/);
  assert.match(registerRoute, /accessAllowed: false/);
});

test("pending state makes clear the same account will unlock Web and App", () => {
  assert.match(pendingPage, /account and sign-in are ready/i);
  assert.match(pendingPage, /same account unlocks the FateDrop Web dashboard and mobile App/i);
  assert.match(pendingPage, /You do not need to sign up again/i);
  assert.doesNotMatch(pendingPage, /View my FateDrop ID/);
});
