import type { Metadata } from "next";
import Link from "next/link";
import { MarketStoryHero } from "@/components/market-story-hero";
import { FinalCta, SectionHeading, SiteShell } from "@/components/page-shell";
import { StockLifecycle } from "@/components/stock-lifecycle";

const networkLayers = [
  ["Retailer supply", "National retailers, specialist TCG stores and independent businesses can all contribute discoverable stock when FateDrop has reliable catalogue or availability evidence."],
  ["FateDrop intelligence", "FateDrop organises product identity, stock signals, RRP/reference value and known checkout context so different offers can be understood consistently."],
  ["Collector control", "You decide whether you simply search, compare with FateFind, save to Wishlist or ask FateMatch to keep watching until your conditions are met."],
] as const;

const coreTools = [
  ["01", "Search", "Ask one network what is currently known about a product. Search is the simple discovery layer: product, retailer, observed stock, price and a direct route to the seller."],
  ["02", "FateFind", "Compare genuinely equivalent live options and configurations using verified RRP/reference value first. FateFind answers which available option is the strongest value now; True Price adds known mandatory delivery as checkout context."],
  ["03", "FateMatch", "When the current deal is not right, choose the exact item and the conditions you would actually buy at. FateDrop keeps watching the network and alerts you when a live offer qualifies."],
  ["04", "Network signals", "Whisper, Echo, Manifested and Vanished explain what FateDrop is observing across the network, from early movement through confirmed live stock to availability that has gone."],
  ["05", "More places to buy", "A useful answer does not have to come from the biggest retailer. Connected independent and specialist stores can surface when they genuinely have relevant stock or stronger value."],
  ["06", "One FateDrop ID", "Your account, membership, Wishlist, FateMatch preferences and notification access are designed to stay consistent across Web, App and linked Discord."],
] as const;

const supportingTools = [
  ["Universal Wishlist", "Save products because you want them without automatically turning every saved item into an alert."],
  ["Local Radar", "Discover nearby TCG businesses while keeping external place discovery separate from verified live-stock claims."],
  ["Fate Encounters", "Explore source-backed UK card shows, venues and participating vendors through the wider Fate Network."],
] as const;

export const metadata: Metadata = {
  title: "Fate Network for Collectors | FateDrop",
  description: "Use the Fate Network to search more retailers, compare live value with FateFind, watch buying conditions with FateMatch and discover specialist and independent TCG stock.",
};

export default function CollectorsPage() {
  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="Fate Network · For collectors"
        title="One network. More places to find what you collect."
        description="The Fate Network connects collector demand with stock across major retailers, specialist TCG stores and independent businesses. FateDrop gives you the tools to search that network, understand real value and keep watching when the right deal is not live yet."
        image="/assets/market/collectors.png"
        alt="FateDrop collector artwork showing a dark trading-card desk scene"
        proof={["Search connected stock", "Compare value with FateFind", "Watch with FateMatch", "Buy direct from retailers"]}
      >
        <div className="button-row">
          <Link className="button button-primary" href="/join?type=collector">Join the collector beta <span>↗</span></Link>
          <Link className="text-link" href="#what-is-the-network">Understand the network <span>↓</span></Link>
        </div>
      </MarketStoryHero>

      <section className="content-section section-shell" id="what-is-the-network">
        <SectionHeading
          eyebrow="What is the Fate Network?"
          title="A connected view of the market — not another shop."
          body="FateDrop does not need to become the retailer to make buying easier. The Fate Network brings retailer supply, FateDrop intelligence and your own buying intent into one journey, then sends you to the seller when you are ready to buy."
        />
        <div className="value-network-grid" style={{ marginTop: 42 }}>
          {networkLayers.map(([title, body]) => <article key={title}><span>FATE NETWORK</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="content-section section-shell" id="collector-core">
        <SectionHeading
          eyebrow="What the network helps you do"
          title="Find it. Understand it. Watch it."
          body="The tools have different jobs, but they all use the same network truth. Search tells you what FateDrop knows. FateFind helps decide what is strongest value now. FateMatch handles the waiting. Signals explain what is moving around them."
        />
        <div className="feature-cards">
          {coreTools.map(([number, title, body]) => (
            <article className="mini-feature" key={title}>
              <div className="mini-feature-top"><span>{number}</span></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section section-shell split-section">
        <div className="copy-stack">
          <p className="eyebrow"><span />Why the network matters</p>
          <h2>A smaller retailer can still be the right answer.</h2>
          <p>A collector should not have to know every specialist shop in the country before starting a search. If a smaller retailer has relevant stock and its catalogue is connected and matched correctly, the Fate Network can make that offer discoverable at the moment somebody is looking for it.</p>
          <p>This becomes especially useful as catalogue coverage grows beyond headline sealed drops. A specialist store with a deep singles catalogue, for example, can become discoverable for those listings when reliable product and stock data is available — even if that business does not have the online reach of a national retailer.</p>
          <div className="point-list">
            <div><span>01</span><p>You search for the product you actually want.</p></div>
            <div><span>02</span><p>FateDrop checks relevant connected offers instead of assuming the biggest retailer has the answer.</p></div>
            <div><span>03</span><p>Search or FateFind can surface a specialist or independent retailer when the evidence supports it.</p></div>
            <div><span>04</span><p>You continue directly to that retailer to confirm the final stock and buy.</p></div>
          </div>
        </div>
        <div className="insight-panel retailer-network-panel">
          <small>YOUR INTENT → FATE NETWORK → RELEVANT RETAILER</small>
          <div className="retailer-network-flow" aria-label="Collector to retailer Fate Network journey"><span>You search</span><i /><span>Fate Network</span><i /><span>Relevant stock</span><i /><span>Retailer checkout</span></div>
          <div className="search-journey">
            <div className="search-query">⌕ Find this product across the network</div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>Connected specialist offer found</b><small>Evidence-backed retailer, stock and price context</small></div><span>Found</span></div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>FateFind can compare value</b><small>Correct RRP/reference first, delivery kept separate</small></div><span>Compare</span></div>
            <div className="journey-arrow" />
            <div className="journey-store"><small>BUY DIRECT</small><strong>The retailer keeps the transaction.</strong><p>FateDrop creates the connection; the seller keeps checkout, fulfilment and the customer relationship.</p></div>
          </div>
        </div>
      </section>

      <section className="content-section section-shell split-section">
        <div className="copy-stack">
          <p className="eyebrow"><span />FateFind → FateMatch</p>
          <h2>Buy when the value is right — not just when stock exists.</h2>
          <p>FateFind is the live decision tool. It compares relevant current configurations against the correct RRP/reference so the lowest raw checkout price does not automatically win. If none of the live options meet your personal buying conditions, FateMatch handles the waiting.</p>
          <div className="point-list">
            <div><span>01</span><p>Use FateFind to compare what is available across the Fate Network now.</p></div>
            <div><span>02</span><p>See which configuration offers the strongest RRP/reference value, with True Price shown when mandatory delivery is known.</p></div>
            <div><span>03</span><p>If the deal is not good enough, create a FateMatch for the exact product and conditions you care about.</p></div>
            <div><span>04</span><p>When the network finds a qualifying live offer, FateMatch tells you why it matched and where to buy.</p></div>
          </div>
        </div>
        <div className="insight-panel collector-radar-panel">
          <small>FATEFIND NOW → FATEMATCH WATCH</small>
          <div className="collector-discovery-rail" aria-label="FateFind to FateMatch journey"><span>Live comparison</span><i /><span>Value verdict</span><i /><span>Your conditions</span><i /><span>FateMatch alert</span></div>
          <div className="search-journey">
            <div className="search-query">⌕ FateFind: compare this product now</div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>Strongest live value identified</b><small>RRP/reference + item price + known checkout context</small></div><span>Find</span></div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>Not ready? FateMatch it.</b><small>Watch until your buying conditions are met</small></div><span>Watch</span></div>
            <div className="journey-arrow" />
            <div className="journey-store"><small>FATEMATCH — LIVE NOW</small><strong>A qualifying offer is live.</strong><p>FateDrop explains the match, then sends you directly to the retailer.</p></div>
          </div>
        </div>
      </section>

      <section className="content-section section-shell" id="stock-lifecycle">
        <SectionHeading
          eyebrow="One signal language"
          title="Know what the network is actually seeing."
          body="Whisper → Echo → Manifested → Vanished. The lifecycle separates early movement from confirmed live stock and from stock that has genuinely disappeared, using the same meaning across Web, App, Discord and push notifications."
        />
        <div style={{ marginTop: 42 }}><StockLifecycle /></div>
      </section>

      <section className="content-section section-shell">
        <div className="quote-band">
          <p className="eyebrow"><span />Network trust</p>
          <blockquote>The best answer cannot be bought.</blockquote>
          <p>Retailers can pay FateDrop for catalogue connection and business tools, but payment cannot buy stronger trust, a better RRP verdict, alert priority or organic FateFind placement. If a smaller store appears as the strongest option, it should be because the evidence and value support that result.</p>
          <div className="button-row" style={{ marginTop: 28 }}><Link className="button button-secondary" href="/businesses">See the retailer side</Link><Link className="text-link" href="/trust">How FateDrop handles trust <span>→</span></Link></div>
        </div>
      </section>

      <section className="content-section section-shell">
        <SectionHeading
          eyebrow="Around the Fate Network"
          title="More ways to discover without confusing the core tools."
          body="Wishlist, nearby discovery and real-world events extend the network around Search, FateFind, FateMatch and Signals. Each has a clear job rather than becoming another version of the same feature."
        />
        <div className="value-network-grid" style={{ marginTop: 42 }}>
          {supportingTools.map(([title, body]) => <article key={title}><span>NETWORK TOOL</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
        <div className="button-row" style={{ marginTop: 28 }}><Link className="button button-secondary" href="/events">Explore Fate Encounters</Link><Link className="text-link" href="/subscriptions#collectors">See FateDrop Plus <span>→</span></Link></div>
      </section>

      <FinalCta />
    </SiteShell>
  );
}
