export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function count(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0;
}

function timestamp(value: unknown) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function nullableNumber(value: unknown) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function signalHealthUrl() {
  const base = (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
  const url = new URL("/api/signal-health", `${base}/`);
  if (url.protocol !== "https:") throw new Error("Signal Engine diagnostics require HTTPS.");
  return url;
}

function unavailable() {
  return Response.json(
    { available: false },
    { status: 503, headers: { "cache-control": "no-store" } },
  );
}

export async function GET() {
  const signalToken = process.env.FATEDROP_SIGNAL_API_TOKEN;
  if (!signalToken) return unavailable();

  try {
    const response = await fetch(signalHealthUrl(), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${signalToken}`,
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return unavailable();

    const payload = record(await response.json());
    if (payload.available !== true) return unavailable();

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
          pending: count(discovery.pending),
          retry: count(discovery.retry),
          processed: count(discovery.processed),
          failed: count(discovery.failed),
          latestObservedAt: timestamp(discovery.latestObservedAt),
          latestProcessedAt: timestamp(discovery.latestProcessedAt),
        },
      },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  } catch {
    return unavailable();
  }
}
