const DEFAULT_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";

export type GlobalEchoRetractionStatus = {
  status: "retracted";
  targetEventId: string;
  retractedAt: string;
  reason: string;
  operatorIssue: number | null;
};

type RetractionStatusResponse = {
  success?: boolean;
  retractions?: Record<string, GlobalEchoRetractionStatus | null>;
  error?: string;
};

type RetractionResponse = {
  success?: boolean;
  eventId?: string;
  duplicate?: boolean;
  retraction?: GlobalEchoRetractionStatus | null;
  error?: string;
  code?: string;
};

function cloudBaseUrl() {
  return (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
}

function cloudSecret() {
  return String(process.env.FATEDROP_METRICS_INGEST_SECRET || "").trim();
}

async function internalPost<T>(pathname: string, body: unknown, timeoutMs = 8_000): Promise<{ ok: boolean; status: number; data: T | null }> {
  const secret = cloudSecret();
  if (!secret) return { ok: false, status: 503, data: null };
  try {
    const response = await fetch(new URL(pathname, `${cloudBaseUrl()}/`), {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-fatedrop-secret": secret,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(Math.max(250, timeoutMs)),
    });
    const data = await response.json().catch(() => null) as T | null;
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 503, data: null };
  }
}

export async function getCloudGlobalEchoRetractions(eventIds: string[]) {
  const clean = [...new Set(eventIds.map((value) => value.trim()).filter(Boolean))].slice(0, 100);
  if (!clean.length) return new Map<string, GlobalEchoRetractionStatus>();
  const result = await internalPost<RetractionStatusResponse>("/internal/operator-echo/retraction-status", { eventIds: clean });
  if (!result.ok || !result.data?.success || !result.data.retractions) {
    throw new Error("Cloud Global Echo retraction status unavailable");
  }
  const retracted = new Map<string, GlobalEchoRetractionStatus>();
  for (const eventId of clean) {
    const status = result.data.retractions[eventId];
    if (status?.status === "retracted" && status.targetEventId === eventId) retracted.set(eventId, status);
  }
  return retracted;
}

export async function retractGlobalEchoInCloud({ eventId, reason, retractedBy }: { eventId: string; reason: string; retractedBy: string }) {
  const result = await internalPost<RetractionResponse>("/internal/operator-echo/retract", { eventId, reason, retractedBy });
  if (!result.ok || !result.data?.success || !result.data.retraction) {
    const error = new Error(result.data?.error || "Cloud Global Echo retraction failed");
    Object.assign(error, { status: result.status, code: result.data?.code || "RETRACTION_FAILED" });
    throw error;
  }
  return {
    eventId: result.data.eventId || eventId,
    duplicate: result.data.duplicate === true,
    retraction: result.data.retraction,
  };
}
