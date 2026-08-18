import { getCurrentSnapshot } from "@/lib/auth";
import { getLatestNetworkMetricSnapshot } from "@/lib/dashboard-storage";
import { hasPremiumAccess } from "@/lib/membership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });

  const network = await getLatestNetworkMetricSnapshot();
  const premium = hasPremiumAccess(snapshot.membership);
  const signals = [...(network?.recentSignals ?? [])]
    .sort((a, b) => b.occurredAt - a.occurredAt)
    .slice(0, 100)
    .map((signal) => premium ? signal : {
      id: signal.id,
      state: signal.state,
      title: "Premium signal detail",
      retailer: null,
      detail: null,
      deliveredPricePence: null,
      occurredAt: signal.occurredAt,
    });

  return Response.json({
    premium,
    source: network?.source ?? null,
    measuredAt: network?.measuredAt ?? null,
    signals,
  }, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
