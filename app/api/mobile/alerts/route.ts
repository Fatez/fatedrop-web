import { getSnapshotForRequest } from "@/lib/auth";
import { hasCapability } from "@/lib/entitlements";
import { fateDropPostgres } from "@/lib/postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SignalRow = {
  id: string;
  state: string;
  retailer_name: string;
  title: string;
  url: string;
  price_pence: number | null;
  rrp_pence: number | null;
  delivered_price_pence: number | null;
  confidence: number;
  detected_at: number;
  reason: string;
};

function publicStage(state: string) {
  if (state === "whisper") return "ECHO";
  if (state === "manifested" || state === "echo") return "MANIFESTED";
  if (state === "vanished") return "VANISHED";
  return "NETWORK";
}

function toMarketEvent(row: SignalRow) {
  const fateStage = publicStage(row.state);
  const confirmed = fateStage === "MANIFESTED";
  return {
    id: row.id,
    type: row.state.toUpperCase(),
    fateStage,
    title: row.title,
    message: row.reason,
    retailer: row.retailer_name,
    detectedAt: new Date(Number(row.detected_at) * 1000).toISOString(),
    confirmed,
    confirmedRestock: confirmed,
    productUrl: row.url,
    product: {
      title: row.title,
      url: row.url,
      pricePence: row.price_pence,
      rrpPence: row.rrp_pence,
      deliveredPricePence: row.delivered_price_pence,
    },
    confidence: Number(row.confidence),
  };
}

export async function GET(request: Request) {
  const snapshot = await getSnapshotForRequest(request);
  if (!snapshot) {
    return Response.json({ error: "Authentication required." }, { status: 401, headers: { "cache-control": "private, no-store" } });
  }

  try {
    const sql = await fateDropPostgres();
    const url = new URL(request.url);
    const requestedId = url.searchParams.get("id")?.trim() || null;
    const requestedLimit = Number.parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Math.max(1, Math.min(100, Number.isFinite(requestedLimit) ? requestedLimit : 50));

    const rows = requestedId
      ? await sql`SELECT id,state,retailer_name,title,url,price_pence,rrp_pence,delivered_price_pence,confidence,detected_at,reason
                  FROM fatedrop_signals WHERE id=${requestedId} LIMIT 1`
      : await sql`SELECT id,state,retailer_name,title,url,price_pence,rrp_pence,delivered_price_pence,confidence,detected_at,reason
                  FROM fatedrop_signals ORDER BY detected_at DESC LIMIT ${limit}`;

    return Response.json({
      success: true,
      premium: hasCapability(snapshot.membership, "priority_alerts"),
      count: rows.length,
      alerts: rows.map((row) => toMarketEvent(row as SignalRow)),
    }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Canonical alert history is temporarily unavailable." }, { status: 503, headers: { "cache-control": "private, no-store" } });
  }
}
