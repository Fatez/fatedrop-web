import { getCurrentSnapshot } from "@/lib/auth";
import { AccountStorageUnavailableError } from "@/lib/account-storage";
import { hasPremiumAccess } from "@/lib/membership";

export async function GET() {
  try {
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Sign in required." }, { status: 401 });
    return Response.json({
      userId: snapshot.account.id,
      fateId: snapshot.account.fateId,
      tier: snapshot.membership.tier,
      status: snapshot.membership.status,
      premium: hasPremiumAccess(snapshot.membership),
      trialEndsAt: snapshot.membership.trialEndsAt,
      currentPeriodEnd: snapshot.membership.currentPeriodEnd,
      cancelAtPeriodEnd: snapshot.membership.cancelAtPeriodEnd,
      updatedAt: snapshot.membership.updatedAt,
    });
  } catch (error) {
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    return Response.json({ error: "Entitlement could not be loaded." }, { status: 500 });
  }
}
