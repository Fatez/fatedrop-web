import type { NetworkLocation } from "@/lib/network-domain";

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => value * Math.PI / 180;
  const earthKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normaliseBusinessName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalisePostcode(value: string | null) {
  return (value ?? "").toUpperCase().replace(/\s+/g, "");
}

export function dedupeLocations(locations: NetworkLocation[]) {
  const seenProvider = new Set<string>();
  const seenNatural = new Set<string>();
  const result: NetworkLocation[] = [];
  for (const location of locations) {
    const providerKey = location.providerId ? `${location.provider}:${location.providerId}` : null;
    const naturalKey = `${normaliseBusinessName(location.name)}:${normalisePostcode(location.postcode)}:${location.latitude.toFixed(4)}:${location.longitude.toFixed(4)}`;
    if ((providerKey && seenProvider.has(providerKey)) || seenNatural.has(naturalKey)) continue;
    if (providerKey) seenProvider.add(providerKey);
    seenNatural.add(naturalKey);
    result.push(location);
  }
  return result;
}
