export type BetaDistributionLinks = {
  ios: string | null;
  android: string | null;
};

export function getBetaDistributionLinks(): BetaDistributionLinks {
  return {
    ios: secureDistributionUrl(process.env.FATEDROP_IOS_BETA_URL),
    android: secureDistributionUrl(process.env.FATEDROP_ANDROID_BETA_URL),
  };
}

function secureDistributionUrl(value: string | undefined) {
  const clean = String(value || "").trim();
  if (!clean) return null;
  try {
    const url = new URL(clean);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}
