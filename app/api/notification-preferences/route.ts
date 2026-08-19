import { assertSameOrigin, getSnapshotForRequest } from "@/lib/auth";
import { DEFAULT_NOTIFICATION_PREFERENCES, getNotificationPreferences, saveNotificationPreferences, type NotificationPreferences } from "@/lib/notification-preferences";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function boolean(value: unknown, fallback: boolean) { return typeof value === "boolean" ? value : fallback; }
function time(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  return value;
}

export async function GET(request: Request) {
  const snapshot = await getSnapshotForRequest(request);
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
  try { return Response.json({ preferences: await getNotificationPreferences(snapshot.account.id) }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return Response.json({ preferences: DEFAULT_NOTIFICATION_PREFERENCES, pendingMigration: true }, { headers: { "Cache-Control": "private, no-store" } }); }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const snapshot = await getSnapshotForRequest(request);
    if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
    const current = await getNotificationPreferences(snapshot.account.id).catch(() => DEFAULT_NOTIFICATION_PREFERENCES);
    const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!payload) return Response.json({ error: "Invalid preference payload." }, { status: 400 });
    const timezone = typeof payload.timezone === "string" && payload.timezone.trim() ? payload.timezone.trim().slice(0, 80) : current.timezone;
    const next: NotificationPreferences = {
      echo: boolean(payload.echo, current.echo), manifested: boolean(payload.manifested, current.manifested), vanished: boolean(payload.vanished, current.vanished),
      priceChange: boolean(payload.priceChange, current.priceChange), fateMatch: boolean(payload.fateMatch, current.fateMatch),
      web: boolean(payload.web, current.web), push: boolean(payload.push, current.push), discord: boolean(payload.discord, current.discord),
      quietHours: boolean(payload.quietHours, current.quietHours), quietStart: time(payload.quietStart), quietEnd: time(payload.quietEnd), timezone,
      updatedAt: Math.floor(Date.now() / 1000),
    };
    if (next.quietHours && (!next.quietStart || !next.quietEnd)) return Response.json({ error: "Quiet hours require a valid start and end time." }, { status: 400 });
    const saved = await saveNotificationPreferences(snapshot.account.id, next);
    return Response.json({ preferences: saved }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Notification preference storage is not ready. Apply the collector preference migration first." }, { status: 503 });
  }
}
