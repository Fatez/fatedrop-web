import { assertSameOrigin, getCurrentSnapshot } from "@/lib/auth";
import { AccountStorageUnavailableError, removeDiscordLink } from "@/lib/account-storage";
import { syncPremiumDiscordRole } from "@/lib/discord";

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Sign in required." }, { status: 401 });
    if (!snapshot.discord) return Response.json({ ok: true });

    // Remove any Premium role before forgetting the Discord identity. If Discord
    // is not configured or the user is not in the server, unlinking still succeeds.
    await syncPremiumDiscordRole(snapshot.discord, {
      ...snapshot.membership,
      tier: "free",
      status: "free",
    }).catch(() => undefined);
    await removeDiscordLink(snapshot.account.id);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Discord link could not be removed." }, { status: 500 });
  }
}
