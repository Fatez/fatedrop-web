"use client";

import { AvatarLayeredCharacter } from "@/components/avatar-layered-character";
import type { AvatarMood as LayeredAvatarMood } from "@/components/avatar-layered-character";
import type { AvatarLoadout } from "@/lib/avatar-loadout";

export type AvatarMood = LayeredAvatarMood;

export function AvatarAnimeCharacter({ loadout, mood = "idle", className = "" }: { loadout: AvatarLoadout; mood?: AvatarMood; className?: string }) {
  return <AvatarLayeredCharacter loadout={loadout} mood={mood} className={className}/>;
}
