import { timingSafeEqual } from "node:crypto";

import { fateDropPostgres } from "@/lib/postgres";

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

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function candidateReason(row: Record<string, unknown>) {
  const rrp = row.official_rrp_pence == null ? null : number(row.official_rrp_pence);
  if (rrp == null) return "missing_rrp";
  if (rrp <= 0) return "invalid_rrp";
  if (!clean(row.rrp_source)) return "missing_source";
  if (row.rrp_verified_at == null) return "missing_verified_at";
  return "review";
}

export async function GET(request: Request) {
  const detail = new URL(request.url).searchParams.get("detail") === "1";
  if (detail && !authorized(request)) {
    return Response.json({ error: "Detailed RRP audit is not authorised." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  try {
    const sql = await fateDropPostgres();
    const verifiedPredicate = sql`official_rrp_pence IS NOT NULL
      AND official_rrp_pence > 0
      AND NULLIF(BTRIM(COALESCE(rrp_source,'')), '') IS NOT NULL
      AND rrp_verified_at IS NOT NULL`;

    const [totalsRows, tcgRows, typeRows, sourceRows] = await Promise.all([
      sql`SELECT
        COUNT(*)::int AS total,
        (COUNT(*) FILTER (WHERE official_rrp_pence IS NULL))::int AS missing_rrp,
        (COUNT(*) FILTER (WHERE ${verifiedPredicate}))::int AS verified,
        (COUNT(*) FILTER (WHERE official_rrp_pence IS NOT NULL AND NOT (${verifiedPredicate})))::int AS unverified,
        (COUNT(*) FILTER (WHERE official_rrp_pence IS NOT NULL AND official_rrp_pence <= 0))::int AS invalid_rrp,
        (COUNT(*) FILTER (WHERE official_rrp_pence IS NOT NULL AND official_rrp_pence > 0 AND NULLIF(BTRIM(COALESCE(rrp_source,'')), '') IS NULL))::int AS missing_source,
        (COUNT(*) FILTER (WHERE official_rrp_pence IS NOT NULL AND official_rrp_pence > 0 AND NULLIF(BTRIM(COALESCE(rrp_source,'')), '') IS NOT NULL AND rrp_verified_at IS NULL))::int AS missing_verified_at
      FROM fatedrop_product_identities`,
      sql`SELECT
        COALESCE(NULLIF(BTRIM(tcg),''),'unknown') AS label,
        COUNT(*)::int AS total,
        (COUNT(*) FILTER (WHERE ${verifiedPredicate}))::int AS verified,
        (COUNT(*) FILTER (WHERE official_rrp_pence IS NULL))::int AS missing_rrp
      FROM fatedrop_product_identities
      GROUP BY 1
      ORDER BY total DESC, label ASC`,
      sql`SELECT
        COALESCE(NULLIF(BTRIM(product_type),''),'unknown') AS label,
        COUNT(*)::int AS total,
        (COUNT(*) FILTER (WHERE ${verifiedPredicate}))::int AS verified,
        (COUNT(*) FILTER (WHERE official_rrp_pence IS NULL))::int AS missing_rrp
      FROM fatedrop_product_identities
      GROUP BY 1
      ORDER BY total DESC, label ASC
      LIMIT 100`,
      sql`SELECT rrp_source AS source, COUNT(*)::int AS count
      FROM fatedrop_product_identities
      WHERE ${verifiedPredicate}
      GROUP BY rrp_source
      ORDER BY count DESC, rrp_source ASC
      LIMIT 100`,
    ]);

    const total = totalsRows[0] as Record<string, unknown> | undefined;
    const response: Record<string, unknown> = {
      ok: true,
      auditedAt: Math.floor(Date.now() / 1000),
      totals: {
        total: number(total?.total),
        verified: number(total?.verified),
        missingRrp: number(total?.missing_rrp),
        unverified: number(total?.unverified),
        invalidRrp: number(total?.invalid_rrp),
        missingSource: number(total?.missing_source),
        missingVerifiedAt: number(total?.missing_verified_at),
      },
      byTcg: (tcgRows as Record<string, unknown>[]).map((row) => ({
        label: clean(row.label) || "unknown",
        total: number(row.total),
        verified: number(row.verified),
        missingRrp: number(row.missing_rrp),
      })),
      byProductType: (typeRows as Record<string, unknown>[]).map((row) => ({
        label: clean(row.label) || "unknown",
        total: number(row.total),
        verified: number(row.verified),
        missingRrp: number(row.missing_rrp),
      })),
      verifiedSources: (sourceRows as Record<string, unknown>[]).map((row) => ({
        source: clean(row.source),
        count: number(row.count),
      })),
    };

    if (detail) {
      const candidateRows = await sql`SELECT
        p.title,
        p.tcg,
        p.canonical_key,
        p.product_type,
        p.set_name,
        p.edition,
        p.official_rrp_pence,
        p.rrp_source,
        p.rrp_verified_at,
        COUNT(DISTINCT o.id)::int AS offer_count,
        COUNT(DISTINCT o.retailer_id)::int AS retailer_count,
        MAX(o.observed_at)::bigint AS latest_offer_observed_at
      FROM fatedrop_product_identities p
      LEFT JOIN fatedrop_offers o ON o.product_identity_id=p.id
      WHERE p.official_rrp_pence IS NULL
        OR p.official_rrp_pence <= 0
        OR NULLIF(BTRIM(COALESCE(p.rrp_source,'')), '') IS NULL
        OR p.rrp_verified_at IS NULL
      GROUP BY p.id,p.title,p.tcg,p.canonical_key,p.product_type,p.set_name,p.edition,p.official_rrp_pence,p.rrp_source,p.rrp_verified_at
      ORDER BY offer_count DESC, latest_offer_observed_at DESC NULLS LAST, p.title ASC
      LIMIT 100`;

      response.candidates = (candidateRows as Record<string, unknown>[]).map((row) => ({
        reason: candidateReason(row),
        title: clean(row.title),
        tcg: clean(row.tcg),
        canonicalKey: clean(row.canonical_key),
        productType: clean(row.product_type),
        setName: clean(row.set_name),
        edition: clean(row.edition),
        currentRrpPence: row.official_rrp_pence == null ? null : number(row.official_rrp_pence),
        currentSource: clean(row.rrp_source),
        verifiedAt: row.rrp_verified_at == null ? null : number(row.rrp_verified_at),
        offerCount: number(row.offer_count),
        retailerCount: number(row.retailer_count),
        latestOfferObservedAt: row.latest_offer_observed_at == null ? null : number(row.latest_offer_observed_at),
      }));
    }

    return Response.json(response, { status: 200, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ ok: false, error: "RRP audit unavailable." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
