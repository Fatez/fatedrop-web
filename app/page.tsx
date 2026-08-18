import type { Metadata } from "next";
import Link from "next/link";
import { EventCalendar } from "@/components/event-calendar";
import { FutureExpansion } from "@/components/future-expansion";
import { InteractivePhoneDemo } from "@/components/interactive-phone-demo";
import { NetworkProof } from "@/components/network-proof";
import { FinalCta, SiteShell } from "@/components/page-shell";
import { StockLifecycle } from "@/components/stock-lifecycle";
import { WhyFateDrop } from "@/components/why-fatedrop";

export const metadata: Metadata = {
  title: "FateDrop | UK TCG Discovery & Stock Intelligence",
  description: "Search participating UK TCG catalogues, compare known costs, follow evidence-backed stock signals and discover independent retailers and events.",
};

export default function Home() {
  return (
    <SiteShell>
      <section className="home-hero section-shell">
        <div className="hero-atmosphere" aria-hidden="true"><i /><i /><i /></div>
        <div className="hero-copy reveal">
          <p className="eyebrow"><span />UK TCG discovery network</p>
          <p className="hero-positioning">Participating catalogues, evidence-backed stock signals and independent discovery—connected.</p>
          <h1>Every card.<br />Every store.<br /><em>One connected network.</em></h1>
          <p className="hero-lede">Search participating UK TCG catalogues, compare product price with known postage and follow evidence-backed stock transitions. Retailers keep their website, checkout, fulfilment and customer relationship.</p>
          <div className="button-row">
            <Link className="button button-primary" href="/join?type=collector">Join the Collector Beta <span>↗</span></Link>
            <Link className="button button-secondary" href="/join?type=business">Become a Retail Partner</Link>
            <Link className="button button-secondary" href="/join?type=event">List an Event</Link>
          </div>
          <div className="hero-trust"><span>Pokémon TCG first</span><i /><span>Broader TCG expansion later</span><i /><span>Independent first</span></div>
        </div>
        <div className="hero-device-wrap reveal delay-one">
          <div className="device-orbit"><span>INTERACTIVE</span><span>SAMPLE DATA</span></div>
          <InteractivePhoneDemo />
          <div className="floating-card card-stock"><small>DROP PULSE</small><strong>Manifested</strong><span>Evidence-backed sample signal</span></div>
          <div className="floating-card card-radar"><small>LOCAL RADAR</small><strong>Nearby</strong><span>Stores, vendors + events</span></div>
        </div>
        <div className="hero-index" aria-hidden="true">FD / 001</div>
      </section>

      <section className="manifesto-strip" aria-label="FateDrop principles"><div><span>FIND THE DROP.</span><span>SUPPORT INDEPENDENTS.</span><span>COLLECT SMARTER.</span><span>FIND THE DROP.</span></div></section>

      <section className="home-outcomes section-shell" aria-labelledby="home-outcomes-title">
        <div className="home-outcomes-head"><p className="eyebrow"><span />The useful bit</p><h2 id="home-outcomes-title">Less hunting for collectors. More discoverability for independents.</h2><p>FateDrop is the connection layer. It helps demand find stock without swallowing the retailer behind the listing.</p></div>
        <div className="home-outcome-grid">
          <article><span>FOR COLLECTORS</span><h3>One search. Better context.</h3><p>Find products across participating catalogues, compare known costs, follow lifecycle signals and discover shops and events.</p><Link href="/collectors">Explore Collector Tools <b>↗</b></Link></article>
          <article><span>FOR RETAILERS</span><h3>Your catalogue. Your customer.</h3><p>Become visible to collectors already searching, then keep your brand, product page, checkout, fulfilment and customer service.</p><Link href="/businesses">See Retailer Value <b>↗</b></Link></article>
        </div>
        <div className="event-outcome"><span>FOR EVENT ORGANISERS</span><p>Turn a date and venue into a searchable visitor journey—including clearly labelled sample Event Vendor Mode.</p><Link href="/events">Explore Event Vendor Mode <b>→</b></Link></div>
      </section>

      <NetworkProof />

      <section className="lifecycle-section section-shell">
        <div className="lifecycle-copy">
          <p className="eyebrow"><span />The early-signal advantage</p>
          <h2>Detect earlier catalogue signals—not only conventional in-stock events.</h2>
          <p>Whisper can add useful context when a new SKU or unseen product begins appearing in retailer data. Manifested verifies purchasable stock; Vanished records sell-out; Echo marks availability returning.</p>
          <span className="status-chip validated">Validated beta lifecycle</span>
          <small>Signal timing depends on the data each retailer makes available. No guaranteed-first or instant-everywhere claim.</small>
        </div>
        <StockLifecycle />
      </section>

      <WhyFateDrop />

      <section className="business-section section-shell">
        <div className="business-visual">
          <div className="catalogue-panel panel-main"><small>CATALOGUE SIGNAL</small><strong>Discovery, connected.</strong><div className="signal-bars">{[42, 70, 54, 82, 64, 90, 76, 98].map((height, i) => <i style={{ height: `${height}%` }} key={i} />)}</div></div>
          <div className="catalogue-panel panel-float"><span>QUALIFIED JOURNEY</span><b>Search → Indie</b></div>
          <div className="catalogue-panel panel-float-two"><span>YOUR CHECKOUT</span><b>Your brand stays yours.</b></div>
        </div>
        <div className="business-copy">
          <p className="eyebrow"><span />For independent businesses</p>
          <h2>Your products. Your prices. Your website. Your checkout.</h2>
          <p>FateDrop does not become the seller. It connects participating catalogue stock with relevant collector searches, then sends the collector to the retailer to confirm and purchase.</p>
          <ul><li>Begin with an agreed feed, API, CSV, sitemap or manual route.</li><li>Review storefront and catalogue presentation before public discovery.</li><li>Keep payments, delivery, returns, service and the customer relationship.</li><li>Build toward referral and catalogue-health insight without inventing sales attribution.</li></ul>
          <div className="button-row"><Link className="button button-primary" href="/join?type=business">Connect Your Catalogue <span>↗</span></Link><Link className="text-link" href="/businesses#partner-demo">Request a Partner Demo <span>→</span></Link></div>
        </div>
      </section>

      <section className="trust-section section-shell" id="trust">
        <div className="trust-intro"><p className="eyebrow"><span />Trust by design</p><h2>Evidence—not manufactured confidence.</h2><p>Verification, measured performance and promotional placement remain separate. Retailers cannot buy a stronger FateScore, and planned infrastructure stays visibly labelled.</p><Link className="text-link" href="/trust">Explore the evidence model <span>→</span></Link></div>
        <div className="trust-grid"><article><span>FateScore · validated beta model</span><h3>Trust needs enough evidence.</h3><p>Without sufficient reliable evidence, the honest result is “Not enough data”.</p></article><article><span>Drop Pulse · validated beta</span><h3>Status needs an observed transition.</h3><p>Lifecycle and availability labels need timestamps or catalogue history.</p></article><article><span>FateFair · active expansion</span><h3>Guidance needs context.</h3><p>Future price guidance will consider comparable offers, condition, delivery, history, freshness and sample size.</p></article></div>
      </section>

      <section className="events-teaser section-shell">
        <div className="events-copy"><p className="eyebrow"><span />Fate Encounters · demo data</p><h2>Discover the event before the day. Search the vendors when you arrive.</h2><p>The current calendar demonstrates dates, venues, tickets and participating vendors. The live event feed and production Event Vendor Mode remain active expansion.</p><div className="button-row"><Link className="button button-primary" href="/join?type=event">List an Event <span>↗</span></Link><Link className="button button-secondary" href="/events">Explore Event Vendor Mode</Link></div></div>
        <EventCalendar compact />
      </section>

      <section className="subscription-teaser section-shell">
        <div><p className="eyebrow"><span />Free and paid value</p><h2>Free discovery. Paid depth—when the infrastructure is ready.</h2><p>Free FateDrop covers useful product, retailer and event discovery. Provisional paid plans add deeper collector intelligence or broader retailer distribution, monitoring, analytics, promotions and event tools.</p><Link className="button button-secondary" href="/subscriptions">See Provisional Plans <span>↗</span></Link></div>
        <div className="subscription-summary"><article><span>Collectors</span><strong>£0 → £7.99</strong><p>Discovery first; lifecycle, FateFind, comparison and collection depth in paid tiers.</p></article><article><span>Retailers</span><strong>£0 → £24.99</strong><p>Organic discovery first; distribution, monitoring and insight in paid tiers.</p></article><small>Provisional founding-member pricing · no authentication, billing or checkout active</small></div>
      </section>

      <FutureExpansion />

      <section className="merch-section section-shell" id="merch">
        <div className="merch-copy"><p className="eyebrow"><span />Support the build</p><h2>Wear the signal.<br />Back the network.</h2><p>FateDrop supporter merchandise gives the community a future route to support better monitoring, event discovery and independent visibility.</p><div className="merch-phases"><span>Phase 01 — Signal</span><span>Phase 02 — Manifest</span><span>Phase 03 — Afterglow</span></div><span className="merch-note">Premium clothing concept · manufacturing and checkout not connected</span><Link className="button button-secondary" href="/merch">Explore the Collection</Link></div>
        <div className="merch-visual" aria-label="Preview of FateDrop supporter merchandise"><div className="merch-orbit" /><article className="shirt-card shirt-black"><span className="shirt-sleeve left" /><span className="shirt-sleeve right" /><div className="shirt-neck" /><div className="shirt-logo"><b>F</b><i>D</i></div><small>SUPPORTER / 001</small></article><article className="shirt-card shirt-violet"><span className="shirt-sleeve left" /><span className="shirt-sleeve right" /><div className="shirt-neck" /><p>FIND STOCK.<br />SUPPORT INDIES.</p><small>FATEDROP UNDERGROUND</small></article></div>
      </section>

      <FinalCta />
    </SiteShell>
  );
}
