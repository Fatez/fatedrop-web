import type { Metadata } from "next";
import Link from "next/link";
import { MarketStoryHero } from "@/components/market-story-hero";
import { FinalCta, SectionHeading, SiteShell } from "@/components/page-shell";
import { StockLifecycle } from "@/components/stock-lifecycle";
import { fateTraderWebEnabled } from "@/lib/fate-trader-web";

const networkLayers = [
  ["Retailer supply", "National retailers, specialist TCG stores and independent businesses can all contribute discoverable stock when FateDrop has reliable catalogue or availability evidence."],
  ["FateDrop intelligence", "FateDrop keeps product identity, stock signals, RRP/reference value and known checkout context connected so different offers can be understood consistently."],
  ["Collector control", "You decide whether to search, compare with FateFind, save to Wishlist, ask FateMatch to keep watching or use Fate Trader for collector-to-collector trading."],
] as const;

const coreTools = [
  ["01", "Search", "Find a product and see the live retailer offers FateDrop currently knows about. Search is discovery: product, retailer, observed stock, price and a route to the seller."],
  ["02", "FateFind", "Compare like-for-like live offers and see which available option gives the strongest value against the correct RRP/reference. True Price adds known mandatory delivery without pretending unknown delivery is £0."],
  ["03", "FateMatch", "When the current deal is not right, choose the exact item and the buying conditions you care about. FateDrop keeps watching and alerts you when a live offer qualifies."],
  ["04", "Network signals", "Whisper, Echo, Manifested and Vanished explain what FateDrop is observing across the network, from early movement through confirmed live stock to availability that has gone."],
  ["05", "Fate Network", "A useful answer does not have to come from the biggest retailer. Major, specialist and independent stores can surface when their evidence-backed offer is relevant."],
  ["06", "One FateDrop ID", "Your account, membership, Wishlist, FateMatch preferences and notification access are designed to stay consistent across Web, App and linked Discord."],
] as const;

const supportingTools = [
  ["Universal Wishlist", "Save products because you want them without automatically turning every saved item into an alert."],
  ["Local Radar", "Discover nearby TCG businesses while keeping external place discovery separate from verified live-stock claims."],
  ["Fate Encounters", "Explore source-backed UK card shows, venues and participating vendors through the wider Fate Network."],
] as const;

export const metadata: Metadata = {
  title: "Fate Network for Collectors | FateDrop",
  description: "Use Search, FateFind and FateMatch across the Fate Network, then use Fate Trader for collector-to-collector trading as beta access expands.",
};

export default function CollectorsPage() {
  const traderEnabled = fateTraderWebEnabled();

  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="Fate Network · For collectors"
        title="One network. More ways to find what you collect."
        description="Search retailer stock, compare live value with FateFind, let FateMatch watch for the right buying conditions and use Fate Trader for collector-to-collector trading. Each tool has one job; the Fate Network keeps the journeys connected."
        image="/assets/market/collectors.png"
        alt="FateDrop collector artwork showing a dark trading-card desk scene"
        proof={["Search connected stock", "Compare with FateFind", "Watch with FateMatch", "Trade with Fate Trader"]}
      >
        <div className="button-row">
          <Link className="button button-primary" href="/join?type=collector">Join the collector beta <span>↗</span></Link>
          <Link className="text-link" href="#what-is-the-network">Understand the network <span>↓</span></Link>
        </div>
      </MarketStoryHero>

      <section className="content-section section-shell" id="what-is-the-network">
        <SectionHeading
          eyebrow="What is the Fate Network?"
          title="The connected layer underneath the collector tools."
          body="For buying, Fate Network connects retailer supply with FateDrop intelligence and your own buying intent, then sends you to the seller. For trading, Fate Trader connects compatible collector intent without turning the retailer journey into the same thing."
        />
        <div className="value-network-grid" style={{ marginTop: 42 }}>
          {networkLayers.map(([title, body]) => <article key={title}><span>FATE NETWORK</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="content-section section-shell" id="collector-core">
        <SectionHeading
          eyebrow="The buying tools"
          title="Find it. Compare it. Watch it."
          body="Search tells you what FateDrop currently knows. FateFind helps decide what is strongest value now. FateMatch handles the waiting. Signals explain what changed around those decisions."
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
            <div><span>02</span><p>See which configuration offers the strongest RRP/reference value. True Price combines item price with known mandatory delivery while delivery remains visible separately.</p></div>
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

      <section className="content-section section-shell split-section" id="fate-trader">
        <div className="copy-stack">
          <p className="eyebrow"><span />Fate Trader · Collector to collector</p>
          <h2>Buying and trading are different journeys.</h2>
          <p>Fate Trader is the collector-to-collector side of the Fate Network. It does not replace FateFind or FateMatch and it does not belong in the retailer checkout flow. You record what you have and what you want; Fate Trade Finder looks for compatible trade intent using the same verified card identity foundation.</p>
          <div className="point-list">
            <div><span>01</span><p>Add cards you genuinely have available to trade.</p></div>
            <div><span>02</span><p>Describe the cards or trade outcome you are looking for.</p></div>
            <div><span>03</span><p>Fate Trade Finder checks for compatible collector intentions rather than retail stock.</p></div>
            <div><span>04</span><p>A compatible result becomes Fate Trade Found; when there is no current match, Fate Trade Hunt can keep the intent available for future matching.</p></div>
          </div>
          <div className="button-row">
            {traderEnabled ? <Link className="button button-primary" href="/dashboard/trader">Open Fate Trader <span>↗</span></Link> : <Link className="button button-secondary" href="/join?type=collector">Fate Trader beta access <span>↗</span></Link>}
          </div>
        </div>
        <div className="insight-panel retailer-network-panel">
          <small>YOUR CARD → FATE TRADE FINDER → COMPATIBLE COLLECTOR</small>
          <div className="retailer-network-flow" aria-label="Fate Trader collector matching journey"><span>Your trade card</span><i /><span>Your want</span><i /><span>Trade Finder</span><i /><span>Trade Found</span></div>
          <div className="search-journey">
            <div className="search-query">⇄ Find a compatible collector trade</div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>Exact reciprocal match first</b><small>Card identity, variant, language and condition evidence stay attached</small></div><span>Match</span></div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>No match yet?</b><small>Keep the intent as a Fate Trade Hunt</small></div><span>Hunt</span></div>
          </div>
        </div>
      </section>

      <section className="content-section section-shell" id="stock-lifecycle">
        <SectionHeading
          eyebrow="One signal language"
          title="Know what the retail network is actually seeing."
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
          title="Useful supporting tools, without duplicating the core jobs."
          body="Wishlist, nearby discovery and real-world events extend the network around Search, FateFind, FateMatch, Fate Trader and Signals. Each has a clear job rather than becoming another version of the same feature."
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
