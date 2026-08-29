import { timingSafeEqual } from "node:crypto";

import {
  isPushCanaryKind,
  runProductionPushCanarySuite,
  runSingleProductionPushCanary,
} from "@/lib/push-canary";

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
      { error: "Push canary is not authorised." },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const payload = await request.json().catch(() => null);
  const requestedKind = payload && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as Record<string, unknown>).kind
    : undefined;
  if (requestedKind !== undefined && !isPushCanaryKind(requestedKind)) {
    return Response.json(
      { error: "Invalid push canary kind." },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const result = requestedKind
      ? await runSingleProductionPushCanary(requestedKind)
      : await runProductionPushCanarySuite();
    if (!result.accepted) {
      return Response.json(
        {
          error: requestedKind
            ? `Production ${requestedKind} push canary did not reach provider acceptance.`
            : "Production push canary suite did not reach provider acceptance for all five functions.",
          ...result,
        },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    return Response.json(result, { status: 200, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json(
      {
        error: requestedKind
          ? `Production ${requestedKind} push canary could not run.`
          : "Production push canary suite could not run.",
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
