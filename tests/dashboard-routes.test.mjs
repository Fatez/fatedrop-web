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
  for (const href of ["/dashboard/alerts", "/dashboard/watchlist", "/dashboard/stores", "/dashboard/events", "/dashboard/true-price", "/dashboard/local-radar", "/dashboard/profile", "/dashboard/avatar", "/dashboard/membership", "/dashboard/discord"]) {
    assert.ok(nav.includes(href), `shared dashboard nav missing ${href}`);
  }
  assert.equal(nav.includes('["⌕", "Search", "/dashboard/search"]'), false, "dead standalone Search navigation should stay removed");
});

test("dashboard home uses the shared shell and retains personal collector identity", () => {
  const root = fs.readFileSync("app/dashboard/page.tsx", "utf8");
  assert.ok(root.includes("DashboardPageShell"));
  assert.equal(root.includes("fd-dashboard-sidebar"), false);
  assert.equal(root.includes('action="/dashboard/search"'), false);
  assert.ok(root.includes("MEMBER SINCE"));
  assert.ok(root.includes("TIME IN NETWORK"));
  assert.ok(root.includes("FATEWINDOW BETA"));
});

test("custom avatar uses a shared illustrated asset rig and persists as account data", () => {
  const page = fs.readFileSync("app/dashboard/avatar/page.tsx", "utf8");
  const builder = fs.readFileSync("components/avatar-builder.tsx", "utf8");
  const preview = fs.readFileSync("components/avatar-preview.tsx", "utf8");
  const layered = fs.readFileSync("components/avatar-layered-character.tsx", "utf8");
  const legacyAdapter = fs.readFileSync("components/avatar-anime-character.tsx", "utf8");
  const thumb = fs.readFileSync("components/avatar-option-thumbnail.tsx", "utf8");
  const loadout = fs.readFileSync("lib/avatar-loadout.ts", "utf8");
  const assets = fs.readFileSync("lib/avatar-assets.ts", "utf8");
  const sprites = fs.readFileSync("public/assets/avatar-v2/avatar-sprites.svg", "utf8");
  const fateMatch = fs.readFileSync("app/dashboard/watchlist/page.tsx", "utf8");
  const api = fs.readFileSync("app/api/account/avatar/route.ts", "utf8");
  const storage = fs.readFileSync("lib/avatar-storage.ts", "utf8");

  assert.ok(page.includes("Design My Avatar"));
  assert.ok(builder.includes("SAVE AVATAR"));
  assert.ok(builder.includes("AvatarOptionThumbnail"));
  for (const category of ["skin", "hair", "face", "eyes", "outfit", "headwear", "accessory", "gear", "companion", "aura", "background"]) assert.ok(builder.includes(`${category}:`), `avatar builder missing ${category}`);
  assert.ok(loadout.includes("AVATAR_SKINS"));
  assert.ok(loadout.includes("AVATAR_FACES"));
  assert.ok(loadout.includes("AVATAR_EYES"));
  assert.ok(loadout.includes("AVATAR_ACCESSORIES"));
  assert.ok(loadout.includes('"ember-fringe"'));
  assert.ok(loadout.includes('"spectral-bomber"'));
  assert.ok(loadout.includes('"command-room"'));
  assert.ok(loadout.includes('"neon-desk"'));
  assert.ok(assets.includes("avatar-sprites.svg"));
  assert.ok(layered.includes("avatarLayerHref"));
  assert.ok(layered.includes("<use"));
  assert.ok(preview.includes("AvatarLayeredCharacter"));
  assert.ok(legacyAdapter.includes("AvatarLayeredCharacter"));
  assert.ok(thumb.includes("AvatarLayeredCharacter"));
  assert.ok(sprites.includes('id="hair-front-midnight-spikes"'));
  assert.ok(sprites.includes('id="outfit-spectral-bomber"'));
  assert.ok(sprites.includes('id="companion-radar-drone"'));
  assert.ok(sprites.includes('id="bg-command-room"'));
  assert.ok(fateMatch.includes("YOUR COMPANION"));
  assert.ok(fateMatch.includes("AvatarPreview"));
  assert.ok(api.includes("assertSameOrigin"));
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

test("live alerts grade major surges separately and use the saved avatar cinematic", () => {
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
  assert.ok(feed.includes('intensity: "major"'));
  assert.ok(feed.includes('kind: "manifested"'));
  assert.ok(feed.includes('intensity: "standard"'));
  assert.ok(feed.includes("local-demo-"));
  assert.ok(beam.includes("intensity-subtle"));
  assert.ok(beam.includes("intensity-major"));
  assert.ok(cinematic.includes("MAJOR NETWORK ACTIVITY"));
  assert.ok(cinematic.includes("DROP DETECTED"));
  assert.ok(cinematic.includes("CONDITIONS BUILDING"));
  assert.ok(cinematic.includes("AvatarAnimeCharacter"));
  assert.ok(cinematic.includes("fd-cinematic-beam"));
  assert.ok(alerts.includes("getUserAvatar"));
  assert.ok(alerts.includes("avatarLoadout"));
  assert.ok(ingest.includes('"queue"'));
  assert.ok(ingest.includes('"security"'));
  assert.ok(ingest.includes('"drop_pulse"'));
});

test("True Price includes the evidence-safe FateWindow decision layer", () => {
  const page = fs.readFileSync("app/dashboard/true-price/page.tsx", "utf8");
  const storefront = fs.readFileSync("components/live-storefront.tsx", "utf8");
  const engine = fs.readFileSync("lib/fate-window.ts", "utf8");
  assert.ok(page.includes("FATEWINDOW · BETA"));
  assert.ok(storefront.includes("evaluateFateWindow"));
  assert.ok(engine.includes('label: "BUY WINDOW OPEN"'));
  assert.ok(engine.includes('label: "WAIT"'));
  assert.ok(engine.includes('label: "EVIDENCE BUILDING"'));
  assert.ok(engine.includes("Official RRP is not verified"));
});

test("Stripe checkout blocks duplicate live subscriptions and repeat trials", () => {
  const checkout = fs.readFileSync("app/api/billing/checkout/route.ts", "utf8");
  const billing = fs.readFileSync("lib/billing.ts", "utf8");
  assert.ok(checkout.includes('snapshot.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled"'));
  assert.ok(checkout.includes("trialEligible = !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt"));
  assert.ok(billing.includes("if (input.trialEligible)"));
});
