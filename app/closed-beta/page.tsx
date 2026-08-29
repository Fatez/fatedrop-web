import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AccountAuthForm } from "@/components/account-auth-form";
import { FateSignalField } from "@/components/fate-signal-field";
import { SiteShell } from "@/components/page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { betaAccessIsApproved } from "@/lib/beta-access";

export const metadata: Metadata = {
  title: "FateDrop Closed Beta Access",
  description: "Request access to the FateDrop closed beta for Web and the mobile App.",
  robots: { index: false, follow: false },
};

export default async function ClosedBetaPage() {
  const snapshot = await getCurrentSnapshot();
  if (snapshot) {
    if (betaAccessIsApproved(snapshot.betaAccess)) redirect("/account");
    if (snapshot.betaAccess.status === "pending") redirect("/beta-pending");
    redirect("/account");
  }

  const turnstileSiteKey = String(process.env.TURNSTILE_SITE_KEY || "").trim();

  return (
    <SiteShell>
      <section className="identity-gate section-shell">
        <FateSignalField variant="radar" className="identity-gate-field" />
        <div className="identity-gate-copy">
          <p className="eyebrow"><span />FATEDROP CLOSED BETA</p>
          <h1>Request closed beta access.</h1>
          <p>
            One request covers FateDrop Web and the mobile App. Fill in the form once; your secure sign-in is created automatically as part of the request and starts Pending until the FateDrop Owner approves it.
          </p>
          <div className="identity-gate-proof">
            <span>01 / Request access</span>
            <span>02 / Owner approval</span>
            <span>03 / Web + App unlock together</span>
          </div>
        </div>
        <div className="identity-gate-panel">
          <small>WEB + APP CLOSED BETA</small>
          <h2>Request access</h2>
          <p>There is no second signup. Once approved, this same sign-in gives you full closed-beta access across FateDrop Web and the App.</p>
          <Suspense fallback={<p>Preparing secure beta access…</p>}>
            <AccountAuthForm mode="register" turnstileSiteKey={turnstileSiteKey} />
          </Suspense>
        </div>
      </section>
    </SiteShell>
  );
}
