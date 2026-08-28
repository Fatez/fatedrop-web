import { timingSafeEqual } from "node:crypto";

import { dispatchCanonicalPushAlerts } from "@/lib/canonical-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.FATEDROP_METRICS_INGEST_SECRET;
  const authorization = request.headers.get("authorization") || "";
  if (!secret || !authorization.startsWith("Bearer ")) return false;
  const provided = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json(
      { error: "Push dispatch is not authorised." },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const result = await dispatchCanonicalPushAlerts();
    if (!result.enabled) {
      return Response.json(
        { error: "Push dispatch is not enabled.", result },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    return Response.json(
      { accepted: true, ...result },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Push dispatch could not run." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
