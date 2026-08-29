import type { Metadata } from "next";
import Image from "next/image";
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
      <main className="closed-beta-page section-shell">
        <section className="closed-beta-art" aria-label="FateDrop closed beta community">
          <Image
            src="/assets/closed-beta/fatedrop-closed-beta-community.webp"
            alt="FateDrop collectors and Koru & Friends gathered around trading cards in the FateDrop world."
            width={1672}
            height={941}
            priority
            sizes="(max-width: 760px) 100vw, 1200px"
          />
          <div className="closed-beta-art-shade" aria-hidden="true" />
          <div className="closed-beta-art-copy">
            <p className="eyebrow"><span />FATEDROP CLOSED BETA</p>
            <h1>Search for Fate.<br/><em>Catch the Drop.</em></h1>
            <p>Join the first closed group testing FateDrop across Web and mobile before subscriptions go live.</p>
          </div>
        </section>

        <section className="identity-gate closed-beta-gate">
          <FateSignalField variant="radar" className="identity-gate-field" />
          <div className="identity-gate-copy">
            <p className="eyebrow"><span />ONE FATEDROP ID</p>
            <h2>Request closed beta access.</h2>
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
      </main>

      <style>{`
        .closed-beta-page{margin-top:82px!important;margin-bottom:80px!important}.closed-beta-art{position:relative;min-height:clamp(390px,55vw,690px);overflow:hidden;border:1px solid rgba(221,203,188,.1);border-radius:24px;background:#090c11;box-shadow:0 32px 90px rgba(0,0,0,.32)}.closed-beta-art>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.closed-beta-art-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,7,10,.82) 0%,rgba(5,7,10,.28) 50%,rgba(5,7,10,.12) 100%),linear-gradient(0deg,rgba(5,7,10,.68) 0%,transparent 46%)}.closed-beta-art-copy{position:absolute;z-index:2;left:clamp(22px,5vw,68px);bottom:clamp(26px,6vw,72px);max-width:690px}.closed-beta-art-copy h1{margin:12px 0 18px;color:#f4ece6;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3.2rem,6.4vw,7.2rem);font-weight:500;line-height:.88;letter-spacing:-.055em;text-wrap:balance}.closed-beta-art-copy h1 em{color:#d2b66f;font-style:normal}.closed-beta-art-copy>p:last-child{max-width:650px;margin:0;color:#d2c9c4;font-size:clamp(13px,1.2vw,16px);line-height:1.65}.closed-beta-gate{position:relative;margin-top:14px!important;padding:clamp(24px,4vw,48px)!important;border:1px solid rgba(221,203,188,.085);border-radius:20px;background:linear-gradient(145deg,#0f1318,#090c10 74%);overflow:hidden}.closed-beta-gate .identity-gate-copy h2{max-width:760px;margin:10px 0 20px;color:#eee4dd;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.4rem,4.8vw,5rem);font-weight:500;line-height:.94;letter-spacing:-.045em}@media(max-width:760px){.closed-beta-page{width:calc(100% - 18px)!important;margin-top:76px!important}.closed-beta-art{min-height:500px;border-radius:18px}.closed-beta-art>img{object-position:center}.closed-beta-art-shade{background:linear-gradient(0deg,rgba(5,7,10,.88) 0%,rgba(5,7,10,.18) 78%)}.closed-beta-art-copy{left:20px;right:20px;bottom:24px}.closed-beta-art-copy h1{font-size:clamp(2.8rem,14vw,4.5rem)}.closed-beta-gate{padding:20px!important;border-radius:18px}}
      `}</style>
    </SiteShell>
  );
}
