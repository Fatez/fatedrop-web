"use client";

import { KoruMascot } from "@/components/koru-mascot";
import {
  DEFAULT_COMPANION_ASSET_MANIFEST,
  companionRendererMode,
  type CompanionAssetManifest,
  type CompanionRenderRequest,
} from "@/lib/companion-contract";

export function CompanionRenderer({ request, manifest = DEFAULT_COMPANION_ASSET_MANIFEST }: { request: CompanionRenderRequest; manifest?: CompanionAssetManifest }) {
  const mode = companionRendererMode(manifest);

  if (mode === "webgl-3d" && manifest.characterModelUrl) {
    return <div className="koru-3d-boundary" data-model={manifest.characterModelUrl}>
      <KoruMascot reaction={request.reaction} compact={request.compact} label={request.label}/>
      <span>Approved Koru 3D asset registered · web renderer pending isolated validation</span>
      <style jsx>{`.koru-3d-boundary{display:grid;gap:8px}.koru-3d-boundary>span{color:#77717e;font-size:8px;text-align:center}`}</style>
    </div>;
  }

  return <KoruMascot reaction={request.reaction} compact={request.compact} label={request.label}/>;
}
