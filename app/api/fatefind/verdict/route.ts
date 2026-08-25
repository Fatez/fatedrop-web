import { NextResponse } from "next/server";
import { requestFateVerdict } from "@/lib/fatefind-verdict-client";

// Read-only market intelligence endpoint. It does not mutate account/session
// state, so both the website and native FateDrop clients may call it.
export async function POST(request: Request) {
  let body: { query?: unknown; leftId?: unknown; rightId?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  const leftId = typeof body.leftId === "string" ? body.leftId : undefined;
  const rightId = typeof body.rightId === "string" ? body.rightId : undefined;
  if (query.length < 2) return NextResponse.json({ success: false, error: "Query must be at least two characters" }, { status: 400 });

  const result = await requestFateVerdict(query, { leftId, rightId });
  if (!result) return NextResponse.json({ success: false, error: "FateDrop Cloud verdict unavailable" }, { status: 502 });
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
