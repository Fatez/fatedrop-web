export type AlertRelevanceCategory = "SEALED_TCG" | "SINGLE_CARD" | "ACCESSORY" | "MERCHANDISE" | "UNKNOWN";

function normalise(value: string) {
  return value.toLowerCase().replace(/[™®©]/g, "").replace(/\s+/g, " ").trim();
}

export function classifyBetaAlertTitle(rawTitle: string): AlertRelevanceCategory {
  const title = normalise(rawTitle || "");
  const strongSealed = /elite trainer box|\betb\b|booster (?:box|display|bundle|pack)|sleeved booster|blister|build\s*(?:&|and)\s*battle|trainer toolkit|battle deck|theme deck|league battle deck|starter deck|\btin\b/.test(title);
  const sealedCollection = /\b(?:pokemon|pokémon|tcg)\b.*\bcollection\b|\bcollection\b.*\b(?:pokemon|pokémon|tcg)\b/.test(title);
  if (strongSealed || sealedCollection) return "SEALED_TCG";

  if (/sleeves?|binder|portfolio|deck box|play ?mat|top ?loader|card protector|dice|counter|token|storage box|card stand/.test(title)) return "ACCESSORY";
  if (/\bpin\b|pin badge|plush|soft toy|figure|figurine|statue|hoodie|t-?shirt|shirt|jersey|clothing|apparel|\bcap\b|\bhat\b|mug|bottle|tumbler|key ?ring|keychain|lanyard|poster|print/.test(title)) return "MERCHANDISE";
  if (/\bsingle card\b|\bindividual card\b|\bpromo card\b|\bpromo\b.*\bcard\b|reverse holo|holo rare|illustration rare|special illustration rare|secret rare|full art card|near mint|light play|lightly played|\b\d{1,3}\/\d{1,3}\b/.test(title)) return "SINGLE_CARD";
  return "UNKNOWN";
}

export function isBetaAlertRelevant(alert: { title?: string | null }) {
  return classifyBetaAlertTitle(alert.title || "") === "SEALED_TCG";
}
