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
  "app/dashboard/membership/page.tsx",
  "app/dashboard/discord/page.tsx",
];

test("every retained dashboard destination has a real page", () => {
  for (const route of dashboardRoutes) assert.equal(fs.existsSync(route), true, `${route} is missing`);
});

test("core dashboard navigation follows Discover Track Network Account structure", () => {
  const nav = fs.readFileSync("components/dashboard-nav.tsx", "utf8");
  for (const group of ["DISCOVER", "TRACK", "NETWORK", "ACCOUNT"]) assert.ok(nav.includes(group), `shared dashboard nav missing ${group}`);
  for (const href of ["/dashboard/alerts", "/dashboard/watchlist", "/dashboard/stores", "/dashboard/events", "/dashboard/true-price", "/dashboard/local-radar", "/dashboard/profile", "/dashboard/membership", "/dashboard/discord"]) {
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

test("live alerts grade major surges separately from product signals", () => {
  const feed = fs.readFileSync("components/live-alert-feed.tsx", "utf8");
  const beam = fs.readFileSync("components/signal-beam.tsx", "utf8");
  const surge = fs.readFileSync("components/signal-surge.tsx", "utf8");
  const ingest = fs.readFileSync("app/api/dashboard/network-snapshot/route.ts", "utf8");
  assert.ok(feed.includes('fetch("/api/dashboard/signals"'));
  assert.ok(feed.includes("10_000"));
  assert.ok(feed.includes("SignalBeam"));
  assert.ok(feed.includes("SignalSurge"));
  assert.ok(feed.includes("TEST MAJOR SURGE"));
  assert.ok(feed.includes("TEST PRODUCT SIGNAL"));
  assert.ok(feed.includes('kind: "security"'));
  assert.ok(feed.includes('intensity: "major"'));
  assert.ok(feed.includes('kind: "manifested"'));
  assert.ok(feed.includes('intensity: "standard"'));
  assert.ok(feed.includes("local-demo-"));
  assert.ok(beam.includes("intensity-subtle"));
  assert.ok(beam.includes("intensity-major"));
  assert.ok(surge.includes("NETWORK SURGE"));
  assert.ok(surge.includes("Listening across the network"));
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
