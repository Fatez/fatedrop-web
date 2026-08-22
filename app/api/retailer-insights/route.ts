import { timingSafeEqual } from "node:crypto";
import { listRetailerHandoffInsights } from "@/lib/retailer-insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.FATEDROP_RETAILER_INSIGHTS_SECRET;
  const authorization = request.headers.get("authorization") || "";
  if (!secret || !authorization.startsWith("Bearer ")) return false;
  const provided = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

function boundedInteger(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, min), max) : fallback;
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Retailer insights are not authorised." }, { status: 401, headers: { "Cache-Control": "private, no-store" } });

  try {
    const url = new URL(request.url);
    const days = boundedInteger(url.searchParams.get("days"), 30, 1, 90);
    const limit = boundedInteger(url.searchParams.get("limit"), 50, 1, 100);
    const insights = await listRetailerHandoffInsights({ days, limit });
    return Response.json({
      generatedAt: Math.floor(Date.now() / 1000),
      windowDays: days,
      definition: "A handoff means a collector opened a retailer destination from FateDrop. It does not mean a purchase was completed.",
      insights,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Retailer handoff insights are temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
