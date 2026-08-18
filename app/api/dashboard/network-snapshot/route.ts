import { randomUUID } from "node:crypto";
import { saveNetworkMetricSnapshot, type NetworkEventListing, type NetworkMetricSnapshot, type NetworkSignal, type SignalLifecycle } from "@/lib/dashboard-storage";
import { processNetworkOpportunity } from "@/lib/fate-network-pipeline";
import { parseNetworkOpportunity } from "@/lib/network-ingest";

export const runtime = "nodejs";

const signalStates = new Set<SignalLifecycle>(["whisper", "manifested", "vanished", "echo"]);
function text(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) || null : null; }
function metric(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : null;
}
function authorized(request: Request) {
  const secret = process.env.FATEDROP_METRICS_INGEST_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Metric ingestion is not authorised." }, { status: 401 });
  try {
    const payload = await request.json() as Record<string, unknown>;
    const sourceEventId = text(payload.sourceEventId, 160);
    const source = text(payload.source, 120);
    if (!sourceEventId || !source) return Response.json({ error: "sourceEventId and source are required." }, { status: 400 });
    const metrics = payload.metrics && typeof payload.metrics === "object" ? payload.metrics as Record<string, unknown> : {};
    const now = Math.floor(Date.now() / 1000);
    const measuredInput = Number(payload.measuredAt);
    const measuredAt = Number.isFinite(measuredInput) && measuredInput > 0 ? Math.floor(measuredInput) : now;
    const recentSignals = Array.isArray(payload.recentSignals) ? payload.recentSignals.slice(0, 100).flatMap((raw): NetworkSignal[] => {
      if (!raw || typeof raw !== "object") return [];
      const item = raw as Record<string, unknown>;
      const state = typeof item.state === "string" && signalStates.has(item.state as SignalLifecycle) ? item.state as SignalLifecycle : null;
      const title = text(item.title, 180);
      if (!state || !title) return [];
      const occurredInput = Number(item.occurredAt);
      return [{ id: text(item.id, 160) || randomUUID(), state, title, retailer: text(item.retailer, 140), detail: text(item.detail, 240), deliveredPricePence: metric(item.deliveredPricePence), occurredAt: Number.isFinite(occurredInput) && occurredInput > 0 ? Math.floor(occurredInput) : measuredAt }];
    }) : [];
    const upcomingEvents = Array.isArray(payload.upcomingEvents) ? payload.upcomingEvents.slice(0, 60).flatMap((raw): NetworkEventListing[] => {
      if (!raw || typeof raw !== "object") return [];
      const item = raw as Record<string, unknown>;
      const name = text(item.name, 180);
      const startsInput = Number(item.startsAt);
      if (!name || !Number.isFinite(startsInput) || startsInput <= 0) return [];
      return [{ id: text(item.id, 160) || randomUUID(), name, venue: text(item.venue, 180), location: text(item.location, 180), startsAt: Math.floor(startsInput), ticketUrl: text(item.ticketUrl, 500), vendorCount: metric(item.vendorCount) }];
    }) : [];
    const snapshot: NetworkMetricSnapshot = {
      id: randomUUID(), sourceEventId, source, measuredAt, recordedAt: now,
      metrics: { whisper: metric(metrics.whisper), manifested: metric(metrics.manifested), vanished: metric(metrics.vanished), echo: metric(metrics.echo), changes24h: metric(metrics.changes24h), productsTracked: metric(metrics.productsTracked), inStock: metric(metrics.inStock), catalogueRetailers: metric(metrics.catalogueRetailers), healthyMonitors: metric(metrics.healthyMonitors) },
      recentSignals, upcomingEvents,
    };
    const inserted = await saveNetworkMetricSnapshot(snapshot);

    let opportunitiesProcessed = 0;
    let fateMatchesTriggered = 0;
    let opportunitiesDeferred = 0;
    const opportunities = Array.isArray(payload.opportunities) ? payload.opportunities.slice(0, 250) : [];
    for (const raw of opportunities) {
      const opportunity = parseNetworkOpportunity(raw, measuredAt);
      if (!opportunity) { opportunitiesDeferred += 1; continue; }
      try {
        const result = await processNetworkOpportunity(opportunity);
        opportunitiesProcessed += 1;
        fateMatchesTriggered += result.matches.length;
      } catch {
        // Snapshot ingestion remains backwards-compatible while the additive Fate Network migration is staged.
        opportunitiesDeferred += 1;
      }
    }

    return Response.json({ stored: inserted, measuredAt, opportunitiesProcessed, opportunitiesDeferred, fateMatchesTriggered }, { status: inserted ? 201 : 200 });
  } catch {
    return Response.json({ error: "Network snapshot could not be stored." }, { status: 500 });
  }
}
