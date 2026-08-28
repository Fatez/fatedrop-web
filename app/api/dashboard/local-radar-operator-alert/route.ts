import { timingSafeEqual } from "node:crypto";

import { dispatchLocalRadarOperatorPush, type LocalRadarOperatorPush } from "@/lib/canonical-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) || null : null;
}

function nullableIso(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const clean = text(value, 80);
  if (!clean || !Number.isFinite(Date.parse(clean))) return undefined;
  return new Date(clean).toISOString();
}

function authorized(request: Request) {
  const secret = process.env.FATEDROP_METRICS_INGEST_SECRET;
  const authorization = request.headers.get("authorization") || "";
  if (!secret || !authorization.startsWith("Bearer ")) return false;
  const provided = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

function parseOperatorPush(payload: unknown): LocalRadarOperatorPush | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const value = payload as Record<string, unknown>;
  const operatorIssue = Number(value.operatorIssue);
  const branchCount = Number(value.branchCount);
  const eventId = text(value.eventId, 180);
  const stage = value.stage === "WHISPER" || value.stage === "ECHO" ? value.stage : null;
  const title = text(value.title, 180);
  const body = text(value.body, 600);
  const retailerId = text(value.retailerId, 120);
  const retailerName = text(value.retailerName, 140);
  const productTitle = text(value.productTitle, 240);
  const expectedFrom = nullableIso(value.expectedFrom);
  const expectedTo = nullableIso(value.expectedTo);
  const expectedLabel = value.expectedLabel === null || value.expectedLabel === undefined ? null : text(value.expectedLabel, 140);

  if (!Number.isInteger(operatorIssue) || operatorIssue <= 0) return null;
  if (!Number.isInteger(branchCount) || branchCount < 1 || branchCount > 100) return null;
  if (eventId !== `local-radar-operator:${operatorIssue}`) return null;
  if (!stage || !title || !body || !retailerId || !retailerName || !productTitle) return null;
  if (title !== "FateDrop · Local Radar · Incoming stock") return null;
  if (!body.endsWith("Check Local Radar to see if a participating store is near you.")) return null;
  if (expectedFrom === undefined || expectedTo === undefined) return null;
  if (expectedFrom && expectedTo && Date.parse(expectedTo) < Date.parse(expectedFrom)) return null;
  if (expectedLabel === null && !expectedFrom && !expectedTo) return null;

  return {
    eventId,
    stage,
    title,
    body,
    retailerId,
    retailerName,
    productTitle,
    expectedFrom,
    expectedTo,
    expectedLabel,
    branchCount,
    operatorIssue,
  };
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Local Radar operator delivery is not authorised." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  const payload = await request.json().catch(() => null);
  const event = parseOperatorPush(payload);
  if (!event) {
    return Response.json({ error: "Invalid Local Radar operator event." }, { status: 400, headers: { "cache-control": "no-store" } });
  }

  try {
    const result = await dispatchLocalRadarOperatorPush(event);
    if (!result.enabled) {
      return Response.json({ error: "Push dispatch is not enabled.", result }, { status: 503, headers: { "cache-control": "no-store" } });
    }
    return Response.json({ accepted: true, eventId: event.eventId, ...result }, { status: 200, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Local Radar operator alert could not be queued." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
