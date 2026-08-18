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
  const retailCount = retailerRegistry.filter((store) => store.category !== "indie").length;
  const indieCount = retailerRegistry.filter((store) => store.category === "indie").length;

  return (
    <DashboardPageShell title="Retailer Network" eyebrow="UK TCG COMMERCE MAP">
      <div className="fd-stores-page">
        <section className="fd-dash-card fd-network-card fd-stores-hero">
          <div className="fd-dash-card-head"><span>NETWORK FOUNDATION</span><i className="live">● {retailerRegistry.length} STORES MAPPED</i></div>
          <div className="fd-network-message"><h1>One storefront. Two networks. Every retailer keeps the sale.</h1><p>Retailers and independent stores remain distinct networks, but their products flow into one FateDrop catalogue. Product identity joins matching listings, True Price compares offers, and checkout stays with the seller.</p></div>
          <div className="fd-network-metrics"><div><strong>{retailCount}</strong><span>RETAIL NETWORK</span><small>Major retail + TCG specialists</small></div><div><strong>{indieCount}</strong><span>INDEPENDENT NETWORK</span><small>Indies with equal visibility</small></div><div><strong>{liveOffers.length}</strong><span>LIVE OFFERS</span><small>Feeding the universal catalogue</small></div></div>
        </section>

        <NetworkSummaryPanels stores={retailerRegistry} products={liveOffers} />

        <div className="fd-stores-workspace">
          <div className="fd-stores-column">
            <LiveStorefront products={liveOffers} />
          </div>

          <section className="fd-dash-card fd-stores-directory-card">
            <div className="fd-dash-card-head"><span>NETWORK DIRECTORY</span><Link href="/dashboard/true-price">Open True Price ↗</Link></div>
            <div className="fd-network-message"><h1>See the network without cluttering the buying experience.</h1><p>Filter the mapped retailer network by type, inspect catalogue readiness and open each store directly. Live catalogue offers remain in the storefront beside it.</p></div>
            <RetailerNetworkBrowser stores={retailerRegistry} />
          </section>
        </div>
      </div>

      <style>{`
        .fd-stores-page{display:grid;gap:22px}.fd-stores-hero{padding:30px}.fd-stores-hero .fd-network-message h1{font-size:clamp(2rem,3vw,3.15rem);line-height:1.02;max-width:900px}.fd-stores-hero .fd-network-message p{font-size:15px;line-height:1.72;max-width:900px}.fd-network-summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;align-items:stretch}.fd-network-summary-card{height:100%;display:flex;flex-direction:column;padding:26px}.fd-network-summary-card .fd-network-message h1{font-size:25px;line-height:1.1}.fd-network-summary-card .fd-network-message p{font-size:14px;line-height:1.65}.fd-network-summary-card .fd-network-mini-list{margin-top:auto}.fd-network-mini-list>div{min-height:48px;padding:11px 0}.fd-network-mini-list strong{font-size:13px}.fd-network-mini-list span{font-size:10px}.fd-stores-workspace{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(420px,.92fr);gap:22px;align-items:start}.fd-stores-column .fd-universal-storefront{margin-top:0!important;height:100%}.fd-stores-directory-card{padding:26px;min-width:0}.fd-stores-directory-card .fd-network-message h1{font-size:24px;line-height:1.12}.fd-stores-directory-card .fd-network-message p{font-size:14px;line-height:1.65}.fd-store-directory-browser{margin-top:20px}.fd-store-directory-controls{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:16px}.fd-store-directory-tabs{display:flex;flex-wrap:wrap;gap:8px}.fd-store-directory-tab{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.035);color:#a9a3b2;border-radius:11px;padding:10px 13px;font-size:12px;font-weight:750;cursor:pointer;transition:.2s ease}.fd-store-directory-tab:hover,.fd-store-directory-tab[data-active="true"]{color:white;border-color:rgba(96,224,255,.38);background:linear-gradient(135deg,rgba(88,232,255,.1),rgba(157,109,255,.1));box-shadow:0 0 0 1px rgba(88,232,255,.05)}.fd-store-directory-count{font-size:10px;letter-spacing:.12em;color:#7e7887;text-transform:uppercase;white-space:nowrap}.fd-store-directory-list article{min-height:76px}.fd-store-directory-list article>div strong{font-size:14px}.fd-store-directory-list article>div small{font-size:11px;line-height:1.45}.fd-store-directory-list aside span{font-size:9px}.fd-store-directory-list aside a{font-size:10px;font-weight:800}.fd-stores-page .fd-dash-card-head>span{font-size:11px;letter-spacing:.15em}.fd-stores-page .fd-dash-card-head small,.fd-stores-page .fd-dash-card-head a{font-size:11px}@media(max-width:1180px){.fd-stores-workspace{grid-template-columns:1fr}.fd-stores-directory-card{min-width:0}}@media(max-width:820px){.fd-network-summary-grid{grid-template-columns:1fr}.fd-stores-hero,.fd-network-summary-card,.fd-stores-directory-card{padding:20px}.fd-store-directory-controls{align-items:flex-start;flex-direction:column}.fd-stores-hero .fd-network-message h1{font-size:2rem}}
      `}</style>
    </DashboardPageShell>
  );
}
