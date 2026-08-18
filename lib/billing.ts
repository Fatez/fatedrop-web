import { createHmac, timingSafeEqual } from "node:crypto";
import type { MembershipTier } from "./account-storage";
import { TRIAL_DAYS } from "./membership";

const STRIPE_API = "https://api.stripe.com/v1";

type StripeJson = Record<string, unknown>;

export class BillingUnavailableError extends Error {
  constructor(message = "Billing is not configured yet.") {
    super(message);
    this.name = "BillingUnavailableError";
  }
}

export function billingReadiness() {
  const secret = process.env.STRIPE_SECRET_KEY || "";
  const webhook = process.env.STRIPE_WEBHOOK_SECRET || "";
  const plus = process.env.STRIPE_PRICE_PLUS || "";
  const pro = process.env.STRIPE_PRICE_PRO || "";
  const missing = [
    ["STRIPE_SECRET_KEY", secret],
    ["STRIPE_WEBHOOK_SECRET", webhook],
    ["STRIPE_PRICE_PLUS", plus],
    ["STRIPE_PRICE_PRO", pro],
  ].filter(([, value]) => !value).map(([name]) => name);
  const mode = secret.startsWith("sk_live_") ? "live" : secret.startsWith("sk_test_") ? "test" : secret ? "unknown" : "unconfigured";
  return {
    configured: missing.length === 0,
    checkoutConfigured: Boolean(secret && plus && pro),
    webhookConfigured: Boolean(webhook),
    mode,
    missing,
    trialDays: TRIAL_DAYS,
    requireCardForTrial: (process.env.FATEDROP_TRIAL_REQUIRE_CARD ?? "true") !== "false",
  } as const;
}

export function priceIdForTier(tier: MembershipTier) {
  if (tier === "plus") return process.env.STRIPE_PRICE_PLUS ?? null;
  if (tier === "pro") return process.env.STRIPE_PRICE_PRO ?? null;
  return null;
}

export function tierForPriceId(priceId: string | null | undefined): MembershipTier {
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId && priceId === process.env.STRIPE_PRICE_PLUS) return "plus";
  return "free";
}

export async function createCheckoutSession(input: {
  userId: string;
  email: string;
  fateId: string;
  tier: Exclude<MembershipTier, "free">;
  existingCustomerId?: string | null;
  trialEligible: boolean;
  origin: string;
}) {
  const priceId = priceIdForTier(input.tier);
  if (!priceId) throw new BillingUnavailableError(`Stripe price for ${input.tier} is not configured.`);

  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("success_url", `${input.origin}/dashboard/membership?billing=success`);
  body.set("cancel_url", `${input.origin}/dashboard/membership?billing=cancelled`);
  body.set("client_reference_id", input.userId);
  body.set("line_items[0][price]", priceId);
  body.set("line_items[0][quantity]", "1");
  if (input.trialEligible) {
    body.set("subscription_data[trial_period_days]", String(TRIAL_DAYS));
    if ((process.env.FATEDROP_TRIAL_REQUIRE_CARD ?? "true") === "false") {
      body.set("payment_method_collection", "if_required");
      body.set("subscription_data[trial_settings][end_behavior][missing_payment_method]", "cancel");
    }
  }
  body.set("subscription_data[metadata][fatedrop_user_id]", input.userId);
  body.set("subscription_data[metadata][fatedrop_fate_id]", input.fateId);
  body.set("metadata[fatedrop_user_id]", input.userId);
  body.set("metadata[fatedrop_tier]", input.tier);
  body.set("allow_promotion_codes", "true");
  if (input.existingCustomerId) body.set("customer", input.existingCustomerId);
  else body.set("customer_email", input.email);

  return stripeRequest("/checkout/sessions", body);
}

export async function createBillingPortalSession(customerId: string, origin: string) {
  const body = new URLSearchParams();
  body.set("customer", customerId);
  body.set("return_url", `${origin}/dashboard/membership`);
  return stripeRequest("/billing_portal/sessions", body);
}

async function stripeRequest(path: string, body: URLSearchParams) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new BillingUnavailableError("STRIPE_SECRET_KEY is not configured.");
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secret}:`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const payload = (await response.json()) as StripeJson;
  if (!response.ok) {
    const nested = payload.error && typeof payload.error === "object" ? payload.error as Record<string, unknown> : null;
    const message = nested?.message ? String(nested.message) : "Stripe rejected the billing request.";
    throw new Error(message);
  }
  return payload;
}

export function verifyStripeWebhook(payload: string, signatureHeader: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new BillingUnavailableError("STRIPE_WEBHOOK_SECRET is not configured.");
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;

  const parsed = Number(timestamp);
  if (!Number.isFinite(parsed) || Math.abs(Math.floor(Date.now() / 1000) - parsed) > 300) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return signatures.some((signature) => {
    try {
      const actual = Buffer.from(signature, "hex");
      return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
    } catch {
      return false;
    }
  });
}

export type StripeSubscriptionShape = {
  id: string;
  customer: string;
  status: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  trial_start?: number | null;
  trial_end?: number | null;
  metadata?: Record<string, string>;
  items?: { data?: Array<{ price?: { id?: string }; current_period_end?: number }> };
};

export function parseStripeSubscription(value: unknown): StripeSubscriptionShape | null {
  if (!value || typeof value !== "object") return null;
  const object = value as Record<string, unknown>;
  if (typeof object.id !== "string") return null;
  const customer = typeof object.customer === "string" ? object.customer : (object.customer && typeof object.customer === "object" && "id" in object.customer ? String((object.customer as Record<string, unknown>).id) : "");
  if (!customer) return null;
  return object as unknown as StripeSubscriptionShape;
}
