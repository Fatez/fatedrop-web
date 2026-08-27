import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth";
import { searchSignalFateVerdict } from "@/lib/fatefind-verdict";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ success: false, error: "CROSS_SITE_REQUEST" }, { status: 403 });
  }

  let body: { query?: unknown; leftId?: unknown; rightId?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ success: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim().slice(0, 300) : "";
  const leftId = typeof body.leftId === "string" ? body.leftId.trim().slice(0, 300) : "";
  const rightId = typeof body.rightId === "string" ? body.rightId.trim().slice(0, 300) : "";
  if (query.length < 2 || !leftId || !rightId) {
    return NextResponse.json({ success: false, error: "INVALID_FATEFIND_SELECTION" }, { status: 400 });
  }

  const result = await searchSignalFateVerdict(query, { leftId, rightId });
  if (!result) {
    return NextResponse.json({ success: false, error: "FATEDROP_CLOUD_UNAVAILABLE" }, { status: 502 });
  }

  return NextResponse.json({
    success: true,
    source: result.source,
    rulesVersion: result.rulesVersion,
    runtime: result.runtime ?? null,
    pairVerdict: result.pairVerdict,
  });
}
