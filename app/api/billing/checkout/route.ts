import { BillingUnavailableError, createCheckoutSession } from "@/lib/billing";
import { assertSameOrigin, getCurrentSnapshot } from "@/lib/auth";
import { betaAccessDeniedResponse, betaAccessIsApproved } from "@/lib/beta-access";
import { betaPremiumEnabled } from "@/lib/beta-premium";
import { hasPremiumAccess } from "@/lib/membership";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Create or sign in to your FateDrop ID first." }, { status: 401 });
    if (!betaAccessIsApproved(snapshot.betaAccess)) return betaAccessDeniedResponse(snapshot.betaAccess);
    if (betaPremiumEnabled()) {
      return Response.json({ error: "Subscriptions are not required during the FateDrop closed beta. Approved testers have full access." }, { status: 409 });
    }
    const payload = await request.json() as { tier?: unknown };
    if (payload.tier !== "plus") return Response.json({ error: "FateDrop Plus is the only collector membership available." }, { status: 400 });
    if (hasPremiumAccess(snapshot.membership)) return Response.json({ error: "This FateDrop ID already has FateDrop Plus access. Use Manage billing from Membership to change the subscription." }, { status: 409 });
    if (snapshot.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled") {
      return Response.json({ error: "An existing Stripe subscription needs attention. Open Manage billing instead of creating a second subscription." }, { status: 409 });
    }

    const trialEligible = !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt;
    const session = await createCheckoutSession({
      userId: snapshot.account.id,
      email: snapshot.account.email,
      fateId: snapshot.account.fateId,
      tier: "plus",
      existingCustomerId: snapshot.membership.stripeCustomerId,
      trialEligible,
      origin: new URL(request.url).origin,
    });
    if (typeof session.url !== "string") return Response.json({ error: "Stripe did not return a checkout address." }, { status: 502 });
    return Response.json({ url: session.url, trialEligible });
  } catch (error) {
    if (error instanceof BillingUnavailableError) return Response.json({ error: "Billing is prepared but Stripe has not been connected yet." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: error instanceof Error ? error.message : "Checkout could not be started." }, { status: 500 });
  }
}
