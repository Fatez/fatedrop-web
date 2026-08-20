export type CompanionVariant = "male" | "female" | "droid";
export type CompanionAssetRole = "humanoid" | "droid";
export type CompanionAssetState = "ready" | "quarantined";

export type CompanionAssetDefinition = {
  id: CompanionVariant;
  label: string;
  role: CompanionAssetRole;
  file: string;
  state: CompanionAssetState;
  description: string;
  unavailableMessage?: string;
};

export type CompanionBounds = {
  min: [number, number, number];
  max: [number, number, number];
};

export const COMPANION_ASSETS: Record<CompanionVariant, CompanionAssetDefinition> = {
  male: {
    id: "male",
    label: "KAEL",
    role: "humanoid",
    file: "/assets/companions/fatedrop-male.glb",
    state: "ready",
    description: "Collector hunter",
  },
  female: {
    id: "female",
    label: "NYRA",
    role: "humanoid",
    file: "/assets/companions/fatedrop-female.glb",
    state: "ready",
    description: "Network tactician",
  },
  droid: {
    id: "droid",
    label: "VØX",
    role: "droid",
    file: "/assets/companions/fatedrop-droid.glb",
    state: "ready",
    description: "Floating signal familiar",
  },
};

export const COMPANION_VARIANTS = Object.keys(COMPANION_ASSETS) as CompanionVariant[];

export function companionDimensions(bounds: CompanionBounds) {
  return {
    width: Math.abs(bounds.max[0] - bounds.min[0]),
    height: Math.abs(bounds.max[1] - bounds.min[1]),
    depth: Math.abs(bounds.max[2] - bounds.min[2]),
  };
}

/**
 * Reject crossed assets before they reach the renderer. Humanoids must read as
 * vertically dominant; the familiar must be genuinely volumetric rather than
 * a card or flat prop.
 */
export function validateCompanionGeometry(asset: CompanionAssetDefinition, bounds: CompanionBounds): string | null {
  const { width, height, depth } = companionDimensions(bounds);
  const largest = Math.max(width, height, depth, 0.0001);
  const smallest = Math.min(width, height, depth);

  if (asset.role === "humanoid") {
    if (height < width * 1.12 || height < depth * 1.12) {
      return `${asset.label} was rejected: expected a vertically oriented humanoid model.`;
    }
    return null;
  }

  if (smallest / largest < 0.28) {
    return `${asset.label} was rejected: expected a volumetric familiar model, not a flat prop.`;
  }

  return null;
}
