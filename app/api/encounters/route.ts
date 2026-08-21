import { getSignalEngineUrl } from "@/lib/encounters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowed = new Set(["from", "to", "tcg", "limit"]);

export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const params = new URLSearchParams();
  for (const [key, value] of incoming.searchParams.entries()) {
    if (allowed.has(key) && value.trim()) params.append(key, value.trim());
  }
  if (!params.has("from")) params.set("from", new Date().toISOString());
  if (!params.has("limit")) params.set("limit", "1000");

  try {
    const response = await fetch(`${getSignalEngineUrl()}/api/encounters?${params.toString()}`, { cache: "no-store" });
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json; charset=utf-8",
        "cache-control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return Response.json({ success: false, events: [], error: "Fate Encounters feed unavailable" }, { status: 503 });
  }
}
