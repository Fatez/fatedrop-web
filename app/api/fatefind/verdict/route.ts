import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth";
import { searchSignalFateVerdict } from "@/lib/fatefind-verdict";
import { isTcgCode, TCG_REGISTRY } from "@/lib/tcg-registry";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ success: false, error: "CROSS_SITE_REQUEST" }, { status: 403 });
  }

  let body: { query?: unknown; tcgCode?: unknown; leftId?: unknown; rightId?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ success: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim().slice(0, 300) : "";
  const tcgCode = body.tcgCode === undefined ? "pokemon" : body.tcgCode;
  const leftId = typeof body.leftId === "string" ? body.leftId.trim().slice(0, 300) : "";
  const rightId = typeof body.rightId === "string" ? body.rightId.trim().slice(0, 300) : "";
  if (query.length < 2 || !isTcgCode(tcgCode) || Boolean(leftId) !== Boolean(rightId)) {
    return NextResponse.json({ success: false, error: "INVALID_FATEFIND_SELECTION" }, { status: 400 });
  }
  if (!TCG_REGISTRY.find((entry)=>entry.code===tcgCode)?.live) return NextResponse.json({ success:false, error:"TCG_BROWSE_INACTIVE" }, { status:409 });

  const result = await searchSignalFateVerdict(query, { tcgCode, ...(leftId && rightId ? { leftId, rightId } : {}) });
  if (!result) {
    return NextResponse.json({ success: false, error: "FATEDROP_CLOUD_UNAVAILABLE" }, { status: 502 });
  }

  return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
