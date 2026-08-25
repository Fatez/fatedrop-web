import { getSnapshotForRequest } from "@/lib/auth";
import { loadLocalRadar } from "@/lib/encounters";
import { distanceKm } from "@/lib/location";
import { configuredPlacesProvider, discoverLocalRetailers } from "@/lib/places-provider";
import { fateDropPostgres } from "@/lib/postgres";
import { retailerRegistry } from "@/lib/retailer-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Origin = { latitude: number; longitude: number; postcode: string | null; label: string | null };
type RadarShop = {
  id: string;
  name: string;
  address: string | null;
  postcode: string | null;
  latitude: number;
  longitude: number;
  websiteUrl: string | null;
  phone: string | null;
  distanceMiles: number;
  networkStatus: "live_connected" | "directory_known" | "local_discovery";
  verification: "verified" | "network" | "external";
  retailerId: string | null;
  retailerCategory: string | null;
  onlineCatalogue: { availableOffers: number | null } | null;
};

function numberParam(url: URL, name: string) {
  const raw = url.searchParams.get(name);
  if (raw == null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}
function textParam(url: URL, name: string, max = 120) {
  const value = String(url.searchParams.get(name) || "").trim();
  return value ? value.slice(0, max) : null;
}
function host(value: string | null | undefined) {
  if (!value) return null;
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return null; }
}
function normaliseName(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function miles(km: number) { return km / 1.609344; }

async function resolvePostcode(postcode: string): Promise<Origin | null> {
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return null;
    const data = await response.json() as { result?: { postcode?: string; latitude?: number | null; longitude?: number | null } };
    const latitude = Number(data.result?.latitude);
    const longitude = Number(data.result?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude, postcode: data.result?.postcode || postcode.toUpperCase(), label: data.result?.postcode || postcode.toUpperCase() };
  } catch { return null; }
}

async function resolveAddress(address: string): Promise<Origin | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.formattedAddress,places.location,places.addressComponents",
      },
      body: JSON.stringify({ textQuery: `${address}, United Kingdom`, regionCode: "GB", maxResultCount: 1 }),
      cache: "no-store",
      signal: AbortSignal.timeout(7_000),
    });
    if (!response.ok) return null;
    const data = await response.json() as { places?: Array<{ formattedAddress?: string; location?: { latitude?: number; longitude?: number }; addressComponents?: Array<{ longText?: string; types?: string[] }> }> };
    const place = data.places?.[0];
    const latitude = Number(place?.location?.latitude);
    const longitude = Number(place?.location?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    const postcode = place?.addressComponents?.find((part) => part.types?.includes("postal_code"))?.longText ?? null;
    return { latitude, longitude, postcode, label: place?.formattedAddress ?? address };
  } catch { return null; }
}

async function connectedShops(origin: Origin, radiusKm: number): Promise<RadarShop[]> {
  try {
    const sql = await fateDropPostgres();
    const latDelta = radiusKm / 110.574;
    const lngDelta = radiusKm / Math.max(20, 111.320 * Math.cos(origin.latitude * Math.PI / 180));
    const rows = await sql`
      SELECT l.id,l.retailer_id,l.name,l.address,l.postcode,l.latitude,l.longitude,l.website,l.phone,l.verification,
             r.name AS retailer_name,r.website AS retailer_website,r.verification AS retailer_verification,r.catalogue_connected,
             COUNT(o.id) FILTER (WHERE o.stock_state IN ('in_stock','preorder'))::int AS available_offers
      FROM fatedrop_retailer_locations l
      LEFT JOIN fatedrop_retailers r ON r.id=l.retailer_id
      LEFT JOIN fatedrop_offers o ON o.retailer_id=r.id
      WHERE l.latitude BETWEEN ${origin.latitude - latDelta} AND ${origin.latitude + latDelta}
        AND l.longitude BETWEEN ${origin.longitude - lngDelta} AND ${origin.longitude + lngDelta}
      GROUP BY l.id,r.id
    `;
    return (rows as Array<Record<string, unknown>>).flatMap((row): RadarShop[] => {
      const latitude = Number(row.latitude), longitude = Number(row.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
      const km = distanceKm(origin.latitude, origin.longitude, latitude, longitude);
      if (km > radiusKm) return [];
      return [{
        id: String(row.id),
        name: String(row.retailer_name || row.name),
        address: row.address == null ? null : String(row.address),
        postcode: row.postcode == null ? null : String(row.postcode),
        latitude, longitude,
        websiteUrl: row.website == null ? (row.retailer_website == null ? null : String(row.retailer_website)) : String(row.website),
        phone: row.phone == null ? null : String(row.phone),
        distanceMiles: miles(km),
        networkStatus: "live_connected",
        verification: row.retailer_verification === "verified" || row.verification === "verified" ? "verified" : "network",
        retailerId: row.retailer_id == null ? null : String(row.retailer_id),
        retailerCategory: null,
        onlineCatalogue: { availableOffers: Number.isFinite(Number(row.available_offers)) ? Number(row.available_offers) : null },
      }];
    });
  } catch { return []; }
}

function knownRetailer(website: string | null, name: string) {
  const websiteHost = host(website);
  const cleanName = normaliseName(name);
  return retailerRegistry.find((retailer) => retailer.physicalStores && (
    (websiteHost && host(retailer.website) === websiteHost) || normaliseName(retailer.name) === cleanName
  )) ?? null;
}

function dedupeShops(connected: RadarShop[], discovered: RadarShop[]) {
  const result = [...connected];
  for (const shop of discovered) {
    const duplicate = result.some((current) => {
      const currentHost = host(current.websiteUrl), shopHost = host(shop.websiteUrl);
      if (currentHost && shopHost && currentHost === shopHost) return true;
      return normaliseName(current.name) === normaliseName(shop.name)
        && distanceKm(current.latitude, current.longitude, shop.latitude, shop.longitude) < 0.8;
    });
    if (!duplicate) result.push(shop);
  }
  return result.sort((a, b) => a.distanceMiles - b.distanceMiles || a.name.localeCompare(b.name));
}

export async function GET(request: Request) {
  const snapshot = await getSnapshotForRequest(request);
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401, headers: { "Cache-Control": "private, no-store" } });

  const url = new URL(request.url);
  const latitude = numberParam(url, "lat");
  const longitude = numberParam(url, "lng") ?? numberParam(url, "lon");
  const postcode = textParam(url, "postcode", 12);
  const address = textParam(url, "address", 160);
  const radiusMiles = Math.min(Math.max(numberParam(url, "radiusMiles") ?? 25, 1), 50);
  const types = textParam(url, "types", 80) || "shops,events";
  const wantsShops = types.split(",").map((item) => item.trim()).includes("shops");
  const wantsEvents = types.split(",").map((item) => item.trim()).includes("events");

  if ((latitude === null) !== (longitude === null)) return Response.json({ error: "Both latitude and longitude are required when using device location." }, { status: 400 });
  if (latitude !== null && (latitude < -90 || latitude > 90 || longitude! < -180 || longitude! > 180)) return Response.json({ error: "Device coordinates are invalid." }, { status: 400 });
  if (latitude === null && !postcode && !address) return Response.json({ error: "Use device location, a UK postcode or an address." }, { status: 400 });

  let origin: Origin | null = latitude !== null && longitude !== null
    ? { latitude, longitude, postcode, label: postcode || "Device location" }
    : postcode ? await resolvePostcode(postcode) : await resolveAddress(address!);
  if (!origin) return Response.json({ error: postcode ? "That UK postcode could not be resolved." : "That address could not be resolved." }, { status: 400 });

  const radiusKm = radiusMiles * 1.609344;
  const placesProvider = configuredPlacesProvider();
  const [connected, discoveredLocations, legacy] = await Promise.all([
    wantsShops ? connectedShops(origin, radiusKm) : Promise.resolve([]),
    wantsShops && placesProvider ? discoverLocalRetailers({ latitude: origin.latitude, longitude: origin.longitude, radiusKm }, placesProvider) : Promise.resolve([]),
    wantsEvents ? loadLocalRadar(new URLSearchParams({ lat: String(origin.latitude), lng: String(origin.longitude), radiusMiles: String(radiusMiles), types: "events" })).catch(() => null) : Promise.resolve(null),
  ]);

  const discovered: RadarShop[] = discoveredLocations.flatMap((location): RadarShop[] => {
    const km = distanceKm(origin!.latitude, origin!.longitude, location.latitude, location.longitude);
    if (km > radiusKm) return [];
    const known = knownRetailer(location.website, location.name);
    return [{
      id: location.id,
      name: location.name,
      address: location.address,
      postcode: location.postcode,
      latitude: location.latitude,
      longitude: location.longitude,
      websiteUrl: location.website,
      phone: location.phone,
      distanceMiles: miles(km),
      networkStatus: known ? "directory_known" : "local_discovery",
      verification: "external",
      retailerId: known?.id ?? null,
      retailerCategory: known?.category ?? null,
      onlineCatalogue: known?.onlineCatalogue ? { availableOffers: null } : null,
    }];
  });
  const shops = dedupeShops(connected, discovered);
  const events = Array.isArray(legacy?.events) ? legacy.events : [];

  return Response.json({
    success: true,
    locationResolution: { status: "resolved", postcode: origin.postcode, label: origin.label, latitude: origin.latitude, longitude: origin.longitude },
    radiusMiles,
    providers: {
      shops: { status: !wantsShops ? "not_requested" : placesProvider ? "live_places_plus_network" : connected.length ? "network_only" : "places_not_configured" },
      events: { status: !wantsEvents ? "not_requested" : legacy ? "cloud" : "unavailable" },
    },
    shops,
    events,
    counts: { shops: shops.length, events: events.length },
    disclaimer: "External Local Radar discovery does not imply a FateDrop partnership or live branch stock. Connected retailers are labelled separately.",
  }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
