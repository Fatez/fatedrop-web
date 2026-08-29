import { timingSafeEqual } from "node:crypto";

import {
  isPushCanaryKind,
  runProductionPushCanarySuite,
  type CanaryKind,
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
  const provided = authorization.slice(7);
  return (
    matchesSecret(provided, process.env.FATEDROP_PUSH_CRON_SECRET) ||
    matchesSecret(provided, process.env.FATEDROP_PUSH_TEST_SECRET)
  );
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json(
      { error: "Push canary is not authorised." },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const requestedKind = new URL(request.url).searchParams.get("kind");
  let selectedKind: CanaryKind | undefined;
  if (requestedKind) {
    if (!isPushCanaryKind(requestedKind)) {
      return Response.json(
        { error: "Push canary kind is not supported." },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    }
    selectedKind = requestedKind;
  }

  try {
    const result = await runProductionPushCanarySuite(selectedKind);
    if (!result.accepted) {
      return Response.json(
        { error: "Production push canary did not reach provider acceptance for every requested function.", ...result },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    return Response.json(result, { status: 200, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json(
      { error: "Production push canary could not run." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
