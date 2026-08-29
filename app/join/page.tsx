import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BetaForm } from "@/components/beta-form";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Join the FateDrop Network",
  description: "Connect with FateDrop as an independent TCG retailer or event organiser.",
};

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  if (type !== "business" && type !== "event") redirect("/closed-beta");
  const initialRole = type;
  return (
    <SiteShell>
      <section className="join-layout koru-join-layout section-shell">
        <div className="join-intro">
          <p className="eyebrow"><span />Join the network</p>
          <h1>Bring your business into FateDrop.</h1>
          <p>Independent retailers can connect the stock collectors are already looking for. Event organisers can bring the real-world TCG scene into the same network. Collector closed-beta access is handled through the dedicated Closed Beta Hub.</p>
          <div className="join-promise"><span><i>01</i>Independent retailers</span><span><i>02</i>Event organisers</span></div>
        </div>
        <Suspense fallback={<div className="join-panel">Preparing the form…</div>}><BetaForm initialRole={initialRole} /></Suspense>
      </section>
      <style>{`
        .koru-join-layout{position:relative;margin-top:96px!important;padding:clamp(28px,4vw,54px)!important;overflow:hidden;border:1px solid rgba(211,193,211,.12);border-radius:28px;background:radial-gradient(circle at 26% 18%,rgba(122,89,140,.16),transparent 28%),linear-gradient(145deg,#11131a,#090b10)}.koru-join-layout:after{content:'';position:absolute;left:-100px;bottom:-180px;width:360px;height:360px;border:1px solid rgba(179,143,190,.08);border-radius:44% 56% 38% 62%;transform:rotate(32deg);pointer-events:none}.koru-join-layout .join-intro,.koru-join-layout .join-panel{position:relative;z-index:2}.koru-join-layout .join-intro h1{color:#eee5df!important;font-family:Georgia,'Times New Roman',serif!important;font-weight:500!important;letter-spacing:-.05em!important;line-height:.96!important}.koru-join-layout .role-tabs button:first-child{display:none!important}@media(max-width:720px){.koru-join-layout{width:calc(100% - 18px)!important;margin-top:78px!important;border-radius:20px}}
      `}</style>
    </SiteShell>
  );
}
