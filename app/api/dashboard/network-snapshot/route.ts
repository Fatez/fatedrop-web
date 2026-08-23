import { randomUUID, timingSafeEqual } from "node:crypto";
import { dispatchCanonicalPushAlerts } from "@/lib/canonical-push";
import { saveNetworkMetricSnapshot, type NetworkEventListing, type NetworkMetricSnapshot, type NetworkSignal, type SignalIntensity, type SignalKind, type SignalLifecycle } from "@/lib/dashboard-storage";
import { processNetworkOpportunity, processRrpReferenceProduct } from "@/lib/fate-network-pipeline";
import { parseNetworkOpportunity, parseRrpReferenceProduct } from "@/lib/network-ingest";

export const runtime = "nodejs";

const lifecycleStates = new Set<SignalLifecycle>(["whisper", "manifested", "vanished", "echo"]);
const signalKinds = new Set<SignalKind>(["whisper", "manifested", "vanished", "echo", "price_change", "launch_date_change", "queue", "security", "drop_pulse"]);
const signalIntensities = new Set<SignalIntensity>(["subtle", "standard", "major"]);
function text(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) || null : null; }
function metric(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : null;
}
function confidence(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : null;
}
function authorized(request: Request) {
  const secret = process.env.FATEDROP_METRICS_INGEST_SECRET;
  const authorization = request.headers.get("authorization") || "";
  if (!secret || !authorization.startsWith("Bearer ")) return false;
  const provided = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
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
      const rawKind = typeof item.kind === "string" ? item.kind : item.state;
      const kind = typeof rawKind === "string" && signalKinds.has(rawKind as SignalKind) ? rawKind as SignalKind : null;
      const rawState = typeof item.state === "string" ? item.state : null;
      const state = rawState && lifecycleStates.has(rawState as SignalLifecycle)
        ? rawState as SignalLifecycle
        : kind && lifecycleStates.has(kind as SignalLifecycle) ? kind as SignalLifecycle : "whisper";
      const intensity = typeof item.intensity === "string" && signalIntensities.has(item.intensity as SignalIntensity) ? item.intensity as SignalIntensity : undefined;
      const title = text(item.title, 180);
      if (!kind || !title) return [];
      const occurredInput = Number(item.occurredAt);
      return [{ id: text(item.id, 160) || randomUUID(), state, kind, intensity, confidence: confidence(item.confidence), title, retailer: text(item.retailer, 140), detail: text(item.detail, 240), deliveredPricePence: metric(item.deliveredPricePence), occurredAt: Number.isFinite(occurredInput) && occurredInput > 0 ? Math.floor(occurredInput) : measuredAt }];
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
      metrics: {
        whisper: metric(metrics.whisper), manifested: metric(metrics.manifested), vanished: metric(metrics.vanished), echo: metric(metrics.echo),
        changes24h: metric(metrics.changes24h), productsTracked: metric(metrics.productsTracked), inStock: metric(metrics.inStock), catalogueRetailers: metric(metrics.catalogueRetailers), healthyMonitors: metric(metrics.healthyMonitors),
        whisperDelivered: metric(metrics.whisperDelivered), whisperSkipped: metric(metrics.whisperSkipped), whisperFailed: metric(metrics.whisperFailed), whisperUnaccounted: metric(metrics.whisperUnaccounted),
        echoDelivered: metric(metrics.echoDelivered), echoSkipped: metric(metrics.echoSkipped), echoFailed: metric(metrics.echoFailed), echoUnaccounted: metric(metrics.echoUnaccounted),
        manifestedDelivered: metric(metrics.manifestedDelivered), manifestedSkipped: metric(metrics.manifestedSkipped), manifestedFailed: metric(metrics.manifestedFailed), manifestedUnaccounted: metric(metrics.manifestedUnaccounted),
        vanishedDelivered: metric(metrics.vanishedDelivered), vanishedSkipped: metric(metrics.vanishedSkipped), vanishedFailed: metric(metrics.vanishedFailed), vanishedUnaccounted: metric(metrics.vanishedUnaccounted),
        discordDetected: metric(metrics.discordDetected), discordAttempted: metric(metrics.discordAttempted), discordDelivered: metric(metrics.discordDelivered), discordSkipped: metric(metrics.discordSkipped), discordFailed: metric(metrics.discordFailed), discordUnaccounted: metric(metrics.discordUnaccounted),
      },
      recentSignals, upcomingEvents,
    };
    const inserted = await saveNetworkMetricSnapshot(snapshot);

    let rrpReferenceProcessed = 0;
    let rrpReferenceDeferred = 0;
    const rrpReferenceProducts = Array.isArray(payload.rrpReferenceProducts) ? payload.rrpReferenceProducts.slice(0, 2000) : [];
    for (const raw of rrpReferenceProducts) {
      const product = parseRrpReferenceProduct(raw, measuredAt);
      if (!product) { rrpReferenceDeferred += 1; continue; }
      try {
        await processRrpReferenceProduct(product);
        rrpReferenceProcessed += 1;
      } catch {
        rrpReferenceDeferred += 1;
      }
    }

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
        opportunitiesDeferred += 1;
      }
    }

    // Push delivery is deliberately isolated from network ingestion. It is inert unless
    // FATEDROP_PUSH_DISPATCH_ENABLED=true, and a provider/database failure never rejects
    // the authoritative snapshot or FateMatch processing above.
    const push = await dispatchCanonicalPushAlerts({ measuredAt }).catch(() => ({
      enabled: process.env.FATEDROP_PUSH_DISPATCH_ENABLED === "true",
      queued: 0,
      claimed: 0,
      sent: 0,
      failed: 0,
      error: "dispatch_failed",
    }));

    return Response.json({ stored: inserted, measuredAt, rrpReferenceProcessed, rrpReferenceDeferred, opportunitiesProcessed, opportunitiesDeferred, fateMatchesTriggered, push }, { status: inserted ? 201 : 200 });
  } catch {
    return Response.json({ error: "Network snapshot could not be stored." }, { status: 500 });
  }
}
