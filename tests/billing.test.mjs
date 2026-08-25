import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const loaded = await import("../lib/billing.ts");
const billing = loaded.billingReadiness ? loaded : loaded.default;

function withEnv(values, fn) {
  const previous = {};
  for (const [key, value] of Object.entries(values)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return Promise.resolve(fn()).finally(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test("billing readiness identifies complete Stripe test configuration without exposing secrets", async () => {
  await withEnv({
    STRIPE_SECRET_KEY: "sk_test_example",
    STRIPE_WEBHOOK_SECRET: "whsec_example",
    STRIPE_PRICE_PLUS: "price_plus",
    STRIPE_PRICE_PRO: undefined,
    FATEDROP_TRIAL_REQUIRE_CARD: "true",
  }, () => {
    const status = billing.billingReadiness();
    assert.equal(status.configured, true);
    assert.equal(status.checkoutConfigured, true);
    assert.equal(status.mode, "test");
    assert.deepEqual(status.missing, []);
    assert.equal(status.requireCardForTrial, true);
    assert.equal(status.trialDays, 7);
    assert.equal(JSON.stringify(status).includes("sk_test_example"), false);
  });
});

test("billing readiness only requires the single public FateDrop Plus price", async () => {
  await withEnv({ STRIPE_SECRET_KEY: undefined, STRIPE_WEBHOOK_SECRET: undefined, STRIPE_PRICE_PLUS: undefined, STRIPE_PRICE_PRO: undefined }, () => {
    const status = billing.billingReadiness();
    assert.equal(status.configured, false);
    assert.equal(status.mode, "unconfigured");
    assert.deepEqual(status.missing.sort(), ["STRIPE_PRICE_PLUS", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"].sort());
  });
});

test("Stripe webhook verification accepts a current valid v1 signature and rejects a bad signature", async () => {
  await withEnv({ STRIPE_WEBHOOK_SECRET: "whsec_test_fatedrop" }, () => {
    const payload = JSON.stringify({ id: "evt_test", type: "customer.subscription.updated" });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${payload}`).digest("hex");
    assert.equal(billing.verifyStripeWebhook(payload, `t=${timestamp},v1=${signature}`), true);
    assert.equal(billing.verifyStripeWebhook(payload, `t=${timestamp},v1=${"0".repeat(64)}`), false);
  });
});

test("new checkout uses Plus while an old Pro price can still be recognised safely", async () => {
  await withEnv({ STRIPE_PRICE_PLUS: "price_plus", STRIPE_PRICE_PRO: "price_legacy_pro" }, () => {
    assert.equal(billing.priceIdForTier("plus"), "price_plus");
    assert.equal(billing.priceIdForTier("pro"), "price_plus");
    assert.equal(billing.tierForPriceId("price_plus"), "plus");
    assert.equal(billing.tierForPriceId("price_legacy_pro"), "pro");
    assert.equal(billing.tierForPriceId("unknown"), "free");
  });
});
