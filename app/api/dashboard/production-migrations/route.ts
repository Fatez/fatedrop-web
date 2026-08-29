import { timingSafeEqual } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { ensureCanonicalOwnerBootstrapAccount } from "@/lib/owner-bootstrap";
import { runProductionMigrations } from "@/lib/production-migrations";
import { fateDropPostgres } from "@/lib/postgres";
import { ensureTemporaryOwnerBootstrap } from "@/lib/temporary-owner-bootstrap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OWNER_BOOTSTRAP_ERROR = "Owner bootstrap requires exactly one canonical hello@fatedrop.co.uk FateDrop account.";
const EMAIL_CANARY_RECIPIENT = "fatedropuk@gmail.com";
const EMAIL_CANARY_FROM = "hello@fatedrop.co.uk";

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
  const provided = authorization.slice(7);
  return matchesSecret(provided, process.env.FATEDROP_PUSH_CRON_SECRET);
}

async function ownerBootstrapDiagnostic(detail: string) {
  if (detail !== OWNER_BOOTSTRAP_ERROR) return detail;
  try {
    const sql = await fateDropPostgres();
    const rows = await sql`SELECT COUNT(*)::int AS count FROM fatedrop_users WHERE lower(email)='hello@fatedrop.co.uk'`;
    const count = Number(rows[0]?.count ?? -1);
    return `${detail} Match count: ${Number.isFinite(count) ? count : "unknown"}.`;
  } catch {
    return `${detail} Match count unavailable.`;
  }
}

async function verifyProductionEmailDelivery() {
  const context = await getCloudflareContext({ async: true });
  const email = (context.env as unknown as { EMAIL?: EmailBinding }).EMAIL;
  if (!email || typeof email.send !== "function") {
    throw new Error("Cloudflare Email binding is unavailable in production.");
  }

  const result = await email.send({
    from: EMAIL_CANARY_FROM,
    to: EMAIL_CANARY_RECIPIENT,
    replyTo: EMAIL_CANARY_FROM,
    subject: "FateDrop email delivery test",
    text: "FateDrop production email delivery is working. No action is required.",
    html: "<p>FateDrop production email delivery is working. No action is required.</p>",
  });

  const messageId = typeof result === "object" && result !== null && "messageId" in result
    ? String((result as { messageId?: string }).messageId || "")
    : "";

  return { accepted: true, recipient: EMAIL_CANARY_RECIPIENT, messageId: messageId || null };
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Production migration is not authorised." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  try {
    const ownerBootstrap = await ensureCanonicalOwnerBootstrapAccount();
    const result = await runProductionMigrations();
    const temporaryOwnerBootstrap = await ensureTemporaryOwnerBootstrap();
    const emailCanary = await verifyProductionEmailDelivery();
    return Response.json({ accepted: true, ownerBootstrap, temporaryOwnerBootstrap, emailCanary, ...result }, { status: 200, headers: { "cache-control": "no-store" } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Production migration failed.";
    const diagnostic = await ownerBootstrapDiagnostic(detail);
    return Response.json({ error: diagnostic.slice(0, 300) }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
