import { BillingUnavailableError, listStripeCustomerSubscriptions, parseStripeSubscription, tierForPriceId, type StripeSubscriptionShape, verifyStripeWebhook } from "@/lib/billing";
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

function subscriptionPriceId(subscription: StripeSubscriptionShape) {
  return subscription.items?.data?.[0]?.price?.id ?? null;
}

function subscriptionPriority(status: string) {
  if (status === "active" || status === "trialing") return 5;
  if (status === "past_due" || status === "unpaid") return 4;
  if (status === "paused") return 3;
  if (status === "incomplete") return 2;
  if (status === "canceled" || status === "incomplete_expired") return 1;
  return 0;
}

function compareSubscriptions(left: StripeSubscriptionShape, right: StripeSubscriptionShape) {
  const priority = subscriptionPriority(left.status) - subscriptionPriority(right.status);
  if (priority) return priority;
  return Number(left.created || 0) - Number(right.created || 0);
}

function canonicalSubscription(
  subscriptions: StripeSubscriptionShape[],
  userId: string,
  currentSubscriptionId: string | null,
  eventSubscriptionId: string | null,
) {
  const candidates = subscriptions.filter((subscription) => {
    const metadataUserId = subscription.metadata?.fatedrop_user_id || null;
    if (metadataUserId && metadataUserId !== userId) return false;
    const recognisedTier = tierForPriceId(subscriptionPriceId(subscription)) !== "free";
    return metadataUserId === userId
      || subscription.id === currentSubscriptionId
      || subscription.id === eventSubscriptionId
      || recognisedTier;
  });

  return candidates.sort((left, right) => compareSubscriptions(right, left))[0] ?? null;
}

async function reconcileSubscription(
  userId: string,
  customerId: string,
  eventSubscriptionId: string,
  { allowCustomerSwitch = false }: { allowCustomerSwitch?: boolean } = {},
) {
  const snapshot = await getAccountSnapshot(userId);
  const storedCustomerId = snapshot?.membership.stripeCustomerId ?? null;
  const storedSubscriptionId = snapshot?.membership.stripeSubscriptionId ?? null;

  const subscriptions = await listStripeCustomerSubscriptions(customerId);
  const selected = canonicalSubscription(subscriptions, userId, storedSubscriptionId, eventSubscriptionId);
  if (!selected) throw new Error("Canonical Stripe subscription could not be resolved.");

  if (storedCustomerId && storedCustomerId !== customerId) {
    if (!allowCustomerSwitch) return { applied: false, reason: "superseded_customer" as const };

    // checkout.session.completed is allowed to establish a genuinely newer Stripe
    // customer, but an old delayed checkout must never move the account backwards.
    // Reconcile the currently stored customer's subscription too and only switch
    // when the incoming customer has the stronger/newer canonical FateDrop state.
    const storedSubscriptions = await listStripeCustomerSubscriptions(storedCustomerId);
    const storedSelected = canonicalSubscription(storedSubscriptions, userId, storedSubscriptionId, storedSubscriptionId);
    if (storedSelected && compareSubscriptions(storedSelected, selected) >= 0) {
      return { applied: false, reason: "superseded_customer" as const };
    }
  }

  const priceId = subscriptionPriceId(selected);
  await updateMembership(userId, {
    tier: tierForPriceId(priceId),
    status: membershipStatus(selected.status),
    stripeCustomerId: selected.customer,
    stripeSubscriptionId: selected.id,
    stripePriceId: priceId,
    trialStartedAt: selected.trial_start ?? null,
    trialEndsAt: selected.trial_end ?? null,
    currentPeriodEnd: selected.current_period_end ?? selected.items?.data?.[0]?.current_period_end ?? null,
    cancelAtPeriodEnd: Boolean(selected.cancel_at_period_end),
  });
  await syncUser(userId);
  return { applied: true, reason: "canonical_stripe_state" as const };
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
      auditUserId = userId;
      auditCustomerId = customerId;
      auditSubscriptionId = subscriptionId;
      if (userId && customerId && subscriptionId) {
        await reconcileSubscription(userId, customerId, subscriptionId, { allowCustomerSwitch: true });
      }
    }

    if (event.type.startsWith("customer.subscription.")) {
      const eventSubscription = parseStripeSubscription(object);
      if (eventSubscription) {
        const metadataUserId = eventSubscription.metadata?.fatedrop_user_id || null;
        const userId = metadataUserId || await findUserIdByStripeCustomer(eventSubscription.customer);
        auditUserId = userId;
        auditCustomerId = eventSubscription.customer;
        auditSubscriptionId = eventSubscription.id;
        if (userId) {
          // The webhook payload identifies what changed, but it is not entitlement
          // authority. Re-read all current subscriptions for this Stripe customer so
          // a delayed older event cannot replay stale status over newer billing state.
          await reconcileSubscription(userId, eventSubscription.customer, eventSubscription.id);
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
