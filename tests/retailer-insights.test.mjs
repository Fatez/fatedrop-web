import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("retailer insights aggregate handoffs without exposing individual collector identity", () => {
  const insights = read("lib/retailer-insights.ts");

  assert.ok(insights.includes("event_type = 'store_tracked'"));
  assert.ok(insights.includes("COUNT(*)::int AS handoffs"));
  assert.ok(insights.includes("MAX(occurred_at)::bigint AS last_handoff_at"));
  assert.ok(!insights.includes("SELECT user_id"));
  assert.ok(!insights.includes("userId:"));
  assert.ok(!insights.includes("email"));
});

test("retailer insight API is bearer protected, no-store and never claims a sale", () => {
  const route = read("app/api/retailer-insights/route.ts");

  assert.ok(route.includes("FATEDROP_RETAILER_INSIGHTS_SECRET"));
  assert.ok(route.includes("timingSafeEqual"));
  assert.ok(route.includes('authorization.startsWith("Bearer ")'));
  assert.ok(route.includes('"Cache-Control": "private, no-store"'));
  assert.ok(route.includes("It does not mean a purchase was completed."));
});
