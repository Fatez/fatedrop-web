import { getTruePriceRrpLookup } from "@/lib/rrp-storage";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rrpLookup = await getTruePriceRrpLookup();
    return Response.json(
      { rrpLookup, count: Object.keys(rrpLookup).length },
      { headers: { "Cache-Control": "private, max-age=60" } },
    );
  } catch {
    return Response.json({ rrpLookup: {}, count: 0 }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
