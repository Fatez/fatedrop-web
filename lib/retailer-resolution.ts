import type { NetworkLocation, NetworkRetailer } from "@/lib/network-domain";

function domain(value: string | null) {
  if (!value) return null;
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return null; }
}
function normalise(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

export function resolveDiscoveredLocation(location: NetworkLocation, retailers: NetworkRetailer[], knownLocations: NetworkLocation[]) {
  const providerMatch = location.providerId ? knownLocations.find((item) => item.provider === location.provider && item.providerId === location.providerId && item.retailerId) : null;
  if (providerMatch?.retailerId) {
    const retailer = retailers.find((item) => item.id === providerMatch.retailerId) ?? null;
    return retailer ? { ...location, retailerId: retailer.id, verification: retailer.verification } : location;
  }
  const websiteDomain = domain(location.website);
  const retailer = retailers.find((item) => (websiteDomain && domain(item.website) === websiteDomain) || normalise(item.name) === normalise(location.name));
  return retailer ? { ...location, retailerId: retailer.id, verification: retailer.verification } : location;
}
