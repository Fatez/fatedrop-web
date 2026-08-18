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

test("every dashboard navigation destination has a real page", () => {
  for (const route of dashboardRoutes) assert.equal(fs.existsSync(route), true, `${route} is missing`);
});

test("dashboard navigation stays inside the signed-in dashboard", () => {
  const root = fs.readFileSync("app/dashboard/page.tsx", "utf8");
  const nav = fs.readFileSync("components/dashboard-nav.tsx", "utf8");
  for (const href of ["/dashboard/search", "/dashboard/alerts", "/dashboard/watchlist", "/dashboard/stores", "/dashboard/events", "/dashboard/true-price", "/dashboard/local-radar", "/dashboard/profile", "/dashboard/membership", "/dashboard/discord"]) {
    assert.ok(root.includes(href) || href === "/dashboard/profile" || href === "/dashboard/membership" || href === "/dashboard/discord", `root dashboard missing ${href}`);
    assert.ok(nav.includes(href), `shared dashboard nav missing ${href}`);
  }
});

test("free alert cards render placeholders instead of actionable signal fields", () => {
  const alerts = fs.readFileSync("app/dashboard/alerts/page.tsx", "utf8");
  assert.ok(alerts.includes('const title = unlocked ? signal.title : "Premium signal detail"'));
  assert.ok(alerts.includes('const retailer = unlocked ?'));
  assert.ok(alerts.includes('const delivered = unlocked ?'));
});

test("Stripe checkout blocks duplicate live subscriptions and repeat trials", () => {
  const checkout = fs.readFileSync("app/api/billing/checkout/route.ts", "utf8");
  const billing = fs.readFileSync("lib/billing.ts", "utf8");
  assert.ok(checkout.includes('snapshot.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled"'));
  assert.ok(checkout.includes("trialEligible = !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt"));
  assert.ok(billing.includes("if (input.trialEligible)"));
});
