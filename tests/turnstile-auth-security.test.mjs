import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const turnstileSource = await readFile(new URL("../lib/turnstile.ts", import.meta.url), "utf8");
const formSource = await readFile(new URL("../components/account-auth-form.tsx", import.meta.url), "utf8");
const loginPageSource = await readFile(new URL("../app/account/login/page.tsx", import.meta.url), "utf8");
const registerPageSource = await readFile(new URL("../app/account/register/page.tsx", import.meta.url), "utf8");
const loginSource = await readFile(new URL("../app/api/auth/login/route.ts", import.meta.url), "utf8");
const registerSource = await readFile(new URL("../app/api/auth/register/route.ts", import.meta.url), "utf8");
const mobileSessionSource = await readFile(new URL("../app/api/mobile/session/route.ts", import.meta.url), "utf8");
const configSource = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");

function position(source, pattern, label) {
  const match = source.search(pattern);
  assert.notEqual(match, -1, `${label} must be present`);
  return match;
}

test("Turnstile secrets remain server-only while the public site key comes from runtime configuration", () => {
  assert.match(turnstileSource, /process\.env\.TURNSTILE_SECRET_KEY/);
  assert.doesNotMatch(formSource, /TURNSTILE_SECRET_KEY/);
  assert.match(loginPageSource, /process\.env\.TURNSTILE_SITE_KEY/);
  assert.match(registerPageSource, /process\.env\.TURNSTILE_SITE_KEY/);
  assert.match(formSource, /turnstileSiteKey/);
  assert.doesNotMatch(formSource, /NEXT_PUBLIC_TURNSTILE/);
});

test("browser login keeps existing abuse controls ahead of Turnstile and password work", () => {
  const rateLimit = position(loginSource, /checkAuthRateLimit\(request, "login"\)/, "login rate limit");
  const boundedBody = position(loginSource, /readBoundedJson\(request\)/, "bounded login body");
  const turnstile = position(loginSource, /assertTurnstile\(request, payload\.turnstileToken, "login"\)/, "login Turnstile");
  const lookup = position(loginSource, /findAccountByEmail\(email\)/, "account lookup");
  const password = position(loginSource, /verifyLoginPassword\(password, account\?\.passwordHash\)/, "dummy-scrypt login verification");
  assert.ok(rateLimit < boundedBody && boundedBody < turnstile && turnstile < lookup && lookup < password);
  assert.match(loginSource, /payload\.password\.length <= 200/);
  assert.match(loginSource, /Email or password is incorrect\./);
});

test("registration keeps the existing confirmation, consent and generic conflict safeguards", () => {
  assert.match(registerSource, /checkAuthRateLimit\(request, "register"\)/);
  assert.match(registerSource, /readBoundedJson\(request\)/);
  assert.match(registerSource, /assertTurnstile\(request, payload\.turnstileToken, "register"\)/);
  assert.match(registerSource, /confirmPassword/);
  assert.match(registerSource, /acceptTerms/);
  assert.match(registerSource, /An account could not be created with those details\./);
  assert.match(registerSource, /password\.length > 200/);
  assert.match(formSource, /name="confirmPassword"/);
  assert.match(formSource, /name="acceptTerms"/);
  assert.match(formSource, /safeNextPath/);
});

test("Turnstile validates challenge context and fails closed in production", () => {
  assert.match(turnstileSource, /if \(!secret\)/);
  assert.match(turnstileSource, /process\.env\.NODE_ENV !== "production"/);
  assert.match(turnstileSource, /throw new TurnstileUnavailableError\(\)/);
  assert.match(turnstileSource, /result\.success !== true/);
  assert.match(turnstileSource, /result\.action/);
  assert.match(turnstileSource, /result\.hostname/);
  assert.match(turnstileSource, /expectedHostname\(request\)/);
  assert.match(turnstileSource, /MAX_TOKEN_LENGTH = 2048/);
});

test("auth form sends and resets the Turnstile token and CSP allows only the official challenge origin", () => {
  assert.match(formSource, /cf-turnstile-response/);
  assert.match(formSource, /turnstileToken/);
  assert.match(formSource, /window\.turnstile\?\.reset\(\)/);
  assert.match(formSource, /https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/);
  assert.match(configSource, /script-src[^\n]*https:\/\/challenges\.cloudflare\.com/);
  assert.match(configSource, /frame-src https:\/\/challenges\.cloudflare\.com/);
});

test("native mobile bearer login is not accidentally forced through browser Turnstile", () => {
  assert.doesNotMatch(mobileSessionSource, /assertTurnstile|turnstileToken|cf-turnstile-response/i);
  assert.match(mobileSessionSource, /startApiSession\(account\.id\)/);
  assert.match(mobileSessionSource, /verifyLoginPassword\(password, account\?\.passwordHash\)/);
});
