import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/app-beta/page.tsx", import.meta.url), "utf8");
const form = await readFile(new URL("../components/app-beta-form.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../app/api/app-beta/route.ts", import.meta.url), "utf8");
const storage = await readFile(new URL("../lib/app-beta-storage.ts", import.meta.url), "utf8");
const migration = await readFile(new URL("../database/2026-08-28-app-beta-leads.sql", import.meta.url), "utf8");

test("temporary App Beta journey is separate from account creation and the general beta form", () => {
  assert.match(page, /App Beta/);
  assert.match(page, /does not create an account/i);
  assert.match(page, /sign in with your FateDrop ID inside the app/i);
  assert.match(form, /fetch\("\/api\/app-beta"/);
  assert.doesNotMatch(form, /\/api\/leads/);
  assert.doesNotMatch(route, /storeLead\(/);
});

test("App Beta signup stores the minimum invite details in its own table", () => {
  assert.match(storage, /INSERT INTO app_beta_leads/);
  assert.match(storage, /data\/app-beta-leads\.ndjson/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS app_beta_leads/);
  assert.match(migration, /email text NOT NULL UNIQUE/);
  assert.match(migration, /device_type IN \('iphone', 'ipad', 'android', 'other'\)/);
  assert.doesNotMatch(migration, /REFERENCES fatedrop_users/);
});

test("App Beta API keeps the existing public-form safety boundaries", () => {
  assert.match(route, /assertSameOrigin\(request\)/);
  assert.match(route, /contentLength > 8_000/);
  assert.match(route, /companyFax/);
  assert.match(route, /contactConsent !== true/);
  assert.match(route, /validEmail/);
  assert.match(route, /DuplicateAppBetaLeadError/);
});

test("iOS beta and later Android interest are described without claiming TestFlight is already live", () => {
  assert.match(form, /iPhone — iOS beta/);
  assert.match(form, /iPad — iOS beta/);
  assert.match(form, /Android — register interest for the later beta/);
  assert.doesNotMatch(form, /current TestFlight beta/);
  assert.match(form, /install invite separately/);
});
