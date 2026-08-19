import type { Metadata } from "next";
import Link from "next/link";
import { AppScreen } from "@/components/app-screen";
import { FinalCta, PageHero, SectionHeading, SiteShell } from "@/components/page-shell";
import { FateSignalField } from "@/components/fate-signal-field";
import { SignalIcon, type SignalIconName } from "@/components/signal-icon";

export const metadata: Metadata = {
  title: "For Collectors | FateDrop",
  description: "Search participating TCG catalogues, follow evidence-backed availability and discover independent retailers and events with FateDrop.",
};

export default function CollectorsPage() {
  return (
    <SiteShell>
      <PageHero motif="radar" eyebrow="For collectors" title="Spend less time searching and more time collecting." description="Tell FateDrop what you want. Search participating catalogues, compare available offers and receive evidence-backed signals when opportunities appear.">
        <div className="button-row"><Link className="button button-primary" href="/join?type=collector">Join the free beta <span>↗</span></Link><Link className="text-link" href="#collector-tools">See what’s inside <span>↓</span></Link></div>
      </PageHero>
      <section className="content-section section-shell split-section">
        <div className="copy-stack">
          <p className="eyebrow"><span />One connected search</p>
          <h2>The hunt is fun. The fragmented search isn’t.</h2>
          <p>Independent shops often carry exactly what collectors want, but finding that stock can mean searching site after site. FateDrop is building a single discovery layer, while every sale still belongs to the retailer.</p>
          <div className="point-list">
            <div><span>01</span><p>Search participating retailer catalogues as sources connect.</p></div>
            <div><span>02</span><p>See observed availability and evidence-backed price context.</p></div>
            <div><span>03</span><p>Continue directly to the retailer to confirm and buy.</p></div>
          </div>
        </div>
        <div className="insight-panel collector-radar-panel">
          <FateSignalField variant="radar" className="panel-signal-field" />
          <small>DISCOVERY JOURNEY / BETA</small>
          <div className="collector-discovery-rail" aria-label="Collector discovery journey"><span>Search</span><i /><span>Compare</span><i /><span>Signal</span><i /><span>Retailer</span></div>
          <div className="search-journey">
            <div className="search-query">⌕ Search: premium collection</div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>Product match</b><small>Found across connected sources</small></div><span>Observed</span></div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>Independent option</b><small>Participating catalogue listing</small></div><span>View</span></div>
            <div className="journey-arrow" />
            <div className="journey-store"><small>BUY DIRECT</small><strong>Continue to the retailer</strong><p>The retailer keeps their brand, website and checkout.</p></div>
          </div>
        </div>
      </section>
      <section className="collector-subscription section-shell">
        <div><p className="eyebrow"><span />Collector membership</p><h2>Use the network for free. Subscribe for deeper intelligence.</h2><p>Basic identity and discovery remain available free. Premium membership is designed for deeper signal detail, saved intent and connected-access features; Plus versus Pro feature gates are still being finalised during the founding beta.</p></div>
        <div className="subscription-summary"><article><span>FateDrop Plus</span><strong>£4.99 / month</strong><p>Current Premium foundation for deeper signal detail, FateFind, True Price context and connected tools where enabled.</p></article><article><span>FateDrop Pro</span><strong>£14.99 / month</strong><p>Higher-tier product direction. Final features and enforcement remain under product review rather than being invented in marketing copy.</p></article><small>14-day collector trial foundation · production checkout only when Stripe credentials, prices and webhook are connected</small><Link className="button button-secondary" href="/subscriptions#collectors">Compare collector plans <span>↗</span></Link></div>
      </section>
      <section className="content-section section-shell" id="collector-tools">
        <SectionHeading eyebrow="Collector tools" title="Everything useful. Nothing noisy." body="FateDrop separates what is usable now from what is still being connected, so the product can grow without pretending every surface is finished." />
        <div className="feature-cards">
          {[
            ["01", "Unified Search · foundation", "The Signal Engine exposes a canonical catalogue API; the dashboard search experience is being connected to that same network rather than creating another search silo.", "unified-search"],
            ["02", "Watchlist · foundation", "Keep wanted products in one account-level collector list as the shared save model develops.", "wishlist"],
            ["03", "Local Radar · beta", "Discover nearby TCG businesses through the configured Places provider while keeping external discovery separate from verified network stock.", "local-radar"],
            ["04", "True Price · beta", "Compare item price, verified RRP and known mandatory delivery; unknown delivery stays unknown and final checkout remains with the retailer.", "true-price"],
            ["05", "FateFind · foundation", "Build structured wanted intent using product, price/RRP limits and online or local scope.", "fatefind"],
            ["06", "Drop Pulse · foundation", "Summarise timestamp-supported movement without turning weak evidence into manufactured urgency.", "drop-pulse"],
            ["07", "Events · demo / sourced beta", "Public examples remain clearly demo data; sourced dashboard listings should always be checked with the organiser before travel.", "events"],
            ["08", "Event Vendor Mode · planned", "Temporary event inventory search remains a future layer and must stay separate from ordinary shop stock.", "event-vendor"],
            ["09", "FateDrop Companion · foundation", "Your account-level customisation and signal reactions are ready for the richer 3D character and floating signal droid layer as it integrates.", "manifested"],
            ["10", "Direct retailer links", "Move from discovery to the seller’s own website and checkout to confirm final stock, price and fulfilment.", "manifested"],
          ].map(([number, title, body, icon]) => <article className="mini-feature" key={title}><div className="mini-feature-top"><span>{number}</span><SignalIcon name={icon as SignalIconName} /></div><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>
      <section className="content-section section-shell split-section">
        <div className="phone-frame" style={{ marginInline: "auto", transform: "rotate(-2deg)", width: 290, height: 600 }}><div className="phone-island" /><AppScreen screen="search" /></div>
        <div className="copy-stack"><p className="eyebrow"><span />Founding beta</p><h2>Help shape the network you want to use.</h2><p>Early collectors get access to the growing discovery experience and a direct line into what FateDrop improves next. No inflated promises—just a useful product getting sharper.</p><Link className="button button-primary" href="/join?type=collector">Join FateDrop free <span>↗</span></Link></div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
