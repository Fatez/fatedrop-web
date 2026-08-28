import { readPushProductionHealth } from "@/lib/push-dispatch-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await readPushProductionHealth();
    if (!health.ok) {
      return new Response(null, { status: 503, headers: { "cache-control": "no-store" } });
    }
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  } catch {
    return new Response(null, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
