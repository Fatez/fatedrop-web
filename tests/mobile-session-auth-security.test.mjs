import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../app/api/mobile/session/route.ts", import.meta.url), "utf8");
const abuseSource = await readFile(new URL("../lib/auth-abuse.ts", import.meta.url), "utf8");

function position(sourceText, pattern, label) {
  const index = sourceText.search(pattern);
  assert.notEqual(index, -1, `${label} must be present`);
  return index;
}

test("mobile login performs the same password verification path for absent accounts", () => {
  assert.match(source, /verifyLoginPassword\(password, account\?\.passwordHash\)/);
  assert.doesNotMatch(source, /account \? await verifyPassword/);
});

test("mobile login is rate-limited and body-bounded before account lookup or password KDF", () => {
  const limiter = position(source, /checkAuthRateLimit\(request, "mobile_login"\)/, "mobile login rate limit");
  const boundedBody = position(source, /readBoundedJson\(request\)/, "bounded mobile auth body");
  const lookup = position(source, /findAccountByEmail\(email\)/, "account lookup");
  const password = position(source, /verifyLoginPassword\(password, account\?\.passwordHash\)/, "password KDF");
  assert.ok(limiter < boundedBody && boundedBody < lookup && lookup < password);
  assert.match(source, /authRateLimitResponse\(rateLimit\)/);
  assert.match(source, /isRequestTooLargeError\(error\)/);
  assert.match(source, /status: 413/);
});

test("mobile login has an isolated bounded policy and Cloudflare client IP precedence", () => {
  assert.match(abuseSource, /type AuthAction = "login" \| "register" \| "mobile_login"/);
  assert.match(abuseSource, /mobile_login: Object\.freeze\(\{ limit: 10, windowMs: 10 \* 60_000 \}\)/);
  assert.match(abuseSource, /request\.headers\.get\("cf-connecting-ip"\)/);
  assert.match(abuseSource, /const key = `\$\{action\}:\$\{authClientKey\(request\)\}`/);
  assert.match(abuseSource, /DEFAULT_MAX_KEYS = 5_000/);
});

test("mobile login preserves bounded password work and opaque bearer-session issuance", () => {
  assert.match(source, /payload\.password\.length <= 200/);
  assert.match(source, /startApiSession\(account\.id\)/);
  assert.match(source, /sessionToken: session\.token/);
  assert.match(source, /Email or password is incorrect\./);
  assert.doesNotMatch(source, /assertTurnstile|turnstileToken|cf-turnstile-response/i);
});
