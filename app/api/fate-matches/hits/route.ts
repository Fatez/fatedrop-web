import { getSnapshotForRequest } from "@/lib/auth";
import { listHostedFateMatches } from "@/lib/hosted-fate-match-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const snapshot = await getSnapshotForRequest(request);
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401, headers: { "cache-control": "no-store" } });
  try {
    return Response.json({ fateMatches: await listHostedFateMatches(snapshot.account.id) }, { headers: { "cache-control": "private, no-store, max-age=0" } });
  } catch {
    return Response.json({ fateMatches: [], pendingMigration: true }, { headers: { "cache-control": "private, no-store, max-age=0" } });
  }
}
