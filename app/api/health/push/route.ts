import { readPushProductionHealth } from "@/lib/push-dispatch-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const detailed = new URL(request.url).searchParams.get("detail") === "1";

  try {
    const health = await readPushProductionHealth();
    if (detailed) {
      return Response.json(health, {
        status: health.ok ? 200 : 503,
        headers: { "cache-control": "no-store" },
      });
    }
    if (!health.ok) {
      return new Response(null, { status: 503, headers: { "cache-control": "no-store" } });
    }
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  } catch {
    if (detailed) {
      return Response.json(
        { ok: false, status: "error", error: "push_health_unavailable" },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    return new Response(null, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
