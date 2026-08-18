import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { updateDiscordRoleSync, type DiscordLinkRecord } from "./account-storage";
import { DISCORD_INVITE_URL, hasPremiumAccess } from "./membership";
import type { MembershipRecord } from "./account-storage";

const DISCORD_API = "https://discord.com/api/v10";
const OAUTH_STATE_COOKIE = "fd_discord_state";

export class DiscordUnavailableError extends Error {
  constructor(message = "Discord linking is not configured yet.") {
    super(message);
    this.name = "DiscordUnavailableError";
  }
}

export async function buildDiscordAuthorizeUrl(origin: string) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) throw new DiscordUnavailableError("DISCORD_CLIENT_ID is not configured.");
  const state = randomBytes(24).toString("base64url");
  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: `${origin}/api/discord/callback`,
    scope: "identify",
    state,
    prompt: "consent",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function validateDiscordState(state: string | null) {
  const jar = await cookies();
  const expected = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete(OAUTH_STATE_COOKIE);
  return Boolean(state && expected && state === expected);
}

export async function exchangeDiscordCode(code: string, origin: string) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new DiscordUnavailableError("Discord OAuth credentials are not configured.");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: `${origin}/api/discord/callback`,
  });
  const response = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Discord could not complete the account link.");
  return response.json() as Promise<{ access_token: string; token_type: string }>;
}

export async function fetchDiscordIdentity(accessToken: string) {
  const response = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Discord identity could not be read.");
  const user = await response.json() as { id: string; username: string; global_name?: string | null; avatar?: string | null };
  return {
    id: user.id,
    username: user.global_name || user.username,
    avatar: user.avatar ?? null,
  };
}

export async function syncPremiumDiscordRole(link: DiscordLinkRecord, membership: MembershipRecord) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_PREMIUM_ROLE_ID;
  if (!botToken || !guildId || !roleId) return { configured: false, synced: false, memberFound: false };

  const method = hasPremiumAccess(membership) ? "PUT" : "DELETE";
  const response = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${link.discordUserId}/roles/${roleId}`, {
    method,
    headers: {
      Authorization: `Bot ${botToken}`,
      "X-Audit-Log-Reason": "FateDrop membership sync",
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    await updateDiscordRoleSync(link.userId, null);
    return { configured: true, synced: false, memberFound: false };
  }
  if (!response.ok && response.status !== 204) {
    await updateDiscordRoleSync(link.userId, null);
    return { configured: true, synced: false, memberFound: true };
  }
  const syncedAt = Math.floor(Date.now() / 1000);
  await updateDiscordRoleSync(link.userId, syncedAt);
  return { configured: true, synced: true, memberFound: true, syncedAt };
}

export { DISCORD_INVITE_URL };
