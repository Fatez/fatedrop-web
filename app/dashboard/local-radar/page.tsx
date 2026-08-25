import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { LocalRadarSearch } from "@/components/local-radar-search";

export const metadata: Metadata = { title: "Local Radar | FateDrop Dashboard", robots: { index: false, follow: false } };

export default function DashboardLocalRadarPage() {
  return <DashboardPageShell title="Local Radar" eyebrow="LOCAL DISCOVERY · EVIDENCE FIRST">
    <div className="fd-dashboard-grid">
      <section className="fd-dash-card fd-network-card"><div className="fd-dash-card-head"><span>LOCAL RADAR</span><i className="pending">LOCATION ON DEMAND</i></div><div className="fd-network-message"><h1>Find useful TCG places around you.<br/>Keep location and stock claims separate.</h1><p>Local Radar helps you discover nearby hobby shops and location-aware FateDrop information using device location or a UK postcode. A shop appearing nearby does <b>not</b> mean FateDrop has verified stock at that physical branch. Connected inventory is only shown when the retailer, location and product evidence support that claim.</p></div></section>
      <section className="fd-dash-card" style={{padding:25}}><div className="fd-dash-card-head"><span>DISCOVER NEARBY TCG STORES</span><small>Device location or UK postcode · up to 50 miles</small></div><LocalRadarSearch/></section>
      <section className="fd-dash-card" style={{padding:25}}><div className="fd-dash-card-head"><span>HOW LOCAL RADAR CONNECTS</span><small>Discovery first · inventory second</small></div><div className="fd-network-message"><h2>Nearby discovery can lead into the wider FateDrop network.</h2><p>From a local business you can inspect its FateDrop presence, search the network or compare qualifying online offers. Local stock rules only become actionable when FateDrop has a resolved participating retailer location and verified inventory evidence for that scope.</p></div></section>
    </div>
  </DashboardPageShell>;
}
