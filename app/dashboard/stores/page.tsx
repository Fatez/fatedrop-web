import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { LiveStorefront } from "@/components/live-storefront";
import { NetworkSummaryPanels } from "@/components/network-summary-panels";
import { RetailerNetworkBrowser } from "@/components/retailer-network-browser";
import { getCobAndPipCatalogue } from "@/lib/retailer-catalogue";
import { retailerRegistry } from "@/lib/retailer-registry";

export const metadata: Metadata = { title: "Retailer Network | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardStoresPage() {
  const liveOffers = await getCobAndPipCatalogue();
  return (
    <DashboardPageShell title="Retailer Network" eyebrow="UK TCG COMMERCE MAP">
      <section className="fd-dash-card fd-network-card">
        <div className="fd-dash-card-head"><span>NETWORK FOUNDATION</span><i className="live">● {retailerRegistry.length} STORES MAPPED</i></div>
        <div className="fd-network-message"><h1>One universal storefront. Two networks feeding it.</h1><p>Retail and independent stores remain distinct networks, but their products flow into one FateDrop catalogue. Product identity joins matching listings; True Price compares individual offers; checkout stays with the retailer.</p></div>
        <div className="fd-network-metrics"><div><strong>{retailerRegistry.filter((store) => store.category !== "indie").length}</strong><span>RETAIL NETWORK</span><small>Major retail + TCG specialists</small></div><div><strong>{retailerRegistry.filter((store) => store.category === "indie").length}</strong><span>INDEPENDENT NETWORK</span><small>Indies with equal visibility</small></div><div><strong>{liveOffers.length}</strong><span>LIVE OFFERS</span><small>Feeding the universal catalogue</small></div></div>
      </section>

      <NetworkSummaryPanels stores={retailerRegistry} products={liveOffers} />
      <LiveStorefront products={liveOffers} />

      <section className="fd-dash-card" style={{ marginTop: 18 }}>
        <div className="fd-dash-card-head"><span>NETWORK DIRECTORY</span><Link href="/dashboard/true-price">Open True Price ↗</Link></div>
        <div className="fd-network-message"><h1>See who is mapped without drowning the storefront in retailer lists.</h1><p>The directory is kept below the buying experience. Use its filters when you want to inspect the network itself.</p></div>
        <RetailerNetworkBrowser stores={retailerRegistry} />
      </section>
    </DashboardPageShell>
  );
}
