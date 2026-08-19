export type RetailerCategory = "major-retail" | "tcg-specialist" | "indie";

export type RetailerRecord = {
  id: string;
  cloudRetailerId?: string;
  name: string;
  category: RetailerCategory;
  website: string;
  pokemon: boolean;
  onlineCatalogue: boolean;
  physicalStores: boolean;
  deliveryKnown: boolean;
  standardDeliveryPence?: number;
  freeDeliveryThresholdPence?: number;
  catalogueStatus: "planned" | "candidate" | "connected";
  partnerStatus: "network" | "candidate" | "partner";
  notes?: string;
};

export const retailerRegistry: RetailerRecord[] = [
  { id: "pokemon-center-uk", cloudRetailerId: "pokemon-center-uk", name: "Pokémon Center UK", category: "major-retail", website: "https://www.pokemoncenter.com/en-gb", pokemon: true, onlineCatalogue: true, physicalStores: false, deliveryKnown: false, catalogueStatus: "candidate", partnerStatus: "network", notes: "Official RRP/reference source when verified through the Signal Engine. Runtime monitor health is read from Cloud rather than inferred from this registry." },
  { id: "smyths", cloudRetailerId: "smyths-uk", name: "Smyths Toys", category: "major-retail", website: "https://www.smythstoys.com/uk/en-gb", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "candidate", partnerStatus: "network", notes: "Signal Engine runtime identity is smyths-uk; static metadata keeps the existing website id for compatibility." },
  { id: "argos", name: "Argos", category: "major-retail", website: "https://www.argos.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "asda", name: "ASDA", category: "major-retail", website: "https://www.asda.com", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "game", name: "GAME", category: "major-retail", website: "https://www.game.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "hamleys", name: "Hamleys", category: "major-retail", website: "https://www.hamleys.com", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "john-lewis", name: "John Lewis", category: "major-retail", website: "https://www.johnlewis.com", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "waterstones", name: "Waterstones", category: "major-retail", website: "https://www.waterstones.com", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "whsmith", name: "WHSmith", category: "major-retail", website: "https://www.whsmith.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "entertainer", name: "The Entertainer", category: "major-retail", website: "https://www.thetoyshop.com", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "chaos-cards", cloudRetailerId: "chaos-cards", name: "Chaos Cards", category: "tcg-specialist", website: "https://www.chaoscards.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "candidate", partnerStatus: "network", notes: "Configured Signal Engine retailer; runtime health and baseline state remain the authority for whether it is actively connected." },
  { id: "magic-madhouse", name: "Magic Madhouse", category: "tcg-specialist", website: "https://magicmadhouse.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: false, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "total-cards", name: "Total Cards", category: "tcg-specialist", website: "https://totalcards.net", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "zatu", name: "Zatu Games", category: "tcg-specialist", website: "https://www.board-game.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: false, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "cob-and-pip", name: "Cob & Pip", category: "indie", website: "https://cobandpip.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: false, deliveryKnown: true, freeDeliveryThresholdPence: 5000, catalogueStatus: "candidate", partnerStatus: "candidate", notes: "Experimental direct storefront lab. Free UK postage over £50; standard delivery below threshold remains unverified." },
  { id: "wishlist-collectables", name: "Wishlist Collectables", category: "indie", website: "https://www.wishlistcollectables.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: true, freeDeliveryThresholdPence: 5000, catalogueStatus: "candidate", partnerStatus: "candidate", notes: "Experimental direct storefront lab. Physical store at 128 Burnt Ash Road, London SE12 8PU. Catalogue pricing remains experimental until retailer onboarding verifies it." },
];

export function retailerByCloudId(cloudRetailerId: string) {
  return retailerRegistry.find((retailer) => (retailer.cloudRetailerId ?? retailer.id) === cloudRetailerId) ?? null;
}

export const retailerCategoryLabels: Record<RetailerCategory, string> = {
  "major-retail": "Major Retail",
  "tcg-specialist": "TCG Specialists",
  indie: "Indies",
};
