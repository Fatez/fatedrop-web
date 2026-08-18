export const AVATAR_BASES = ["scout", "runner", "warden"] as const;
export const AVATAR_SKINS = ["light", "warm", "olive", "deep", "rich"] as const;
export const AVATAR_HAIR = ["midnight-spikes", "violet-wave", "silver-fade", "cyan-crop", "ember-fringe"] as const;
export const AVATAR_FACES = ["soft", "sharp", "friendly", "focused"] as const;
export const AVATAR_EYES = ["violet", "cyan", "amber", "silver"] as const;
export const AVATAR_OUTFITS = ["signal-hoodie", "collector-jacket", "tournament-shell", "spectral-bomber"] as const;
export const AVATAR_HEADWEAR = ["signal-cap", "headphones", "visor", "beanie"] as const;
export const AVATAR_ACCESSORIES = ["none", "chain", "card-charm", "signal-pin", "crossbody"] as const;
export const AVATAR_GEAR = ["scanner", "binder", "slab-case", "none"] as const;
export const AVATAR_COMPANIONS = ["radar-drone", "signal-orb", "mini-beacon", "none"] as const;
export const AVATAR_AURAS = ["violet", "cyan", "spectral", "gold"] as const;
export const AVATAR_BACKGROUNDS = ["fate-network", "command-room", "card-vault", "tournament-floor", "neon-desk"] as const;
export const AVATAR_TCG_STYLES = ["neutral", "pokemon", "one-piece", "lorcana", "magic", "yugioh"] as const;
export const FAVOURITE_TCGS = ["pokemon", "one-piece", "lorcana", "magic", "yugioh"] as const;

export type AvatarBase = typeof AVATAR_BASES[number];
export type AvatarSkin = typeof AVATAR_SKINS[number];
export type AvatarHair = typeof AVATAR_HAIR[number];
export type AvatarFace = typeof AVATAR_FACES[number];
export type AvatarEyes = typeof AVATAR_EYES[number];
export type AvatarOutfit = typeof AVATAR_OUTFITS[number];
export type AvatarHeadwear = typeof AVATAR_HEADWEAR[number];
export type AvatarAccessory = typeof AVATAR_ACCESSORIES[number];
export type AvatarGear = typeof AVATAR_GEAR[number];
export type AvatarCompanion = typeof AVATAR_COMPANIONS[number];
export type AvatarAura = typeof AVATAR_AURAS[number];
export type AvatarBackground = typeof AVATAR_BACKGROUNDS[number];
export type AvatarTcgStyle = typeof AVATAR_TCG_STYLES[number];
export type FavouriteTcg = typeof FAVOURITE_TCGS[number];

export type AvatarLoadout = {
  base: AvatarBase;
  skin: AvatarSkin;
  hair: AvatarHair;
  face: AvatarFace;
  eyes: AvatarEyes;
  outfit: AvatarOutfit;
  headwear: AvatarHeadwear;
  accessory: AvatarAccessory;
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
  skin: "warm",
  hair: "midnight-spikes",
  face: "friendly",
  eyes: "violet",
  outfit: "signal-hoodie",
  headwear: "signal-cap",
  accessory: "signal-pin",
  gear: "scanner",
  companion: "radar-drone",
  aura: "violet",
  background: "command-room",
  tcgStyle: "neutral",
};

export const AVATAR_OPTION_LABELS = {
  base: { scout: "Signal Scout", runner: "Network Runner", warden: "Vault Warden" },
  skin: { light: "Light", warm: "Warm", olive: "Olive", deep: "Deep", rich: "Rich" },
  hair: { "midnight-spikes": "Midnight Spikes", "violet-wave": "Violet Wave", "silver-fade": "Silver Fade", "cyan-crop": "Cyan Crop", "ember-fringe": "Ember Fringe" },
  face: { soft: "Soft", sharp: "Sharp", friendly: "Friendly", focused: "Focused" },
  eyes: { violet: "Violet", cyan: "Cyan", amber: "Amber", silver: "Silver" },
  outfit: { "signal-hoodie": "Signal Hoodie", "collector-jacket": "Collector Jacket", "tournament-shell": "Tournament Shell", "spectral-bomber": "Spectral Bomber" },
  headwear: { "signal-cap": "Signal Cap", headphones: "Headphones", visor: "Scanner Visor", beanie: "Collector Beanie" },
  accessory: { none: "No Accessory", chain: "Signal Chain", "card-charm": "Card Charm", "signal-pin": "Signal Pin", crossbody: "Collector Crossbody" },
  gear: { scanner: "Signal Scanner", binder: "Binder", "slab-case": "Slab Case", none: "No Gear" },
  companion: { "radar-drone": "Radar Drone", "signal-orb": "Signal Orb", "mini-beacon": "Mini Beacon", none: "No Companion" },
  aura: { violet: "Violet Signal", cyan: "Icy Radar", spectral: "Spectral Foil", gold: "Gold Trace" },
  background: { "fate-network": "Fate Network", "command-room": "Collector Command Room", "card-vault": "Card Vault", "tournament-floor": "Tournament Floor", "neon-desk": "Neon Collector Desk" },
  tcgStyle: { neutral: "FateDrop", pokemon: "Pokémon TCG", "one-piece": "One Piece TCG", lorcana: "Lorcana", magic: "Magic", yugioh: "Yu-Gi-Oh!" },
} as const;

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === "string" && (options as readonly string[]).includes(value);
}

export function normalizeAvatarLoadout(input: unknown): AvatarLoadout {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const rawBackground = raw.background === "collector-desk" ? "neon-desk" : raw.background;
  return {
    base: isOneOf(raw.base, AVATAR_BASES) ? raw.base : DEFAULT_AVATAR_LOADOUT.base,
    skin: isOneOf(raw.skin, AVATAR_SKINS) ? raw.skin : DEFAULT_AVATAR_LOADOUT.skin,
    hair: isOneOf(raw.hair, AVATAR_HAIR) ? raw.hair : DEFAULT_AVATAR_LOADOUT.hair,
    face: isOneOf(raw.face, AVATAR_FACES) ? raw.face : DEFAULT_AVATAR_LOADOUT.face,
    eyes: isOneOf(raw.eyes, AVATAR_EYES) ? raw.eyes : DEFAULT_AVATAR_LOADOUT.eyes,
    outfit: isOneOf(raw.outfit, AVATAR_OUTFITS) ? raw.outfit : DEFAULT_AVATAR_LOADOUT.outfit,
    headwear: isOneOf(raw.headwear, AVATAR_HEADWEAR) ? raw.headwear : DEFAULT_AVATAR_LOADOUT.headwear,
    accessory: isOneOf(raw.accessory, AVATAR_ACCESSORIES) ? raw.accessory : DEFAULT_AVATAR_LOADOUT.accessory,
    gear: isOneOf(raw.gear, AVATAR_GEAR) ? raw.gear : DEFAULT_AVATAR_LOADOUT.gear,
    companion: isOneOf(raw.companion, AVATAR_COMPANIONS) ? raw.companion : DEFAULT_AVATAR_LOADOUT.companion,
    aura: isOneOf(raw.aura, AVATAR_AURAS) ? raw.aura : DEFAULT_AVATAR_LOADOUT.aura,
    background: isOneOf(rawBackground, AVATAR_BACKGROUNDS) ? rawBackground : DEFAULT_AVATAR_LOADOUT.background,
    tcgStyle: isOneOf(raw.tcgStyle, AVATAR_TCG_STYLES) ? raw.tcgStyle : DEFAULT_AVATAR_LOADOUT.tcgStyle,
  };
}

export function normalizeFavouriteTcgs(input: unknown): FavouriteTcg[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter((value): value is FavouriteTcg => isOneOf(value, FAVOURITE_TCGS)))].slice(0, 3);
}
