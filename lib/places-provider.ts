import type { NetworkLocation } from "@/lib/network-domain";
import { dedupeLocations } from "@/lib/location";

export const LOCAL_RADAR_CATEGORIES = [
  "trading card store",
  "TCG shop",
  "card shop",
  "hobby shop",
  "game store",
  "collectibles store",
  "Pokemon cards",
] as const;

export type PlacesSearchInput = {
  latitude: number;
  longitude: number;
  radiusKm: number;
  query: string;
};

export interface PlacesProvider {
  id: string;
  search(input: PlacesSearchInput): Promise<NetworkLocation[]>;
}

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  websiteUri?: string;
  nationalPhoneNumber?: string;
  regularOpeningHours?: unknown;
  addressComponents?: Array<{ longText?: string; types?: string[] }>;
};

function postcodeFromComponents(components: GooglePlace["addressComponents"]) {
  return components?.find((item) => item.types?.includes("postal_code"))?.longText ?? null;
}

export class GooglePlacesProvider implements PlacesProvider {
  id = "google-places";
  constructor(private readonly apiKey: string) {}

  async search(input: PlacesSearchInput): Promise<NetworkLocation[]> {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours,places.addressComponents",
      },
      body: JSON.stringify({
        textQuery: input.query,
        locationBias: {
          circle: {
            center: { latitude: input.latitude, longitude: input.longitude },
            radius: Math.min(Math.max(input.radiusKm * 1000, 1000), 50_000),
          },
        },
        maxResultCount: 20,
      }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Google Places request failed (${response.status})`);
    const payload = await response.json() as { places?: GooglePlace[] };
    return (payload.places ?? []).flatMap((place): NetworkLocation[] => {
      const latitude = place.location?.latitude;
      const longitude = place.location?.longitude;
      const name = place.displayName?.text?.trim();
      if (!name || latitude === undefined || longitude === undefined) return [];
      return [{
        id: `google-places:${place.id ?? `${latitude}:${longitude}:${name}`}`,
        retailerId: null,
        provider: "google-places",
        providerId: place.id ?? null,
        name,
        address: place.formattedAddress ?? null,
        postcode: postcodeFromComponents(place.addressComponents),
        latitude,
        longitude,
        website: place.websiteUri ?? null,
        phone: place.nationalPhoneNumber ?? null,
        openingDetails: place.regularOpeningHours ? { raw: place.regularOpeningHours } : null,
        verification: "external",
      }];
    });
  }
}

export function configuredPlacesProvider(): PlacesProvider | null {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  return apiKey ? new GooglePlacesProvider(apiKey) : null;
}

export async function discoverLocalRetailers(input: Omit<PlacesSearchInput, "query">, provider = configuredPlacesProvider()) {
  if (!provider) return [];
  const batches = await Promise.all(LOCAL_RADAR_CATEGORIES.map((query) => provider.search({ ...input, query }).catch(() => [])));
  return dedupeLocations(batches.flat());
}
