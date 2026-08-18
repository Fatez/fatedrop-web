export const AVATAR_PRESET_IDS = [
  "signal-hood",
  "night-mask",
  "void-cat",
  "orbit-runner",
  "signal-crown",
  "prism-core",
  "radar-pulse",
  "city-ghost",
  "lunar-signal",
  "blue-wolf",
  "echo-portal",
  "shadow-samurai",
] as const;

export const MAX_STORED_AVATAR_DATA_URL = 300_000;

const PRESET_PATHS = new Set(AVATAR_PRESET_IDS.map((id) => `/assets/avatars/${id}.webp`));

export function avatarPresetPath(id: string) {
  return `/assets/avatars/${id}.webp`;
}

export function normalizeAvatarValue(input: string) {
  const avatar = input.trim();
  if (!avatar) return { value: null as string | null };

  if (PRESET_PATHS.has(avatar)) return { value: avatar };

  if (avatar.startsWith("data:image/webp;base64,")) {
    if (avatar.length > MAX_STORED_AVATAR_DATA_URL || !/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(avatar)) {
      return { value: null as string | null, error: "That custom avatar is too large or invalid." };
    }
    return { value: avatar };
  }

  try {
    const parsed = new URL(avatar);
    if (parsed.protocol !== "https:") return { value: null as string | null, error: "Use a FateDrop preset, upload an image, or provide an https:// image address." };
    if (parsed.toString().length > 1000) return { value: null as string | null, error: "That image address is too long." };
    return { value: parsed.toString() };
  } catch {
    return { value: null as string | null, error: "Choose a FateDrop preset, upload an image, or use a complete https:// image address." };
  }
}
