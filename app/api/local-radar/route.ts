import { getCurrentSnapshot } from "@/lib/auth";
import { discoverLocalRetailers } from "@/lib/places-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function numberParam(url: URL, name: string) {
  const value = Number(url.searchParams.get(name));
  return Number.isFinite(value) ? value : null;
}

export async function GET(request: Request) {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
  const url = new URL(request.url);
  const latitude = numberParam(url, "lat");
  const longitude = numberParam(url, "lon");
  const radiusKm = numberParam(url, "radius") ?? 25;
  if (latitude === null || longitude === null || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return Response.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
  const radius = Math.min(Math.max(radiusKm, 1), 50);
  if (!process.env.GOOGLE_PLACES_API_KEY) return Response.json({ locations: [], providerConfigured: false, radiusKm: radius });
  const locations = await discoverLocalRetailers({ latitude, longitude, radiusKm: radius });
  return Response.json({ locations, providerConfigured: true, radiusKm: radius }, { headers: { "Cache-Control": "private, no-store" } });
}
