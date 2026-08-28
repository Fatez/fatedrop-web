import { timingSafeEqual } from "node:crypto";

import { applyRequiredDatabaseMigrations, databaseMigrationStatus } from "@/lib/database-migrations";

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
  return matchesSecret(authorization.slice(7), process.env.FATEDROP_DEPLOY_MIGRATION_SECRET);
}

function noStore(status = 200) {
  return { status, headers: { "cache-control": "no-store" } };
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Database migration status is not authorised." }, noStore(401));
  }

  try {
    const status = await databaseMigrationStatus();
    return Response.json(status, noStore(status.ready ? 200 : 503));
  } catch {
    return Response.json({ error: "Database migration status could not be read." }, noStore(503));
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Database migration is not authorised." }, noStore(401));
  }

  try {
    const result = await applyRequiredDatabaseMigrations();
    if (!result.ready) {
      return Response.json({ error: "Required database migrations remain pending.", ...result }, noStore(503));
    }
    return Response.json({ accepted: true, ...result }, noStore(200));
  } catch {
    return Response.json({ error: "Required database migrations could not be applied." }, noStore(503));
  }
}
