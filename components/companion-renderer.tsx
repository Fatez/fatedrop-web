"use client";

import { AvatarPreview, type AvatarMood } from "@/components/avatar-preview";
import { DEFAULT_COMPANION_ASSET_MANIFEST, companionRendererMode, type CompanionAssetManifest, type CompanionRenderRequest } from "@/lib/companion-contract";

function fallbackMood(reaction: CompanionRenderRequest["reaction"]): AvatarMood {
  if (reaction === "echo") return "whisper";
  if (reaction === "manifested") return "manifested";
  if (reaction === "vanished") return "alert";
  if (reaction === "fatematch") return "match";
  if (reaction === "major") return "major";
  if (reaction === "watching") return "watching";
  return "idle";
}

export function CompanionRenderer({ request, manifest = DEFAULT_COMPANION_ASSET_MANIFEST }: { request: CompanionRenderRequest; manifest?: CompanionAssetManifest }) {
  const mode = request.mode ?? companionRendererMode(manifest);

  // The 3D boundary is intentionally explicit: when the production GLB/animation
  // manifest is supplied, this component becomes the only account-facing swap point.
  // Until then the persisted loadout is rendered through the proven illustrated rig.
  if (mode === "webgl-3d" && manifest.characterModelUrl) {
    return <div className="fd-companion-3d-pending" data-model={manifest.characterModelUrl} data-droid={manifest.droidModelUrl ?? undefined} aria-label={request.label ?? "FateDrop Companion 3D renderer pending integration"}>
      <AvatarPreview loadout={request.loadout} mood={fallbackMood(request.reaction)} compact={request.compact} label={request.label ?? "FateDrop Companion"}/>
    </div>;
  }

  return <AvatarPreview loadout={request.loadout} mood={fallbackMood(request.reaction)} compact={request.compact} label={request.label ?? "FateDrop Companion"}/>;
}
