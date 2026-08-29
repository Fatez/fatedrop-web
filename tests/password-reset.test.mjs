import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const loginPage = read("app/account/login/page.tsx");
const requestPage = read("app/account/forgot-password/page.tsx");
const resetPage = read("app/account/reset-password/page.tsx");
const requestRoute = read("app/api/auth/password-reset/request/route.ts");
const confirmRoute = read("app/api/auth/password-reset/confirm/route.ts");
const resetService = read("lib/password-reset.ts");
const resetMigration = read("database/2026-08-29-password-reset.sql");
const migrations = read("lib/production-migrations.ts");
const abuse = read("lib/auth-abuse.ts");
const turnstile = read("lib/turnstile.ts");
const wrangler = read("wrangler.jsonc");

test("sign in exposes one first-party forgot-password recovery path", () => {
  assert.match(loginPage, /\/account\/forgot-password/);
  assert.match(requestPage, /PasswordResetRequestForm/);
  assert.match(resetPage, /PasswordResetForm/);
  assert.doesNotMatch(loginPage, /resend\.com|sendgrid|postmark/i);
});

test("reset requests are bounded, Turnstile protected and do not disclose account existence", () => {
  assert.match(requestRoute, /checkAuthRateLimit\(request, "password_reset_request"\)/);
  assert.match(requestRoute, /assertTurnstile\(request, payload\.turnstileToken, "password_reset_request"\)/);
  assert.match(requestRoute, /assertSameOrigin\(request\)/);
  assert.match(requestRoute, /If a FateDrop ID exists for that email/);
  assert.match(requestRoute, /queuePasswordResetEmail\(emailContext, account\.email, reset\.rawToken\)/);
  assert.doesNotMatch(requestRoute, /queuePasswordResetEmail\(emailContext, email,/);
  assert.match(abuse, /password_reset_request: Object\.freeze\(\{ limit: 5, windowMs: 60 \* 60_000 \}\)/);
  assert.match(turnstile, /"password_reset_request"/);
});

test("reset tokens are high entropy, hashed at rest, short lived and supersede older links", () => {
  assert.match(resetService, /randomBytes\(32\)\.toString\("base64url"\)/);
  assert.match(resetService, /createHash\("sha256"\)/);
  assert.match(resetService, /const RESET_TTL_SECONDS = 30 \* 60/);
  assert.match(resetService, /UPDATE fatedrop_password_reset_tokens[\s\S]*consumed_at = \$\{now\}[\s\S]*WHERE user_id = \$\{userId\}/);
  assert.match(resetService, /INSERT INTO fatedrop_password_reset_tokens \(token_hash/);
  assert.doesNotMatch(resetMigration, /raw_token|reset_token text/i);
});

test("reset completion atomically changes the password and invalidates every prior session", () => {
  assert.match(confirmRoute, /checkAuthRateLimit\(request, "password_reset_complete"\)/);
  assert.match(confirmRoute, /hashPassword\(password\)/);
  assert.match(confirmRoute, /completePasswordReset/);
  assert.match(resetMigration, /FOR UPDATE/);
  assert.match(resetMigration, /SET password_hash = p_password_hash/);
  assert.match(resetMigration, /DELETE FROM fatedrop_sessions/);
  assert.match(resetMigration, /SET consumed_at = v_now/);
  assert.match(turnstile, /"password_reset_complete"/);
});

test("password reset migration is canonical and Cloudflare Email Service is the outbound boundary", () => {
  assert.match(migrations, /2026-08-29-password-reset\.sql/);
  assert.match(wrangler, /"send_email"/);
  assert.match(wrangler, /"name": "EMAIL"/);
  assert.match(resetService, /getCloudflareContext/);
  assert.match(resetService, /hello@fatedrop\.co\.uk/);
  assert.match(resetService, /to: recipient/);
  assert.match(resetService, /This link expires in 30 minutes/);
});
