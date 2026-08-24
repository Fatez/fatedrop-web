export type ProductAlertCategory = "SEALED_TCG" | "SINGLE_CARD" | "ACCESSORY" | "MERCHANDISE" | "UNKNOWN";

export type ProductAlertClassification = {
  category: ProductAlertCategory;
  subcategory: string;
  confidence: number;
  evidence: string[];
};

export type ProductAlertPreferenceShape = {
  sealedTcg: boolean;
  singleCards: boolean;
  accessories: boolean;
  merchandise: boolean;
  unknownProducts: boolean;
};

const SEALED_TYPES = new Set([
  "elite_trainer_box",
  "booster_box",
  "booster_bundle",
  "booster_pack",
  "tin",
  "deck",
]);

function norm(value: string | null | undefined) {
  return String(value || "").toLowerCase().replace(/[™®©]/g, "").replace(/\s+/g, " ").trim();
}

function sealedSubtype(productType: string, title: string) {
  if (productType === "elite_trainer_box" || /elite trainer box|\betb\b/.test(title)) return "ETB";
  if (productType === "booster_box" || /booster (?:box|display)/.test(title)) return "BOOSTER_BOX";
  if (productType === "booster_bundle" || /booster bundle/.test(title)) return "BOOSTER_BUNDLE";
  if (productType === "collection_box" || /\bcollection\b/.test(title)) return "COLLECTION";
  if (productType === "booster_pack" || /booster pack|sleeved booster/.test(title)) return "BOOSTER_PACK";
  if (/blister/.test(title)) return "BLISTER";
  if (productType === "tin" || /\btin\b/.test(title)) return "TIN";
  if (productType === "deck" || /battle deck|theme deck|league battle deck|starter deck/.test(title)) return "DECK";
  return "SEALED_PRODUCT";
}

function accessorySubtype(title: string) {
  if (/sleeves?/.test(title)) return "SLEEVES";
  if (/binder|portfolio/.test(title)) return "BINDER";
  if (/deck box/.test(title)) return "DECK_BOX";
  if (/play ?mat/.test(title)) return "PLAYMAT";
  if (/top ?loader|card protector/.test(title)) return "CARD_PROTECTION";
  if (/dice|counter|token/.test(title)) return "GAME_ACCESSORY";
  if (/storage box|card stand/.test(title)) return "STORAGE";
  return "ACCESSORY";
}

function merchandiseSubtype(title: string) {
  if (/\bpin\b|pin badge/.test(title)) return "PIN";
  if (/plush|soft toy/.test(title)) return "PLUSH";
  if (/figure|figurine|statue/.test(title)) return "FIGURE";
  if (/hoodie|t-?shirt|shirt|jersey|clothing|apparel|cap|hat/.test(title)) return "APPAREL";
  if (/mug|bottle|tumbler/.test(title)) return "DRINKWARE";
  if (/key ?ring|keychain|lanyard/.test(title)) return "SMALL_MERCH";
  if (/poster|print/.test(title)) return "PRINT";
  return "MERCHANDISE";
}

export function classifyProductAlert(input: { title?: string | null; productType?: string | null }): ProductAlertClassification {
  const title = norm(input.title);
  const productType = norm(input.productType).replace(/\s+/g, "_");

  const accessoryEvidence = /sleeves?|binder|portfolio|deck box|play ?mat|top ?loader|card protector|dice|counter|token|storage box|card stand/.test(title);
  const merchandiseEvidence = /\bpin\b|pin badge|plush|soft toy|figure|figurine|statue|hoodie|t-?shirt|shirt|jersey|clothing|apparel|\bcap\b|\bhat\b|mug|bottle|tumbler|key ?ring|keychain|lanyard|poster|print/.test(title);
  const strongSealedEvidence = /elite trainer box|\betb\b|booster (?:box|display|bundle|pack)|sleeved booster|blister|build\s*(?:&|and)\s*battle|trainer toolkit|battle deck|theme deck|league battle deck|starter deck|\btin\b/.test(title);
  const tcgCollectionEvidence = /\btcg\b.*\bcollection\b|\bcollection\b.*\btcg\b/.test(title);
  const singleCardEvidence = /\bsingle card\b|\bindividual card\b|\bpromo card\b|\bpromo\b.*\bcard\b|reverse holo|holo rare|illustration rare|special illustration rare|secret rare|full art card/.test(title);

  if (strongSealedEvidence || tcgCollectionEvidence || (productType === "collection_box" && !accessoryEvidence && !merchandiseEvidence)) {
    return {
      category: "SEALED_TCG",
      subcategory: sealedSubtype(productType, title),
      confidence: strongSealedEvidence || tcgCollectionEvidence ? 0.99 : 0.94,
      evidence: [
        strongSealedEvidence ? "sealed-title-structure" : null,
        tcgCollectionEvidence ? "tcg-collection-title" : null,
        productType ? `product-type:${productType}` : null,
      ].filter((value): value is string => Boolean(value)),
    };
  }

  if (merchandiseEvidence) {
    return {
      category: "MERCHANDISE",
      subcategory: merchandiseSubtype(title),
      confidence: 0.98,
      evidence: ["merchandise-title-structure", productType ? `product-type:${productType}` : null].filter((value): value is string => Boolean(value)),
    };
  }

  if (accessoryEvidence || productType === "accessory") {
    return {
      category: "ACCESSORY",
      subcategory: accessorySubtype(title),
      confidence: accessoryEvidence ? 0.98 : 0.92,
      evidence: [accessoryEvidence ? "accessory-title-structure" : "accessory-product-type", productType ? `product-type:${productType}` : null].filter((value): value is string => Boolean(value)),
    };
  }

  if (SEALED_TYPES.has(productType)) {
    return {
      category: "SEALED_TCG",
      subcategory: sealedSubtype(productType, title),
      confidence: 0.97,
      evidence: [`product-type:${productType}`],
    };
  }

  if (singleCardEvidence || ["single_card", "card_single", "single"].includes(productType)) {
    return {
      category: "SINGLE_CARD",
      subcategory: /promo/.test(title) ? "PROMO" : "SINGLE",
      confidence: singleCardEvidence ? 0.96 : 0.9,
      evidence: [singleCardEvidence ? "single-card-title-structure" : "single-card-product-type"],
    };
  }

  return {
    category: "UNKNOWN",
    subcategory: "UNCLASSIFIED",
    confidence: 0.4,
    evidence: [productType ? `unresolved-product-type:${productType}` : "no-reliable-product-type"],
  };
}

export function productAlertEnabled(
  classification: Pick<ProductAlertClassification, "category">,
  preferences: ProductAlertPreferenceShape,
) {
  if (classification.category === "SEALED_TCG") return preferences.sealedTcg;
  if (classification.category === "SINGLE_CARD") return preferences.singleCards;
  if (classification.category === "ACCESSORY") return preferences.accessories;
  if (classification.category === "MERCHANDISE") return preferences.merchandise;
  return preferences.unknownProducts;
}
