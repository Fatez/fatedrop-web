import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { LiveStorefront } from "@/components/live-storefront";
import { RetailerNetworkBrowser } from "@/components/retailer-network-browser";
import { getCobAndPipCatalogue } from "@/lib/retailer-catalogue";
import { retailerRegistry } from "@/lib/retailer-registry";

export const metadata: Metadata = { title: "Retailer Network | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardStoresPage() {
  const cobAndPip = await getCobAndPipCatalogue();
  return (
    <DashboardPageShell title="Retailer Network" eyebrow="UK TCG COMMERCE MAP">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-network-card">
          <div className="fd-dash-card-head"><span>NETWORK FOUNDATION</span><i className="live">● {retailerRegistry.length} STORES MAPPED</i></div>
          <div className="fd-network-message"><h1>One product. Every useful place to buy it.</h1><p>Browse major retail, TCG specialists and Indies without a long category-by-category page. Connected catalogues become live storefronts and feed Search, Alerts and True Price.</p></div>
          <div className="fd-network-metrics">
            <div><strong>{retailerRegistry.filter((store) => store.category === "major-retail").length}</strong><span>MAJOR RETAIL</span><small>National and high-street sellers</small></div>
            <div><strong>{retailerRegistry.filter((store) => store.category === "tcg-specialist").length}</strong><span>SPECIALISTS</span><small>Established TCG retailers</small></div>
            <div><strong>{retailerRegistry.filter((store) => store.category === "indie").length}</strong><span>INDIES</span><small>Independent network</small></div>
          </div>
        </section>
        <section className="fd-dash-card">
          <div className="fd-dash-card-head"><span>LIVE CATALOGUES</span><small>Cob & Pip first</small></div>
          <div className="fd-network-message"><h1>{cobAndPip.length ? `${cobAndPip.length} Cob & Pip products flowing into FateDrop.` : "Cob & Pip catalogue connection ready."}</h1><p>Products link straight back to the retailer to buy. FateDrop remains the discovery and intelligence layer rather than taking the retailer checkout away.</p></div>
          <Link className="fd-dashboard-wide-button" href="/dashboard/true-price">Compare with True Price →</Link>
        </section>
      </div>
      <RetailerNetworkBrowser stores={retailerRegistry} />
      <LiveStorefront products={cobAndPip} retailerName="Cob & Pip" />
    </DashboardPageShell>
  );
}
