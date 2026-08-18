import { getCurrentSnapshot } from "@/lib/auth";
import { capabilitiesForMembership, effectiveTier } from "@/lib/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
  return Response.json({
    userId: snapshot.account.id,
    tier: effectiveTier(snapshot.membership),
    membershipStatus: snapshot.membership.status,
    capabilities: [...capabilitiesForMembership(snapshot.membership)],
  }, { headers: { "Cache-Control": "private, no-store" } });
}
