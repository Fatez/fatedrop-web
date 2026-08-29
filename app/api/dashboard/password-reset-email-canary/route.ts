import { timingSafeEqual } from "node:crypto";

import {
  getPasswordResetEmailContext,
  PasswordResetEmailUnavailableError,
  sendPasswordResetTransportCanary,
} from "@/lib/password-reset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CANARY_RECIPIENT = "fatedropuk@gmail.com";

function matchesSecret(provided: string, expected: string | undefined) {
  if (!expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

function authorized(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return false;
  return matchesSecret(authorization.slice(7), process.env.FATEDROP_PUSH_CRON_SECRET);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Email canary is not authorised." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  try {
    const context = await getPasswordResetEmailContext();
    const result = await sendPasswordResetTransportCanary(context, CANARY_RECIPIENT);
    const messageId = result && typeof result === "object" && "messageId" in result
      ? String((result as { messageId?: unknown }).messageId || "")
      : "";
    return Response.json(
      { accepted: true, recipient: CANARY_RECIPIENT, messageId: messageId || null },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    const detail = error instanceof PasswordResetEmailUnavailableError
      ? "Cloudflare Email rejected or could not accept the password-reset transport canary."
      : "Password-reset transport canary failed.";
    return Response.json({ error: detail }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
