import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../lib/auth-abuse.ts", import.meta.url), "utf8");

test("login and registration have explicit bounded abuse budgets", () => {
  assert.match(source, /login:\s*Object\.freeze\(\{\s*limit:\s*10,\s*windowMs:\s*10\s*\*\s*60_000\s*\}\)/);
  assert.match(source, /register:\s*Object\.freeze\(\{\s*limit:\s*5,\s*windowMs:\s*60\s*\*\s*60_000\s*\}\)/);
  assert.match(source, /DEFAULT_MAX_KEYS\s*=\s*5_000/);
});

test("Cloudflare client IP is preferred before proxy fallbacks", () => {
  const cloudflare = source.indexOf('"cf-connecting-ip"');
  const real = source.indexOf('"x-real-ip"');
  const forwarded = source.indexOf('"x-forwarded-for"');
  assert.ok(cloudflare >= 0);
  assert.ok(real > cloudflare);
  assert.ok(forwarded > real);
});

test("auth request bodies and rate-limit responses are bounded", () => {
  assert.match(source, /MAX_AUTH_BODY_BYTES\s*=\s*16_384/);
  assert.match(source, /status:\s*429/);
  assert.match(source, /"retry-after"/);
  assert.match(source, /RequestTooLargeError/);
});
