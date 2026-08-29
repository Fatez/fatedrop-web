import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSignOut } from "@/components/account-signout";
import { SiteShell } from "@/components/page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { betaAccessIsApproved } from "@/lib/beta-access";

export const metadata: Metadata = {
  title: "Beta access pending",
  description: "Your FateDrop closed-beta access request status.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BetaPendingPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/beta-pending");
  if (betaAccessIsApproved(snapshot.betaAccess)) redirect("/dashboard");

  const revoked = snapshot.betaAccess.status === "revoked";

  return <SiteShell>
    <main className="beta-pending-page section-shell">
      <section className="beta-pending-card">
        <p className="eyebrow"><span />FATEDROP CLOSED BETA</p>
        <div className="beta-state">{revoked ? "ACCESS REVOKED" : "REQUEST RECEIVED"}</div>
        <h1>{revoked ? "Your beta access is not active." : "Your request is in."}</h1>
        <p className="lead">
          {revoked
            ? "This FateDrop ID is still valid, but it is not currently approved for the closed beta."
            : "This FateDrop ID is your closed-beta request. It is waiting for explicit Owner approval; once approved, the same ID unlocks the FateDrop Web dashboard and App."}
        </p>
        <div className="beta-identity">
          <span><small>FATEDROP ID</small><strong>{snapshot.account.fateId}</strong></span>
          <span><small>STATUS</small><strong>{revoked ? "Revoked" : "Pending approval"}</strong></span>
          <span><small>ACCESS</small><strong>Web + App together</strong></span>
        </div>
        <p className="truth">There is only one closed-beta request. An install link or paid membership does not bypass account approval.</p>
        <div className="button-row">
          <Link href="/account" className="button button-secondary">View my FateDrop ID</Link>
          <AccountSignOut />
        </div>
      </section>
    </main>
    <style>{`
      .beta-pending-page{max-width:980px;margin-top:120px!important;margin-bottom:90px!important}.beta-pending-card{padding:clamp(28px,5vw,64px);border:1px solid rgba(210,182,111,.16);border-radius:24px;background:radial-gradient(circle at 85% 8%,rgba(124,110,255,.13),transparent 30%),linear-gradient(145deg,#10141a,#080b10 74%);box-shadow:0 28px 80px rgba(0,0,0,.28)}.beta-pending-card h1{max-width:760px;margin:14px 0;color:#eee4dd;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.7rem,6vw,5.8rem);font-weight:500;line-height:.94;letter-spacing:-.045em}.beta-state{display:inline-flex;margin-top:24px;padding:7px 10px;border:1px solid rgba(210,182,111,.2);border-radius:999px;color:#d2b66f;font-size:9px;font-weight:900;letter-spacing:.14em}.beta-pending-card .lead{max-width:720px;color:#a49ca0;font-size:14px;line-height:1.75}.beta-identity{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:30px 0 18px}.beta-identity span{padding:16px;border:1px solid rgba(221,203,188,.08);border-radius:12px;background:rgba(255,255,255,.018)}.beta-identity small{display:block;color:#777074;font-size:8px;font-weight:900;letter-spacing:.13em}.beta-identity strong{display:block;margin-top:7px;color:#ddd2ca;font-size:11px}.truth{max-width:760px;padding-left:13px;border-left:2px solid rgba(124,110,255,.45);color:#827b80!important;font-size:11px!important;line-height:1.65!important}.beta-pending-card .button-row{margin-top:28px}@media(max-width:700px){.beta-pending-page{width:calc(100% - 18px)!important;margin-top:86px!important}.beta-pending-card{padding:23px;border-radius:18px}.beta-identity{grid-template-columns:1fr}}
    `}</style>
  </SiteShell>;
}
