import type { AvatarLoadout } from "./avatar-loadout";

export const COMPANION_SCHEMA_VERSION = 1 as const;

export type CompanionRenderMode = "fallback-2d" | "webgl-3d";
export type CompanionReaction = "idle" | "watching" | "echo" | "manifested" | "vanished" | "fatematch" | "major";

export type CompanionAssetManifest = {
  version: typeof COMPANION_SCHEMA_VERSION;
  characterModelUrl: string | null;
  characterFormat: "glb" | null;
  droidModelUrl: string | null;
  droidFormat: "glb" | null;
  animationClips: Partial<Record<CompanionReaction, string>>;
  fallbackArtworkVersion: string;
};

export type CompanionRenderRequest = {
  loadout: AvatarLoadout;
  reaction: CompanionReaction;
  mode?: CompanionRenderMode;
  compact?: boolean;
  label?: string;
};

export const DEFAULT_COMPANION_ASSET_MANIFEST: CompanionAssetManifest = {
  version: COMPANION_SCHEMA_VERSION,
  characterModelUrl: null,
  characterFormat: null,
  droidModelUrl: null,
  droidFormat: null,
  animationClips: {},
  fallbackArtworkVersion: "koru-v1",
};

export function companionReactionFromSignal(input: { kind?: string | null; state?: string | null; fateMatch?: boolean; major?: boolean }): CompanionReaction {
  if (input.fateMatch) return "fatematch";
  if (input.major) return "major";
  const kind = (input.kind ?? input.state ?? "").toLowerCase();
  if (kind === "whisper" || kind === "drop_pulse") return "watching";
  if (kind === "echo" || kind === "queue" || kind === "security" || kind === "traffic" || kind === "access_readiness" || kind === "access-blocked" || kind === "access_blocked") return "echo";
  if (kind === "manifested") return "manifested";
  if (kind === "vanished") return "vanished";
  return "watching";
}

export function companionRendererMode(manifest: CompanionAssetManifest = DEFAULT_COMPANION_ASSET_MANIFEST): CompanionRenderMode {
  return manifest.characterModelUrl && manifest.characterFormat === "glb" ? "webgl-3d" : "fallback-2d";
}
