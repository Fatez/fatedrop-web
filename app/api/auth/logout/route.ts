import { assertSameOrigin, endSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await endSession();
    return Response.json({ signedOut: true });
  } catch (error) {
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Sign-out could not be completed." }, { status: 500 });
  }
}
