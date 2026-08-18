import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { LiveStorefront } from "@/components/live-storefront";
import { getCobAndPipCatalogue } from "@/lib/retailer-catalogue";

export const metadata: Metadata = { title: "True Price | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardTruePricePage() {
  const cobAndPip = await getCobAndPipCatalogue();
  return (
    <DashboardPageShell title="True Price" eyebrow="DELIVERED VALUE INTELLIGENCE">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-network-card">
          <div className="fd-dash-card-head"><span>TRUE PRICE</span><i className="live">● INTELLIGENCE ONLINE</i></div>
          <div className="fd-network-message"><h1>Signal tells you when. True Price tells you whether to buy.</h1><p>FateDrop compares matching offers by transaction: shelf price, mandatory delivery and official RRP where verified. Retailers are never ranked as businesses; only individual offers can be sorted by delivered cost.</p></div>
          <div className="fd-network-metrics"><div><strong>RRP</strong><span>REFERENCE</span><small>Verified official source only</small></div><div><strong>+%</strong><span>PREMIUM</span><small>Delivered cost versus RRP</small></div><div><strong>£</strong><span>TRUE PRICE</span><small>Item + mandatory delivery</small></div></div>
        </section>
        <section className="fd-dash-card">
          <div className="fd-dash-card-head"><span>INTELLIGENCE STATUS</span><small>{cobAndPip.length} live offers loaded</small></div>
          <div className="fd-network-message"><h1>First catalogue connected. Cross-store matching comes next.</h1><p>Cob & Pip is now the first live offer source. Its £50 free-postage rule is known. Below that threshold FateDrop deliberately labels delivery as unknown until the exact mandatory postage can be verified. We will not manufacture a fake True Price.</p></div>
        </section>
      </div>
      <LiveStorefront products={cobAndPip} retailerName="Cob & Pip" />
      <section className="fd-dash-card" style={{ marginTop: 18 }}>
        <div className="fd-dash-card-head"><span>NEXT COMPARISON LAYER</span><small>Product identity matching</small></div>
        <div className="fd-network-message"><h1>Same product → every current offer.</h1><p>The next connected catalogues will be normalised to a shared product identity. Once two stores carry the same product, True Price can show All, Major Retail, Specialists and Indies, calculate known delivered totals, compare verified RRP and send the user directly to the chosen retailer to buy.</p></div>
      </section>
    </DashboardPageShell>
  );
}
