import { mintFateFindEvaluationCapability } from "@/lib/fatefind-evaluation-capability";

const DEFAULT_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";

export type HostedFateFindImmediateEvaluation = {
  success: boolean;
  enabled: boolean;
  evaluation: {
    finds: number;
    evaluated: number;
    created: number;
  } | null;
};

function signalEngineBaseUrl() {
  return (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
}

export async function evaluateHostedFateFindNow(fateFindId: string, timeoutMs = 4_000): Promise<HostedFateFindImmediateEvaluation | null> {
  const cleanId = fateFindId.trim();
  if (!cleanId) return null;

  const url = new URL("/internal/fatefind/evaluate", `${signalEngineBaseUrl()}/`);
  try {
    const token = await mintFateFindEvaluationCapability(cleanId);
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fateFindId: cleanId }),
      signal: AbortSignal.timeout(Math.max(250, timeoutMs)),
    });
    if (!response.ok) return null;
    const payload = await response.json() as HostedFateFindImmediateEvaluation;
    return payload?.success === true ? payload : null;
  } catch {
    return null;
  }
}
