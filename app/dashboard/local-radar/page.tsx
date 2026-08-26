import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { LocalRadarSearch } from "@/components/local-radar-search";

export const metadata: Metadata = { title: "Local Radar | FateDrop Dashboard", robots: { index: false, follow: false } };

export default function DashboardLocalRadarPage() {
  return <DashboardPageShell title="Local Radar" eyebrow="NEARBY STORES · EXPECTED STOCK · CONFIRMED STOCK">
    <div className="fd-local-radar-page">
      <section className="fd-local-radar-hero">
        <span>FATE NETWORK · LOCAL RADAR</span>
        <h1>Find nearby stores. See what may be arriving.</h1>
        <p>Local Radar uses the canonical FateDrop Cloud discovery engine to answer two simple questions: <strong>where can you buy Pokémon and TCG products near you</strong>, and <strong>what stock may be arriving there</strong>. Expected stock is never presented as guaranteed availability, and only genuine exact-branch evidence becomes Confirmed.</p>
        <div className="fd-local-radar-model" aria-label="Local Radar status model">
          <div><b>STORE</b><small>Known physical retailer branch.</small></div>
          <div><b>EXPECTED</b><small>Credible incoming-stock intelligence. Not guaranteed.</small></div>
          <div><b>CONFIRMED</b><small>Physical availability verified at that exact branch.</small></div>
          <div><b>UNKNOWN</b><small>No reliable current stock information.</small></div>
        </div>
      </section>

      <LocalRadarSearch />
    </div>

    <style>{`
      .fd-local-radar-page{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-local-radar-hero{padding:30px;border:1px solid rgba(221,203,188,.085);border-radius:13px;background:radial-gradient(circle at 90% 10%,rgba(126,87,143,.15),transparent 30%),linear-gradient(145deg,#101419,#090d11 72%)}.fd-local-radar-hero>span{color:#b6977d;font-size:9px;font-weight:900;letter-spacing:.15em}.fd-local-radar-hero h1{max-width:950px;margin:10px 0 12px;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.5rem,4.6vw,5rem);font-weight:500;line-height:.96;letter-spacing:-.05em}.fd-local-radar-hero>p{max-width:980px;margin:0;color:#9d9599;font-size:13px;line-height:1.72}.fd-local-radar-hero>p strong{color:#d4c5ba}.fd-local-radar-model{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:22px}.fd-local-radar-model div{padding:12px;border:1px solid rgba(221,203,188,.065);border-radius:10px;background:rgba(255,255,255,.014)}.fd-local-radar-model b{display:block;color:#d7cbc2;font-size:8px;letter-spacing:.1em}.fd-local-radar-model small{display:block;margin-top:4px;color:#847d81;font-size:8px;line-height:1.45}.fd-local-radar-model div:nth-child(2) b{color:#c7a2de}.fd-local-radar-model div:nth-child(3) b{color:#96cbb0}@media(max-width:850px){.fd-local-radar-hero{padding:23px 20px}.fd-local-radar-model{grid-template-columns:1fr 1fr}}@media(max-width:520px){.fd-local-radar-model{grid-template-columns:1fr}}
    `}</style>
  </DashboardPageShell>;
}
