import { saveDiscordLink } from "@/lib/account-storage";
import { getCurrentSnapshot } from "@/lib/auth";
import { exchangeDiscordCode, fetchDiscordIdentity, syncPremiumDiscordRole, validateDiscordState } from "@/lib/discord";
import { hasPremiumAccess } from "@/lib/membership";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.redirect(new URL("/account/login?next=/account", request.url));
  if (!(await validateDiscordState(url.searchParams.get("state")))) return Response.redirect(new URL("/account?discord=state", request.url));
  const code = url.searchParams.get("code");
  if (!code) return Response.redirect(new URL("/account?discord=cancelled", request.url));

  try {
    const token = await exchangeDiscordCode(code, url.origin);
    const identity = await fetchDiscordIdentity(token.access_token);
    const link = await saveDiscordLink({
      userId: snapshot.account.id,
      discordUserId: identity.id,
      discordUsername: identity.username,
      discordAvatar: identity.avatar,
      connectedAt: Math.floor(Date.now() / 1000),
      roleSyncedAt: null,
    });
    if (!hasPremiumAccess(snapshot.membership)) return Response.redirect(new URL("/account?discord=linked-free", request.url));
    const role = await syncPremiumDiscordRole(link, snapshot.membership);
    const result = role.configured && !role.memberFound ? "join" : role.synced ? "linked" : "linked-no-role";
    return Response.redirect(new URL(`/account?discord=${result}`, request.url));
  } catch {
    return Response.redirect(new URL("/account?discord=error", request.url));
  }
}
