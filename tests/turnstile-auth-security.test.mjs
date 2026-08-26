import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { assertTurnstile, TurnstileRejectedError, TurnstileUnavailableError } from "../lib/turnstile.ts";

const formSource = await readFile(new URL("../components/account-auth-form.tsx", import.meta.url), "utf8");
const loginSource = await readFile(new URL("../app/api/auth/login/route.ts", import.meta.url), "utf8");
const registerSource = await readFile(new URL("../app/api/auth/register/route.ts", import.meta.url), "utf8");
const configSource = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");

async function withTurnstileEnv(fn) {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousSecret = process.env.TURNSTILE_SECRET_KEY;
  const previousSite = process.env.NEXT_PUBLIC_SITE_URL;
  const previousFetch = globalThis.fetch;
  process.env.NODE_ENV = "production";
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  process.env.NEXT_PUBLIC_SITE_URL = "https://fatedrop.co.uk";
  try { await fn(); }
  finally {
    process.env.NODE_ENV = previousNodeEnv;
    process.env.TURNSTILE_SECRET_KEY = previousSecret;
    process.env.NEXT_PUBLIC_SITE_URL = previousSite;
    globalThis.fetch = previousFetch;
  }
}

test("Turnstile accepts only a successful matching action and hostname", async () => {
  await withTurnstileEnv(async () => {
    globalThis.fetch = async () => Response.json({ success: true, action: "login", hostname: "fatedrop.co.uk" });
    await assert.doesNotReject(assertTurnstile(new Request("https://fatedrop.co.uk/api/auth/login"), "valid-token", "login"));

    globalThis.fetch = async () => Response.json({ success: true, action: "register", hostname: "fatedrop.co.uk" });
    await assert.rejects(
      assertTurnstile(new Request("https://fatedrop.co.uk/api/auth/login"), "valid-token", "login"),
      TurnstileRejectedError,
    );
  });
});

test("Turnstile fails closed in production when its secret is missing", async () => {
  await withTurnstileEnv(async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    await assert.rejects(
      assertTurnstile(new Request("https://fatedrop.co.uk/api/auth/login"), "valid-token", "login"),
      TurnstileUnavailableError,
    );
  });
});

test("login and registration both require the browser challenge token", () => {
  assert.match(formSource, /cf-turnstile-response/);
  assert.match(formSource, /turnstileToken/);
  assert.match(loginSource, /assertTurnstile\(request, payload\.turnstileToken, "login"\)/);
  assert.match(registerSource, /assertTurnstile\(request, payload\.turnstileToken, "register"\)/);
  assert.match(configSource, /script-src[^\n]*challenges\.cloudflare\.com/);
  assert.match(configSource, /frame-src https:\/\/challenges\.cloudflare\.com/);
});
