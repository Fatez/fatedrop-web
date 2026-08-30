import { timingSafeEqual } from "node:crypto";

import { fateDropPostgres } from "@/lib/postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHECKPOINT_ID = "pre-rrp-2026-08-30-1514";

function matchesSecret(provided: string, expected: string | undefined) {
  if (!expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

function authorized(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return false;
  return matchesSecret(authorization.slice(7), process.env.FATEDROP_RRP_AUDIT_SECRET);
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json(
      { error: "RRP recovery checkpoint is not authorised." },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const sql = await fateDropPostgres();

    await sql`CREATE TABLE IF NOT EXISTS fatedrop_rrp_recovery_snapshots (
      checkpoint_id text NOT NULL,
      captured_at bigint NOT NULL,
      checkpoint_identity_count integer NOT NULL,
      product_identity_id text NOT NULL,
      tcg text NOT NULL,
      canonical_key text NOT NULL,
      title text NOT NULL,
      product_type text,
      set_name text,
      edition text,
      official_rrp_pence bigint,
      rrp_source text,
      rrp_verified_at bigint,
      identity_updated_at bigint NOT NULL,
      PRIMARY KEY (checkpoint_id, product_identity_id)
    )`;

    const existingRows = await sql`SELECT COUNT(*)::int AS count
      FROM fatedrop_rrp_recovery_snapshots
      WHERE checkpoint_id=${CHECKPOINT_ID}`;
    const existingCount = number(existingRows[0]?.count);

    if (existingCount === 0) {
      const capturedAt = Math.floor(Date.now() / 1000);
      await sql`INSERT INTO fatedrop_rrp_recovery_snapshots (
        checkpoint_id,
        captured_at,
        checkpoint_identity_count,
        product_identity_id,
        tcg,
        canonical_key,
        title,
        product_type,
        set_name,
        edition,
        official_rrp_pence,
        rrp_source,
        rrp_verified_at,
        identity_updated_at
      )
      SELECT
        ${CHECKPOINT_ID},
        ${capturedAt},
        COUNT(*) OVER ()::int,
        id,
        tcg,
        canonical_key,
        title,
        product_type,
        set_name,
        edition,
        official_rrp_pence,
        rrp_source,
        rrp_verified_at,
        updated_at
      FROM fatedrop_product_identities
      ON CONFLICT (checkpoint_id, product_identity_id) DO NOTHING`;
    }

    const [snapshotRows, canonicalRows] = await Promise.all([
      sql`SELECT
        COUNT(*)::int AS snapshot_count,
        COALESCE(MAX(checkpoint_identity_count), 0)::int AS expected_count,
        COALESCE(MIN(captured_at), 0)::bigint AS captured_at,
        COUNT(DISTINCT captured_at)::int AS capture_versions
      FROM fatedrop_rrp_recovery_snapshots
      WHERE checkpoint_id=${CHECKPOINT_ID}`,
      sql`SELECT COUNT(*)::int AS canonical_count FROM fatedrop_product_identities`,
    ]);

    const snapshot = snapshotRows[0] as Record<string, unknown> | undefined;
    const snapshotCount = number(snapshot?.snapshot_count);
    const expectedIdentityCount = number(snapshot?.expected_count);
    const capturedAt = number(snapshot?.captured_at);
    const captureVersions = number(snapshot?.capture_versions);
    const canonicalCountNow = number(canonicalRows[0]?.canonical_count);
    const complete = snapshotCount > 0 && snapshotCount === expectedIdentityCount && captureVersions === 1;

    return Response.json(
      {
        accepted: complete,
        checkpointId: CHECKPOINT_ID,
        created: existingCount === 0,
        capturedAt,
        snapshotCount,
        expectedIdentityCount,
        canonicalCountNow,
        captureVersions,
        complete,
      },
      { status: complete ? 200 : 503, headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "RRP recovery checkpoint failed." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
