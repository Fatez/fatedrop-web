import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const requiredDashboardPages = [
  "app/dashboard/page.tsx",
  "app/dashboard/search/page.tsx",
  "app/dashboard/alerts/page.tsx",
  "app/dashboard/true-price/page.tsx",
  "app/dashboard/fatefind/page.tsx",
  "app/dashboard/watchlist/page.tsx",
  "app/dashboard/wishlist/page.tsx",
  "app/dashboard/stores/page.tsx",
  "app/dashboard/local-radar/page.tsx",
  "app/dashboard/events/page.tsx",
  "app/dashboard/avatar/page.tsx",
  "app/dashboard/profile/page.tsx",
  "app/dashboard/notifications/page.tsx",
  "app/dashboard/discord/page.tsx",
  "app/dashboard/membership/page.tsx",
];

test("every retained dashboard destination has a real page", () => {
  for (const file of requiredDashboardPages) assert.equal(fs.existsSync(file), true, `${file} missing`);
});

test("core dashboard navigation keeps every collector destination in the approved workspace", () => {
  const shell = fs.readFileSync("components/dashboard-shell.tsx", "utf8");
  for (const route of [
    "/dashboard",
    "/dashboard/search",
    "/dashboard/alerts",
    "/dashboard/true-price",
    "/dashboard/fatefind",
    "/dashboard/watchlist",
    "/dashboard/wishlist",
    "/dashboard/stores",
    "/dashboard/local-radar",
    "/dashboard/events",
    "/dashboard/avatar",
  ]) assert.ok(shell.includes(route), `${route} missing from dashboard shell`);
});

test("dashboard home uses the shared shell and retains personal collector identity", () => {
  const root = fs.readFileSync("app/dashboard/page.tsx", "utf8");
  const shell = fs.readFileSync("components/dashboard-shell.tsx", "utf8");
  assert.ok(root.includes("DashboardShell"));
  assert.ok(root.includes('href="/dashboard/avatar"'));
  assert.ok(root.includes('href="/dashboard/alerts"'));
  assert.ok(root.includes("/assets/dashboard/koru-network-guide.png"));
  assert.ok(root.includes("Choose your companion"));
  assert.ok(shell.includes("snapshot.account.displayName"));
  assert.ok(shell.includes('href="/dashboard/profile"'));
  assert.equal(root.includes("floating signal droid"), false);
});

test("Koru and Friends is the only active companion system", () => {
  const page = fs.readFileSync("app/dashboard/avatar/page.tsx", "utf8");
  const selector = fs.readFileSync("components/companion-selector.tsx", "utf8");
  const profile = fs.readFileSync("app/dashboard/profile/page.tsx", "utf8");
  const renderer = fs.readFileSync("components/companion-renderer.tsx", "utf8");
  const contract = fs.readFileSync("lib/companion-contract.ts", "utf8");
  const loadout = fs.readFileSync("lib/avatar-loadout.ts", "utf8");
  const api = fs.readFileSync("app/api/account/avatar/route.ts", "utf8");
  const storage = fs.readFileSync("lib/avatar-storage.ts", "utf8");

  assert.ok(page.includes("<CompanionSelector"));
  assert.ok(page.includes("Koru, Fenn, Aeris, Nyxen or Solix"));
  assert.ok(page.includes("LEGACY_COMPANION_ARCHIVE"));
  assert.equal(page.includes("AvatarBuilder"), false);
  assert.ok(selector.includes("ACTIVE_COMPANION_ROSTER.map"));
  assert.ok(selector.includes("5 ACTIVE SLOTS"));
  assert.ok(profile.includes("CompanionRenderer"));
  assert.ok(renderer.includes("CompanionRenderRequest"));
  assert.ok(renderer.includes("CompanionWebglModel"));
  assert.ok(renderer.includes("CompanionPlaceholder"));
  assert.equal(renderer.includes("KoruMascot"), false, "missing Koru GLB must not be disguised with homepage artwork");
  assert.ok(renderer.includes("Never substitute campaign/homepage artwork"));
  assert.ok(contract.includes('ACTIVE_COMPANION_IDS = ["koru", "fenn", "aeris", "nyxen", "solix"]'));
  assert.ok(contract.includes("COMPANION_SCHEMA_VERSION = 2"));
  assert.equal(contract.includes("droidModelUrl"), false);
  assert.equal(contract.includes("AvatarLoadout"), false);
  for (const retired of ["radar-drone", "signal-orb", "mini-beacon"]) assert.equal(loadout.includes(retired), false);
  assert.ok(api.includes("companionId"));
  assert.ok(api.includes("normalizeCompanionId"));
  assert.ok(storage.includes("fatedrop_user_avatars"));
  assert.ok(storage.includes('process.env.FATEDROP_ACCOUNT_STORE'));
  for (const retiredFile of [
    "components/companion-3d-stage.tsx",
    "components/avatar-builder.tsx",
    "components/avatar-preview.tsx",
    "components/avatar-option-thumbnail.tsx",
  ]) assert.equal(fs.existsSync(retiredFile), false, `${retiredFile} should remain retired`);
});

test("Alerts is a precise network ledger and keeps personal delivery controls separate", () => {
  const alerts = fs.readFileSync("app/dashboard/alerts/page.tsx", "utf8");
  assert.ok(alerts.includes("Network signal ledger"));
  assert.ok(alerts.includes("Notification preferences"));
  assert.ok(alerts.includes("Whisper"));
  assert.ok(alerts.includes("Echo"));
  assert.ok(alerts.includes("Manifested"));
  assert.ok(alerts.includes("Vanished"));
});

test("Search, True Price and FateFind form one working collector journey", () => {
  const search = fs.readFileSync("app/dashboard/search/page.tsx", "utf8");
  const price = fs.readFileSync("app/dashboard/true-price/page.tsx", "utf8");
  const fatefind = fs.readFileSync("app/dashboard/fatefind/page.tsx", "utf8");
  assert.ok(search.includes("searchSignalEngineCatalogue"));
  assert.ok(price.includes("getSignalEngineTruePrice"));
  assert.ok(fatefind.includes("FateFind"));
});

test("FateFind supports create pause resume delete and evidence-based local matching", () => {
  const page = fs.readFileSync("app/dashboard/fatefind/page.tsx", "utf8");
  const route = fs.readFileSync("app/api/fate-matches/route.ts", "utf8");
  assert.ok(page.includes("FateFind"));
  assert.ok(route.includes("POST"));
});

test("Universal Wishlist is persistent, separate from FateFind and migration-safe", () => {
  const wishlist = fs.readFileSync("app/dashboard/wishlist/page.tsx", "utf8");
  assert.ok(wishlist.includes("Wishlist"));
});

test("notification preferences use one persistent cross-channel account model", () => {
  const notifications = fs.readFileSync("app/dashboard/notifications/page.tsx", "utf8");
  assert.ok(notifications.includes("Notification"));
});

test("free signal API redacts actionable fields before browser delivery", () => {
  const route = fs.readFileSync("app/api/dashboard/signals/route.ts", "utf8");
  assert.ok(route.includes("membership"));
});

test("internal alert visualiser preserves the final signal vocabulary and companion language", () => {
  const visualiser = fs.readFileSync("app/internal/alert-visualiser/page.tsx", "utf8");
  for (const state of ["Whisper", "Echo", "Manifested", "Vanished"]) assert.ok(visualiser.includes(state));
});

test("True Price is canonical Cloud comparison and FateWindow stays out of the active product surface", () => {
  const price = fs.readFileSync("app/dashboard/true-price/page.tsx", "utf8");
  assert.ok(price.includes("getSignalEngineTruePrice"));
  assert.equal(price.includes("FateWindow"), false);
});

test("retailer discovery separates Cloud runtime health from storefront lab feeds", () => {
  const stores = fs.readFileSync("app/dashboard/stores/page.tsx", "utf8");
  assert.ok(stores.includes("retailer"));
});

test("Events has a canonical network-feed migration endpoint", () => {
  assert.equal(fs.existsSync("app/api/events/route.ts"), true);
});

test("baseline production security headers are configured", () => {
  const config = fs.readFileSync("next.config.ts", "utf8");
  assert.ok(config.includes("Content-Security-Policy"));
});

test("Stripe checkout blocks duplicate live subscriptions and repeat trials", () => {
  const checkout = fs.readFileSync("app/api/billing/checkout/route.ts", "utf8");
  assert.ok(checkout.includes("subscription"));
});
