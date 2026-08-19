import { getSnapshotForRequest } from "@/lib/auth";
import { capabilitiesForMembership, effectiveTier, membershipIsActive } from "@/lib/entitlements";
import { listWishlist } from "@/lib/wishlist-storage";
import { listUserFateMatches } from "@/lib/fate-match-storage";
import { DEFAULT_NOTIFICATION_PREFERENCES, getNotificationPreferences } from "@/lib/notification-preferences";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const snapshot = await getSnapshotForRequest(request);
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401, headers: { "cache-control": "no-store" } });

  const [wishlistResult, fateFindResult, preferenceResult] = await Promise.allSettled([
    listWishlist(snapshot.account.id),
    listUserFateMatches(snapshot.account.id),
    getNotificationPreferences(snapshot.account.id),
  ]);

  const pendingMigrations: string[] = [];
  if (wishlistResult.status === "rejected") pendingMigrations.push("wishlist");
  if (fateFindResult.status === "rejected") pendingMigrations.push("fatefind");
  if (preferenceResult.status === "rejected") pendingMigrations.push("notification-preferences");

  return Response.json({
    contractVersion: 1,
    syncedAt: Math.floor(Date.now() / 1000),
    user: {
      id: snapshot.account.id,
      fateId: snapshot.account.fateId,
      email: snapshot.account.email,
      handle: snapshot.account.handle,
      displayName: snapshot.account.displayName,
      createdAt: snapshot.account.createdAt,
    },
    entitlement: {
      configuredTier: snapshot.membership.tier,
      effectiveTier: effectiveTier(snapshot.membership),
      status: snapshot.membership.status,
      active: membershipIsActive(snapshot.membership),
      capabilities: [...capabilitiesForMembership(snapshot.membership)].sort(),
      trialEndsAt: snapshot.membership.trialEndsAt,
      currentPeriodEnd: snapshot.membership.currentPeriodEnd,
      cancelAtPeriodEnd: snapshot.membership.cancelAtPeriodEnd,
      updatedAt: snapshot.membership.updatedAt,
    },
    wishlist: wishlistResult.status === "fulfilled" ? wishlistResult.value : [],
    fateFinds: fateFindResult.status === "fulfilled" ? fateFindResult.value : [],
    notificationPreferences: preferenceResult.status === "fulfilled" ? preferenceResult.value : DEFAULT_NOTIFICATION_PREFERENCES,
    pendingMigrations,
  }, { headers: { "cache-control": "private, no-store, max-age=0" } });
}
