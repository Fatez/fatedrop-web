import { safeExternalHttpsUrl } from "./external-url";
import { getSignalRetailerDirectory, type SignalRetailerDirectoryRecord } from "./signal-engine-client";

export type RetailerNetworkRecord = {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  retailerClass: string;
  verification: string;
  tcgs: string[];
  online: boolean;
  physicalStores: boolean | null;
  physicalLocations: number | null;
  monitoring: {
    configured: boolean;
    healthy: boolean;
    stale: boolean;
    baselineCompleted: boolean;
    lastScanAt: number | null;
    lastSuccessAt: number | null;
    productsSeen: number | null;
  };
};

export type RetailerNetworkSnapshot = {
  available: boolean;
  retailers: RetailerNetworkRecord[];
};

function cloudRow(directory: SignalRetailerDirectoryRecord): RetailerNetworkRecord {
  return {
    id: directory.id,
    name: directory.name,
    website: safeExternalHttpsUrl(directory.websiteUrl),
    logoUrl: safeExternalHttpsUrl(directory.logoUrl),
    description: directory.description ?? null,
    retailerClass: directory.retailerClass,
    verification: directory.verification,
    tcgs: Array.isArray(directory.tcgs) ? directory.tcgs : [],
    online: directory.online === true,
    physicalStores: directory.physicalStores ?? null,
    physicalLocations: directory.physicalLocations ?? null,
    monitoring: {
      configured: directory.monitoring.configured === true,
      healthy: directory.monitoring.healthy === true,
      stale: directory.monitoring.stale === true,
      baselineCompleted: directory.monitoring.baselineCompleted === true,
      lastScanAt: directory.monitoring.lastScanAt ?? null,
      lastSuccessAt: directory.monitoring.lastSuccessAt ?? null,
      productsSeen: directory.monitoring.productsSeen ?? null,
    },
  };
}

export async function getRetailerNetworkSnapshot(timeoutMs = 8_000): Promise<RetailerNetworkSnapshot> {
  const response = await getSignalRetailerDirectory(timeoutMs);
  if (!response) return { available: false, retailers: [] };

  return {
    available: true,
    retailers: (response.retailers ?? [])
      .map(cloudRow)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
  };
}

export async function getRetailerNetwork(timeoutMs = 8_000): Promise<RetailerNetworkRecord[]> {
  return (await getRetailerNetworkSnapshot(timeoutMs)).retailers;
}
