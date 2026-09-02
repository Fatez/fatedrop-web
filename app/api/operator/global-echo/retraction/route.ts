import { getSnapshotForRequest } from "@/lib/auth";
import { getOperatorCapabilities } from "@/lib/operator-capabilities";
import { retractGlobalEchoInCloud } from "@/lib/operator-global-echo-retraction-cloud";
import { cancelPendingGlobalEchoPushes } from "@/lib/operator-global-echo-retraction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanReason(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 300) : "";
}

function cleanEventId(value: unknown) {
  const eventId = typeof value === "string" ? value.trim() : "";
  return /^local-radar-operator:\d+$/.test(eventId) ? eventId : "";
}

export async function POST(request: Request) {
  const snapshot = await getSnapshotForRequest(request, { allowPending: true });
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401, headers: { "cache-control": "private, no-store" } });

  const capabilities = await getOperatorCapabilities(snapshot.account.id);
  if (!capabilities.canRetractGlobalEcho) {
    return Response.json({ error: "Global Echo retraction is not authorised." }, { status: 403, headers: { "cache-control": "private, no-store" } });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const eventId = cleanEventId(body?.eventId);
  const reason = cleanReason(body?.reason);
  if (!eventId) return Response.json({ error: "A valid manual Global Echo event is required." }, { status: 400, headers: { "cache-control": "private, no-store" } });
  if (reason.length < 3) return Response.json({ error: "Add a short reason for the retraction." }, { status: 400, headers: { "cache-control": "private, no-store" } });

  try {
    const cloud = await retractGlobalEchoInCloud({ eventId, reason, retractedBy: snapshot.account.id });
    const push = await cancelPendingGlobalEchoPushes(eventId, reason);
    return Response.json({ success: true, eventId, duplicate: cloud.duplicate, retraction: cloud.retraction, push }, { headers: { "cache-control": "private, no-store" } });
  } catch (cause) {
    const error = cause as Error & { status?: number; code?: string };
    const status = Number.isInteger(error.status) && Number(error.status) >= 400 && Number(error.status) < 600 ? Number(error.status) : 503;
    return Response.json({ error: error.message || "Global Echo could not be retracted.", code: error.code || "RETRACTION_FAILED" }, { status, headers: { "cache-control": "private, no-store" } });
  }
}
