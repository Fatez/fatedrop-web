export type RetailerCategory = "major-retail" | "tcg-specialist" | "indie";

export type RetailerRecord = {
  id: string;
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
  { id: "pokemon-center-uk", name: "Pokémon Center UK", category: "major-retail", website: "https://www.pokemoncenter.com/en-gb", pokemon: true, onlineCatalogue: true, physicalStores: false, deliveryKnown: false, catalogueStatus: "candidate", partnerStatus: "network", notes: "Primary official RRP/reference candidate." },
  { id: "smyths", name: "Smyths Toys", category: "major-retail", website: "https://www.smythstoys.com/uk/en-gb", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "argos", name: "Argos", category: "major-retail", website: "https://www.argos.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "asda", name: "ASDA", category: "major-retail", website: "https://www.asda.com", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "game", name: "GAME", category: "major-retail", website: "https://www.game.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "hamleys", name: "Hamleys", category: "major-retail", website: "https://www.hamleys.com", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "john-lewis", name: "John Lewis", category: "major-retail", website: "https://www.johnlewis.com", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "waterstones", name: "Waterstones", category: "major-retail", website: "https://www.waterstones.com", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "whsmith", name: "WHSmith", category: "major-retail", website: "https://www.whsmith.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "entertainer", name: "The Entertainer", category: "major-retail", website: "https://www.thetoyshop.com", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "chaos-cards", name: "Chaos Cards", category: "tcg-specialist", website: "https://www.chaoscards.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "magic-madhouse", name: "Magic Madhouse", category: "tcg-specialist", website: "https://magicmadhouse.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: false, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "total-cards", name: "Total Cards", category: "tcg-specialist", website: "https://totalcards.net", pokemon: true, onlineCatalogue: true, physicalStores: true, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "zatu", name: "Zatu Games", category: "tcg-specialist", website: "https://www.board-game.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: false, deliveryKnown: false, catalogueStatus: "planned", partnerStatus: "network" },
  { id: "cob-and-pip", name: "Cob & Pip", category: "indie", website: "https://cobandpip.co.uk", pokemon: true, onlineCatalogue: true, physicalStores: false, deliveryKnown: true, freeDeliveryThresholdPence: 5000, catalogueStatus: "candidate", partnerStatus: "candidate", notes: "Family-run UK online TCG store. Free UK postage over £50; registered office is not a retail location. Standard delivery below the free-delivery threshold remains unverified." },
];

export const retailerCategoryLabels: Record<RetailerCategory, string> = {
  "major-retail": "Major Retail",
  "tcg-specialist": "TCG Specialists",
  indie: "Indies",
};
