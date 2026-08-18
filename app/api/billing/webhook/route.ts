import { BillingUnavailableError, parseStripeSubscription, tierForPriceId, verifyStripeWebhook } from "@/lib/billing";
import { findUserIdByStripeCustomer, getAccountSnapshot, updateMembership } from "@/lib/account-storage";
import { hasProcessedBillingEvent, recordBillingAudit } from "@/lib/dashboard-storage";
import { syncPremiumDiscordRole } from "@/lib/discord";

export const runtime = "nodejs";

function membershipStatus(status: string) {
  if (["trialing", "active", "past_due", "paused", "canceled"].includes(status)) return status as "trialing" | "active" | "past_due" | "paused" | "canceled";
  if (status === "unpaid" || status === "incomplete" || status === "incomplete_expired") return "past_due" as const;
  return "canceled" as const;
}

async function syncUser(userId: string) {
  const snapshot = await getAccountSnapshot(userId);
  if (snapshot?.discord) await syncPremiumDiscordRole(snapshot.discord, snapshot.membership);
}

function idFrom(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) return String((value as Record<string, unknown>).id);
  return null;
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (!verifyStripeWebhook(raw, request.headers.get("stripe-signature"))) return new Response("Invalid signature", { status: 400 });
    const event = JSON.parse(raw) as { id?: string; type?: string; created?: number; data?: { object?: unknown } };
    if (!event.id || !event.type) return new Response("Malformed Stripe event", { status: 400 });
    if (await hasProcessedBillingEvent(event.id)) return Response.json({ received: true, duplicate: true });

    const object = event.data?.object;
    let auditUserId: string | null = null;
    let auditCustomerId: string | null = null;
    let auditSubscriptionId: string | null = null;

    if (event.type === "checkout.session.completed" && object && typeof object === "object") {
      const session = object as Record<string, unknown>;
      const metadata = session.metadata && typeof session.metadata === "object" ? session.metadata as Record<string, unknown> : {};
      const userId = typeof session.client_reference_id === "string" ? session.client_reference_id : (typeof metadata.fatedrop_user_id === "string" ? metadata.fatedrop_user_id : null);
      const customerId = idFrom(session.customer);
      const subscriptionId = idFrom(session.subscription);
      const tier = metadata.fatedrop_tier === "pro" ? "pro" : metadata.fatedrop_tier === "plus" ? "plus" : undefined;
      auditUserId = userId;
      auditCustomerId = customerId;
      auditSubscriptionId = subscriptionId;
      if (userId) {
        await updateMembership(userId, { stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId, ...(tier ? { tier } : {}) });
        await syncUser(userId);
      }
    }

    if (event.type.startsWith("customer.subscription.")) {
      const subscription = parseStripeSubscription(object);
      if (subscription) {
        const metadataUserId = subscription.metadata?.fatedrop_user_id || null;
        const userId = metadataUserId || await findUserIdByStripeCustomer(subscription.customer);
        const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
        auditUserId = userId;
        auditCustomerId = subscription.customer;
        auditSubscriptionId = subscription.id;
        if (userId) {
          await updateMembership(userId, {
            tier: tierForPriceId(priceId),
            status: event.type === "customer.subscription.deleted" ? "canceled" : membershipStatus(subscription.status),
            stripeCustomerId: subscription.customer,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            trialStartedAt: subscription.trial_start ?? null,
            trialEndsAt: subscription.trial_end ?? null,
            currentPeriodEnd: subscription.current_period_end ?? subscription.items?.data?.[0]?.current_period_end ?? null,
            cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
          });
          await syncUser(userId);
        }
      }
    }

    if (event.type.startsWith("invoice.") && object && typeof object === "object") {
      const invoice = object as Record<string, unknown>;
      const customerId = idFrom(invoice.customer);
      const subscriptionId = idFrom(invoice.subscription);
      auditCustomerId = customerId;
      auditSubscriptionId = subscriptionId;
      if (!auditUserId && customerId) auditUserId = await findUserIdByStripeCustomer(customerId);
      // Subscription status remains authoritative for access. Invoice events are
      // retained in the billing audit so payment failures/renewals are traceable
      // without prematurely inventing an entitlement state.
    }

    await recordBillingAudit({
      eventId: event.id,
      eventType: event.type,
      userId: auditUserId,
      customerId: auditCustomerId,
      subscriptionId: auditSubscriptionId,
      stripeCreatedAt: typeof event.created === "number" ? event.created : null,
      processedAt: Math.floor(Date.now() / 1000),
    });

    return Response.json({ received: true });
  } catch (error) {
    if (error instanceof BillingUnavailableError) return new Response("Billing not configured", { status: 503 });
    return new Response("Webhook processing failed", { status: 500 });
  }
}
