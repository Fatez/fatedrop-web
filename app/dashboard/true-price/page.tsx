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
      <div className="fd-true-price-page">
        <div className="fd-true-price-top-grid">
          <section className="fd-dash-card fd-network-card fd-true-price-hero-card">
            <div className="fd-dash-card-head"><span>TRUE PRICE</span><i className="live">● IDENTITY ENGINE ONLINE</i></div>
            <div className="fd-network-message"><h1>Signal tells you when. True Price tells you whether to buy.</h1><p>FateDrop creates a shared identity for products before comparing offers. Retailers can call the same item different things; the engine reduces those titles into set, product type and edition so equivalent offers can meet on one comparison.</p></div>
            <div className="fd-network-metrics"><div><strong>{cobAndPip.length}</strong><span>LIVE OFFERS</span><small>Cob & Pip catalogue</small></div><div><strong>{sealedIdentities.length}</strong><span>IDENTITIES</span><small>Comparable product groups detected</small></div><div><strong>£</strong><span>TRUE PRICE</span><small>Item + verified mandatory delivery</small></div></div>
          </section>

          <section className="fd-dash-card fd-true-price-hero-card fd-matching-rules-card">
            <div className="fd-dash-card-head"><span>MATCHING RULES</span><small>Evidence-first comparison</small></div>
            <div className="fd-network-message"><h1>Standard products stay separate from Pokémon Center editions.</h1><p>An ordinary Elite Trainer Box must never be falsely compared with a Pokémon Center-exclusive ETB just because the set name matches. FateDrop tracks edition and product type as part of identity, and leaves uncertain matches separate rather than fabricating a bargain.</p></div>
            <div className="fd-matching-proof">
              <span><b>01</b> Set identity</span>
              <span><b>02</b> Product type</span>
              <span><b>03</b> Edition check</span>
            </div>
          </section>
        </div>

        <div className="fd-true-price-data-grid">
          <section className="fd-dash-card fd-identity-index-card">
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

          <div className="fd-storefront-column">
            <LiveStorefront products={cobAndPip} />
          </div>
        </div>

        <section className="fd-dash-card fd-next-feed-card">
          <div className="fd-dash-card-head"><span>NEXT FEED</span><small>Cross-retailer comparison</small></div>
          <div className="fd-network-message"><h1>Identity engine → second catalogue → real comparison.</h1><p>The matcher is ready to receive another retailer catalogue. When a second retailer exposes the same standard product identity, FateDrop can group both offers, calculate verified delivered totals, compare RRP where available and send the buyer directly to whichever offer they choose.</p></div>
        </section>
      </div>

      <style>{`
        .fd-true-price-page{display:grid;gap:24px;padding-bottom:32px}
        .fd-true-price-top-grid{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr);gap:24px;align-items:stretch}
        .fd-true-price-top-grid>.fd-dash-card{height:100%;min-height:360px;display:flex;flex-direction:column}
        .fd-true-price-hero-card .fd-network-message{flex:1}
        .fd-true-price-hero-card .fd-network-message h1{font-size:clamp(2rem,2.5vw,3rem);line-height:1.02;letter-spacing:-.045em;margin-bottom:18px}
        .fd-true-price-hero-card .fd-network-message p{font-size:15px;line-height:1.72;max-width:760px}
        .fd-true-price-page .fd-dash-card-head span{font-size:12px;letter-spacing:.13em}
        .fd-true-price-page .fd-dash-card-head small,.fd-true-price-page .fd-dash-card-head i{font-size:11px}
        .fd-true-price-page .fd-network-metrics strong{font-size:clamp(2rem,2.8vw,3rem)}
        .fd-true-price-page .fd-network-metrics span{font-size:10px}
        .fd-true-price-page .fd-network-metrics small{font-size:11px;line-height:1.4}
        .fd-matching-proof{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}
        .fd-matching-proof span{min-height:64px;padding:14px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.025);display:flex;align-items:center;gap:10px;color:#b7b0bf;font-size:12px;font-weight:700}
        .fd-matching-proof b{color:#9d6dff;font-size:11px;letter-spacing:.08em}
        .fd-true-price-data-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px;align-items:start}
        .fd-identity-index-card,.fd-storefront-column>.fd-dash-card{margin-top:0!important}
        .fd-identity-index-card{overflow:hidden}
        .fd-true-price-page .fd-dashboard-list article{min-height:72px;padding-top:14px;padding-bottom:14px}
        .fd-true-price-page .fd-dashboard-list article strong{font-size:14px;line-height:1.35}
        .fd-true-price-page .fd-dashboard-list article small{font-size:11px;line-height:1.45;margin-top:4px}
        .fd-true-price-page .fd-dashboard-list article aside span{font-size:10px}
        .fd-storefront-column .fd-network-message h1{font-size:clamp(1.65rem,2vw,2.25rem);line-height:1.08;letter-spacing:-.035em}
        .fd-storefront-column .fd-network-message p{font-size:14px;line-height:1.65}
        .fd-storefront-column .fd-storefront-controls input,.fd-storefront-column .fd-storefront-controls button{font-size:12px}
        .fd-next-feed-card{min-height:220px}
        .fd-next-feed-card .fd-network-message h1{font-size:clamp(1.75rem,2.2vw,2.5rem);line-height:1.06;letter-spacing:-.04em}
        .fd-next-feed-card .fd-network-message p{font-size:15px;line-height:1.7;max-width:980px}
        @media(max-width:1180px){.fd-true-price-top-grid,.fd-true-price-data-grid{grid-template-columns:1fr}.fd-true-price-top-grid>.fd-dash-card{min-height:auto}.fd-storefront-column>.fd-dash-card{margin-top:0!important}}
        @media(max-width:720px){.fd-true-price-page{gap:16px}.fd-true-price-top-grid,.fd-true-price-data-grid{gap:16px}.fd-true-price-hero-card .fd-network-message h1{font-size:1.8rem}.fd-matching-proof{grid-template-columns:1fr}.fd-true-price-page .fd-dashboard-list article strong{font-size:13px}.fd-true-price-page .fd-dashboard-list article small{font-size:10px}}
      `}</style>
    </DashboardPageShell>
  );
}
