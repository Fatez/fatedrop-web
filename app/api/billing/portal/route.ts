import { BillingUnavailableError, createBillingPortalSession } from "@/lib/billing";
import { assertSameOrigin, getCurrentSnapshot } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Sign in required." }, { status: 401 });
    if (!snapshot.membership.stripeCustomerId) return Response.json({ error: "No Stripe billing profile is linked to this FateDrop ID yet." }, { status: 400 });
    const session = await createBillingPortalSession(snapshot.membership.stripeCustomerId, new URL(request.url).origin);
    if (typeof session.url !== "string") return Response.json({ error: "Stripe did not return a portal address." }, { status: 502 });
    return Response.json({ url: session.url });
  } catch (error) {
    if (error instanceof BillingUnavailableError) return Response.json({ error: "Billing is prepared but Stripe has not been connected yet." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Billing portal could not be opened." }, { status: 500 });
  }
}
