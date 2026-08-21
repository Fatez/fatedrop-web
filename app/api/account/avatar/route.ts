import { getCurrentSnapshot, assertSameOrigin } from "@/lib/auth";
import { AvatarStorageUnavailableError, defaultAvatarRecord, getUserAvatar, saveUserAvatar } from "@/lib/avatar-storage";
import { normalizeAvatarLoadout, normalizeFavouriteTcgs } from "@/lib/avatar-loadout";
import { normalizeCompanionId } from "@/lib/companion-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
  try {
    const record = await getUserAvatar(snapshot.account.id);
    return Response.json({ avatar: record ?? defaultAvatarRecord(snapshot.account.id), persistent: Boolean(record) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ avatar: defaultAvatarRecord(snapshot.account.id), persistent: false }, { headers: { "Cache-Control": "private, no-store" } });
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
    const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!payload) return Response.json({ error: "Invalid avatar payload." }, { status: 400 });

    if (Object.prototype.hasOwnProperty.call(payload, "companionId")) {
      const companionId = normalizeCompanionId(payload.companionId);
      const current = await getUserAvatar(snapshot.account.id) ?? defaultAvatarRecord(snapshot.account.id);
      const avatar = await saveUserAvatar(snapshot.account.id, { ...current.loadout, companion: companionId }, current.favouriteTcgs);
      return Response.json({ avatar, companionId }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
    }

    const loadout = normalizeAvatarLoadout(payload.loadout);
    const favouriteTcgs = normalizeFavouriteTcgs(payload.favouriteTcgs);
    const current = await getUserAvatar(snapshot.account.id).catch(() => null);
    const avatar = await saveUserAvatar(snapshot.account.id, { ...loadout, companion: current?.loadout.companion ?? loadout.companion }, favouriteTcgs);
    return Response.json({ avatar }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof AvatarStorageUnavailableError) return Response.json({ error: "Profile and companion saving is staged. Approve the account migration to enable persistence." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Profile or companion choice could not be saved." }, { status: 500 });
  }
}
