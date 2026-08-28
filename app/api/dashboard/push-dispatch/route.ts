import { timingSafeEqual } from "node:crypto";

import { dispatchCanonicalPushAlerts } from "@/lib/canonical-push";
import { databaseMigrationStatus } from "@/lib/database-migrations";

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

  try {
    const migrationStatus = await databaseMigrationStatus();
    if (!migrationStatus.ready) {
      return Response.json(
        { error: "Push dispatch blocked because required database migrations are pending.", migrationStatus },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }

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
