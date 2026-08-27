import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const dashboardRoutes = [
  "app/dashboard/search/page.tsx",
  "app/dashboard/alerts/page.tsx",
  "app/dashboard/fatefind/page.tsx",
  "app/dashboard/watchlist/page.tsx",
  "app/dashboard/wishlist/page.tsx",
  "app/dashboard/notifications/page.tsx",
  "app/dashboard/network/page.tsx",
  "app/dashboard/stores/page.tsx",
  "app/dashboard/indie/page.tsx",
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

test("core dashboard navigation keeps every collector destination in the approved workspace", () => {
  const nav = fs.readFileSync("components/dashboard-nav.tsx", "utf8");
  const shell = fs.readFileSync("components/dashboard-page-shell.tsx", "utf8");
  for (const href of ["/dashboard", "/dashboard/search", "/dashboard/alerts", "/dashboard/network", "/dashboard/fatefind", "/dashboard/watchlist", "/dashboard/wishlist", "/dashboard/stores", "/dashboard/local-radar", "/dashboard/avatar", "/dashboard/membership", "/dashboard/discord"]) assert.ok(nav.includes(href));
  assert.equal(nav.includes('"/dashboard/true-price"'), false);
  assert.equal(nav.includes('"/dashboard/events"'), false);
  assert.ok(shell.includes('href="/dashboard/notifications"'));
  assert.ok(shell.includes('href="/dashboard/profile"'));
  assert.ok(nav.includes('["⌕", "Search", "/dashboard/search",'));
  assert.ok(nav.includes('"FateFind", "/dashboard/fatefind"'));
  assert.ok(nav.includes('"FateMatch", "/dashboard/watchlist"'));
  assert.ok(nav.includes('"Wishlist", "/dashboard/wishlist"'));
  assert.ok(nav.includes('"Koru & Friends", "/dashboard/avatar"'));
  assert.ok(nav.includes('"Fate Network", "/dashboard/network"'));
  assert.ok(nav.includes('"Retailers", "/dashboard/stores"'));
  assert.ok(nav.includes('"Retailer Dashboard", "/dashboard/indie"'));
  assert.equal(nav.includes('"Indies", "/dashboard/stores"'), false);
});

test("dashboard home uses the shared shell and retains personal collector identity", () => {
  const root = fs.readFileSync("app/dashboard/page.tsx", "utf8");
  const shell = fs.readFileSync("components/dashboard-page-shell.tsx", "utf8");
  assert.ok(root.includes("DashboardPageShell"));
  assert.equal(root.includes("fd-dashboard-sidebar"), false);
  assert.ok(root.includes("snapshot.account.displayName"));
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
  assert.ok(storage.includes("FATEDROP_ACCOUNT_STORE"));
  assert.ok(storage.includes("FATEDROP_AVATAR_FILE"));
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

test("Alerts is a precise network ledger and keeps personal delivery controls separate", () => {
  const alerts = fs.readFileSync("app/dashboard/alerts/page.tsx", "utf8");
  assert.ok(alerts.includes("NETWORK FLIGHT RECORDER"));
  assert.ok(alerts.includes("PRECISE SIGNAL ACTIVITY"));
  assert.ok(alerts.includes("SIGNAL LEDGER"));
  assert.ok(alerts.includes("EXACT CAUSE"));
  for (const state of ["WHISPER", "ECHO", "MANIFESTED", "VANISHED"]) assert.ok(alerts.includes(`"${state}"`));
  for (const cause of ["catalogue_new", "queue", "security", "restock", "sold_out", "lifecycle_unspecified"]) assert.ok(alerts.includes(`"${cause}"`));
  assert.ok(alerts.includes('/dashboard/notifications'));
  assert.ok(alerts.includes('/dashboard/fatefind?q='));
  assert.ok(alerts.includes('/dashboard/watchlist?q='));
  assert.ok(alerts.includes("CanonicalAlertSignalPack"));
  assert.ok(alerts.includes("Cause unclassified"));
  assert.equal(alerts.includes("<LiveAlertFeed"), false);
});

test("Search, FateFind and FateMatch form one working collector journey while True Price remains an internal calculation", () => {
  const search = fs.readFileSync("app/dashboard/search/page.tsx", "utf8");
  const legacyTruePrice = fs.readFileSync("app/dashboard/true-price/page.tsx", "utf8");
  const fateFind = fs.readFileSync("app/dashboard/fatefind/page.tsx", "utf8");
  const fateMatch = fs.readFileSync("app/dashboard/watchlist/page.tsx", "utf8");
  const client = fs.readFileSync("lib/signal-engine-client.ts", "utf8");
  assert.ok(search.includes("searchSignalCatalogue"));
  assert.equal(search.includes('/dashboard/true-price?q='), false);
  assert.ok(search.includes('/dashboard/fatefind?q='));
  assert.ok(search.includes('/dashboard/watchlist?q='));
  assert.ok(search.includes("BUY ↗"));
  assert.ok(legacyTruePrice.includes("/dashboard/fatefind"));
  assert.ok(fateFind.includes("TRUE PRICE"));
  assert.ok(fateFind.includes("VS RRP / REF"));
  assert.ok(fateFind.includes("searchSignalTruePrice"));
  assert.ok(fateFind.includes("ValueCompare"));
  assert.ok(fateFind.includes("Which live option is the strongest value?"));
  assert.ok(fateMatch.includes("FateMatchBuilder"));
  assert.ok(fateMatch.includes("FateFindActions"));
  assert.ok(client.includes('"/api/catalogue"'));
  assert.ok(client.includes('"/api/true-price"'));
});

test("FateMatch supports create pause resume delete companion assignment and evidence-based local matching", () => {
  const builder = fs.readFileSync("components/fate-match-builder.tsx", "utf8");
  const actions = fs.readFileSync("components/fatefind-actions.tsx", "utf8");
  const api = fs.readFileSync("app/api/fate-matches/route.ts", "utf8");
  const storage = fs.readFileSync("lib/fate-match-storage.ts", "utf8");
  assert.ok(builder.includes("navigator.geolocation"));
  assert.ok(builder.includes("radiusKm"));
  assert.ok(builder.includes("latitude"));
  assert.ok(builder.includes("longitude"));
  assert.ok(builder.includes("Use your location before saving a Local-only FateMatch."));
  assert.ok(builder.includes("companionId"));
  assert.ok(builder.includes("START FATEMATCH WATCH"));
  assert.ok(api.includes("export async function POST"));
  assert.ok(api.includes("export async function PATCH"));
  assert.ok(api.includes("export async function DELETE"));
  assert.ok(api.includes("Local FateMatch monitoring requires a resolved location and radius."));
  assert.ok(api.includes("assertSameOrigin(request)"));
  assert.ok(storage.includes("setFateMatchEnabled"));
  assert.ok(storage.includes("deleteFateMatch"));
  assert.ok(actions.includes('method: "PATCH"'));
  assert.ok(actions.includes('method: "DELETE"'));
});

test("Universal Wishlist is persistent, separate from FateFind and FateMatch, and migration-safe", () => {
  const page = fs.readFileSync("app/dashboard/wishlist/page.tsx", "utf8");
  const api = fs.readFileSync("app/api/wishlist/route.ts", "utf8");
  const storage = fs.readFileSync("lib/wishlist-storage.ts", "utf8");
  const migration = fs.readFileSync("database/2026-08-19-user-preferences.sql", "utf8");
  assert.ok(page.includes("Wishlist means “I want this.”"));
  assert.ok(page.includes("FateMatch means “let me know when this is in stock.”"));
  assert.ok(page.includes("/dashboard/fatefind"));
  assert.ok(page.includes("/dashboard/watchlist"));
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

test("True Price remains a FateFind calculation rather than a standalone dashboard product", () => {
  const page = fs.readFileSync("app/dashboard/true-price/page.tsx", "utf8");
  const fateFind = fs.readFileSync("app/dashboard/fatefind/page.tsx", "utf8");
  const client = fs.readFileSync("lib/signal-engine-client.ts", "utf8");
  assert.ok(page.includes("/dashboard/fatefind"));
  assert.ok(fateFind.includes("TRUE PRICE"));
  assert.ok(fateFind.includes("VS RRP / REF"));
  assert.ok(client.includes('"/api/true-price"'));
});

test("retailer discovery uses one Cloud directory without storefront lab truth", () => {
  const stores = fs.readFileSync("app/dashboard/stores/page.tsx", "utf8");
  const network = fs.readFileSync("lib/retailer-network.ts", "utf8");
  assert.ok(stores.includes("FATE NETWORK · RETAILER DISCOVERY"));
  assert.ok(stores.includes("Discover the stores behind the hobby."));
  assert.ok(stores.includes("<RetailerMarketDirectory"));
  assert.ok(stores.includes("getRetailerNetworkSnapshot"));
  assert.equal(stores.includes("EXPERIMENTAL STOREFRONT LAB"), false);
  assert.equal(stores.includes("Cob & Pip"), false);
  assert.equal(stores.includes("Wishlist Collectables"), false);
  assert.equal(stores.includes("getCobAndPipCatalogue"), false);
  assert.equal(stores.includes("getWishlistCollectablesCatalogue"), false);
  assert.ok(network.includes("getSignalRetailerDirectory"));
  assert.equal(network.includes("getSignalEngineStatus"), false);
  assert.equal(network.includes("retailerRegistry"), false);
  assert.equal(network.includes("retailerByCloudId"), false);
});

test("Events has a canonical network-feed migration endpoint", () => {
  const eventsApi = fs.readFileSync("app/api/events/route.ts", "utf8");
  const dashboardEvents = fs.readFileSync("app/dashboard/events/page.tsx", "utf8");
  assert.ok(eventsApi.includes("getLatestNetworkMetricSnapshot"));
  assert.ok(eventsApi.includes('status: snapshot ? "network" : "awaiting-network-feed"'));
  assert.ok(eventsApi.includes("upcomingEvents"));
  assert.ok(dashboardEvents.includes("loadUpcomingEncounters"));
  assert.ok(dashboardEvents.includes("EventCalendar"));
  assert.ok(dashboardEvents.includes("FateEncountersLive"));
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
