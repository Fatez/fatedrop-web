import assert from "node:assert/strict";
import test from "node:test";

import { authClientKey, checkAuthRateLimit, isRequestTooLargeError, readBoundedJson } from "../lib/auth-abuse.ts";

function request(ip, init = {}) {
  return new Request("https://fatedrop.co.uk/api/auth/login", {
    method: "POST",
    headers: { "cf-connecting-ip": ip, ...(init.headers || {}) },
    body: init.body,
  });
}

test("login blocks the eleventh request inside a ten-minute window", () => {
  const req = request("203.0.113.11");
  for (let i = 0; i < 10; i += 1) {
    assert.equal(checkAuthRateLimit(req, "login", { now: 1_000 }).allowed, true);
  }
  const blocked = checkAuthRateLimit(req, "login", { now: 1_000 });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.limit, 10);
  assert.ok(blocked.retryAfterSeconds > 0);
});

test("registration blocks the sixth request inside an hour", () => {
  const req = request("203.0.113.12");
  for (let i = 0; i < 5; i += 1) {
    assert.equal(checkAuthRateLimit(req, "register", { now: 2_000 }).allowed, true);
  }
  assert.equal(checkAuthRateLimit(req, "register", { now: 2_000 }).allowed, false);
});

test("Cloudflare client IP takes precedence over spoofable proxy fallbacks", () => {
  const req = new Request("https://fatedrop.co.uk/api/auth/login", {
    method: "POST",
    headers: {
      "cf-connecting-ip": "198.51.100.10",
      "x-real-ip": "198.51.100.20",
      "x-forwarded-for": "198.51.100.30",
    },
  });
  assert.equal(authClientKey(req), "ip:198.51.100.10");
});

test("auth JSON bodies are capped before application processing", async () => {
  const oversized = request("203.0.113.13", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: "x".repeat(20_000) }),
  });
  await assert.rejects(() => readBoundedJson(oversized), (error) => isRequestTooLargeError(error));
});
