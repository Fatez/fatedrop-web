import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const webhookSource = await readFile(new URL("../app/api/billing/webhook/route.ts", import.meta.url), "utf8");
const billingSource = await readFile(new URL("../lib/billing.ts", import.meta.url), "utf8");

function position(source, pattern, label) {
  const index = source.search(pattern);
  assert.notEqual(index, -1, `${label} must be present`);
  return index;
}

test("subscription webhooks reconcile current Stripe customer state instead of replaying event status", () => {
  assert.match(webhookSource, /const eventSubscription = parseStripeSubscription\(object\)/);
  assert.match(webhookSource, /await reconcileSubscription\(userId, eventSubscription\.customer, eventSubscription\.id\)/);
  assert.match(webhookSource, /await listStripeCustomerSubscriptions\(customerId\)/);
  assert.doesNotMatch(webhookSource, /event\.type === "customer\.subscription\.deleted" \? "canceled"/);

  const listRead = position(webhookSource, /await listStripeCustomerSubscriptions\(customerId\)/, "canonical Stripe read");
  const mutation = position(webhookSource, /await updateMembership\(userId, \{/, "membership mutation");
  assert.ok(listRead < mutation, "Stripe canonical state must be read before membership mutation");
});

test("Stripe reconciliation includes canceled subscriptions and fails closed on read failure", () => {
  assert.match(billingSource, /new URLSearchParams\(\{ customer: customerId, status: "all", limit: "100" \}\)/);
  assert.match(billingSource, /method: "GET"/);
  assert.match(billingSource, /cache: "no-store"/);
  assert.match(billingSource, /if \(!response\.ok\) throw new Error\("Stripe subscription state could not be reconciled\."\)/);
  assert.doesNotMatch(billingSource, /catch[\s\S]{0,120}parseStripeSubscription/);
});

test("delayed events from a superseded Stripe customer cannot replace the current customer", () => {
  assert.match(webhookSource, /storedCustomerId && storedCustomerId !== customerId/);
  assert.match(webhookSource, /if \(!allowCustomerSwitch\) return \{ applied: false, reason: "superseded_customer" as const \}/);
  assert.match(webhookSource, /const storedSubscriptions = await listStripeCustomerSubscriptions\(storedCustomerId\)/);
  assert.match(webhookSource, /compareSubscriptions\(storedSelected, selected\) >= 0/);
  assert.match(webhookSource, /allowCustomerSwitch: true/);
});

test("subscription selection rejects another FateDrop ID and ranks current canonical state deterministically", () => {
  assert.match(webhookSource, /if \(metadataUserId && metadataUserId !== userId\) return false/);
  assert.match(webhookSource, /subscriptionPriority\(left\.status\) - subscriptionPriority\(right\.status\)/);
  assert.match(webhookSource, /Number\(left\.created \|\| 0\) - Number\(right\.created \|\| 0\)/);
  assert.match(webhookSource, /compareSubscriptions\(right, left\)/);
  assert.match(webhookSource, /metadataUserId === userId/);
  assert.match(webhookSource, /tierForPriceId\(subscriptionPriceId\(subscription\)\) !== "free"/);
});

test("billing audit still deduplicates event IDs after successful reconciliation", () => {
  const duplicate = position(webhookSource, /hasProcessedBillingEvent\(event\.id\)/, "event dedupe");
  const reconcile = position(webhookSource, /if \(event\.type\.startsWith\("customer\.subscription\."\)\)/, "subscription reconciliation");
  const audit = position(webhookSource, /await recordBillingAudit\(\{/, "billing audit");
  assert.ok(duplicate < reconcile && reconcile < audit);
});
