import type { AvatarLoadout } from "@/lib/avatar-loadout";

export const AVATAR_SPRITE_SHEET = "/assets/avatar-v2/avatar-sprites.svg";

export type AvatarLayerKind = "background" | "aura" | "base" | "skin" | "hairBack" | "face" | "eyes" | "outfit" | "accessory" | "gear" | "hairFront" | "headwear" | "companion";

function normalisedBackground(background: AvatarLoadout["background"]) {
  return background === "collector-desk" ? "neon-desk" : background;
}

export function avatarLayerId(kind: AvatarLayerKind, loadout: AvatarLoadout) {
  switch (kind) {
    case "background": return `bg-${normalisedBackground(loadout.background)}`;
    case "aura": return `aura-${loadout.aura}`;
    case "base": return `base-${loadout.base}`;
    case "skin": return `skin-${loadout.skin}-tone`;
    case "hairBack": return `hair-back-${loadout.hair}`;
    case "face": return `face-${loadout.face}`;
    case "eyes": return `eyes-${loadout.eyes}`;
    case "outfit": return `outfit-${loadout.outfit}`;
    case "accessory": return `accessory-${loadout.accessory}`;
    case "gear": return `gear-${loadout.gear}`;
    case "hairFront": return `hair-front-${loadout.hair}`;
    case "headwear": return `head-${loadout.headwear}`;
    case "companion": return `companion-${loadout.companion}`;
  }
}

export function avatarLayerHref(kind: AvatarLayerKind, loadout: AvatarLoadout) {
  return `${AVATAR_SPRITE_SHEET}#${avatarLayerId(kind, loadout)}`;
}

export const AVATAR_LAYER_ORDER: AvatarLayerKind[] = [
  "background",
  "aura",
  "base",
  "hairBack",
  "skin",
  "face",
  "eyes",
  "outfit",
  "accessory",
  "gear",
  "hairFront",
  "headwear",
  "companion",
];

export const AVATAR_RIG_VERSION = 2;
export const AVATAR_RIG_VIEWBOX = "0 0 640 960";
