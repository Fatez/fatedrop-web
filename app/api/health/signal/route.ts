export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";
const SUCCESS_CACHE_CONTROL = "public, max-age=0, s-maxage=30, stale-while-revalidate=120";

type JsonRecord = Record<string, unknown>;
type FailureReason =
  | "invalid_request"
  | "upstream_error"
  | "upstream_invalid_response"
  | "upstream_unavailable"
  | "upstream_timeout"
  | "upstream_request_failed";

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function count(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0;
}

function timestamp(value: unknown) {
  if (value == null) return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : null;
  }
  return null;
}

function nullableNumber(value: unknown) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function signalSummaryUrl() {
  const base = (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
  const url = new URL("/api/signal-summary", `${base}/`);
  if (url.protocol !== "https:") throw new Error("Signal Engine health summary requires HTTPS.");
  return url;
}

function unavailable(reason: FailureReason, status = 503) {
  return Response.json(
    { available: false, reason },
    { status, headers: { "cache-control": "no-store" } },
  );
}

function requestFailureReason(error: unknown): FailureReason {
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
    return "upstream_timeout";
  }
  return "upstream_request_failed";
}

async function fetchSignalSummary() {
  return fetch(signalSummaryUrl(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  if (requestUrl.search) return unavailable("invalid_request", 400);

  try {
    const response = await fetchSignalSummary();
    if (!response.ok) return unavailable("upstream_error");

    let payload: JsonRecord;
    try {
      payload = record(await response.json());
    } catch {
      return unavailable("upstream_invalid_response");
    }
    if (payload.available !== true) return unavailable("upstream_unavailable");

    const diagnostics = record(payload.diagnostics);
    const reliability = record(diagnostics.reliability);
    const monitors = record(diagnostics.monitors);
    const discordLatency = record(diagnostics.discordLatency);
    const discovery = record(diagnostics.discovery);

    return Response.json(
      {
        available: true,
        generatedAt: timestamp(payload.generatedAt),
        lifecycle: {
          absentStages: stringList(diagnostics.absentLifecycleStages),
        },
        delivery: {
          issues: count(diagnostics.discordDeliveryIssues),
          duplicateSignalsSuppressed: count(diagnostics.duplicateSignalsSuppressed),
          latencySampleSize: count(discordLatency.sampleSize),
          medianLatencySeconds: nullableNumber(discordLatency.medianSeconds),
          p95LatencySeconds: nullableNumber(discordLatency.p95Seconds),
        },
        discord: {
          orphanedSignals: count(reliability.orphanedDiscordSignals),
          telemetryStoppedWhileSignalsContinue: reliability.telemetryStoppedWhileSignalsContinue === true,
          recentSignals: count(reliability.recentSignals),
          recentDiscordAttempts: count(reliability.recentDiscordAttempts),
          latestSignalAt: timestamp(reliability.latestSignalAt),
          latestDiscordAttemptAt: timestamp(reliability.latestDiscordAttemptAt),
        },
        retailers: {
          total: count(monitors.totalRetailers),
          fresh: count(monitors.freshRetailers),
          stale: count(monitors.staleRetailers),
          unhealthy: count(monitors.unhealthyRetailers),
          blocked: count(monitors.blockedRetailers),
        },
        discovery: {
          available: discovery.available === true,
          pending: count(discovery.pending),
          retry: count(discovery.retry),
          processed: count(discovery.processed),
          failed: count(discovery.failed),
          latestObservedAt: timestamp(discovery.latestObservedAt),
          latestProcessedAt: timestamp(discovery.latestProcessedAt),
          oldestActiveAt: timestamp(discovery.oldestActiveAt),
        },
      },
      { status: 200, headers: { "cache-control": SUCCESS_CACHE_CONTROL } },
    );
  } catch (error) {
    return unavailable(requestFailureReason(error));
  }
}
