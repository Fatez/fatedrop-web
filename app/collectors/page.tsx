import type { Metadata } from "next";
import Link from "next/link";
import { MarketStoryHero } from "@/components/market-story-hero";
import { FinalCta, SectionHeading, SiteShell } from "@/components/page-shell";
import { StockLifecycle } from "@/components/stock-lifecycle";

const coreTools = [
  ["01", "Signal intelligence", "Whisper tells you something changed. Echo says access, traffic or security activity is building. Manifested confirms purchasable stock is live. Vanished closes the loop when previously confirmed availability is gone."],
  ["02", "True Price", "See observed price against official RRP, known mandatory delivery and the percentage above or below RRP where the evidence is available."],
  ["03", "FateFind → FateMatch", "Create a FateFind with the product and limits that matter. When an observed active offer qualifies, that successful result becomes a FateMatch."],
  ["04", "Independent discovery", "Find stock beyond the obvious major retailers and continue directly to the independent store that actually has the product."],
] as const;

const supportingTools = [
  ["Universal Wishlist", "Keep products you care about in one account-level list without turning every saved item into an alert."],
  ["Local Radar", "Discover nearby TCG businesses while keeping external discovery separate from verified network-stock claims."],
  ["Fate Encounters", "Explore source-backed UK card shows, venues and participating vendors through the same wider network."],
] as const;

export const metadata: Metadata = {
  title: "For Collectors | FateDrop",
  description: "Follow stock signals, compare True Price, create FateFind hunts, receive FateMatch results and discover independent TCG retailers and events through FateDrop.",
};

export default function CollectorsPage() {
  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="For collectors"
        title="Find the cards. Know the price. Catch the signal."
        description="Search participating TCG retailers, compare True Price, track the products that matter and let FateDrop surface the strongest route to buy — including independent stores you may never have found on your own."
        image="/assets/market/collectors-hero.jpg"
        alt="A mature TCG collector desk with trading cards, binders and FateDrop-inspired signal lighting"
        proof={["Search the network", "Compare True Price", "Create FateFind hunts", "Buy direct from stores"]}
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
          body="FateDrop focuses on the parts collectors currently have to piece together themselves: what is changing, whether stock is actually live, what the price means and which retailer is worth opening next."
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
          <h2>Your hunt should search the network, not your patience.</h2>
          <p>A FateFind is the hunt you create. Choose the product, price limits, RRP limits and online or local scope that matter to you. FateDrop evaluates observed retailer offers against that intent; when an active offer genuinely qualifies, the result is a FateMatch.</p>
          <div className="point-list">
            <div><span>01</span><p>Create a FateFind for the product or product family you are looking for.</p></div>
            <div><span>02</span><p>Add useful price or RRP limits and online/local scope.</p></div>
            <div><span>03</span><p>Receive a FateMatch only when an observed active offer satisfies those criteria.</p></div>
            <div><span>04</span><p>Open the retailer directly to confirm final stock, delivery and checkout.</p></div>
          </div>
        </div>
        <div className="insight-panel collector-radar-panel">
          <small>FATEFIND → FATEMATCH / COLLECTOR INTENT</small>
          <div className="collector-discovery-rail" aria-label="FateFind to FateMatch journey"><span>Your FateFind</span><i /><span>Network evidence</span><i /><span>Qualifying offer</span><i /><span>FateMatch</span></div>
          <div className="search-journey">
            <div className="search-query">⌕ FateFind: selected product + limits</div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>Offer observed</b><small>Price + availability + retailer evidence</small></div><span>Check</span></div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>FateMatch</b><small>Your chosen criteria are met</small></div><span>Match</span></div>
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
          body="Wishlist, nearby discovery and real-world events support the collecting journey without competing with Signals, True Price and FateFind → FateMatch."
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
