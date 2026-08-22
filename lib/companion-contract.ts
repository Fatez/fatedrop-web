export const COMPANION_SCHEMA_VERSION = 3 as const;

export const ACTIVE_COMPANION_IDS = ["oru", "nyxen", "solix", "aeris"] as const;
export type CompanionId = (typeof ACTIVE_COMPANION_IDS)[number];
export type CompanionRequestId = CompanionId | "koru" | "fenn";

export type CompanionRenderMode = "fallback-2d" | "webgl-3d";
export type CompanionReaction = "idle" | "watching" | "echo" | "manifested" | "vanished" | "fatematch" | "major";
export type CompanionClipName = "Idle" | "Whisper" | "Echo" | "Manifested" | "Vanished" | "FateMatch";

export type CompanionDefinition = {
  id: CompanionId;
  name: string;
  code: string;
  role: string;
  slot: 1 | 2 | 3 | 4;
  isMascot: boolean;
  fallbackArtwork: string | null;
  modelUrl: string;
  textureUrl: string;
  modelFormat: "glb";
  animationClips: Record<CompanionReaction, CompanionClipName>;
};

const CLIPS: Record<CompanionReaction, CompanionClipName> = {
  idle: "Idle",
  watching: "Whisper",
  echo: "Echo",
  manifested: "Manifested",
  vanished: "Vanished",
  fatematch: "FateMatch",
  major: "FateMatch",
};

const ASSET_ROOT = "/assets/companions";

export const ACTIVE_COMPANION_ROSTER: readonly CompanionDefinition[] = [
  {
    id: "oru",
    name: "Oru",
    code: "ORU",
    role: "FateDrop guide",
    slot: 1,
    isMascot: true,
    fallbackArtwork: `${ASSET_ROOT}/koru-signal-companion.webp`,
    modelUrl: `${ASSET_ROOT}/oru/oru.glb`,
    textureUrl: `${ASSET_ROOT}/oru/oru-texture.jpg`,
    modelFormat: "glb",
    animationClips: CLIPS,
  },
  {
    id: "nyxen",
    name: "Nyxen",
    code: "K-13",
    role: "Whisper watcher",
    slot: 2,
    isMascot: false,
    fallbackArtwork: null,
    modelUrl: `${ASSET_ROOT}/nyxen/nyxen.glb`,
    textureUrl: `${ASSET_ROOT}/nyxen/nyxen-texture.jpg`,
    modelFormat: "glb",
    animationClips: CLIPS,
  },
  {
    id: "solix",
    name: "Solix",
    code: "K-12",
    role: "Manifested spark",
    slot: 3,
    isMascot: false,
    fallbackArtwork: null,
    modelUrl: `${ASSET_ROOT}/solix/solix.glb`,
    textureUrl: `${ASSET_ROOT}/solix/solix-texture.jpg`,
    modelFormat: "glb",
    animationClips: CLIPS,
  },
  {
    id: "aeris",
    name: "Aeris",
    code: "K-14",
    role: "Signal scout",
    slot: 4,
    isMascot: false,
    fallbackArtwork: null,
    modelUrl: `${ASSET_ROOT}/aeris/aeris.glb`,
    textureUrl: `${ASSET_ROOT}/aeris/aeris-texture.jpg`,
    modelFormat: "glb",
    animationClips: CLIPS,
  },
] as const;

export const LEGACY_COMPANION_ARCHIVE = [
  { id: "kael", name: "Kael", code: "K-01", status: "legacy-cameo" },
  { id: "nyra", name: "Nyra", code: "N-02", status: "legacy-cameo" },
] as const;

export const PLANNED_COMPANION_ARCHIVE = [
  { id: "fenn", name: "Fenn", status: "future-character" },
] as const;

export type CompanionRenderRequest = {
  companionId: CompanionRequestId;
  reaction: CompanionReaction;
  compact?: boolean;
  label?: string;
};

export function isCompanionId(value: unknown): value is CompanionId {
  return typeof value === "string" && (ACTIVE_COMPANION_IDS as readonly string[]).includes(value);
}

/** Preserve old Koru/Fenn links while the public roster moves to the supplied Oru models. */
export function normalizeCompanionId(value: unknown): CompanionId {
  if (isCompanionId(value)) return value;
  const legacy = String(value ?? "").toLowerCase();
  if (legacy === "koru" || legacy === "fenn") return "oru";
  return "oru";
}

export function companionDefinition(id: CompanionRequestId): CompanionDefinition {
  const normalized = normalizeCompanionId(id);
  return ACTIVE_COMPANION_ROSTER.find((companion) => companion.id === normalized) ?? ACTIVE_COMPANION_ROSTER[0];
}

export function companionRendererMode(definition: CompanionDefinition): CompanionRenderMode {
  return definition.modelUrl && definition.modelFormat === "glb" ? "webgl-3d" : "fallback-2d";
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
