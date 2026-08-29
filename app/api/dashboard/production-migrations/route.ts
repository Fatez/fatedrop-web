import { timingSafeEqual } from "node:crypto";

import { ensureCanonicalOwnerBootstrapAccount } from "@/lib/owner-bootstrap";
import { runProductionMigrations } from "@/lib/production-migrations";
import { fateDropPostgres } from "@/lib/postgres";
import { ensureTemporaryOwnerBootstrap } from "@/lib/temporary-owner-bootstrap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OWNER_BOOTSTRAP_ERROR = "Owner bootstrap requires exactly one canonical hello@fatedrop.co.uk FateDrop account.";

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
  return matchesSecret(provided, process.env.FATEDROP_PUSH_CRON_SECRET);
}

async function ownerBootstrapDiagnostic(detail: string) {
  if (detail !== OWNER_BOOTSTRAP_ERROR) return detail;
  try {
    const sql = await fateDropPostgres();
    const rows = await sql`SELECT COUNT(*)::int AS count FROM fatedrop_users WHERE lower(email)='hello@fatedrop.co.uk'`;
    const count = Number(rows[0]?.count ?? -1);
    return `${detail} Match count: ${Number.isFinite(count) ? count : "unknown"}.`;
  } catch {
    return `${detail} Match count unavailable.`;
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Production migration is not authorised." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  try {
    const ownerBootstrap = await ensureCanonicalOwnerBootstrapAccount();
    const result = await runProductionMigrations();
    const temporaryOwnerBootstrap = await ensureTemporaryOwnerBootstrap();
    return Response.json({ accepted: true, ownerBootstrap, temporaryOwnerBootstrap, ...result }, { status: 200, headers: { "cache-control": "no-store" } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Production migration failed.";
    const diagnostic = await ownerBootstrapDiagnostic(detail);
    return Response.json({ error: diagnostic.slice(0, 300) }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
