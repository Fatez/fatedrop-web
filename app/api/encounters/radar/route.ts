import { loadLocalRadar } from "@/lib/encounters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowed = new Set(["lat", "lng", "postcode", "radiusMiles", "tcg", "types", "from", "to"]);

export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const params = new URLSearchParams();
  for (const [key, value] of incoming.searchParams.entries()) {
    if (allowed.has(key) && value.trim()) params.append(key, value.trim());
  }
  const hasCoordinates = params.has("lat") && params.has("lng");
  const hasPostcode = params.has("postcode");
  if (!hasCoordinates && !hasPostcode) {
    return Response.json({ success: false, shops: [], events: [], error: "A postcode or latitude/longitude is required." }, { status: 400 });
  }
  if (!params.has("radiusMiles")) params.set("radiusMiles", "25");
  if (!params.has("types")) params.set("types", "shops,events");
  if (!params.has("from")) params.set("from", new Date().toISOString());

  try {
    const data = await loadLocalRadar(params);
    return Response.json(data, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return Response.json({ success: false, shops: [], events: [], error: "Nearby Fate Encounters discovery is unavailable." }, { status: 503 });
  }
}
