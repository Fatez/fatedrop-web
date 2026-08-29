import { assertSameOrigin, getCurrentSnapshot } from "@/lib/auth";
import { betaAccessDeniedResponse, betaAccessIsApproved } from "@/lib/beta-access";
import { syncPremiumDiscordRole } from "@/lib/discord";
import { hasPremiumAccess } from "@/lib/membership";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Sign in required." }, { status: 401 });
    if (!betaAccessIsApproved(snapshot.betaAccess)) return betaAccessDeniedResponse(snapshot.betaAccess);
    if (!snapshot.discord) return Response.json({ error: "Connect Discord to this FateDrop ID first." }, { status: 400 });
    if (!hasPremiumAccess(snapshot.membership)) return Response.json({ error: "Premium membership is required before the Discord Premium role can be activated." }, { status: 409 });
    const result = await syncPremiumDiscordRole(snapshot.discord, snapshot.membership);
    if (!result.configured) return Response.json({ error: "Discord role automation is built but the bot credentials are not configured yet." }, { status: 503 });
    if (!result.memberFound) return Response.json({ error: "Join the FateDrop Discord server first, then sync again." }, { status: 409 });
    if (!result.synced) return Response.json({ error: "Discord could not update the role. Check the bot role hierarchy and Manage Roles permission." }, { status: 502 });
    return Response.json({ synced: true });
  } catch (error) {
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Discord role sync could not be completed." }, { status: 500 });
  }
}
