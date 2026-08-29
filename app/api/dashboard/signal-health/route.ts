import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";

function matchesSecret(provided: string, expected: string | undefined) {
  if (!expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

function authorized(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return false;
  return matchesSecret(authorization.slice(7), process.env.FATEDROP_PUSH_CRON_SECRET);
}

function signalHealthUrl() {
  const base = (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
  const url = new URL("/api/signal-health", `${base}/`);
  if (url.protocol !== "https:") throw new Error("Signal Engine diagnostics require HTTPS.");
  return url;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json(
      { error: "Signal health is not authorised." },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const signalToken = process.env.FATEDROP_SIGNAL_API_TOKEN;
  if (!signalToken) {
    return Response.json(
      { error: "Signal health is unavailable." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const response = await fetch(signalHealthUrl(), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${signalToken}`,
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      return Response.json(
        { error: "Canonical Cloud signal health is unavailable.", upstreamStatus: response.status },
        { status: 502, headers: { "cache-control": "no-store" } },
      );
    }

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return Response.json(
        { error: "Canonical Cloud signal health returned an invalid payload." },
        { status: 502, headers: { "cache-control": "no-store" } },
      );
    }

    return Response.json(payload, {
      status: 200,
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Canonical Cloud signal health is unavailable." },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}
