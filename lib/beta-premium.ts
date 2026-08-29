import type { NeonQueryFunction } from "@neondatabase/serverless";
import type { AccountSnapshot, MembershipRecord } from "./account-storage";

export type BetaPremiumAccessGrant = {
  type: "beta-premium";
  temporary: true;
};

export type AccessSnapshot = AccountSnapshot & {
  accessGrant: BetaPremiumAccessGrant | null;
};

export function betaPremiumEnabled() {
  return process.env.FATEDROP_BETA_PREMIUM_ENABLED !== "false";
}

export async function applyTemporaryBetaPremium(snapshot: AccountSnapshot | null): Promise<AccessSnapshot | null> {
  if (!snapshot) return null;

  if (!betaPremiumEnabled()) {
    return { ...snapshot, accessGrant: null };
  }

  const membershipAlreadyPremium =
    (snapshot.membership.tier === "plus" || snapshot.membership.tier === "pro") &&
    (snapshot.membership.status === "active" || snapshot.membership.status === "trialing");

  if (membershipAlreadyPremium || !(await collectorIsInBeta(snapshot.account.email))) {
    return { ...snapshot, accessGrant: null };
  }

  const membership: MembershipRecord = {
    ...snapshot.membership,
    tier: "plus",
    status: "active",
  };

  return {
    ...snapshot,
    membership,
    accessGrant: { type: "beta-premium", temporary: true },
  };
}

async function collectorIsInBeta(email: string) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return false;

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql: NeonQueryFunction<false, false> = neon(connectionString);
    const rows = await sql`
      SELECT 1
      FROM beta_leads
      WHERE lower(email) = ${normalizedEmail}
        AND role = 'collector'
        AND contact_consent = TRUE
      LIMIT 1
    `;
    return Boolean(rows[0]);
  } catch {
    // Premium beta eligibility must never make a valid FateDrop sign-in fail.
    return false;
  }
}
