export const COMPANION_SCHEMA_VERSION = 2 as const;

export const ACTIVE_COMPANION_IDS = ["koru", "fenn", "aeris", "nyxen", "solix"] as const;
export type CompanionId = (typeof ACTIVE_COMPANION_IDS)[number];

export type CompanionRenderMode = "fallback-2d" | "webgl-3d";
export type CompanionReaction = "idle" | "watching" | "echo" | "manifested" | "vanished" | "fatematch" | "major";

export type CompanionDefinition = {
  id: CompanionId;
  name: string;
  slot: 1 | 2 | 3 | 4 | 5;
  isMascot: boolean;
  fallbackArtwork: string | null;
  modelUrl: string | null;
  reactionModelUrls?: Partial<Record<CompanionReaction, string>>;
  modelFormat: "glb" | null;
  animationClips: Partial<Record<CompanionReaction, string>>;
};

// Verified directly against the supplied Aeris, Nyxen, Solix and Fenn state exports.
// These names describe source animation metadata only; the lightweight WebGL viewer
// does not claim skeletal clip playback until that capability is separately shipped.
const VERIFIED_STATE_CLIPS: Partial<Record<CompanionReaction, string>> = {
  idle: "Armature|Idle|baselayer",
  watching: "Armature|Listening_Gesture|baselayer",
  echo: "Armature|Alert|baselayer",
  manifested: "Armature|mage_soell_cast_1|baselayer",
  vanished: "Armature|Sneaky_Walk|baselayer",
  fatematch: "Armature|Victory_Cheer|baselayer",
  major: "Armature|Victory_Cheer|baselayer",
};

export const ACTIVE_COMPANION_ROSTER: readonly CompanionDefinition[] = [
  { id: "koru", name: "Koru", slot: 1, isMascot: true, fallbackArtwork: "/assets/companions/koru-signal-companion.webp", modelUrl: null, modelFormat: null, animationClips: {} },
  { id: "fenn", name: "Fenn", slot: 2, isMascot: false, fallbackArtwork: null, modelUrl: null, modelFormat: null, animationClips: VERIFIED_STATE_CLIPS },
  { id: "aeris", name: "Aeris", slot: 3, isMascot: false, fallbackArtwork: null, modelUrl: "/assets/companions/aeris/aeris.glb", modelFormat: "glb", animationClips: VERIFIED_STATE_CLIPS },
  { id: "nyxen", name: "Nyxen", slot: 4, isMascot: false, fallbackArtwork: null, modelUrl: "/assets/companions/nyxen/nyxen.glb", modelFormat: "glb", animationClips: VERIFIED_STATE_CLIPS },
  { id: "solix", name: "Solix", slot: 5, isMascot: false, fallbackArtwork: null, modelUrl: "/assets/companions/solix/solix.glb", modelFormat: "glb", animationClips: VERIFIED_STATE_CLIPS },
] as const;

export const LEGACY_COMPANION_ARCHIVE = [
  { id: "kael", name: "Kael", code: "K-01" },
  { id: "nyra", name: "Nyra", code: "N-02" },
] as const;

export type CompanionRenderRequest = {
  companionId: CompanionId;
  reaction: CompanionReaction;
  compact?: boolean;
  label?: string;
};

export function isCompanionId(value: unknown): value is CompanionId {
  return typeof value === "string" && (ACTIVE_COMPANION_IDS as readonly string[]).includes(value);
}

export function normalizeCompanionId(value: unknown): CompanionId {
  return isCompanionId(value) ? value : "koru";
}

export function companionDefinition(id: CompanionId): CompanionDefinition {
  return ACTIVE_COMPANION_ROSTER.find((companion) => companion.id === id) ?? ACTIVE_COMPANION_ROSTER[0];
}

export function companionModelUrl(definition: CompanionDefinition, reaction: CompanionReaction): string | null {
  const reactionUrl = definition.reactionModelUrls?.[reaction]
    ?? (reaction === "major" ? definition.reactionModelUrls?.fatematch : undefined);
  return reactionUrl ?? definition.modelUrl;
}

export function companionRendererMode(definition: CompanionDefinition): CompanionRenderMode {
  const hasReactionModel = Object.keys(definition.reactionModelUrls ?? {}).length > 0;
  return definition.modelFormat === "glb" && (Boolean(definition.modelUrl) || hasReactionModel) ? "webgl-3d" : "fallback-2d";
}

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
