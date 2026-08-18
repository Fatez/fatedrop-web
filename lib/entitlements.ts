import type { MembershipRecord, MembershipTier } from "@/lib/account-storage";

export type FateCapability =
  | "browse_network"
  | "selected_signals"
  | "retailer_discovery"
  | "true_price"
  | "advanced_fate_match"
  | "priority_alerts"
  | "advanced_filters"
  | "premium_discord"
  | "fate_lock_eligibility";

const FREE: FateCapability[] = ["browse_network", "selected_signals", "retailer_discovery", "true_price"];
const PREMIUM: FateCapability[] = [...FREE, "advanced_fate_match", "priority_alerts", "advanced_filters", "premium_discord", "fate_lock_eligibility"];

export function membershipIsActive(membership: MembershipRecord) {
  return membership.status === "trialing" || membership.status === "active";
}

export function effectiveTier(membership: MembershipRecord): MembershipTier {
  return membershipIsActive(membership) ? membership.tier : "free";
}

export function capabilitiesForMembership(membership: MembershipRecord): ReadonlySet<FateCapability> {
  return new Set(effectiveTier(membership) === "free" ? FREE : PREMIUM);
}

export function hasCapability(membership: MembershipRecord, capability: FateCapability) {
  return capabilitiesForMembership(membership).has(capability);
}
