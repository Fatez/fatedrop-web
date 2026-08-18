import type { CatalogueProduct } from "@/lib/retailer-catalogue";
import { identifyProduct } from "@/lib/product-identity";

const aliases: Record<string, string[]> = {
  etb: ["elite trainer box"],
  "elite trainer": ["elite trainer box"],
  "pc etb": ["pokemon center elite trainer box", "pokemon center etb"],
  "pokemon center etb": ["pokemon center elite trainer box"],
  bb: ["booster box", "booster display"],
  "booster display": ["booster box"],
  bundle: ["booster bundle"],
  blister: ["blister", "3 pack blister", "three pack blister", "checklane blister"],
  "3 pack": ["3 pack blister", "three pack blister"],
  tin: ["tin"],
};

function normalise(value: string) {
  return value
    .toLowerCase()
    .replace(/[–—:&+()'’]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function expandedQueries(query: string) {
  const clean = normalise(query);
  if (!clean) return [];
  const expanded = new Set<string>([clean]);
  for (const [alias, values] of Object.entries(aliases)) {
    if (clean === alias || clean.includes(alias)) {
      for (const value of values) expanded.add(normalise(clean.replace(alias, value)));
    }
  }
  return [...expanded];
}

export function catalogueProductMatches(product: CatalogueProduct, query: string) {
  const queries = expandedQueries(query);
  if (!queries.length) return true;

  const identity = identifyProduct(product.title);
  const haystack = normalise([
    product.title,
    product.vendor ?? "",
    product.productType ?? "",
    product.retailerName,
    product.handle,
    identity.setName,
    identity.kind.replaceAll("-", " "),
    identity.pokemonCenterEdition ? "pokemon center edition pc etb" : "standard edition",
  ].join(" "));

  return queries.some((candidate) => candidate.split(" ").every((term) => haystack.includes(term)));
}
