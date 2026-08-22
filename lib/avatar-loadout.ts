import { normalizeCompanionId, type CompanionId } from "@/lib/companion-contract";

export const FAVOURITE_TCGS = ["pokemon", "one-piece", "lorcana", "magic", "yugioh"] as const;

export type AvatarCompanion = CompanionId;
export type FavouriteTcg = typeof FAVOURITE_TCGS[number];

/**
 * Legacy storage name retained for database/API compatibility.
 * The active Koru & Friends system stores only the selected companion here.
 */
export type AvatarLoadout = {
  companion: AvatarCompanion;
};

export type AvatarRecord = {
  userId: string;
  loadout: AvatarLoadout;
  favouriteTcgs: FavouriteTcg[];
  updatedAt: number;
};

export const DEFAULT_AVATAR_LOADOUT: AvatarLoadout = {
  companion: "koru",
};

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === "string" && (options as readonly string[]).includes(value);
}

export function normalizeAvatarLoadout(input: unknown): AvatarLoadout {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  return { companion: normalizeCompanionId(raw.companion) };
}

export function normalizeFavouriteTcgs(input: unknown): FavouriteTcg[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter((value): value is FavouriteTcg => isOneOf(value, FAVOURITE_TCGS)))].slice(0, 3);
}
