import { assertSameOrigin, getCurrentSessionToken } from "@/lib/auth";
import { fateTraderCloudPath, fateTraderWebEnabled } from "@/lib/fate-trader-web";

const DEFAULT_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";
const MAX_BODY_BYTES = 1_000_000;

type RouteContext = { params: Promise<{ path: string[] }> };

function json(status: number, payload: unknown) {
  return Response.json(payload, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

async function proxy(request: Request, context: RouteContext) {
  if (!fateTraderWebEnabled()) {
    return json(404, { ok: false, error: { code: "NOT_FOUND", message: "Fate Trader is not enabled." } });
  }

  const { path } = await context.params;
  const cloudPath = fateTraderCloudPath(path);
  if (!cloudPath) {
    return json(404, { ok: false, error: { code: "NOT_FOUND", message: "Fate Trader resource not found." } });
  }

  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    return json(405, { ok: false, error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } });
  }

  if (request.method !== "GET") {
    try {
      assertSameOrigin(request);
    } catch {
      return json(403, { ok: false, error: { code: "CROSS_ORIGIN", message: "Cross-origin request rejected." } });
    }
  }

  const base = (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
  const target = new URL(cloudPath, `${base}/`);
  target.search = new URL(request.url).search;

  const token = await getCurrentSessionToken();
  const headers = new Headers({ Accept: "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let body: string | undefined;
  if (request.method !== "GET") {
    body = await request.text();
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      return json(413, { ok: false, error: { code: "REQUEST_TOO_LARGE", message: "Request body is too large." } });
    }
    if (body) headers.set("Content-Type", request.headers.get("content-type") || "application/json");
  }

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const text = await response.text();
    return new Response(text || null, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return json(502, {
      ok: false,
      error: {
        code: "TRADER_UPSTREAM_UNAVAILABLE",
        message: "Fate Trader is temporarily unavailable.",
        retryable: true,
      },
    });
  }
}

export function GET(request: Request, context: RouteContext) { return proxy(request, context); }
export function POST(request: Request, context: RouteContext) { return proxy(request, context); }
export function PUT(request: Request, context: RouteContext) { return proxy(request, context); }
export function PATCH(request: Request, context: RouteContext) { return proxy(request, context); }
export function DELETE(request: Request, context: RouteContext) { return proxy(request, context); }
