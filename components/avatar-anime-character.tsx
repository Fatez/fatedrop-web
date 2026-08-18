"use client";

import { AvatarLayeredCharacter, type AvatarMood } from "@/components/avatar-layered-character";
import type { AvatarLoadout } from "@/lib/avatar-loadout";

export type { AvatarMood } from "@/components/avatar-layered-character";

export function AvatarAnimeCharacter({ loadout, mood = "idle", className = "" }: { loadout: AvatarLoadout; mood?: AvatarMood; className?: string }) {
  return <AvatarLayeredCharacter loadout={loadout} mood={mood} className={className}/>;
}
