import { getSnapshotForRequest } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";

function numberParam(url: URL, name: string) {
  const raw = url.searchParams.get(name);
  if (raw == null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function textParam(url: URL, name: string, max = 160) {
  const value = String(url.searchParams.get(name) || "").trim();
  return value ? value.slice(0, max) : null;
}

function signalEngineUrl() {
  return (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
}

export async function GET(request: Request) {
  const snapshot = await getSnapshotForRequest(request);
  if (!snapshot) {
    return Response.json(
      { error: "Authentication required." },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const url = new URL(request.url);
  const latitude = numberParam(url, "lat");
  const longitude = numberParam(url, "lng") ?? numberParam(url, "lon");
  const postcode = textParam(url, "postcode", 12);
  const address = textParam(url, "address", 160);
  const radiusMilesRaw = numberParam(url, "radiusMiles") ?? 25;
  const radiusMiles = Math.min(Math.max(radiusMilesRaw, 1), 50);
  const tcg = textParam(url, "tcg", 40);
  const types = textParam(url, "types", 80) || "shops,events";

  const hasLatitude = latitude !== null;
  const hasLongitude = longitude !== null;
  if (hasLatitude !== hasLongitude) {
    return Response.json(
      { error: "Both latitude and longitude are required when using device location." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  if (latitude !== null && (latitude < -90 || latitude > 90 || longitude! < -180 || longitude! > 180)) {
    return Response.json(
      { error: "Device coordinates are invalid." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  if (latitude === null && !postcode && !address) {
    return Response.json(
      { error: "Use device location, enter a UK postcode or search an address." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const cloudUrl = new URL("/api/local-radar", `${signalEngineUrl()}/`);
  if (latitude !== null && longitude !== null) {
    cloudUrl.searchParams.set("lat", String(latitude));
    cloudUrl.searchParams.set("lng", String(longitude));
  }
  if (postcode) cloudUrl.searchParams.set("postcode", postcode.toUpperCase());
  if (address) cloudUrl.searchParams.set("address", address);
  cloudUrl.searchParams.set("radiusMiles", String(radiusMiles));
  cloudUrl.searchParams.set("types", types);
  if (tcg) cloudUrl.searchParams.set("tcg", tcg);

  try {
    const response = await fetch(cloudUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload) {
      return Response.json(
        { error: "Local Radar could not reach the FateDrop discovery network." },
        { status: 502, headers: { "Cache-Control": "private, no-store" } },
      );
    }
    return Response.json(payload, {
      status: 200,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return Response.json(
      { error: "Local Radar could not reach the FateDrop discovery network." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}