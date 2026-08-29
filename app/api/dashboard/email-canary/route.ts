import { timingSafeEqual } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CANARY_RECIPIENT = "fatedropuk@gmail.com";
const CANARY_FROM = "hello@fatedrop.co.uk";

type EmailBinding = {
  send(message: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
  }): Promise<{ messageId?: string } | unknown>;
};

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

function safeReason(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "unknown");
  return message.replace(/[\r\n]+/g, " ").slice(0, 300);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json(
      { error: "Email canary is not authorised." },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const context = await getCloudflareContext({ async: true });
    const email = (context.env as unknown as { EMAIL?: EmailBinding }).EMAIL;
    if (!email || typeof email.send !== "function") {
      return Response.json(
        { accepted: false, error: "Cloudflare Email binding is unavailable." },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }

    const result = await email.send({
      from: CANARY_FROM,
      to: CANARY_RECIPIENT,
      replyTo: CANARY_FROM,
      subject: "FateDrop email delivery test",
      text: "FateDrop production email delivery is working. No action is required.",
      html: "<p>FateDrop production email delivery is working. No action is required.</p>",
    });

    const messageId = typeof result === "object" && result !== null && "messageId" in result
      ? String((result as { messageId?: string }).messageId || "")
      : "";

    return Response.json(
      { accepted: true, recipient: CANARY_RECIPIENT, messageId: messageId || null },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { accepted: false, error: "Cloudflare Email Service rejected the production canary.", reason: safeReason(error) },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
