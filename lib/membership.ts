import type { MembershipRecord, MembershipTier } from "./account-storage";
import { hasCapability } from "./entitlements";

export const DISCORD_INVITE_URL = "https://discord.gg/QK9ahpYSFk";
export const DISCORD_COMMUNITY_OPEN = process.env.NEXT_PUBLIC_DISCORD_ENABLED === "true";
export const TRIAL_DAYS = 7;

export function hasPremiumAccess(membership: MembershipRecord) {
  return hasCapability(membership, "advanced_fate_match");
}

export function membershipLabel(membership: MembershipRecord) {
  if (membership.status === "trialing") return `${tierLabel(membership.tier)} Trial`;
  if (membership.status === "active") return tierLabel(membership.tier);
  if (membership.status === "past_due") return `${tierLabel(membership.tier)} · payment issue`;
  if (membership.status === "paused") return `${tierLabel(membership.tier)} · paused`;
  return "Free Network Member";
}

export function tierLabel(tier: MembershipTier) {
  if (tier === "plus" || tier === "pro") return "FateDrop Plus";
  return "Free";
}

export function networkAge(createdAt: number, now = Math.floor(Date.now() / 1000)) {
  const days = Math.max(0, Math.floor((now - createdAt) / 86_400));
  if (days < 1) return "Joined today";
  if (days === 1) return "1 day in the network";
  if (days < 30) return `${days} days in the network`;
  const months = Math.floor(days / 30.4375);
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} in the network`;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  return remainder ? `${years}y ${remainder}m in the network` : `${years} ${years === 1 ? "year" : "years"} in the network`;
}

export function formatMemberSince(createdAt: number) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }).format(new Date(createdAt * 1000));
}
