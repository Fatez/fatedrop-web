import { saveDiscordLink } from "@/lib/account-storage";
import { getCurrentSnapshot } from "@/lib/auth";
import { ensureDiscordGuildMember, exchangeDiscordCode, fetchDiscordIdentity, syncPremiumDiscordRole, validateDiscordState } from "@/lib/discord";
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

    const guild = await ensureDiscordGuildMember(identity.id, token.access_token);
    if (!guild.configured) return Response.redirect(new URL("/account?discord=setup", request.url));
    if (!guild.joined) return Response.redirect(new URL("/account?discord=join-error", request.url));

    const premium = hasPremiumAccess(snapshot.membership);
    const role = await syncPremiumDiscordRole(link, snapshot.membership);

    if (!premium) {
      const result = role.configured && !role.synced ? "linked-free-role-error" : "linked-free";
      return Response.redirect(new URL(`/account?discord=${result}`, request.url));
    }

    const result = role.synced ? "linked" : role.configured && !role.memberFound ? "join" : "linked-no-role";
    return Response.redirect(new URL(`/account?discord=${result}`, request.url));
  } catch {
    return Response.redirect(new URL("/account?discord=error", request.url));
  }
}
