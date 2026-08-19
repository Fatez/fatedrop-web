import { getSnapshotForRequest } from "@/lib/auth";
import { AccountStorageUnavailableError } from "@/lib/account-storage";
import { capabilitiesForMembership, effectiveTier, membershipIsActive } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const snapshot = await getSnapshotForRequest(request);
    if (!snapshot) return Response.json({ error: "Sign in required." }, { status: 401, headers: { "cache-control": "no-store" } });

    const capabilities = [...capabilitiesForMembership(snapshot.membership)].sort();
    const active = membershipIsActive(snapshot.membership);

    return Response.json({
      contractVersion: 1,
      authoritative: true,
      userId: snapshot.account.id,
      fateId: snapshot.account.fateId,
      membership: {
        configuredTier: snapshot.membership.tier,
        effectiveTier: effectiveTier(snapshot.membership),
        status: snapshot.membership.status,
        active,
        trialEndsAt: snapshot.membership.trialEndsAt,
        currentPeriodEnd: snapshot.membership.currentPeriodEnd,
        cancelAtPeriodEnd: snapshot.membership.cancelAtPeriodEnd,
        updatedAt: snapshot.membership.updatedAt,
      },
      capabilities,
      issuedAt: Math.floor(Date.now() / 1000),
    }, { headers: { "cache-control": "private, no-store, max-age=0" } });
  } catch (error) {
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503, headers: { "cache-control": "no-store" } });
    return Response.json({ error: "Entitlement could not be loaded." }, { status: 500, headers: { "cache-control": "no-store" } });
  }
}
