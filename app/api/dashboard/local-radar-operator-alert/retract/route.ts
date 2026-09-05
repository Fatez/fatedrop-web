import { timingSafeEqual } from "node:crypto";

import { dispatchCanonicalPushAlerts } from "@/lib/canonical-push";
import { recordOperatorEchoRetraction, type OperatorEchoRetraction } from "@/lib/operator-echo-retraction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) || null : null;
}

function authorized(request: Request) {
  const secret = process.env.FATEDROP_METRICS_INGEST_SECRET;
  const authorization = request.headers.get("authorization") || "";
  if (!secret || !authorization.startsWith("Bearer ")) return false;
  const provided = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function parseOperatorEchoRetraction(payload: unknown): OperatorEchoRetraction | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const value = payload as Record<string, unknown>;
  const targetOperatorIssue = Number(value.targetOperatorIssue);
  const retractionIssue = Number(value.retractionIssue);
  const eventId = text(value.eventId, 180);
  const targetEventId = text(value.targetEventId, 180);
  const reason = typeof value.reason === "string" ? value.reason.trim() : "";
  const operatorLogin = text(value.operatorLogin, 80);
  const requestedAt = text(value.requestedAt, 80);

  if (Number(value.schemaVersion) !== 2 || value.operation !== "retract" || value.operatorConfirmation !== "RETRACT_GLOBAL_ECHO") return null;
  if (!Number.isInteger(targetOperatorIssue) || targetOperatorIssue <= 0) return null;
  if (!Number.isInteger(retractionIssue) || retractionIssue <= 0) return null;
  if (eventId !== `local-radar-operator-retraction:${retractionIssue}`) return null;
  if (targetEventId !== `local-radar-operator:${targetOperatorIssue}`) return null;
  if (reason.length < 10 || reason.length > 500) return null;
  if (operatorLogin !== "Fatez") return null;
  if (!requestedAt || !Number.isFinite(Date.parse(requestedAt))) return null;

  return {
    eventId,
    targetEventId,
    targetOperatorIssue,
    retractionIssue,
    reason,
    operatorLogin,
    requestedAt: new Date(requestedAt).toISOString(),
  };
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Operator Echo retraction is not authorised." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  const command = parseOperatorEchoRetraction(await request.json().catch(() => null));
  if (!command) {
    return Response.json({ error: "Invalid operator Echo retraction." }, { status: 400, headers: { "cache-control": "no-store" } });
  }

  try {
    const retraction = await recordOperatorEchoRetraction(command);
    const dispatch = await dispatchCanonicalPushAlerts();
    return Response.json({
      accepted: true,
      immutableOriginal: true,
      stockTruthChanged: false,
      ...retraction,
      dispatch,
    }, { status: 200, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Operator Echo retraction could not be applied." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
