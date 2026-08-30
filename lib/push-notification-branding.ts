export type FateDropPushStage = "WHISPER" | "ECHO" | "MANIFESTED" | "VANISHED";

export type PushNotificationBranding = {
  companion: "oru" | "fenn" | "koru" | "nyxen" | "radar" | "fatedrop";
  androidIcon: string | null;
};

const STAGE_BRANDING: Record<FateDropPushStage, PushNotificationBranding> = {
  WHISPER: { companion: "oru", androidIcon: "fatedrop_oru" },
  ECHO: { companion: "fenn", androidIcon: "fatedrop_fenn" },
  MANIFESTED: { companion: "koru", androidIcon: "fatedrop_koru" },
  VANISHED: { companion: "nyxen", androidIcon: "fatedrop_nyxen" },
};

function normalizedStage(value: unknown): FateDropPushStage | null {
  const stage = typeof value === "string" ? value.trim().toUpperCase() : "";
  return stage === "WHISPER" || stage === "ECHO" || stage === "MANIFESTED" || stage === "VANISHED" ? stage : null;
}

export function pushNotificationBranding(input: { platform?: unknown; stage?: unknown; route?: unknown }): PushNotificationBranding {
  const route = typeof input.route === "string" ? input.route.trim().toLowerCase() : "";
  if (route === "local-radar" || route === "local-radar-stock") {
    return { companion: "radar", androidIcon: "fatedrop_radar" };
  }

  const stage = normalizedStage(input.stage);
  if (stage) return STAGE_BRANDING[stage];
  return { companion: "fatedrop", androidIcon: null };
}

export function expoAndroidIcon(platform: unknown, branding: PushNotificationBranding, enabled = process.env.FATEDROP_ANDROID_STAGE_NOTIFICATION_ICONS === "true") {
  if (!enabled) return null;
  return typeof platform === "string" && platform.trim().toLowerCase() === "android" ? branding.androidIcon : null;
}
