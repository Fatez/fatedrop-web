import type { CatalogueProduct } from "@/lib/retailer-catalogue";

export type ProductKind = "elite-trainer-box" | "booster-pack" | "booster-bundle" | "booster-box" | "collection" | "blister" | "tin" | "starter-deck" | "deck" | "other";

export type ProductIdentity = {
  key: string;
  tcg: string;
  setName: string;
  kind: ProductKind;
  edition: string;
  pokemonCenterEdition: boolean;
};

const noise = /\b(pokemon|pokémon|tcg|trading card game|new|sealed|uk|mega evolution|scarlet violet|scarlet & violet|sword shield|sword & shield)\b/gi;

function normalise(value: string) {
  return value.toLowerCase().replace(/[–—:&+()]/g, " ").replace(noise, " ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function kindFromTitle(title: string): ProductKind {
  const value = title.toLowerCase();
  if (/elite trainer box|\betb\b/.test(value)) return "elite-trainer-box";
  if (/booster display|booster box/.test(value)) return "booster-box";
  if (/booster bundle/.test(value)) return "booster-bundle";
  if (/3 pack blister|three pack blister|checklane blister|blister/.test(value)) return "blister";
  if (/booster pack|sleeved booster/.test(value)) return "booster-pack";
  if (/starter deck/.test(value)) return "starter-deck";
  if (/\bdeck\b/.test(value)) return "deck";
  if (/\btin\b/.test(value)) return "tin";
  if (/collection|box/.test(value)) return "collection";
  return "other";
}

function editionFromTitle(title: string, tcg: string) {
  if (tcg === "pokemon" && /pokemon center/i.test(title)) return "pokemon-center";
  if (/first edition|1st edition/i.test(title)) return "first-edition";
  return "standard";
}

function setFromTitle(title: string) {
  let value = normalise(title)
    .replace(/pokemon center/g, " ")
    .replace(/elite trainer box|\betb\b|booster display box|booster box|booster bundle|booster pack|sleeved booster pack|3 pack blister|checklane blister|blister|starter deck|deck|collection|tin/g, " ")
    .replace(/\b\d+\s*(packs?|cards?)\b/g, " ")
    .replace(/new sealed/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  if (!value) value = normalise(title);
  return value;
}

export function identifyProduct(title: string, tcg = "pokemon"): ProductIdentity {
  const cleanTcg = tcg.trim().toLowerCase() || "pokemon";
  const kind = kindFromTitle(title);
  const setName = setFromTitle(title);
  const edition = editionFromTitle(title, cleanTcg);
  const pokemonCenterEdition = cleanTcg === "pokemon" && edition === "pokemon-center";
  return { key: `${cleanTcg}:${setName}:${kind}:${edition}`, tcg: cleanTcg, setName, kind, edition, pokemonCenterEdition };
}

export type IdentifiedOffer = CatalogueProduct & { identity: ProductIdentity };

export function identifyOffers(products: CatalogueProduct[], tcg = "pokemon"): IdentifiedOffer[] {
  return products.map((product) => ({ ...product, identity: identifyProduct(product.title, tcg) }));
}

export function groupMatchingOffers(products: CatalogueProduct[], tcg = "pokemon") {
  const groups = new Map<string, IdentifiedOffer[]>();
  for (const offer of identifyOffers(products, tcg)) {
    const existing = groups.get(offer.identity.key) ?? [];
    existing.push(offer);
    groups.set(offer.identity.key, existing);
  }
  return [...groups.entries()].map(([key, offers]) => ({ key, identity: offers[0].identity, offers }));
}
