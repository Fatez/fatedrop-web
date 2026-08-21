import { loadEncounterVendors } from "@/lib/encounters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id?.trim()) return Response.json({ vendors: [], error: "Encounter id required" }, { status: 400 });
  try {
    const vendors = await loadEncounterVendors(id);
    return Response.json({ success: true, count: vendors.length, vendors }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return Response.json({ success: false, vendors: [], error: "Encounter vendors unavailable" }, { status: 503 });
  }
}
