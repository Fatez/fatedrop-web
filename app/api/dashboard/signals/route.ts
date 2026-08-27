import { getCurrentSnapshot } from "@/lib/auth";
import { getCanonicalRecentSignals } from "@/lib/canonical-signals";
import { hasPremiumAccess } from "@/lib/membership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });

  const canonicalSignals = await getCanonicalRecentSignals(100).catch(() => null);
  const premium = hasPremiumAccess(snapshot.membership);
  const signals = (canonicalSignals ?? []).map((signal) => premium ? signal : {
    id: signal.id,
    state: signal.state,
    kind: signal.kind,
    intensity: signal.intensity,
    confidence: null,
    title: signal.intensity === "major" ? "Major network movement detected" : "Premium signal detail",
    retailer: null,
    detail: null,
    deliveredPricePence: null,
    occurredAt: signal.occurredAt,
  });

  return Response.json({
    available: canonicalSignals !== null,
    premium,
    source: canonicalSignals !== null ? "FateDrop signal ledger" : null,
    measuredAt: canonicalSignals?.[0]?.occurredAt ?? null,
    signals,
  }, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
