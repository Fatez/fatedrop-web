import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";

export const metadata: Metadata = { title: "Local Radar | FateDrop Dashboard", robots: { index: false, follow: false } };

export default function DashboardLocalRadarPage() {
  return (
    <DashboardPageShell title="Local Radar" eyebrow="NEARBY DISCOVERY">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-network-card"><div className="fd-dash-card-head"><span>LOCAL RADAR</span><i className="pending">LOCATION ON DEMAND</i></div><div className="fd-network-message"><h1>Nearby stock without making location mandatory.</h1><p>Local Radar will request location only when you use it, with a UK postcode fallback and a useful list view even when mapping is unavailable.</p></div></section>
        <section className="fd-dash-card"><div className="fd-dash-card-head"><span>RADAR STATUS</span><small>Awaiting live retailer location data</small></div><div className="fd-dashboard-empty"><strong>The dashboard route is ready.</strong><span>We will enable nearby shops, events and local stock here once verified retailer coordinates and catalogue observations are connected.</span></div></section>
      </div>
    </DashboardPageShell>
  );
}
