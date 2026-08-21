import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
const auth = readFileSync(new URL("../lib/auth.ts", import.meta.url), "utf8");
const gate = readFileSync(new URL("../docs/security-legal-release-gate.md", import.meta.url), "utf8");

test("production headers include CSP, HSTS and private route controls", () => {
  for (const header of [
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "X-Frame-Options",
    "Permissions-Policy",
    "Cross-Origin-Opener-Policy",
    "Cross-Origin-Resource-Policy",
  ]) assert.ok(config.includes(header), `${header} missing`);

  assert.ok(config.includes("frame-ancestors 'none'"));
  assert.ok(config.includes("object-src 'none'"));
  assert.equal(config.includes("'unsafe-eval'"), false);
  assert.ok(config.includes('source: "/account/:path*"'));
  assert.ok(config.includes('source: "/dashboard/:path*"'));
  assert.ok(config.includes("private, no-store, max-age=0"));
  assert.ok(config.includes("noindex, nofollow, noarchive"));
  assert.ok(config.includes('source: "/api/:path*"'));
});

test("same-origin guard rejects explicit cross-site browser mutations", () => {
  assert.ok(auth.includes('request.headers.get("sec-fetch-site")'));
  assert.ok(auth.includes('fetchSite === "cross-site"'));
  assert.ok(auth.includes('throw new Error("CROSS_ORIGIN")'));
  assert.ok(auth.includes('request.headers.get("origin")'));
  assert.ok(auth.includes("x-forwarded-host"));
});

test("security release gate keeps deployment and legal controls explicit", () => {
  assert.ok(gate.includes("Cloudflare rate limiting"));
  assert.ok(gate.includes("Turnstile"));
  assert.ok(gate.includes("UK data protection"));
  assert.ok(gate.includes("UK consumer Terms"));
  assert.ok(gate.includes("Whisper = product/catalogue movement"));
  assert.ok(gate.includes("Echo = queue/traffic/security/access readiness"));
});
