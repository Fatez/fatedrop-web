import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BetaOwnerConsole } from "@/components/beta-owner-console";
import { SiteShell } from "@/components/page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { isOwnerUser, listBetaRequestsForOwner } from "@/lib/owner-access";

export const metadata: Metadata = {
  title: "Beta Owner Console",
  description: "Owner-only FateDrop beta approval controls.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BetaOwnerPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/admin/beta");
  if (!await isOwnerUser(snapshot.account.id)) notFound();

  const requests = await listBetaRequestsForOwner(snapshot.account.id);

  return <SiteShell>
    <main className="section-shell fd-owner-page">
      <section className="fd-owner-hero">
        <div>
          <p className="eyebrow"><span />OWNER / CLOSED BETA</p>
          <h1>Beta access.<br/><em>Controlled by FateDrop.</em></h1>
          <p>Registration creates a pending FateDrop ID only. Approve or revoke access here; membership, a TestFlight link or possession of a company email alias never bypasses this canonical approval state.</p>
        </div>
        <div className="fd-owner-hero-actions">
          <span><small>OWNER ID</small><b>{snapshot.account.fateId}</b></span>
          <Link className="button button-secondary" href="/account">Back to FateDrop ID</Link>
        </div>
      </section>

      <section className="fd-owner-panel">
        <div className="fd-owner-panel-head">
          <div><span>ACCESS QUEUE</span><h2>Collector approvals</h2></div>
          <i>CANONICAL / AUDITED</i>
        </div>
        <p className="fd-owner-warning">Approving a collector grants closed-beta entitlement across surfaces that consume canonical FateDrop access. Revoking removes that entitlement. Owner access itself cannot be changed from this console.</p>
        <BetaOwnerConsole initialRequests={requests} />
      </section>
    </main>
    <style>{`
      .fd-owner-page{margin-top:94px!important;margin-bottom:80px!important}.fd-owner-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:end;padding:clamp(26px,4vw,48px);border:1px solid rgba(221,203,188,.09);border-radius:22px;background:radial-gradient(circle at 82% 12%,rgba(124,110,255,.12),transparent 30%),linear-gradient(145deg,#101419,#090c10)}.fd-owner-hero h1{margin:8px 0 18px;color:#f0e7e1;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3rem,5vw,5.8rem);font-weight:500;line-height:.92;letter-spacing:-.05em}.fd-owner-hero h1 em{color:#bbaeb8;font-style:normal}.fd-owner-hero>div>p:last-child{max-width:800px;margin:0;color:#968e93;font-size:13px;line-height:1.75}.fd-owner-hero-actions{display:grid;gap:12px;min-width:220px}.fd-owner-hero-actions>span{padding:14px;border:1px solid rgba(221,203,188,.07);border-radius:10px;background:rgba(255,255,255,.018)}.fd-owner-hero-actions small{display:block;color:#7d7479;font-size:8px;font-weight:900;letter-spacing:.13em}.fd-owner-hero-actions b{display:block;margin-top:5px;color:#d8cec8;font-size:11px}.fd-owner-panel{margin-top:12px;padding:clamp(20px,3vw,30px);border:1px solid rgba(221,203,188,.08);border-radius:16px;background:linear-gradient(145deg,#0f1318,#090c10 74%)}.fd-owner-panel-head{display:flex;justify-content:space-between;gap:20px;align-items:start}.fd-owner-panel-head span{color:#9d7f68;font-size:9px;font-weight:900;letter-spacing:.13em}.fd-owner-panel-head h2{margin:7px 0 0;color:#e7ddd6;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:500}.fd-owner-panel-head i{padding:5px 8px;border:1px solid rgba(124,110,255,.16);border-radius:999px;color:#a99eff;font-size:8px;font-style:normal;font-weight:900;letter-spacing:.1em}.fd-owner-warning{margin:14px 0 18px;padding:12px 14px;border:1px solid rgba(210,182,111,.1);border-radius:10px;background:rgba(210,182,111,.025);color:#9d9498;font-size:11px;line-height:1.6}@media(max-width:800px){.fd-owner-page{width:calc(100% - 18px)!important;margin-top:78px!important}.fd-owner-hero{grid-template-columns:1fr}.fd-owner-hero-actions{min-width:0}.fd-owner-panel-head{display:grid}}
    `}</style>
  </SiteShell>;
}
