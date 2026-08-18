import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { LiveStorefront } from "@/components/live-storefront";
import { getCobAndPipCatalogue } from "@/lib/retailer-catalogue";
import { groupMatchingOffers } from "@/lib/product-identity";

export const metadata: Metadata = { title: "True Price | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardTruePricePage() {
  const cobAndPip = await getCobAndPipCatalogue();
  const identities = groupMatchingOffers(cobAndPip);
  const sealedIdentities = identities.filter((group) => group.identity.kind !== "other");

  return (
    <DashboardPageShell title="True Price" eyebrow="DELIVERED VALUE INTELLIGENCE">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-network-card">
          <div className="fd-dash-card-head"><span>TRUE PRICE</span><i className="live">● IDENTITY ENGINE ONLINE</i></div>
          <div className="fd-network-message"><h1>Signal tells you when. True Price tells you whether to buy.</h1><p>FateDrop now creates a shared identity for products before comparing offers. Retailers can call the same item different things; the engine reduces those titles into set, product type and edition so equivalent offers can meet on one comparison.</p></div>
          <div className="fd-network-metrics"><div><strong>{cobAndPip.length}</strong><span>LIVE OFFERS</span><small>Cob & Pip catalogue</small></div><div><strong>{sealedIdentities.length}</strong><span>IDENTITIES</span><small>Comparable product groups detected</small></div><div><strong>£</strong><span>TRUE PRICE</span><small>Item + verified mandatory delivery</small></div></div>
        </section>
        <section className="fd-dash-card">
          <div className="fd-dash-card-head"><span>MATCHING RULES</span><small>Evidence-first comparison</small></div>
          <div className="fd-network-message"><h1>Standard products stay separate from Pokémon Center editions.</h1><p>An ordinary Elite Trainer Box must never be falsely compared with a Pokémon Center-exclusive ETB just because the set name matches. FateDrop tracks edition and product type as part of identity, and leaves uncertain matches separate rather than fabricating a bargain.</p></div>
        </section>
      </div>

      <section className="fd-dash-card" style={{ marginTop: 18 }}>
        <div className="fd-dash-card-head"><span>PRODUCT IDENTITY INDEX</span><small>Ready for the next retailer feed</small></div>
        <div className="fd-dashboard-list">
          {sealedIdentities.slice(0, 12).map((group) => (
            <article key={group.key}>
              <span className="fd-store-thumb">◇</span>
              <div><strong>{group.identity.setName || group.offers[0].title}</strong><small>{group.identity.kind.replaceAll("-", " ")}{group.identity.pokemonCenterEdition ? " · Pokémon Center edition" : " · standard edition"}</small></div>
              <aside><span>{group.offers.length} OFFER{group.offers.length === 1 ? "" : "S"}</span></aside>
            </article>
          ))}
        </div>
      </section>

      <LiveStorefront products={cobAndPip} retailerName="Cob & Pip" />

      <section className="fd-dash-card" style={{ marginTop: 18 }}>
        <div className="fd-dash-card-head"><span>NEXT FEED</span><small>Cross-retailer comparison</small></div>
        <div className="fd-network-message"><h1>Identity engine → second catalogue → real comparison.</h1><p>The matcher is now ready to receive another retailer catalogue. When a second retailer exposes the same standard product identity, FateDrop can group both offers, calculate verified delivered totals, compare RRP where available and send the buyer directly to whichever offer they choose.</p></div>
      </section>
    </DashboardPageShell>
  );
}
