import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { LocalRadarSearch } from "@/components/local-radar-search";

export const metadata: Metadata = { title: "Local Radar | FateDrop Dashboard", robots: { index: false, follow: false } };

export default function DashboardLocalRadarPage() {
  return <DashboardPageShell title="Local Radar" eyebrow="NEARBY DISCOVERY · FATEFIND READY">
    <div className="fd-dashboard-grid">
      <section className="fd-dash-card fd-network-card"><div className="fd-dash-card-head"><span>LOCAL RADAR</span><i className="pending">LOCATION ON DEMAND</i></div><div className="fd-network-message"><h1>Find the shops around you.<br/>Know which ones are actually in the network.</h1><p>Local Radar uses an approved Places-provider adapter rather than scraping map results. FateDrop keeps external discovery visibly separate from Network and Verified retailers, and never claims live stock for an external shop unless verified inventory exists.</p></div></section>
      <section className="fd-dash-card" style={{padding:25}}><div className="fd-dash-card-head"><span>DISCOVER NEARBY TCG STORES</span><small>Places-provider adapter · up to 50 km</small></div><LocalRadarSearch/></section>
      <section className="fd-dash-card" style={{padding:25}}><div className="fd-dash-card-head"><span>FATEFIND CONNECTION</span><small>Shared location model</small></div><div className="fd-network-message"><h2>Local discovery and local stock are deliberately different.</h2><p>An externally discovered hobby shop can appear on Radar. A local FateFind rule only becomes actionable when FateDrop has a resolved participating retailer location and verified qualifying inventory inside your radius.</p></div></section>
    </div>
  </DashboardPageShell>;
}
