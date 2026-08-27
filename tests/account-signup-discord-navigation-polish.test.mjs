import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("FateDrop ID registration requires password confirmation and Terms/Privacy acceptance", () => {
  const form = read("components/account-auth-form.tsx");
  const route = read("app/api/auth/register/route.ts");

  assert.match(form, /name="confirmPassword"/);
  assert.match(form, /name="acceptTerms"/);
  assert.match(form, /href="\/terms"/);
  assert.match(form, /href="\/privacy"/);
  assert.match(form, /safeNextPath/);
  assert.match(route, /confirmPassword/);
  assert.match(route, /acceptTerms/);
  assert.match(route, /Passwords do not match/);
});

test("Discord is only persisted after confirmed guild membership", () => {
  const callback = read("app/api/discord/callback/route.ts");
  const joinIndex = callback.indexOf("await ensureDiscordGuildMember(identity.id, token.access_token)");
  const saveIndex = callback.indexOf("await saveDiscordLink({");

  assert.ok(joinIndex >= 0, "Discord guild join must be attempted");
  assert.ok(saveIndex >= 0, "Discord link must still be persisted after a successful join");
  assert.ok(joinIndex < saveIndex, "guild membership must succeed before FateDrop stores the Discord link");
  assert.match(callback, /if \(!guild\.joined\) return Response\.redirect\(new URL\("\/account\?discord=join-error"/);
});

test("Collector beta handoff clearly creates a separate FateDrop ID afterwards", () => {
  const betaForm = read("components/beta-form.tsx");

  assert.match(betaForm, /does not create your FateDrop ID/);
  assert.match(betaForm, /Create your FateDrop ID/);
  assert.match(betaForm, /href="\/account\/register"/);
});

test("Events lives in dashboard navigation rather than the public top navigation", () => {
  const publicNav = read("components/nav.tsx");
  const dashboardNav = read("components/dashboard-nav.tsx");
  const dashboardEvents = read("app/dashboard/events/page.tsx");

  assert.match(publicNav, /filter\(\(item\) => item\.href !== "\/events"\)/);
  assert.match(dashboardNav, /"Events", "\/dashboard\/events"/);
  assert.match(dashboardEvents, /DashboardPageShell title="Events"/);
});
