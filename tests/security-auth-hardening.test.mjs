import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { authClientAddress, checkAuthRateLimit, resetAuthRateLimitsForTest } from "../lib/auth-abuse.ts";

function authRequest(ip, extraHeaders = {}) {
  return new Request("https://fatedrop.co.uk/api/auth/login", {
    method: "POST",
    headers: { "cf-connecting-ip": ip, ...extraHeaders },
  });
}

test("login attempts are blocked after the bounded per-client budget", () => {
  resetAuthRateLimitsForTest();
  const request = authRequest("203.0.113.10");
  for (let index = 0; index < 30; index += 1) {
    assert.equal(checkAuthRateLimit(request, "login", 1_000).allowed, true);
  }
  const blocked = checkAuthRateLimit(request, "login", 1_000);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfterSeconds > 0);
});

test("registration has a tighter abuse budget than login", () => {
  resetAuthRateLimitsForTest();
  const request = authRequest("203.0.113.11");
  for (let index = 0; index < 10; index += 1) {
    assert.equal(checkAuthRateLimit(request, "register", 1_000).allowed, true);
  }
  assert.equal(checkAuthRateLimit(request, "register", 1_000).allowed, false);
});

test("Cloudflare connecting IP is preferred over spoofable proxy fallbacks", () => {
  const request = authRequest("203.0.113.12", { "x-forwarded-for": "198.51.100.50" });
  assert.equal(authClientAddress(request), "203.0.113.12");
});

test("login performs password verification even when the email is unknown", async () => {
  const source = await readFile(new URL("../app/api/auth/login/route.ts", import.meta.url), "utf8");
  assert.match(source, /DUMMY_PASSWORD_HASH/);
  assert.match(source, /verifyPassword\(password, account\?\.passwordHash \|\| DUMMY_PASSWORD_HASH\)/);
  assert.match(source, /checkAuthRateLimit\(request, "login"\)/);
});

test("registration does not return the underlying account conflict detail", async () => {
  const source = await readFile(new URL("../app/api/auth/register/route.ts", import.meta.url), "utf8");
  assert.match(source, /checkAuthRateLimit\(request, "register"\)/);
  assert.doesNotMatch(source, /Response\.json\(\{ error: error\.message \}/);
  assert.match(source, /An account could not be created with those details\./);
});
