import type { EncounterEvent, EncounterVendor, LocalRadarResponse } from "@/lib/encounter-types";

const FALLBACK_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";
const ENCOUNTERS_TIMEOUT_MS = 4500;

export function getSignalEngineUrl() {
  const raw = process.env.FATEDROP_SIGNAL_ENGINE_URL || FALLBACK_SIGNAL_ENGINE_URL;
  return raw.replace(/\/+$/, "");
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`Fate Encounters request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function loadUpcomingEncounters(limit = 1000) {
  const params = new URLSearchParams({
    from: new Date().toISOString(),
    limit: String(Math.min(Math.max(limit, 1), 2000)),
  });
  try {
    const response = await fetch(`${getSignalEngineUrl()}/api/encounters?${params.toString()}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(ENCOUNTERS_TIMEOUT_MS),
    });
    const data = await readJson<{ success?: boolean; events?: EncounterEvent[] }>(response);
    return {
      live: data.success === true,
      events: Array.isArray(data.events) ? data.events : [],
    };
  } catch {
    return { live: false, events: [] as EncounterEvent[] };
  }
}

export async function loadEncounterVendors(eventId: string) {
  const response = await fetch(`${getSignalEngineUrl()}/api/encounters/${encodeURIComponent(eventId)}/vendors`, {
    cache: "no-store",
    signal: AbortSignal.timeout(ENCOUNTERS_TIMEOUT_MS),
  });
  const data = await readJson<{ vendors?: EncounterVendor[] }>(response);
  return Array.isArray(data.vendors) ? data.vendors : [];
}

export async function loadLocalRadar(searchParams: URLSearchParams) {
  const response = await fetch(`${getSignalEngineUrl()}/api/local-radar?${searchParams.toString()}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(ENCOUNTERS_TIMEOUT_MS),
  });
  const data = await readJson<LocalRadarResponse>(response);
  return {
    ...data,
    shops: Array.isArray(data.shops) ? data.shops : [],
    events: Array.isArray(data.events) ? data.events : [],
  };
}
