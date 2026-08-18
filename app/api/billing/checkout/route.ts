import { BillingUnavailableError, createCheckoutSession } from "@/lib/billing";
import { assertSameOrigin, getCurrentSnapshot } from "@/lib/auth";
import { hasPremiumAccess } from "@/lib/membership";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Create or sign in to your FateDrop ID first." }, { status: 401 });
    const payload = await request.json() as { tier?: unknown };
    const tier = payload.tier === "plus" || payload.tier === "pro" ? payload.tier : null;
    if (!tier) return Response.json({ error: "Choose a valid membership tier." }, { status: 400 });
    if (hasPremiumAccess(snapshot.membership)) return Response.json({ error: "This FateDrop ID already has Premium access. Use Manage billing from your profile to change the subscription." }, { status: 409 });
    const session = await createCheckoutSession({
      userId: snapshot.account.id,
      email: snapshot.account.email,
      fateId: snapshot.account.fateId,
      tier,
      existingCustomerId: snapshot.membership.stripeCustomerId,
      origin: new URL(request.url).origin,
    });
    if (typeof session.url !== "string") return Response.json({ error: "Stripe did not return a checkout address." }, { status: 502 });
    return Response.json({ url: session.url });
  } catch (error) {
    if (error instanceof BillingUnavailableError) return Response.json({ error: "Billing is prepared but Stripe has not been connected yet." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: error instanceof Error ? error.message : "Checkout could not be started." }, { status: 500 });
  }
}
