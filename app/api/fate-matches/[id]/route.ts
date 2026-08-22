import { assertSameOrigin, getCurrentSnapshot } from "@/lib/auth";
import { setFateMatchEnabled } from "@/lib/fate-match-storage";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const snapshot = await getCurrentSnapshot();
    if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401 });
    const { id } = await context.params;
    const payload = await request.json().catch(() => null) as { enabled?: unknown } | null;
    if (!payload || typeof payload.enabled !== "boolean") return Response.json({ error: "enabled must be boolean." }, { status: 400 });
    const match = await setFateMatchEnabled(snapshot.account.id, id, payload.enabled);
    return match ? Response.json({ match }) : Response.json({ error: "FateMatch not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "FateMatch storage is not ready." }, { status: 503 });
  }
}
