export const AVATAR_BASES = ["scout", "runner", "warden"] as const;
export const AVATAR_HAIR = ["midnight-spikes", "violet-wave", "silver-fade", "cyan-crop"] as const;
export const AVATAR_OUTFITS = ["signal-hoodie", "collector-jacket", "tournament-shell"] as const;
export const AVATAR_HEADWEAR = ["signal-cap", "headphones", "visor", "beanie"] as const;
export const AVATAR_GEAR = ["scanner", "binder", "slab-case", "none"] as const;
export const AVATAR_COMPANIONS = ["radar-drone", "signal-orb", "mini-beacon", "none"] as const;
export const AVATAR_AURAS = ["violet", "cyan", "spectral", "gold"] as const;
export const AVATAR_BACKGROUNDS = ["fate-network", "collector-desk", "card-vault", "tournament-floor"] as const;
export const AVATAR_TCG_STYLES = ["neutral", "pokemon", "one-piece", "lorcana", "magic", "yugioh"] as const;
export const FAVOURITE_TCGS = ["pokemon", "one-piece", "lorcana", "magic", "yugioh"] as const;

export type AvatarBase = typeof AVATAR_BASES[number];
export type AvatarHair = typeof AVATAR_HAIR[number];
export type AvatarOutfit = typeof AVATAR_OUTFITS[number];
export type AvatarHeadwear = typeof AVATAR_HEADWEAR[number];
export type AvatarGear = typeof AVATAR_GEAR[number];
export type AvatarCompanion = typeof AVATAR_COMPANIONS[number];
export type AvatarAura = typeof AVATAR_AURAS[number];
export type AvatarBackground = typeof AVATAR_BACKGROUNDS[number];
export type AvatarTcgStyle = typeof AVATAR_TCG_STYLES[number];
export type FavouriteTcg = typeof FAVOURITE_TCGS[number];

export type AvatarLoadout = {
  base: AvatarBase;
  hair: AvatarHair;
  outfit: AvatarOutfit;
  headwear: AvatarHeadwear;
  gear: AvatarGear;
  companion: AvatarCompanion;
  aura: AvatarAura;
  background: AvatarBackground;
  tcgStyle: AvatarTcgStyle;
};

export type AvatarRecord = {
  userId: string;
  loadout: AvatarLoadout;
  favouriteTcgs: FavouriteTcg[];
  updatedAt: number;
};

export const DEFAULT_AVATAR_LOADOUT: AvatarLoadout = {
  base: "scout",
  hair: "midnight-spikes",
  outfit: "signal-hoodie",
  headwear: "signal-cap",
  gear: "scanner",
  companion: "radar-drone",
  aura: "violet",
  background: "fate-network",
  tcgStyle: "neutral",
};

export const AVATAR_OPTION_LABELS = {
  base: { scout: "Signal Scout", runner: "Network Runner", warden: "Vault Warden" },
  hair: { "midnight-spikes": "Midnight Spikes", "violet-wave": "Violet Wave", "silver-fade": "Silver Fade", "cyan-crop": "Cyan Crop" },
  outfit: { "signal-hoodie": "Signal Hoodie", "collector-jacket": "Collector Jacket", "tournament-shell": "Tournament Shell" },
  headwear: { "signal-cap": "Signal Cap", headphones: "Headphones", visor: "Scanner Visor", beanie: "Collector Beanie" },
  gear: { scanner: "Signal Scanner", binder: "Binder", "slab-case": "Slab Case", none: "No Gear" },
  companion: { "radar-drone": "Radar Drone", "signal-orb": "Signal Orb", "mini-beacon": "Mini Beacon", none: "No Companion" },
  aura: { violet: "Violet Signal", cyan: "Icy Radar", spectral: "Spectral Foil", gold: "Gold Trace" },
  background: { "fate-network": "Fate Network", "collector-desk": "Collector Desk", "card-vault": "Card Vault", "tournament-floor": "Tournament Floor" },
  tcgStyle: { neutral: "FateDrop", pokemon: "Pokémon TCG", "one-piece": "One Piece TCG", lorcana: "Lorcana", magic: "Magic", yugioh: "Yu-Gi-Oh!" },
} as const;

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === "string" && (options as readonly string[]).includes(value);
}

export function normalizeAvatarLoadout(input: unknown): AvatarLoadout {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  return {
    base: isOneOf(raw.base, AVATAR_BASES) ? raw.base : DEFAULT_AVATAR_LOADOUT.base,
    hair: isOneOf(raw.hair, AVATAR_HAIR) ? raw.hair : DEFAULT_AVATAR_LOADOUT.hair,
    outfit: isOneOf(raw.outfit, AVATAR_OUTFITS) ? raw.outfit : DEFAULT_AVATAR_LOADOUT.outfit,
    headwear: isOneOf(raw.headwear, AVATAR_HEADWEAR) ? raw.headwear : DEFAULT_AVATAR_LOADOUT.headwear,
    gear: isOneOf(raw.gear, AVATAR_GEAR) ? raw.gear : DEFAULT_AVATAR_LOADOUT.gear,
    companion: isOneOf(raw.companion, AVATAR_COMPANIONS) ? raw.companion : DEFAULT_AVATAR_LOADOUT.companion,
    aura: isOneOf(raw.aura, AVATAR_AURAS) ? raw.aura : DEFAULT_AVATAR_LOADOUT.aura,
    background: isOneOf(raw.background, AVATAR_BACKGROUNDS) ? raw.background : DEFAULT_AVATAR_LOADOUT.background,
    tcgStyle: isOneOf(raw.tcgStyle, AVATAR_TCG_STYLES) ? raw.tcgStyle : DEFAULT_AVATAR_LOADOUT.tcgStyle,
  };
}

export function normalizeFavouriteTcgs(input: unknown): FavouriteTcg[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter((value): value is FavouriteTcg => isOneOf(value, FAVOURITE_TCGS)))].slice(0, 3);
}
