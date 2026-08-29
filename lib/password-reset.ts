import { createHash, randomBytes } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { fateDropPostgres } from "@/lib/postgres";

const RESET_TTL_SECONDS = 30 * 60;
const RESET_FROM = "hello@fatedrop.co.uk";

type EmailSendResult = { messageId?: string } | unknown;
type EmailBinding = {
  send(message: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
  }): Promise<EmailSendResult>;
};

type PasswordResetEmailContext = {
  email: EmailBinding;
  waitUntil: (promise: Promise<unknown>) => void;
};

export class PasswordResetEmailUnavailableError extends Error {
  constructor(message = "Password reset email service is unavailable.") {
    super(message);
    this.name = "PasswordResetEmailUnavailableError";
  }
}

export async function getPasswordResetEmailContext(): Promise<PasswordResetEmailContext> {
  let context;
  try {
    context = await getCloudflareContext({ async: true });
  } catch {
    throw new PasswordResetEmailUnavailableError();
  }

  const env = context.env as unknown as { EMAIL?: EmailBinding };
  const email = env.EMAIL;
  if (!email || typeof email.send !== "function") throw new PasswordResetEmailUnavailableError();
  return {
    email,
    waitUntil: (promise) => context.ctx.waitUntil(promise),
  };
}

export async function issuePasswordResetToken(userId: string) {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + RESET_TTL_SECONDS;
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(rawToken);
  const sql = await fateDropPostgres();

  await sql`
    WITH retired AS (
      UPDATE fatedrop_password_reset_tokens
      SET consumed_at = ${now}
      WHERE user_id = ${userId}
        AND consumed_at IS NULL
      RETURNING token_hash
    )
    INSERT INTO fatedrop_password_reset_tokens (token_hash, user_id, created_at, expires_at, consumed_at)
    VALUES (${tokenHash}, ${userId}, ${now}, ${expiresAt}, NULL)
  `;

  return { rawToken, expiresAt };
}

export async function completePasswordReset(rawToken: string, passwordHash: string) {
  const tokenHash = hashResetToken(rawToken);
  const sql = await fateDropPostgres();
  const rows = await sql`
    SELECT user_id
    FROM fatedrop_consume_password_reset(${tokenHash}, ${passwordHash})
  `;
  return rows[0]?.user_id ? String(rows[0].user_id) : null;
}

export function queuePasswordResetEmail(
  emailContext: PasswordResetEmailContext,
  recipient: string,
  rawToken: string,
) {
  const resetUrl = passwordResetUrl(rawToken);
  const from = String(process.env.FATEDROP_PASSWORD_RESET_FROM || RESET_FROM).trim() || RESET_FROM;
  const safeUrl = escapeHtml(resetUrl);
  const sendPromise = emailContext.email.send({
    from,
    to: recipient,
    replyTo: RESET_FROM,
    subject: "Reset your FateDrop password",
    text: [
      "A password reset was requested for your FateDrop ID.",
      "",
      `Reset your password: ${resetUrl}`,
      "",
      "This link expires in 30 minutes and can only be used once.",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `<!doctype html><html><body style="margin:0;background:#080b10;color:#e8dfd8;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto;padding:40px 24px"><p style="font-size:12px;letter-spacing:.14em;color:#d2b66f">FATEDROP</p><h1 style="font-size:30px;font-weight:500">Reset your password</h1><p style="line-height:1.7;color:#a9a0a5">A password reset was requested for your FateDrop ID.</p><p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;padding:13px 18px;border-radius:8px;background:#7c6eff;color:#fff;text-decoration:none;font-weight:700">Reset password</a></p><p style="font-size:13px;line-height:1.7;color:#898187">This link expires in 30 minutes and can only be used once. If you did not request this, you can ignore this email.</p></div></body></html>`,
  }).then(() => undefined).catch(() => undefined);

  emailContext.waitUntil(sendPromise);
}

export function validResetTokenShape(value: unknown) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{40,64}$/.test(value);
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function passwordResetUrl(rawToken: string) {
  const configured = String(process.env.NEXT_PUBLIC_SITE_URL || "https://fatedrop.co.uk").trim();
  let base: URL;
  try {
    base = new URL(configured);
  } catch {
    base = new URL("https://fatedrop.co.uk");
  }
  if (process.env.NODE_ENV === "production" && base.hostname !== "fatedrop.co.uk") {
    base = new URL("https://fatedrop.co.uk");
  }
  const url = new URL("/account/reset-password", base);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
