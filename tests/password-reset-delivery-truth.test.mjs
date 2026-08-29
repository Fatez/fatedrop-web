import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const reset = await readFile(new URL("../lib/password-reset.ts", import.meta.url), "utf8");
const requestRoute = await readFile(new URL("../app/api/auth/password-reset/request/route.ts", import.meta.url), "utf8");
const canaryRoute = await readFile(new URL("../app/api/dashboard/password-reset-email-canary/route.ts", import.meta.url), "utf8");

test("password reset email delivery is awaited and provider failure is never silently swallowed", () => {
  assert.match(reset, /return await emailContext\.email\.send\(/);
  assert.match(reset, /FATEDROP_PASSWORD_RESET_EMAIL_SEND_FAILED/);
  assert.doesNotMatch(reset, /\.catch\(\(\) => undefined\)/);
  assert.doesNotMatch(reset, /waitUntil\(sendPromise\)/);
});

test("public reset request awaits delivery but preserves the generic account-enumeration response", () => {
  assert.match(requestRoute, /await sendPasswordResetEmail\(emailContext, account\.email, reset\.rawToken\)/);
  assert.match(requestRoute, /If a FateDrop ID exists for that email, a password reset link has been sent\./);
  assert.match(requestRoute, /if \(!\(error instanceof PasswordResetEmailUnavailableError\)\) throw error/);
});

test("secret-only production canary exercises the same Cloudflare email binding against the temporary Owner mailbox", () => {
  assert.match(canaryRoute, /CANARY_RECIPIENT = "fatedropuk@gmail\.com"/);
  assert.match(canaryRoute, /FATEDROP_PUSH_CRON_SECRET/);
  assert.match(canaryRoute, /sendPasswordResetTransportCanary/);
  assert.match(canaryRoute, /status: 401/);
  assert.match(canaryRoute, /status: 503/);
});

test("secret-only canary preserves only sanitized Cloudflare provider codes", () => {
  assert.match(reset, /\^E_\[A-Z0-9_\]\{1,64\}\$/);
  assert.match(reset, /providerCode/);
  assert.match(canaryRoute, /providerCode/);
  assert.match(canaryRoute, /Cloudflare Email rejected or could not accept/);
  assert.doesNotMatch(canaryRoute, /error\.message/);
});
