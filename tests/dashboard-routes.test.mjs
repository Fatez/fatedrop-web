import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const dashboardRoutes = [
  "app/dashboard/page.tsx",
  "app/dashboard/search/page.tsx",
  "app/dashboard/alerts/page.tsx",
  "app/dashboard/watchlist/page.tsx",
  "app/dashboard/wishlist/page.tsx",
  "app/dashboard/true-price/page.tsx",
  "app/dashboard/events/page.tsx",
  "app/dashboard/stores/page.tsx",
  "app/dashboard/settings/page.tsx",
  "app/dashboard/avatar/page.tsx",
  "app/dashboard/profile/page.tsx",
  "app/dashboard/notifications/page.tsx",
];

test("every retained dashboard destination has a real page", () => {
  for (const route of dashboardRoutes) assert.equal(fs.existsSync(route), true, `missing ${route}`);
});

test("core dashboard navigation keeps every collector destination in the approved workspace", () => {
  const shell = fs.readFileSync("components/dashboard-nav.tsx", "utf8");
  for (const href of ["/dashboard", "/dashboard/search", "/dashboard/alerts", "/dashboard/watchlist", "/dashboard/wishlist", "/dashboard/true-price", "/dashboard/events", "/dashboard/stores", "/dashboard/avatar", "/dashboard/settings"]) {
    assert.ok(shell.includes(href), `missing nav destination ${href}`);
  }
  const pageShell = fs.readFileSync("components/dashboard-page-shell.tsx", "utf8");
  assert.ok(pageShell.includes("/dashboard/profile"));
  assert.ok(pageShell.includes("/dashboard/notifications"));
});

test("dashboard home uses the shared shell and retains personal collector identity", () => {
  const page = fs.readFileSync("app/dashboard/page.tsx", "utf8");
  assert.ok(page.includes("DashboardPageShell"));
  assert.ok(page.includes("snapshot.account.displayName"));
  assert.ok(page.includes("Signals Overview"));
  assert.ok(page.includes("Recent Signals"));
  assert.ok(page.includes("True Price Comparison"));
  assert.ok(page.includes("FateFind"));
  assert.ok(page.includes("Network Pulse"));
  assert.ok(page.includes("Recent Manifested Drops"));
});

test("Koru and Friends is the only active companion system", () => {
  const selector = fs.readFileSync("components/companion-selector.tsx", "utf8");
  const contract = fs.readFileSync("lib/companion-contract.ts", "utf8");
  assert.ok(selector.includes("ACTIVE_COMPANION_ROSTER"));
  assert.ok(contract.includes('["koru", "fenn", "aeris", "nyxen", "solix"]'));
  assert.equal(contract.includes('"droid"'), false);
  assert.equal(contract.includes('"scout"'), false);
});

test("Alerts is personal and links to shared notification preferences", () => {
  const page = fs.readFileSync("app/dashboard/alerts/page.tsx", "utf8");
  assert.ok(page.includes("DashboardPageShell"));
  assert.ok(page.includes("/dashboard/notifications"));
  assert.ok(page.includes("Whisper"));
  assert.ok(page.includes("Echo"));
  assert.ok(page.includes("Manifested"));
  assert.ok(page.includes("Vanished"));
});

test("Universal Wishlist is persistent, separate from FateFind and migration-safe", () => {
  const page = fs.readFileSync("app/dashboard/wishlist/page.tsx", "utf8");
  const storage = fs.readFileSync("lib/wishlist-storage.ts", "utf8");
  assert.ok(page.includes("Universal Wishlist"));
  assert.ok(page.includes("Wishlist is not FateFind"));
  assert.ok(storage.includes("fatedrop_wishlist_items"));
});

test("notification preferences use one persistent cross-channel account model", () => {
  const page = fs.readFileSync("app/dashboard/notifications/page.tsx", "utf8");
  const storage = fs.readFileSync("lib/notification-preferences.ts", "utf8");
  assert.ok(page.includes("NotificationPreferencesForm"));
  assert.ok(storage.includes("whisper"));
  assert.ok(storage.includes("echo"));
  assert.ok(storage.includes("manifested"));
  assert.ok(storage.includes("vanished"));
});

test("free signal API redacts actionable fields before browser delivery", () => {
  const route = fs.readFileSync("app/api/signals/route.ts", "utf8");
  assert.ok(route.includes("redactSignalForMembership"));
});

test("internal alert visualiser preserves the final signal vocabulary and companion language", () => {
  const feed = fs.readFileSync("app/internal/alert-feed/page.tsx", "utf8");
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

test("True Price is canonical Cloud comparison and FateWindow stays out of the active product surface", () => {
  const page = fs.readFileSync("app/dashboard/true-price/page.tsx", "utf8");
  const client = fs.readFileSync("lib/signal-engine-client.ts", "utf8");
  assert.ok(page.includes("searchSignalTruePrice"));
  assert.ok(page.includes("ITEM PRICE"));
  assert.ok(page.includes("KNOWN DELIVERY"));
  assert.ok(page.includes("TRUE PRICE"));
  assert.ok(page.includes("CREATE A FATEFIND"));
  assert.equal(page.toUpperCase().includes("FATEWINDOW"), false);
  assert.ok(client.includes('"/api/true-price"'));
});

test("retailer discovery separates Cloud runtime health from storefront lab feeds", () => {
  const stores = fs.readFileSync("app/dashboard/stores/page.tsx", "utf8");
  const network = fs.readFileSync("lib/retailer-network.ts", "utf8");
  const registry = fs.readFileSync("lib/retailer-registry.ts", "utf8");
  assert.ok(stores.includes("LIVE NETWORK"));
  assert.ok(stores.includes("STOREFRONT LAB"));
  assert.ok(stores.includes("FateDrop is the bridge, not the marketplace"));
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
  assert.ok(config.includes("Content-Security-Policy"));
  assert.ok(config.includes("Strict-Transport-Security"));
});

test("Stripe checkout blocks duplicate live subscriptions and repeat trials", () => {
  const route = fs.readFileSync("app/api/billing/create-checkout/route.ts", "utf8");
  assert.ok(route.includes("already has an active paid membership"));
  assert.ok(route.includes("trialAlreadyUsed"));
});
