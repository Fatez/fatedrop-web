import { assertSameOrigin, getCurrentSnapshot } from "@/lib/auth";
import { isOwnerUser, listBetaRequestsForOwner, setBetaAccessAsOwner } from "@/lib/owner-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.json({ error: "Sign in required." }, { status: 401, headers: noStore() });
  if (!await isOwnerUser(snapshot.account.id)) return Response.json({ error: "Not found." }, { status: 404, headers: noStore() });

  try {
    const requests = await listBetaRequestsForOwner(snapshot.account.id);
    return Response.json({ success: true, requests }, { headers: noStore() });
  } catch {
    return Response.json({ error: "Beta requests are temporarily unavailable." }, { status: 503, headers: noStore() });
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return Response.json({ error: "Request rejected." }, { status: 403, headers: noStore() });
  }

  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return Response.json({ error: "Sign in required." }, { status: 401, headers: noStore() });
  if (!await isOwnerUser(snapshot.account.id)) return Response.json({ error: "Not found." }, { status: 404, headers: noStore() });

  let payload: { userId?: unknown; action?: unknown };
  try {
    payload = await request.json() as { userId?: unknown; action?: unknown };
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400, headers: noStore() });
  }

  const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
  const action = payload.action === "approve" ? "approve" : payload.action === "revoke" ? "revoke" : null;
  if (!userId || !action) return Response.json({ error: "A user and action are required." }, { status: 400, headers: noStore() });

  try {
    const betaAccess = await setBetaAccessAsOwner(snapshot.account.id, userId, action === "approve" ? "approved" : "revoked");
    return Response.json({ success: true, betaAccess }, { headers: noStore() });
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_SELF_CHANGE_BLOCKED") {
      return Response.json({ error: "Owner access cannot be changed from the beta console." }, { status: 409, headers: noStore() });
    }
    return Response.json({ error: "Beta access could not be updated." }, { status: 500, headers: noStore() });
  }
}

function noStore() {
  return { "cache-control": "private, no-store, max-age=0" };
}
