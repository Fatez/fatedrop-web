import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const dashboardRoutes = [
  "app/dashboard/search/page.tsx",
  "app/dashboard/alerts/page.tsx",
  "app/dashboard/watchlist/page.tsx",
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
  for (const group of ["DISCOVER", "TRACK", "NETWORK", "ACCOUNT"]) assert.ok(nav.includes(group), `shared dashboard nav missing ${group}`);
  for (const href of ["/dashboard/search", "/dashboard/alerts", "/dashboard/watchlist", "/dashboard/stores", "/dashboard/events", "/dashboard/true-price", "/dashboard/local-radar", "/dashboard/profile", "/dashboard/avatar", "/dashboard/membership", "/dashboard/discord"]) assert.ok(nav.includes(href), `shared dashboard nav missing ${href}`);
  assert.ok(nav.includes('["⌕", "Search", "/dashboard/search"]'));
  assert.ok(nav.includes('["♡", "FateFind", "/dashboard/watchlist"]'));
  assert.ok(nav.includes('["◇", "Companion", "/dashboard/avatar"]'));
});

test("dashboard home uses the shared shell and retains personal collector identity", () => {
  const root = fs.readFileSync("app/dashboard/page.tsx", "utf8");
  assert.ok(root.includes("DashboardPageShell"));
  assert.equal(root.includes("fd-dashboard-sidebar"), false);
  assert.ok(root.includes("MEMBER SINCE"));
  assert.ok(root.includes("TIME IN NETWORK"));
  assert.ok(root.includes("FATEDROP COMPANION · FOUNDATION"));
  assert.ok(root.includes('href="/dashboard/search"'));
});

test("FateDrop Companion uses a shared illustrated rig with a 3D renderer boundary", () => {
  const page = fs.readFileSync("app/dashboard/avatar/page.tsx", "utf8");
  const builder = fs.readFileSync("components/avatar-builder.tsx", "utf8");
  const preview = fs.readFileSync("components/avatar-preview.tsx", "utf8");
  const layered = fs.readFileSync("components/avatar-layered-character.tsx", "utf8");
  const renderer = fs.readFileSync("components/companion-renderer.tsx", "utf8");
  const contract = fs.readFileSync("lib/companion-contract.ts", "utf8");
  const loadout = fs.readFileSync("lib/avatar-loadout.ts", "utf8");
  const assets = fs.readFileSync("lib/avatar-assets.ts", "utf8");
  const sprites = fs.readFileSync("public/assets/avatar-v2/avatar-sprites.svg", "utf8");
  const fateFind = fs.readFileSync("app/dashboard/watchlist/page.tsx", "utf8");
  const api = fs.readFileSync("app/api/account/avatar/route.ts", "utf8");
  const storage = fs.readFileSync("lib/avatar-storage.ts", "utf8");

  assert.ok(page.includes("FateDrop Companion"));
  assert.ok(page.includes("3D READY FOUNDATION"));
  assert.ok(builder.includes("SAVE AVATAR"));
  for (const category of ["skin", "hair", "face", "eyes", "outfit", "headwear", "accessory", "gear", "companion", "aura", "background"]) assert.ok(builder.includes(`${category}:`));
  assert.ok(loadout.includes("AVATAR_SKINS"));
  assert.ok(assets.includes("avatar-sprites.svg"));
  assert.ok(layered.includes("avatarLayerHref"));
  assert.ok(preview.includes("AvatarLayeredCharacter"));
  assert.ok(renderer.includes("CompanionRenderRequest"));
  assert.ok(renderer.includes("webgl-3d"));
  assert.ok(contract.includes("characterModelUrl"));
  assert.ok(contract.includes("droidModelUrl"));
  assert.ok(sprites.includes('id="companion-radar-drone"'));
  assert.ok(fateFind.includes("YOUR COMPANION"));
  assert.ok(api.includes("normalizeAvatarLoadout"));
  assert.ok(storage.includes("fatedrop_user_avatars"));
});

test("free live alert feed redacts actionable signal fields before browser delivery", () => {
  const alerts = fs.readFileSync("app/dashboard/alerts/page.tsx", "utf8");
  const api = fs.readFileSync("app/api/dashboard/signals/route.ts", "utf8");
  assert.ok(alerts.includes('"Premium signal detail"'));
  assert.ok(alerts.includes("deliveredPricePence: null"));
  assert.ok(alerts.includes("confidence: null"));
  assert.ok(api.includes('"Premium signal detail"'));
  assert.ok(api.includes('"Major network movement detected"'));
  assert.ok(api.includes("retailer: null"));
  assert.ok(api.includes("detail: null"));
  assert.ok(api.includes("confidence: null"));
  assert.ok(api.includes("deliveredPricePence: null"));
  assert.ok(api.includes('"Cache-Control": "private, no-store, max-age=0"'));
});

test("live alerts grade major surges separately and use the saved Companion cinematic", () => {
  const feed = fs.readFileSync("components/live-alert-feed.tsx", "utf8");
  const beam = fs.readFileSync("components/signal-beam.tsx", "utf8");
  const cinematic = fs.readFileSync("components/avatar-signal-cinematic.tsx", "utf8");
  const alerts = fs.readFileSync("app/dashboard/alerts/page.tsx", "utf8");
  const ingest = fs.readFileSync("app/api/dashboard/network-snapshot/route.ts", "utf8");
  assert.ok(feed.includes('fetch("/api/dashboard/signals"'));
  assert.ok(feed.includes("10_000"));
  assert.ok(feed.includes("SignalBeam"));
  assert.ok(feed.includes("AvatarSignalCinematic"));
  assert.ok(feed.includes("TEST AVATAR SURGE"));
  assert.ok(feed.includes("TEST PRODUCT SIGNAL"));
  assert.ok(feed.includes('kind: "security"'));
  assert.ok(feed.includes('kind: "manifested"'));
  assert.ok(feed.includes("local-demo-"));
  assert.ok(beam.includes("intensity-major"));
  assert.ok(cinematic.includes("MAJOR NETWORK ACTIVITY"));
  assert.ok(alerts.includes("getUserAvatar"));
  assert.ok(ingest.includes('"queue"'));
  assert.ok(ingest.includes('"security"'));
  assert.ok(ingest.includes('"drop_pulse"'));
});

test("True Price is canonical Cloud comparison and FateWindow is held", () => {
  const page = fs.readFileSync("app/dashboard/true-price/page.tsx", "utf8");
  const client = fs.readFileSync("lib/signal-engine-client.ts", "utf8");
  assert.ok(page.includes("searchSignalTruePrice"));
  assert.ok(page.includes("FATEWINDOW · HOLD / EXPERIMENTAL"));
  assert.ok(page.includes("CREATE FATEFIND"));
  assert.ok(client.includes('"/api/true-price"'));
});

test("Stripe checkout blocks duplicate live subscriptions and repeat trials", () => {
  const checkout = fs.readFileSync("app/api/billing/checkout/route.ts", "utf8");
  const billing = fs.readFileSync("lib/billing.ts", "utf8");
  assert.ok(checkout.includes('snapshot.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled"'));
  assert.ok(checkout.includes("trialEligible = !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt"));
  assert.ok(billing.includes("if (input.trialEligible)"));
});
