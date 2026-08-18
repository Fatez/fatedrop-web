import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";

export const metadata: Metadata = { title: "True Price | FateDrop Dashboard", robots: { index: false, follow: false } };

export default function DashboardTruePricePage() {
  return (
    <DashboardPageShell title="True Price" eyebrow="DELIVERED VALUE">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-network-card"><div className="fd-dash-card-head"><span>TRUE PRICE</span><i className="live">● MODEL READY</i></div><div className="fd-network-message"><h1>Cheapest listing is not always the cheapest purchase.</h1><p>True Price compares the listed price against official RRP, adds known mandatory delivery, and sorts offers by the actual delivered total rather than headline price alone.</p></div><div className="fd-network-metrics"><div><strong>RRP</strong><span>REFERENCE</span><small>Official source where available</small></div><div><strong>+%</strong><span>MARKUP</span><small>Price increase vs RRP</small></div><div><strong>£</strong><span>DELIVERED</span><small>Item + required postage</small></div></div></section>
        <section className="fd-dash-card"><div className="fd-dash-card-head"><span>LIVE COMPARISON</span><small>Waiting for connected offers</small></div><div className="fd-dashboard-empty"><strong>No live comparison set yet.</strong><span>Once retailer catalogue offers are flowing, this page will rank the real delivered price while keeping unknown postage visibly unknown.</span></div></section>
      </div>
    </DashboardPageShell>
  );
}
