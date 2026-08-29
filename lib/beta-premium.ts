import type { AccountSnapshot, MembershipRecord } from "./account-storage";
import { betaAccessIsApproved, getBetaAccess, type BetaAccessSnapshot } from "./beta-access";

export type BetaPremiumAccessGrant = {
  type: "beta-premium";
  temporary: true;
};

export type AccessSnapshot = AccountSnapshot & {
  betaAccess: BetaAccessSnapshot;
  accessGrant: BetaPremiumAccessGrant | null;
};

export function betaPremiumEnabled() {
  return process.env.FATEDROP_BETA_PREMIUM_ENABLED !== "false";
}

export async function applyTemporaryBetaPremium(snapshot: AccountSnapshot | null): Promise<AccessSnapshot | null> {
  if (!snapshot) return null;

  const betaAccess = await getBetaAccess(snapshot.account.id);
  const base = { ...snapshot, betaAccess };

  // Closed beta is approval-only: Pending/Revoked accounts remain authenticated
  // only for approval status, while Approved accounts receive the complete beta
  // feature set regardless of their future paid membership tier.
  if (!betaAccessIsApproved(betaAccess)) {
    return { ...base, accessGrant: null };
  }

  if (!betaPremiumEnabled()) {
    return { ...base, accessGrant: null };
  }

  const membershipAlreadyPremium =
    (snapshot.membership.tier === "plus" || snapshot.membership.tier === "pro") &&
    (snapshot.membership.status === "active" || snapshot.membership.status === "trialing");

  if (membershipAlreadyPremium) {
    return { ...base, accessGrant: { type: "beta-premium", temporary: true } };
  }

  const membership: MembershipRecord = {
    ...snapshot.membership,
    tier: "plus",
    status: "active",
  };

  return {
    ...base,
    membership,
    accessGrant: { type: "beta-premium", temporary: true },
  };
}
