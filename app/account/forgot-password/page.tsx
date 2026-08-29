import type { Metadata } from "next";
import { FateSignalField } from "@/components/fate-signal-field";
import { PasswordResetRequestForm } from "@/components/password-reset-request-form";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Forgot password | FateDrop",
  description: "Request a secure FateDrop password reset link.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  const turnstileSiteKey = String(process.env.TURNSTILE_SITE_KEY || "").trim();
  return <SiteShell>
    <section className="identity-gate section-shell">
      <FateSignalField variant="signal" className="identity-gate-field" />
      <div className="identity-gate-copy">
        <p className="eyebrow"><span />FATEDROP ID RECOVERY</p>
        <h1>Forgot your password?</h1>
        <p>Enter the email attached to your FateDrop ID. If that account exists, we&apos;ll send a one-use reset link to that exact address.</p>
        <div className="identity-gate-proof">
          <span>01 / One-use reset link</span>
          <span>02 / Expires after 30 minutes</span>
          <span>03 / Existing sessions signed out</span>
        </div>
      </div>
      <div className="identity-gate-panel">
        <small>SECURE ACCOUNT RECOVERY</small>
        <h2>Reset password</h2>
        <PasswordResetRequestForm turnstileSiteKey={turnstileSiteKey} />
      </div>
    </section>
  </SiteShell>;
}
