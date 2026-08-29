import { randomUUID } from "node:crypto";
import { getSnapshotForRequest } from "@/lib/auth";
import { betaAccessDeniedResponse, betaAccessIsApproved } from "@/lib/beta-access";
import { fateDropPostgres } from "@/lib/postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validExpoToken(value: unknown) {
  return typeof value === "string" && /^(?:ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9+\/_=-]+\]$/.test(value.trim()) ? value.trim() : null;
}

export async function POST(request: Request) {
  const snapshot = await getSnapshotForRequest(request, { allowPending: true });
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401, headers: { "cache-control": "no-store" } });
  if (!betaAccessIsApproved(snapshot.betaAccess)) return betaAccessDeniedResponse(snapshot.betaAccess);
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  const token = validExpoToken(payload?.token);
  if (!token) return Response.json({ error: "A valid Expo push token is required." }, { status: 400 });
  const platform = typeof payload?.platform === "string" ? payload.platform.trim().slice(0, 20) : null;
  const deviceLabel = typeof payload?.deviceLabel === "string" ? payload.deviceLabel.trim().slice(0, 120) || null : null;
  const now = Math.floor(Date.now() / 1000);
  try {
    const sql = await fateDropPostgres();
    const rows = await sql`
      INSERT INTO fatedrop_push_endpoints (id,user_id,expo_push_token,platform,device_label,enabled,created_at,updated_at)
      VALUES (${randomUUID()},${snapshot.account.id},${token},${platform},${deviceLabel},true,${now},${now})
      ON CONFLICT (expo_push_token) DO UPDATE SET
        platform=EXCLUDED.platform,
        device_label=EXCLUDED.device_label,
        enabled=true,
        updated_at=EXCLUDED.updated_at,
        failure_reason=NULL
      WHERE fatedrop_push_endpoints.user_id=EXCLUDED.user_id
      RETURNING user_id
    `;
    if (!rows[0]) return Response.json({ error: "This push endpoint is already registered to another FateDrop ID." }, { status: 409, headers: { "cache-control": "no-store" } });
    return Response.json({ registered: true }, { status: 201, headers: { "cache-control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Push endpoint storage is not ready. Apply the hosted notification migration first." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const snapshot = await getSnapshotForRequest(request, { allowPending: true });
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
  if (!betaAccessIsApproved(snapshot.betaAccess)) return betaAccessDeniedResponse(snapshot.betaAccess);
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  const token = validExpoToken(payload?.token);
  if (!token) return Response.json({ error: "A valid Expo push token is required." }, { status: 400 });
  try {
    const sql = await fateDropPostgres();
    const now = Math.floor(Date.now() / 1000);
    await sql`UPDATE fatedrop_push_endpoints SET enabled=false,updated_at=${now} WHERE user_id=${snapshot.account.id} AND expo_push_token=${token}`;
    return Response.json({ registered: false }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Push endpoint could not be updated." }, { status: 503 });
  }
}
