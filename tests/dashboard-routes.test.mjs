import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const dashboardRoutes = [
  "app/dashboard/search/page.tsx",
  "app/dashboard/alerts/page.tsx",
  "app/dashboard/watchlist/page.tsx",
  "app/dashboard/wishlist/page.tsx",
  "app/dashboard/notifications/page.tsx",
  "app/dashboard/stores/page.tsx",
  "app/dashboard/events/page.tsx",
  "app/dashboard/true-price/page.tsx",
  "app/dashboard/local-radar/page.tsx",
  "app/dashboard/profile/page.tsx",
  "app/dashboard/avatar/page.tsx",
  "app/dashboard/membership/page.tsx",
  "app/dashboard/discord/page.tsx",
];

test("every retained dashboard destination has a real page", () => {
  for (const route of dashboardRoutes) assert.equal(fs.existsSync(route), true, `${route} is missing`);
});

test("core dashboard navigation follows Discover Track Network Account structure", () => {
  const nav = fs.readFileSync("components/dashboard-nav.tsx", "utf8");
  for (const group of ["DISCOVER", "TRACK", "NETWORK", "ACCOUNT"]) assert.ok(nav.includes(group));
  for (const href of ["/dashboard/search", "/dashboard/alerts", "/dashboard/watchlist", "/dashboard/wishlist", "/dashboard/notifications", "/dashboard/stores", "/dashboard/events", "/dashboard/true-price", "/dashboard/local-radar", "/dashboard/profile", "/dashboard/avatar", "/dashboard/membership", "/dashboard/discord"]) assert.ok(nav.includes(href));
  assert.ok(nav.includes('["⌕", "Search", "/dashboard/search"]'));
  assert.ok(nav.includes('["♡", "FateFind", "/dashboard/watchlist"]'));
  assert.ok(nav.includes('["☆", "Wishlist", "/dashboard/wishlist"]'));
  assert.ok(nav.includes('["≋", "Preferences", "/dashboard/notifications"]'));
  assert.ok(nav.includes('["◇", "Koru & Friends", "/dashboard/avatar"]'));
});

test("dashboard home uses the shared shell and retains personal collector identity", () => {
  const root = fs.readFileSync("app/dashboard/page.tsx", "utf8");
  assert.ok(root.includes("DashboardPageShell"));
  assert.equal(root.includes("fd-dashboard-sidebar"), false);
  assert.ok(root.includes("MEMBER SINCE"));
  assert.ok(root.includes("TIME IN NETWORK"));
  assert.ok(root.includes('href="/dashboard/avatar"'));
  assert.ok(root.includes('href="/dashboard/search"'));
  assert.ok(root.includes("KORU &amp; FRIENDS · FIVE ACTIVE SLOTS"));
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
  assert.ok(renderer.includes("KoruMascot"));
  assert.ok(contract.includes('ACTIVE_COMPANION_IDS = ["koru", "fenn", "aeris", "nyxen", "solix"]'));
  assert.ok(contract.includes("COMPANION_SCHEMA_VERSION = 2"));
  assert.equal(contract.includes("droidModelUrl"), false);
  assert.equal(contract.includes("AvatarLoadout"), false);
  for (const retired of ["radar-drone", "signal-orb", "mini-beacon"]) assert.equal(loadout.includes(retired), false);
  assert.ok(api.includes("companionId"));
  assert.ok(api.includes("normalizeCompanionId"));
  assert.ok(storage.includes("fatedrop_user_avatars"));
  for (const retiredFile of [
    "components/companion-3d-stage.tsx",
    "components/avatar-builder.tsx",
    "components/avatar-preview.tsx",
    "components/avatar-option-thumbnail.tsx",
    "components/avatar-anime-character.tsx",
    "components/avatar-layered-character.tsx",
    "lib/avatar-assets.ts",
    "public/assets/avatar-v2/avatar-sprites.svg",
    "public/assets/companions/fatedrop-male.glb",
    "public/assets/companions/fatedrop-droid.glb",
  ]) assert.equal(fs.existsSync(retiredFile), false, `${retiredFile} should remain retired`);
});

test("Alerts is personal and links to shared notification preferences", () => {
  const alerts = fs.readFileSync("app/dashboard/alerts/page.tsx", "utf8");
  assert.ok(alerts.includes("YOUR HUNTS · YOUR NOTIFICATIONS"));
  assert.ok(alerts.includes("ACTIVE FATEFINDS"));
  assert.ok(alerts.includes("YOUR NOTIFICATION / HUNT HISTORY"));
  assert.ok(alerts.includes('/dashboard/notifications'));
  assert.ok(alerts.includes("one account-level persistence model"));
  assert.equal(alerts.includes("<LiveAlertFeed"), false);
  assert.ok(alerts.includes("Open Network Activity"));
});

test("Universal Wishlist is persistent, separate from FateFind and migration-safe", () => {
  const page = fs.readFileSync("app/dashboard/wishlist/page.tsx", "utf8");
  const api = fs.readFileSync("app/api/wishlist/route.ts", "utf8");
  const storage = fs.readFileSync("lib/wishlist-storage.ts", "utf8");
  const migration = fs.readFileSync("database/2026-08-19-user-preferences.sql", "utf8");
  assert.ok(page.includes("Wishlist means “I want this.”"));
  assert.ok(page.includes("FateFind means “go hunt this for me.”"));
  assert.ok(api.includes("assertSameOrigin"));
  assert.ok(storage.includes("fatedrop_wishlist_items"));
  assert.ok(migration.includes("CREATE TABLE IF NOT EXISTS fatedrop_wishlist_items"));
});

test("notification preferences use one persistent cross-channel account model", () => {
  const page = fs.readFileSync("app/dashboard/notifications/page.tsx", "utf8");
  const api = fs.readFileSync("app/api/notification-preferences/route.ts", "utf8");
  const storage = fs.readFileSync("lib/notification-preferences.ts", "utf8");
  const migration = fs.readFileSync("database/2026-08-19-user-preferences.sql", "utf8");
  assert.ok(page.includes("ONE PROFILE · EVERY CHANNEL"));
  assert.ok(api.includes("assertSameOrigin"));
  assert.ok(storage.includes("fatedrop_notification_preferences"));
  for (const signal of ["whisper", "echo", "manifested", "vanished", "priceChange", "fateMatch"]) assert.ok(storage.includes(signal));
  assert.ok(migration.includes("CREATE TABLE IF NOT EXISTS fatedrop_notification_preferences"));
});

test("free signal API redacts actionable fields before browser delivery", () => {
  const api = fs.readFileSync("app/api/dashboard/signals/route.ts", "utf8");
  assert.ok(api.includes('"Premium signal detail"'));
  assert.ok(api.includes('"Major network movement detected"'));
  assert.ok(api.includes("retailer: null"));
  assert.ok(api.includes("detail: null"));
  assert.ok(api.includes("confidence: null"));
  assert.ok(api.includes("deliveredPricePence: null"));
  assert.ok(api.includes('"Cache-Control": "private, no-store, max-age=0"'));
});

test("internal alert visualiser preserves the final signal vocabulary and companion language", () => {
  const feed = fs.readFileSync("components/live-alert-feed.tsx", "utf8");
  assert.ok(feed.includes('whisper: { label: "WHISPER"'));
  assert.ok(feed.includes('echo: { label: "ECHO"'));
  assert.ok(feed.includes('queue: { label: "ECHO"'));
  assert.ok(feed.includes('security: { label: "ECHO"'));
  assert.ok(feed.includes('drop_pulse: { label: "DROP PULSE"'));
  assert.ok(feed.includes('state: "echo"'));
  assert.equal(feed.includes('whisper: { label: "ECHO"'), false);
  assert.equal(feed.includes('echo: { label: "MANIFESTED"'), false);
  assert.ok(feed.includes("TEST COMPANION SURGE"));
  assert.ok(feed.includes("TEST PRODUCT SIGNAL"));
  assert.ok(feed.includes("Your selected Koru &amp; Friends companion remains on watch"));
  assert.equal(feed.includes("TEST AVATAR SURGE"), false);
});

test("True Price is canonical Cloud comparison and FateWindow is held", () => {
  const page = fs.readFileSync("app/dashboard/true-price/page.tsx", "utf8");
  const client = fs.readFileSync("lib/signal-engine-client.ts", "utf8");
  assert.ok(page.includes("searchSignalTruePrice"));
  assert.ok(page.includes("FATEWINDOW · HOLD / EXPERIMENTAL"));
  assert.ok(page.includes("CREATE FATEFIND"));
  assert.ok(client.includes('"/api/true-price"'));
});

test("retailer discovery separates Cloud runtime health from storefront lab feeds", () => {
  const stores = fs.readFileSync("app/dashboard/stores/page.tsx", "utf8");
  const network = fs.readFileSync("lib/retailer-network.ts", "utf8");
  const registry = fs.readFileSync("lib/retailer-registry.ts", "utf8");
  assert.ok(stores.includes("CANONICAL CLOUD RETAILERS"));
  assert.ok(stores.includes("EXPERIMENTAL STOREFRONT LAB"));
  assert.ok(network.includes("getSignalEngineStatus"));
  assert.ok(registry.includes("cloudRetailerId"));
  assert.ok(registry.includes('cloudRetailerId: "smyths-uk"'));
});

test("Events has a canonical network-feed migration endpoint", () => {
  const eventsApi = fs.readFileSync("app/api/events/route.ts", "utf8");
  assert.ok(eventsApi.includes("getLatestNetworkMetricSnapshot"));
  assert.ok(eventsApi.includes('status: snapshot ? "network" : "awaiting-network-feed"'));
  assert.ok(eventsApi.includes("upcomingEvents"));
});

test("baseline production security headers are configured", () => {
  const config = fs.readFileSync("next.config.ts", "utf8");
  for (const header of ["X-Content-Type-Options", "Referrer-Policy", "X-Frame-Options", "Permissions-Policy"]) assert.ok(config.includes(header));
});

test("Stripe checkout blocks duplicate live subscriptions and repeat trials", () => {
  const checkout = fs.readFileSync("app/api/billing/checkout/route.ts", "utf8");
  const billing = fs.readFileSync("lib/billing.ts", "utf8");
  assert.ok(checkout.includes('snapshot.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled"'));
  assert.ok(checkout.includes("trialEligible = !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt"));
  assert.ok(billing.includes("if (input.trialEligible)"));
});
