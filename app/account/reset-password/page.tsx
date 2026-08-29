import type { Metadata } from "next";
import Link from "next/link";
import { FateSignalField } from "@/components/fate-signal-field";
import { PasswordResetForm } from "@/components/password-reset-form";
import { SiteShell } from "@/components/page-shell";
import { validResetTokenShape } from "@/lib/password-reset";

export const metadata: Metadata = {
  title: "Reset password | FateDrop",
  description: "Set a new password for your FateDrop ID.",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token.trim() : "";
  const turnstileSiteKey = String(process.env.TURNSTILE_SITE_KEY || "").trim();
  const validToken = validResetTokenShape(token);

  return <SiteShell>
    <section className="identity-gate section-shell">
      <FateSignalField variant="radar" className="identity-gate-field" />
      <div className="identity-gate-copy">
        <p className="eyebrow"><span />FATEDROP ID RECOVERY</p>
        <h1>Set a new password.</h1>
        <p>Your reset link is single-use. Once the password changes, every existing FateDrop Web and mobile session for this ID is signed out.</p>
        <div className="identity-gate-proof">
          <span>01 / New password</span>
          <span>02 / Reset link consumed</span>
          <span>03 / Old sessions invalidated</span>
        </div>
      </div>
      <div className="identity-gate-panel">
        <small>SECURE PASSWORD RESET</small>
        <h2>{validToken ? "Choose a new password" : "Reset link unavailable"}</h2>
        {validToken
          ? <PasswordResetForm token={token} turnstileSiteKey={turnstileSiteKey} />
          : <div className="identity-reset-invalid"><p>This password reset link is invalid or incomplete. Request a new one from the sign-in page.</p><Link className="button button-secondary" href="/account/forgot-password">Request a new reset link</Link></div>}
      </div>
    </section>
    <style>{`.identity-reset-invalid{display:grid;gap:16px}.identity-reset-invalid p{margin:0;color:#938b90;font-size:12px;line-height:1.7}`}</style>
  </SiteShell>;
}
