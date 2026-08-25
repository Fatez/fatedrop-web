import type { Metadata } from "next";
import Link from "next/link";
import { MarketStoryHero } from "@/components/market-story-hero";
import { FinalCta, SectionHeading, SiteShell } from "@/components/page-shell";
import { StockLifecycle } from "@/components/stock-lifecycle";

const coreTools = [
  ["01", "Signal intelligence", "Whisper tells you something changed. Echo says access, traffic or security activity is building. Manifested confirms purchasable stock is live. Vanished closes the loop when previously confirmed availability is gone."],
  ["02", "FateFind", "Search the live network, compare genuinely equivalent configurations against verified RRP/reference and identify the strongest-value option rather than simply the smallest checkout number. True Price is supporting checkout context when delivery is known."],
  ["03", "FateMatch", "Choose a product and the stock, price or RRP conditions you would actually buy at. FateDrop watches those conditions and alerts you when a qualifying live offer appears."],
  ["04", "Independent discovery", "Find stock beyond the obvious major retailers and continue directly to the independent store that actually has the product."],
] as const;

const supportingTools = [
  ["Universal Wishlist", "Keep products you care about in one account-level list without turning every saved item into an alert."],
  ["Local Radar", "Discover nearby TCG businesses while keeping external discovery separate from verified network-stock claims."],
  ["Fate Encounters", "Explore source-backed UK card shows, venues and participating vendors through the same wider network."],
] as const;

export const metadata: Metadata = {
  title: "For Collectors | FateDrop",
  description: "Follow stock signals, use FateFind to compare live value, let FateMatch watch your buying conditions and discover independent TCG retailers and events through FateDrop.",
};

export default function CollectorsPage() {
  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="For collectors"
        title="Find the cards. Know the value. Catch the signal."
        description="Search participating TCG retailers, let FateFind compare real value against verified RRP/reference, and use FateMatch when you want FateDrop to watch a product for the conditions you would actually buy at."
        image="/assets/market/collectors.png"
        alt="FateDrop collector artwork showing a dark trading-card desk scene"
        proof={["Search the network", "FateFind best value now", "FateMatch watches conditions", "Buy direct from stores"]}
      >
        <div className="button-row">
          <Link className="button button-primary" href="/join?type=collector">Join the collector beta <span>↗</span></Link>
          <Link className="text-link" href="#collector-core">See the core tools <span>↓</span></Link>
        </div>
      </MarketStoryHero>

      <section className="content-section section-shell" id="collector-core">
        <SectionHeading
          eyebrow="The collector advantage"
          title="Everything before checkout, clearer."
          body="FateDrop focuses on the parts collectors currently have to piece together themselves: what is changing, whether stock is actually live, which offer is genuinely good value and when a product finally meets your personal buying conditions."
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
          <p className="eyebrow"><span />FateFind → FateMatch</p>
          <h2>Find the best value now. Watch it when the deal is not right yet.</h2>
          <p>FateFind is the live comparison tool: search a product and FateDrop compares relevant available configurations using the correct RRP/reference. If nothing meets what you would actually pay, FateMatch takes over the waiting: set the product and your conditions and let FateDrop monitor them for you.</p>
          <div className="point-list">
            <div><span>01</span><p>Search the product in FateFind and compare the live network.</p></div>
            <div><span>02</span><p>See which option is strongest value against verified RRP/reference, with True Price context when delivery is known.</p></div>
            <div><span>03</span><p>If the current deal is not right, create a FateMatch watch with your price, RRP or stock conditions.</p></div>
            <div><span>04</span><p>When a qualifying offer appears, receive the alert and continue directly to the retailer.</p></div>
          </div>
        </div>
        <div className="insight-panel collector-radar-panel">
          <small>FATEFIND NOW → FATEMATCH WATCH</small>
          <div className="collector-discovery-rail" aria-label="FateFind to FateMatch journey"><span>Live comparison</span><i /><span>Value verdict</span><i /><span>Your conditions</span><i /><span>FateMatch alert</span></div>
          <div className="search-journey">
            <div className="search-query">⌕ FateFind: compare this product now</div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>Best live value identified</b><small>RRP/reference + item price + checkout context</small></div><span>Find</span></div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>FateMatch</b><small>Watch until your buying conditions are met</small></div><span>Watch</span></div>
            <div className="journey-arrow" />
            <div className="journey-store"><small>BUY DIRECT</small><strong>Continue to the retailer</strong><p>Final stock, checkout, delivery and service remain with the seller.</p></div>
          </div>
        </div>
      </section>

      <section className="content-section section-shell" id="stock-lifecycle">
        <SectionHeading
          eyebrow="One signal language"
          title="Four states. One meaning everywhere."
          body="Whisper → Echo → Manifested → Vanished. The same lifecycle should mean the same thing on the website, in the app, on Discord and in a push notification."
        />
        <div style={{ marginTop: 42 }}><StockLifecycle /></div>
      </section>

      <section className="content-section section-shell">
        <SectionHeading
          eyebrow="The wider network"
          title="Useful extras, without burying the core product."
          body="Wishlist, nearby discovery and real-world events support the collecting journey without competing with Signals, FateFind and FateMatch."
        />
        <div className="value-network-grid" style={{ marginTop: 42 }}>
          {supportingTools.map(([title, body]) => <article key={title}><span>NETWORK TOOL</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
        <div className="button-row" style={{ marginTop: 28 }}><Link className="button button-secondary" href="/events">Explore Fate Encounters</Link><Link className="text-link" href="/subscriptions#collectors">See membership <span>→</span></Link></div>
      </section>

      <FinalCta />
    </SiteShell>
  );
}
