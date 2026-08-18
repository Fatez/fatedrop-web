import { AccountConflictError, AccountStorageUnavailableError, updateAccountProfile } from "@/lib/account-storage";
import { assertSameOrigin, getCurrentSnapshot } from "@/lib/auth";
import { hasPremiumAccess, membershipLabel, networkAge } from "@/lib/membership";
import { normalizeAvatarValue } from "@/lib/avatar";

export const runtime = "nodejs";

function publicSnapshot(snapshot: NonNullable<Awaited<ReturnType<typeof getCurrentSnapshot>>>) {
  return {
    profile: {
      fateId: snapshot.account.fateId,
      email: snapshot.account.email,
      displayName: snapshot.account.displayName,
      username: snapshot.account.username,
      bio: snapshot.account.bio,
      avatarUrl: snapshot.account.avatarUrl,
      primaryTcg: snapshot.account.primaryTcg,
      collectorStyle: snapshot.account.collectorStyle,
      region: snapshot.account.region,
      profileTheme: snapshot.account.profileTheme,
      createdAt: snapshot.account.createdAt,
      networkAge: networkAge(snapshot.account.createdAt),
    },
    membership: {
      tier: snapshot.membership.tier,
      status: snapshot.membership.status,
      label: membershipLabel(snapshot.membership),
      premium: hasPremiumAccess(snapshot.membership),
      trialEndsAt: snapshot.membership.trialEndsAt,
      currentPeriodEnd: snapshot.membership.currentPeriodEnd,
      cancelAtPeriodEnd: snapshot.membership.cancelAtPeriodEnd,
    },
    discord: snapshot.discord ? {
      username: snapshot.discord.discordUsername,
      avatar: snapshot.discord.discordAvatar,
      connectedAt: snapshot.discord.connectedAt,
      roleSyncedAt: snapshot.discord.roleSyncedAt,
    } : null,
  };
}

export async function GET() {
  try {
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Sign in required." }, { status: 401 });
    return Response.json(publicSnapshot(snapshot));
  } catch (error) {
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    return Response.json({ error: "Account could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Sign in required." }, { status: 401 });
    const payload = await request.json() as Record<string, unknown>;

    const displayName = typeof payload.displayName === "string" ? payload.displayName.trim().slice(0, 60) : snapshot.account.displayName;
    const username = typeof payload.username === "string" ? payload.username.trim().toLowerCase().slice(0, 24) : snapshot.account.username;
    const bio = typeof payload.bio === "string" ? payload.bio.trim().slice(0, 220) : (snapshot.account.bio ?? "");
    const avatarUrl = typeof payload.avatarUrl === "string" ? payload.avatarUrl.trim() : (snapshot.account.avatarUrl ?? "");
    let normalizedAvatarUrl = avatarUrl;
    const primaryTcg = typeof payload.primaryTcg === "string" ? payload.primaryTcg.trim().slice(0, 80) : (snapshot.account.primaryTcg ?? "");
    const collectorStyle = typeof payload.collectorStyle === "string" ? payload.collectorStyle.trim().slice(0, 80) : (snapshot.account.collectorStyle ?? "");
    const region = typeof payload.region === "string" ? payload.region.trim().slice(0, 80) : (snapshot.account.region ?? "");
    const profileTheme = typeof payload.profileTheme === "string" && ["signal", "cyan", "violet", "magenta"].includes(payload.profileTheme) ? payload.profileTheme as "signal" | "cyan" | "violet" | "magenta" : snapshot.account.profileTheme;

    const fields: Record<string, string> = {};
    if (displayName.length < 2) fields.displayName = "Use at least 2 characters.";
    if (!/^[a-z0-9_]{3,24}$/.test(username)) fields.username = "Use 3–24 lowercase letters, numbers or underscores.";
    const normalizedAvatar = normalizeAvatarValue(avatarUrl);
    if (normalizedAvatar.error) fields.avatarUrl = normalizedAvatar.error;
    normalizedAvatarUrl = normalizedAvatar.value ?? "";
    if (Object.keys(fields).length) return Response.json({ error: "Check the highlighted fields.", fields }, { status: 400 });

    await updateAccountProfile(snapshot.account.id, {
      displayName,
      username,
      bio: bio || null,
      avatarUrl: normalizedAvatarUrl || null,
      primaryTcg: primaryTcg || null,
      collectorStyle: collectorStyle || null,
      region: region || null,
      profileTheme,
    });
    const updated = await getCurrentSnapshot();
    if (!updated) return Response.json({ error: "Account could not be reloaded." }, { status: 500 });
    return Response.json(publicSnapshot(updated));
  } catch (error) {
    if (error instanceof AccountConflictError) return Response.json({ error: error.message, fields: { username: error.message } }, { status: 409 });
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Profile could not be updated." }, { status: 500 });
  }
}
