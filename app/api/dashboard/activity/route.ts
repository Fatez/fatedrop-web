import { randomUUID } from "node:crypto";
import { getCurrentSnapshot } from "@/lib/auth";
import { recordDashboardActivity, type DashboardActivityEvent, type DashboardActivityType, type SignalLifecycle } from "@/lib/dashboard-storage";

export const runtime = "nodejs";

const activityTypes = new Set<DashboardActivityType>(["signal_seen", "wishlist_hit", "store_tracked", "market_saving"]);
const signalStates = new Set<SignalLifecycle>(["whisper", "manifested", "vanished", "echo"]);

function text(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) || null : null; }
function serviceAuthorized(request: Request) {
  const secret = process.env.FATEDROP_METRICS_INGEST_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function POST(request: Request) {
  try {
    const service = serviceAuthorized(request);
    const snapshot = service ? null : await getCurrentSnapshot();
    if (!service && !snapshot) return Response.json({ error: "Sign in required." }, { status: 401 });
    const payload = await request.json() as Record<string, unknown>;
    const type = typeof payload.type === "string" && activityTypes.has(payload.type as DashboardActivityType) ? payload.type as DashboardActivityType : null;
    if (!type) return Response.json({ error: "Unsupported dashboard activity type." }, { status: 400 });
    const userId = service ? text(payload.userId, 100) : snapshot!.account.id;
    if (!userId) return Response.json({ error: "userId is required for service ingestion." }, { status: 400 });
    const signalState = typeof payload.signalState === "string" && signalStates.has(payload.signalState as SignalLifecycle) ? payload.signalState as SignalLifecycle : null;
    const now = Math.floor(Date.now() / 1000);
    const occurredAtInput = Number(payload.occurredAt);
    const occurredAt = Number.isFinite(occurredAtInput) && occurredAtInput > 0 ? Math.floor(occurredAtInput) : now;
    const amountInput = Number(payload.amountPence);
    const amountPence = Number.isFinite(amountInput) ? Math.max(0, Math.min(Math.floor(amountInput), 100_000_000)) : null;
    const source = service ? (text(payload.source, 20) === "app" ? "app" : text(payload.source, 20) === "import" ? "import" : "cloud") : "website";
    const sourceEventId = text(payload.sourceEventId, 160);
    const event: DashboardActivityEvent = {
      id: sourceEventId ? `evt_${sourceEventId}`.slice(0, 190) : randomUUID(),
      userId,
      sourceEventId,
      type,
      signalState,
      title: text(payload.title, 180),
      subtitle: text(payload.subtitle, 240),
      retailer: text(payload.retailer, 140),
      storeId: text(payload.storeId, 140),
      amountPence,
      source: source as DashboardActivityEvent["source"],
      occurredAt,
      recordedAt: now,
    };
    const inserted = await recordDashboardActivity(event);
    return Response.json({ stored: inserted, id: event.id }, { status: inserted ? 201 : 200 });
  } catch {
    return Response.json({ error: "Dashboard activity could not be stored." }, { status: 500 });
  }
}
