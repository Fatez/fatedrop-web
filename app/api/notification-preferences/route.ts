import { assertSameOrigin, getSnapshotForRequest } from "@/lib/auth";
import { DEFAULT_NOTIFICATION_PREFERENCES, getNotificationPreferences, isValidIanaTimezone, normalizeLifecycleMarkets, normalizeSelectedSetKeys, saveNotificationPreferences, type NotificationPreferences } from "@/lib/notification-preferences";

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
    if (!isValidIanaTimezone(timezone)) return Response.json({ error: "Choose a valid timezone." }, { status: 400 });
    if (payload.selectedSetKeys !== undefined && !Array.isArray(payload.selectedSetKeys)) {
      return Response.json({ error: "Selected sets must be an array." }, { status: 400 });
    }
    if (payload.lifecycleMarkets !== undefined && (!payload.lifecycleMarkets || typeof payload.lifecycleMarkets !== "object" || Array.isArray(payload.lifecycleMarkets))) {
      return Response.json({ error: "Lifecycle market preferences must be an object." }, { status: 400 });
    }
    const selectedSetKeys = payload.selectedSetKeys === undefined ? current.selectedSetKeys : normalizeSelectedSetKeys(payload.selectedSetKeys);
    if (Array.isArray(payload.selectedSetKeys) && selectedSetKeys.length !== new Set(payload.selectedSetKeys).size) {
      return Response.json({ error: "One or more selected set keys are invalid." }, { status: 400 });
    }
    const lifecycleMarkets = payload.lifecycleMarkets === undefined
      ? current.lifecycleMarkets
      : normalizeLifecycleMarkets(payload.lifecycleMarkets, current.lifecycleMarkets);
    const next: NotificationPreferences = {
      whisper: boolean(payload.whisper, current.whisper), echo: boolean(payload.echo, current.echo), manifested: boolean(payload.manifested, current.manifested), vanished: boolean(payload.vanished, current.vanished),
      priceChange: boolean(payload.priceChange, current.priceChange), fateMatch: boolean(payload.fateMatch, current.fateMatch),
      sealedTcg: boolean(payload.sealedTcg, current.sealedTcg), singleCards: boolean(payload.singleCards, current.singleCards),
      accessories: boolean(payload.accessories, current.accessories), merchandise: boolean(payload.merchandise, current.merchandise),
      unknownProducts: boolean(payload.unknownProducts, current.unknownProducts),
      english: boolean(payload.english, current.english), japanese: boolean(payload.japanese, current.japanese), korean: boolean(payload.korean, current.korean),
      simplifiedChinese: boolean(payload.simplifiedChinese, current.simplifiedChinese), traditionalChinese: boolean(payload.traditionalChinese, current.traditionalChinese),
      otherLanguages: boolean(payload.otherLanguages, current.otherLanguages), unknownLanguage: boolean(payload.unknownLanguage, current.unknownLanguage),
      lifecycleMarkets,
      allSets: boolean(payload.allSets, current.allSets), selectedSetKeys, unknownSets: boolean(payload.unknownSets, current.unknownSets),
      web: boolean(payload.web, current.web), push: boolean(payload.push, current.push), discord: boolean(payload.discord, current.discord),
      quietHours: boolean(payload.quietHours, current.quietHours), quietStart: time(payload.quietStart), quietEnd: time(payload.quietEnd), timezone,
      updatedAt: Math.floor(Date.now() / 1000),
    };
    if (next.quietHours && (!next.quietStart || !next.quietEnd)) return Response.json({ error: "Quiet hours require a valid start and end time." }, { status: 400 });
    if (!next.allSets && !next.selectedSetKeys.length && !next.unknownSets) return Response.json({ error: "Choose at least one set or keep unknown sets enabled." }, { status: 400 });
    const saved = await saveNotificationPreferences(snapshot.account.id, next);
    return Response.json({ preferences: saved }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Notification preference storage is not ready. Apply the collector preference migration first." }, { status: 503 });
  }
}
