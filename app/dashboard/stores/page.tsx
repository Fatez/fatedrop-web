import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { retailerCategoryLabels, retailerRegistry } from "@/lib/retailer-registry";

export const metadata: Metadata = { title: "Retailer Network | FateDrop Dashboard", robots: { index: false, follow: false } };

export default function DashboardStoresPage() {
  const categories = ["major-retail", "tcg-specialist", "indie"] as const;
  const connectedCandidates = retailerRegistry.filter((store) => store.catalogueStatus === "candidate").length;

  return (
    <DashboardPageShell title="Retailer Network" eyebrow="UK TCG COMMERCE MAP">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-network-card">
          <div className="fd-dash-card-head"><span>NETWORK FOUNDATION</span><i className="live">● {retailerRegistry.length} STORES SEEDED</i></div>
          <div className="fd-network-message">
            <h1>One product. Every useful place to buy it.</h1>
            <p>FateDrop separates major retail, established TCG specialists and independent stores, then feeds their offers into Search, Alerts, Local Radar and True Price without ranking the businesses themselves.</p>
          </div>
          <div className="fd-network-metrics">
            <div><strong>{retailerRegistry.filter((store) => store.category === "major-retail").length}</strong><span>MAJOR RETAIL</span><small>National and high-street sellers</small></div>
            <div><strong>{retailerRegistry.filter((store) => store.category === "tcg-specialist").length}</strong><span>SPECIALISTS</span><small>Established TCG retailers</small></div>
            <div><strong>{retailerRegistry.filter((store) => store.category === "indie").length}</strong><span>INDIES</span><small>Independent network starts here</small></div>
          </div>
        </section>

        <section className="fd-dash-card">
          <div className="fd-dash-card-head"><span>CATALOGUE PIPELINE</span><small>{connectedCandidates} integration candidates</small></div>
          <div className="fd-network-message"><h1>Cob & Pip is our first Indie catalogue candidate.</h1><p>Its online catalogue spans Pokémon and multiple other TCGs. FateDrop has recorded its £50 free-delivery threshold so True Price can eventually calculate the delivered transaction rather than only the shelf price.</p></div>
          <a className="fd-dashboard-wide-button" href="https://cobandpip.co.uk" target="_blank" rel="noreferrer">Open Cob & Pip →</a>
        </section>
      </div>

      {categories.map((category) => {
        const stores = retailerRegistry.filter((store) => store.category === category);
        return (
          <section className="fd-dash-card" key={category} style={{ marginTop: 18 }}>
            <div className="fd-dash-card-head"><span>{retailerCategoryLabels[category].toUpperCase()}</span><small>{stores.length} seeded</small></div>
            <div className="fd-dashboard-list">
              {stores.map((store) => (
                <article key={store.id}>
                  <span className="fd-store-thumb">◇</span>
                  <div><strong>{store.name}</strong><small>{store.onlineCatalogue ? "Online catalogue" : "Retail network"}{store.physicalStores ? " · physical stores" : ""}{store.freeDeliveryThresholdPence ? ` · free delivery £${(store.freeDeliveryThresholdPence / 100).toFixed(0)}+` : ""}</small></div>
                  <aside><span>{store.catalogueStatus === "candidate" ? "CATALOGUE NEXT" : "MAPPED"}</span><a href={store.website} target="_blank" rel="noreferrer" aria-label={`Open ${store.name}`}>↗</a></aside>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="fd-dash-card" style={{ marginTop: 18 }}>
        <div className="fd-dash-card-head"><span>TRUE PRICE CONNECTION</span><Link href="/dashboard/true-price">Open True Price ↗</Link></div>
        <div className="fd-network-message"><h1>Retailer registry → offers → delivered comparison.</h1><p>Each catalogue we connect will provide product availability and price. FateDrop can then add known mandatory delivery, compare against RRP and show the best current transaction for that product across All, Major Retail, Specialists and Indies.</p></div>
      </section>
    </DashboardPageShell>
  );
}
