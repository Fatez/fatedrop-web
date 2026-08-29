import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AccountAuthForm } from "@/components/account-auth-form";
import { FateSignalField } from "@/components/fate-signal-field";
import { SiteShell } from "@/components/page-shell";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Request FateDrop Closed Beta Access",
  description: "Create your FateDrop ID and request access to the FateDrop closed beta.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/account");
  const turnstileSiteKey = String(process.env.TURNSTILE_SITE_KEY || "").trim();

  return <SiteShell>
    <section className="identity-gate section-shell">
      <FateSignalField variant="signal" className="identity-gate-field" />
      <div className="identity-gate-copy">
        <p className="eyebrow"><span />FATEDROP CLOSED BETA</p>
        <h1>One request.<br /><em>One FateDrop ID.</em></h1>
        <p>Create your FateDrop ID here and we&apos;ll place that same account into the closed-beta approval queue. There is no separate App Beta signup and no second account to create.</p>
        <div className="identity-gate-proof">
          <span>01 / Create FateDrop ID</span>
          <span>02 / Pending owner approval</span>
          <span>03 / One approval unlocks Web + App</span>
        </div>
      </div>
      <div className="identity-gate-panel">
        <small>CLOSED BETA REQUEST</small>
        <h2>Request beta access</h2>
        <Suspense fallback={<p>Preparing beta request…</p>}>
          <AccountAuthForm mode="register" turnstileSiteKey={turnstileSiteKey} />
        </Suspense>
        <p className="identity-privacy-note">Your FateDrop ID is created only after validation and starts Pending. Passwords are one-way hashed and never stored as readable text.</p>
      </div>
    </section>
  </SiteShell>;
}
