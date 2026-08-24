import { getSignalEngineStatus, getSignalRetailerDirectory, type SignalRetailerDirectoryRecord } from "./signal-engine-client";
import { retailerByCloudId, retailerRegistry, type RetailerRecord } from "./retailer-registry";

export type RetailerNetworkRecord = {
  id: string;
  cloudRetailerId: string | null;
  name: string;
  website: string | null;
  category: RetailerRecord["category"] | "unknown";
  retailerClass: string;
  source: "cloud" | "registry";
  online: boolean | null;
  physicalStores: boolean | null;
  physicalLocations: number | null;
  runtime: {
    healthy: boolean | null;
    baselineCompleted: boolean | null;
    lastScanAt: number | null;
    lastSuccessAt: number | null;
    productsSeen: number | null;
  };
  relationship: RetailerRecord["partnerStatus"] | "unknown";
  storefrontStatus: RetailerRecord["catalogueStatus"] | "unknown";
};

function categoryFromClass(retailerClass: string, registry: RetailerRecord | null) {
  if (registry) return registry.category;
  if (retailerClass === "national") return "major-retail" as const;
  if (retailerClass === "specialist" || retailerClass === "regional") return "tcg-specialist" as const;
  if (retailerClass === "independent") return "indie" as const;
  return "unknown" as const;
}

function cloudRow(directory: SignalRetailerDirectoryRecord): RetailerNetworkRecord {
  const registry = retailerByCloudId(directory.id);
  return {
    id: registry?.id ?? directory.id,
    cloudRetailerId: directory.id,
    name: registry?.name ?? directory.name,
    website: directory.websiteUrl ?? registry?.website ?? null,
    category: categoryFromClass(directory.retailerClass, registry),
    retailerClass: directory.retailerClass,
    source: "cloud",
    online: directory.online ?? registry?.onlineCatalogue ?? null,
    physicalStores: directory.physicalStores ?? registry?.physicalStores ?? null,
    physicalLocations: directory.physicalLocations ?? null,
    runtime: {
      healthy: directory.monitoring.healthy,
      baselineCompleted: directory.monitoring.baselineCompleted,
      lastScanAt: directory.monitoring.lastScanAt,
      lastSuccessAt: directory.monitoring.lastSuccessAt,
      productsSeen: directory.monitoring.productsSeen,
    },
    relationship: registry?.partnerStatus ?? "network",
    storefrontStatus: registry?.catalogueStatus ?? "connected",
  };
}

export async function getRetailerNetwork(): Promise<RetailerNetworkRecord[]> {
  const [status, directoryResponse] = await Promise.all([
    getSignalEngineStatus(),
    getSignalRetailerDirectory(),
  ]);
  const directory = directoryResponse?.retailers ?? [];
  const seen = new Set<string>();
  let rows: RetailerNetworkRecord[];

  if (directory.length) {
    rows = directory.map((entry) => {
      const row = cloudRow(entry);
      seen.add(row.id);
      return row;
    });
  } else {
    const cloud = status?.state?.retailers ?? [];
    rows = cloud.map((runtime) => {
      const registry = retailerByCloudId(runtime.id);
      if (registry) seen.add(registry.id);
      const retailerClass = registry?.category === "major-retail" ? "national" : registry?.category === "tcg-specialist" ? "specialist" : registry?.category === "indie" ? "independent" : "unknown";
      return {
        id: registry?.id ?? runtime.id,
        cloudRetailerId: runtime.id,
        name: registry?.name ?? runtime.name,
        website: registry?.website ?? null,
        category: registry?.category ?? "unknown",
        retailerClass,
        source: "cloud" as const,
        online: registry?.onlineCatalogue ?? null,
        physicalStores: registry?.physicalStores ?? null,
        physicalLocations: null,
        runtime: {
          healthy: runtime.healthy,
          baselineCompleted: runtime.baselineCompleted,
          lastScanAt: runtime.lastScanAt,
          lastSuccessAt: runtime.lastSuccessAt,
          productsSeen: runtime.productsSeen ?? null,
        },
        relationship: registry?.partnerStatus ?? "unknown" as const,
        storefrontStatus: registry?.catalogueStatus ?? "unknown" as const,
      };
    });
  }

  for (const registry of retailerRegistry) {
    if (seen.has(registry.id)) continue;
    rows.push({
      id: registry.id,
      cloudRetailerId: registry.cloudRetailerId ?? null,
      name: registry.name,
      website: registry.website,
      category: registry.category,
      retailerClass: registry.category === "major-retail" ? "national" : registry.category === "tcg-specialist" ? "specialist" : "independent",
      source: "registry",
      online: registry.onlineCatalogue,
      physicalStores: registry.physicalStores,
      physicalLocations: null,
      runtime: { healthy: null, baselineCompleted: null, lastScanAt: null, lastSuccessAt: null, productsSeen: null },
      relationship: registry.partnerStatus,
      storefrontStatus: registry.catalogueStatus,
    });
  }

  return rows.sort((a, b) => {
    if (a.source !== b.source) return a.source === "cloud" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
