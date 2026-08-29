import { evaluateHostedFateFindNow } from "@/lib/hosted-fatefind-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCTION_PROBE_FATEFIND_ID = "production-probe-nonexistent";

export async function GET() {
  try {
    const outcome = await evaluateHostedFateFindNow(PRODUCTION_PROBE_FATEFIND_ID, 4_000);
    const evaluation = outcome?.evaluation;
    const healthy = outcome?.success === true
      && outcome.enabled === true
      && Number(evaluation?.finds || 0) === 0
      && Number(evaluation?.created || 0) === 0;

    if (!healthy) {
      return new Response(null, { status: 503, headers: { "cache-control": "no-store" } });
    }

    return new Response(null, { status: 204, headers: { "cache-control": "public, max-age=30" } });
  } catch {
    return new Response(null, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
