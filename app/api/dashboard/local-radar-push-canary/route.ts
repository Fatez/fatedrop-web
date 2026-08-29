import { timingSafeEqual } from "node:crypto";

import { runLocalRadarProductionCanary } from "@/lib/local-radar-push-canary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json(
      { error: "Local Radar push canary is not authorised." },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const result = await runLocalRadarProductionCanary();
    if (!result.accepted) {
      return Response.json(
        { error: "Local Radar production canary did not reach provider acceptance.", ...result },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    return Response.json(result, { status: 200, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json(
      { error: "Local Radar production canary could not run." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
