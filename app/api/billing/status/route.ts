import { getCurrentSnapshot } from "@/lib/auth";
import { billingReadiness } from "@/lib/billing";
import { membershipLabel } from "@/lib/membership";

export const runtime = "nodejs";

export async function GET() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.json({ error: "Sign in required." }, { status: 401 });
  const readiness = billingReadiness();
  return Response.json({
    billing: readiness,
    membership: {
      label: membershipLabel(snapshot.membership),
      tier: snapshot.membership.tier,
      status: snapshot.membership.status,
      stripeCustomerConnected: Boolean(snapshot.membership.stripeCustomerId),
      stripeSubscriptionConnected: Boolean(snapshot.membership.stripeSubscriptionId),
      trialEndsAt: snapshot.membership.trialEndsAt,
      currentPeriodEnd: snapshot.membership.currentPeriodEnd,
      cancelAtPeriodEnd: snapshot.membership.cancelAtPeriodEnd,
    },
  });
}
