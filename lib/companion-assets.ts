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
    label: "Signal Scout",
    role: "humanoid",
    file: "/assets/companions/fatedrop-male.glb",
    state: "ready",
    description: "Collector companion",
  },
  female: {
    id: "female",
    label: "Signal Warden",
    role: "humanoid",
    file: "/assets/companions/fatedrop-female.glb",
    state: "ready",
    description: "Collector companion",
  },
  droid: {
    id: "droid",
    label: "Signal Droid",
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
 * Rejects obviously crossed companion assets before they reach the renderer.
 * Humanoids must read as vertically dominant; the droid must be genuinely
 * volumetric rather than a flat prop/card. This is deliberately conservative:
 * it catches role swaps without trying to infer character identity from art.
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
    return `${asset.label} was rejected: expected a volumetric droid model, not a flat prop.`;
  }

  return null;
}
