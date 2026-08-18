"use client";

import { AvatarLayeredCharacter } from "@/components/avatar-layered-character";
import type { AvatarLoadout } from "@/lib/avatar-loadout";

export function AvatarOptionThumbnail({ loadout }: { loadout: AvatarLoadout }) {
  return <div className="fd-option-thumb" aria-hidden="true"><AvatarLayeredCharacter loadout={loadout} mood="idle"/><style jsx>{`
    .fd-option-thumb{position:relative;width:100%;aspect-ratio:4/3;overflow:hidden;border-radius:10px;background:#07080d}.fd-option-thumb :global(.fd-layered-avatar){position:absolute;inset:-34% -8% -12%;filter:none}.fd-option-thumb :global(.fd-layer-person),.fd-option-thumb :global(.fd-layer-companion),.fd-option-thumb :global(.fd-layer-atmosphere),.fd-option-thumb :global(.fd-avatar-particles i){animation:none!important}.fd-option-thumb:after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 0 1px rgba(255,255,255,.04);border-radius:10px;pointer-events:none}
  `}</style></div>;
}
