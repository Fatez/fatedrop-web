import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { LocalRadarSearch } from "@/components/local-radar-search";

export const metadata: Metadata = { title: "Local Radar | FateDrop Dashboard", robots: { index: false, follow: false } };

export default function DashboardLocalRadarPage() {
  return <DashboardPageShell title="Local Radar" eyebrow="NEARBY DISCOVERY · FATEFIND READY">
    <div className="fd-dashboard-grid">
      <section className="fd-dash-card fd-network-card"><div className="fd-dash-card-head"><span>LOCAL RADAR</span><i className="pending">LOCATION ON DEMAND</i></div><div className="fd-network-message"><h1>Find the shops around you.<br/>Know which ones are actually in the network.</h1><p>Local Radar uses the canonical FateDrop Cloud discovery engine and approved location providers rather than scraping map results. Search from your device location or a UK postcode. External discovery stays visibly separate from connected retailers, and FateDrop never turns online catalogue evidence into a claim about stock at a physical branch.</p></div></section>
      <section className="fd-dash-card" style={{padding:25}}><div className="fd-dash-card-head"><span>DISCOVER NEARBY TCG STORES</span><small>Cloud Radar · device location or UK postcode · up to 50 miles</small></div><LocalRadarSearch/></section>
      <section className="fd-dash-card" style={{padding:25}}><div className="fd-dash-card-head"><span>FATEFIND CONNECTION</span><small>Shared location model</small></div><div className="fd-network-message"><h2>Local discovery and local stock are deliberately different.</h2><p>An externally discovered hobby shop can appear on Radar, and nearby Fate Encounters can share the same location model. A local FateFind rule only becomes actionable when FateDrop has a resolved participating retailer location and qualifying inventory with evidence strong enough for that scope.</p></div></section>
    </div>
  </DashboardPageShell>;
}
