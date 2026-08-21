import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta, PageHero, SectionHeading, SiteShell } from "@/components/page-shell";
import { StockLifecycle } from "@/components/stock-lifecycle";

const coreTools = [
  ["01", "Signal intelligence", "Whisper tells you something changed. Echo says activity is building. Manifested confirms stock is live. Vanished closes the loop when it is gone."],
  ["02", "True Price", "See observed price against official RRP, known mandatory delivery and the percentage above or below RRP where the evidence is available."],
  ["03", "FateMatch", "Tell FateDrop what you are hunting for and let the network surface qualifying options across participating retailers."],
  ["04", "Independent discovery", "Find stock beyond the obvious major retailers and continue directly to the independent store that actually has the product."],
] as const;

const supportingTools = [
  ["Universal Wishlist", "Keep products you care about in one account-level list without turning every saved item into an alert."],
  ["Local Radar", "Discover nearby TCG businesses while keeping external discovery separate from verified network-stock claims."],
  ["Fate Encounters", "Explore source-backed UK card shows, venues and participating vendors through the same wider network."],
] as const;

export const metadata: Metadata = {
  title: "For Collectors | FateDrop",
  description: "Follow stock signals, compare True Price, use FateMatch and discover independent TCG retailers and events through FateDrop.",
};

export default function CollectorsPage() {
  return (
    <SiteShell>
      <PageHero
        motif="radar"
        eyebrow="For collectors"
        title="Find the right drop. Know the price. Know where to buy."
        description="FateDrop turns fragmented retailer browsing into one clearer journey: follow the signal, understand the price context, find a FateMatch and buy directly from the retailer."
      >
        <div className="button-row">
          <Link className="button button-primary" href="/join?type=collector">Join the collector beta <span>↗</span></Link>
          <Link className="text-link" href="#collector-core">See the core tools <span>↓</span></Link>
        </div>
      </PageHero>

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
          <p className="eyebrow"><span />FateMatch</p>
          <h2>Your hunt should search the network, not your patience.</h2>
          <p>FateMatch is the collector-intent layer. You define what you want and the limits that matter; FateDrop evaluates observed retailer offers and surfaces qualifying matches instead of making you repeat the same search across dozens of tabs.</p>
          <div className="point-list">
            <div><span>01</span><p>Choose the product or product family you are looking for.</p></div>
            <div><span>02</span><p>Add useful price or RRP limits and online/local scope.</p></div>
            <div><span>03</span><p>Open the retailer directly when a qualifying offer is found.</p></div>
          </div>
        </div>
        <div className="insight-panel collector-radar-panel">
          <small>FATEMATCH / COLLECTOR INTENT</small>
          <div className="collector-discovery-rail" aria-label="FateMatch journey"><span>Your hunt</span><i /><span>Network evidence</span><i /><span>Qualifying offer</span><i /><span>Retailer</span></div>
          <div className="search-journey">
            <div className="search-query">⌕ Wanted: selected product</div>
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
          body="Wishlist, nearby discovery and real-world events support the collecting journey without competing with Signals, True Price and FateMatch."
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
