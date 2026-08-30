import { timingSafeEqual } from "node:crypto";

import { dispatchCanonicalPushAlerts } from "@/lib/canonical-push";
import { reconcileExpoPushReceipts } from "@/lib/expo-push-receipts";
import { recordPushDispatchHeartbeat } from "@/lib/push-dispatch-health";

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
  return matchesSecret(provided, process.env.FATEDROP_METRICS_INGEST_SECRET)
    || matchesSecret(provided, process.env.FATEDROP_PUSH_CRON_SECRET);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json(
      { error: "Push dispatch is not authorised." },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const startedAt = Math.floor(Date.now() / 1000);

  try {
    const receipts = await reconcileExpoPushReceipts();
    const result = await dispatchCanonicalPushAlerts();
    const completedAt = Math.floor(Date.now() / 1000);
    const totalProviderFailure = result.enabled && result.claimed > 0 && result.sent === 0 && result.failed > 0;
    const receiptUnavailable = !receipts.schemaReady || receipts.error !== null;
    const status = !result.enabled ? "disabled" : totalProviderFailure || receiptUnavailable ? "error" : "ok";
    const heartbeatError = !result.enabled
      ? "Push dispatch is not enabled."
      : totalProviderFailure
        ? "Every claimed push delivery failed in the provider batch."
        : receiptUnavailable
          ? `Expo receipt verification unavailable: ${receipts.error || "receipt schema unavailable"}`
          : null;

    await recordPushDispatchHeartbeat({
      startedAt,
      completedAt,
      status,
      queued: result.queued,
      claimed: result.claimed,
      sent: result.sent,
      failed: result.failed + receipts.failed,
      error: heartbeatError,
    }).catch(() => undefined);

    if (!result.enabled) {
      return Response.json(
        { error: "Push dispatch is not enabled.", result, receipts },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    if (totalProviderFailure) {
      return Response.json(
        { error: "Every claimed push delivery failed.", result, receipts },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    return Response.json(
      { accepted: true, ...result, receipts },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    const completedAt = Math.floor(Date.now() / 1000);
    const detail = error instanceof Error ? error.message : "Push dispatch could not run.";
    await recordPushDispatchHeartbeat({
      startedAt,
      completedAt,
      status: "error",
      queued: 0,
      claimed: 0,
      sent: 0,
      failed: 0,
      error: detail.slice(0, 240),
    }).catch(() => undefined);
    return Response.json(
      { error: "Push dispatch could not run." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
