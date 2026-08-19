import { getSignalEngineStatus } from "./signal-engine-client";
import { retailerByCloudId, retailerRegistry, type RetailerRecord } from "./retailer-registry";

export type RetailerNetworkRecord = {
  id: string;
  name: string;
  website: string | null;
  category: RetailerRecord["category"] | "unknown";
  source: "cloud" | "registry";
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

export async function getRetailerNetwork(): Promise<RetailerNetworkRecord[]> {
  const status = await getSignalEngineStatus();
  const cloud = status?.state?.retailers ?? [];
  const seen = new Set<string>();
  const rows: RetailerNetworkRecord[] = cloud.map((runtime) => {
    const registry = retailerByCloudId(runtime.id);
    if (registry) seen.add(registry.id);
    return {
      id: registry?.id ?? runtime.id,
      name: registry?.name ?? runtime.name,
      website: registry?.website ?? null,
      category: registry?.category ?? "unknown",
      source: "cloud",
      runtime: {
        healthy: runtime.healthy,
        baselineCompleted: runtime.baselineCompleted,
        lastScanAt: runtime.lastScanAt,
        lastSuccessAt: runtime.lastSuccessAt,
        productsSeen: runtime.productsSeen ?? null,
      },
      relationship: registry?.partnerStatus ?? "unknown",
      storefrontStatus: registry?.catalogueStatus ?? "unknown",
    };
  });

  for (const registry of retailerRegistry) {
    if (seen.has(registry.id)) continue;
    rows.push({
      id: registry.id,
      name: registry.name,
      website: registry.website,
      category: registry.category,
      source: "registry",
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
