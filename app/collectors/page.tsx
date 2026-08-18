import type { Metadata } from "next";
import Link from "next/link";
import { AppScreen } from "@/components/app-screen";
import { FinalCta, PageHero, SectionHeading, SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "For Collectors | FateDrop",
  description: "Search independent TCG catalogues, follow live availability and discover local events with FateDrop.",
};

export default function CollectorsPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="For collectors" title="Spend less time searching and more time collecting." description="Tell FateDrop what you want. Search participating catalogues, compare available offers and receive evidence-backed signals when opportunities appear.">
        <div className="button-row"><Link className="button button-primary" href="/join?type=collector">Join the free beta <span>↗</span></Link><Link className="text-link" href="#collector-tools">See what’s inside <span>↓</span></Link></div>
      </PageHero>
      <section className="content-section section-shell split-section">
        <div className="copy-stack">
          <p className="eyebrow"><span />One connected search</p>
          <h2>The hunt is fun. The fragmented search isn’t.</h2>
          <p>Independent shops often carry exactly what collectors want, but finding that stock can mean searching site after site. FateDrop creates a single discovery layer, while every sale still belongs to the retailer.</p>
          <div className="point-list">
            <div><span>01</span><p>Search participating retailer catalogues from one place.</p></div>
            <div><span>02</span><p>See current availability and useful price context.</p></div>
            <div><span>03</span><p>Continue directly to the independent retailer to buy.</p></div>
          </div>
        </div>
        <div className="insight-panel">
          <small>DISCOVERY JOURNEY / LIVE BETA</small>
          <div className="search-journey">
            <div className="search-query">⌕ Search: premium collection</div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>Product match</b><small>Found across the network</small></div><span>In stock</span></div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>Independent option</b><small>Current catalogue listing</small></div><span>View</span></div>
            <div className="journey-arrow" />
            <div className="journey-store"><small>BUY DIRECT</small><strong>Continue to the retailer</strong><p>The retailer keeps their brand, website and checkout.</p></div>
          </div>
        </div>
      </section>
      <section className="collector-subscription section-shell">
        <div><p className="eyebrow"><span />B2C subscription model</p><h2>Use the market for free. Subscribe for deeper intelligence.</h2><p>Basic discovery, shops, events and direct retailer purchasing remain available free. Proposed Plus and Pro tiers add more specific alerts, saved searches, lifecycle intelligence and collection tools.</p></div>
        <div className="subscription-summary"><article><span>FateDrop Plus</span><strong>£4.99 / month</strong><p>Product alerts, lifecycle notifications, Universal Wishlist, FateFind, True Price and Local Radar alerts.</p></article><article><span>FateDrop Pro</span><strong>£7.99 / month</strong><p>Advanced lifecycle, collection, basket, event and future multi-TCG tools as infrastructure supports them.</p></article><small>Provisional founding-member pricing · no checkout active</small><Link className="button button-secondary" href="/subscriptions#collectors">Compare collector plans <span>↗</span></Link></div>
      </section>
      <section className="content-section section-shell" id="collector-tools">
        <SectionHeading eyebrow="Collector tools" title="Everything useful. Nothing noisy." body="The beta focuses on practical discovery tools that reduce friction without taking the collector away from independent businesses." />
        <div className="feature-cards">
          {[
            ["01", "Unified search", "Look across connected independent catalogues with one query."],
            ["02", "Universal Wishlist", "Save wanted products across connected retailers, including unavailable or sold-out products."],
            ["03", "Local Radar", "Discover retailers, vendors and events by location or postcode."],
            ["04", "True Price", "Compare product price, known postage and free-delivery thresholds; confirm the final total at checkout."],
            ["05", "FateFind", "Build a wanted search using maximum price, condition, location, collection and preorder preferences."],
            ["06", "Drop Pulse", "Follow timestamp-supported labels such as just listed, recently restocked and price dropped."],
            ["07", "Events", "Plan visits using dates, venues, tickets and participating vendor information."],
            ["08", "Event Vendor Mode", "Search clearly labelled temporary stock by product, vendor, stall, price and condition."],
            ["09", "Direct retailer links", "Move from discovery to the seller’s own website and checkout."],
          ].map(([number, title, body]) => <article className="mini-feature" key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>
      <section className="content-section section-shell split-section">
        <div className="phone-frame" style={{ marginInline: "auto", transform: "rotate(-2deg)", width: 290, height: 600 }}><div className="phone-island" /><AppScreen screen="search" /></div>
        <div className="copy-stack"><p className="eyebrow"><span />Free during beta</p><h2>Help shape the network you want to use.</h2><p>Early collectors get access to the growing discovery experience and a direct line into what FateDrop improves next. No inflated promises—just a useful product getting sharper.</p><Link className="button button-primary" href="/join?type=collector">Join FateDrop free <span>↗</span></Link></div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
