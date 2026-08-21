import type { Metadata } from "next";
import Link from "next/link";
import { EventCalendar } from "@/components/event-calendar";
import { FutureExpansion } from "@/components/future-expansion";
import { InteractivePhoneDemo } from "@/components/interactive-phone-demo";
import { NetworkProof } from "@/components/network-proof";
import { FinalCta, SiteShell } from "@/components/page-shell";
import { StockLifecycle } from "@/components/stock-lifecycle";
import { WhyFateDrop } from "@/components/why-fatedrop";
import { FateSignalField } from "@/components/fate-signal-field";
import { DISCORD_COMMUNITY_OPEN, DISCORD_INVITE_URL, TRIAL_DAYS } from "@/lib/membership";

export const metadata: Metadata = {
  title: "FateDrop | UK TCG Discovery & Stock Intelligence",
  description: "Search participating UK TCG catalogues, compare known costs, follow evidence-backed stock signals and discover independent retailers and events.",
};

export default function Home() {
  return (
    <SiteShell>
      <section className="home-hero section-shell">
        <div className="hero-atmosphere" aria-hidden="true"><i /><i /><i /></div>
        <FateSignalField variant="signal" className="hero-signal-field" />
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
          <h2>Echo when something is moving. Manifested when it is real.</h2>
          <p>Echo is FateDrop&apos;s public early-intelligence state: meaningful queue, security, catalogue or metadata movement worth watching, without promising that stock is coming. Manifested means availability or another meaningful event is confirmed from observed evidence. Vanished records previously confirmed availability being lost.</p>
          <span className="status-chip validated">Evidence-backed beta lifecycle</span>
          <small>Whisper remains internal engine terminology. Signal timing depends on the evidence each source exposes; an Echo is never a guarantee that a drop is imminent.</small>
        </div>
        <StockLifecycle />
      </section>

      <WhyFateDrop />

      <section className="business-section section-shell">
        <div className="business-visual">
          <FateSignalField variant="market" className="business-signal-field" />
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
        <div className="trust-intro"><p className="eyebrow"><span />Trust by design</p><h2>Evidence—not manufactured confidence.</h2><p>Verification, measured performance and promotional placement remain separate. Paid placement cannot buy stronger trust evidence, and planned infrastructure stays visibly labelled.</p><Link className="text-link" href="/trust">Explore the evidence model <span>→</span></Link></div>
        <div className="trust-grid"><article><span>Evidence model · foundation</span><h3>Trust needs enough evidence.</h3><p>FateScore is a planned evidence-led model. Until its scoring inputs and publication policy are implemented, FateDrop shows the evidence it actually has rather than inventing a score.</p></article><article><span>Drop Pulse · foundation</span><h3>Context needs observed movement.</h3><p>Drop Pulse summarises timestamp-supported activity behind an offer or event. It is secondary context around Echo, Manifested and Vanished—not another public lifecycle state.</p></article><article><span>FateFair · planned</span><h3>Guidance needs context.</h3><p>Future price guidance requires comparable offers, condition, delivery, history, freshness and sample size before it can be trustworthy.</p></article></div>
      </section>

      <section className="events-teaser section-shell">
        <div className="events-copy"><p className="eyebrow"><span />Fate Encounters · live UK calendar</p><h2>Discover the event before the day. Search the vendors when you arrive.</h2><p>Browse source-verified UK card shows, trade events and conventions, use Local Radar for nearby events, and inspect organiser-backed vendor or table locations where they are published. Physical event stock appears only when explicit evidence exists.</p><div className="button-row"><Link className="button button-primary" href="/join?type=event">List an Event <span>↗</span></Link><Link className="button button-secondary" href="/events">Explore Live Events</Link></div></div>
        <EventCalendar compact />
      </section>

      <section className="subscription-teaser section-shell">
        <div><p className="eyebrow"><span />FateDrop membership</p><h2>One identity. One entitlement. More useful the longer you stay.</h2><p>Create a FateDrop ID for free, keep your permanent member-since history and start a {TRIAL_DAYS}-day collector trial when you want deeper stock intelligence. The same entitlement foundation is designed to power the app and Premium Discord as those integrations are individually connected.</p><div className="button-row"><Link className="button button-primary" href="/account/register">Create FateDrop ID <span>↗</span></Link><Link className="button button-secondary" href="/subscriptions">See Membership</Link></div></div>
        <div className="subscription-summary"><article><span>Collectors</span><strong>FREE → PREMIUM</strong><p>Free identity and discovery with paid Premium depth. Plus and Pro pricing is shown on the membership page; the final higher-tier feature split remains under founding-beta review.</p></article><article><span>Connected access</span><strong>WEB → APP → DISCORD</strong><p>One membership state designed to follow the collector across the FateDrop network as each client integration is verified.</p></article><small>Stripe billing activates only when live credentials, prices and webhook configuration are connected.</small></div>
      </section>

      <section className="identity-community-teaser section-shell">
        <FateSignalField variant="radar" className="identity-community-field" />
        <div className="identity-community-copy"><p className="eyebrow"><span />Your network identity</p><h2>Become part of the signal.</h2><p>Your FateDrop ID carries your profile, membership age and account-level Companion foundation. When Premium integrations are active, the same entitlement can power deeper dashboard, app and Discord access.</p><div className="identity-community-steps"><span><i>01</i>Create your ID</span><span><i>02</i>Build your profile</span><span><i>03</i>Customise Companion</span><span><i>04</i>Connect the network</span></div><div className="button-row"><Link className="button button-primary" href="/account">Open FateDrop ID <span>↗</span></Link>{DISCORD_COMMUNITY_OPEN ? <a className="button button-secondary" href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">Join the Discord</a> : <span className="button button-secondary disabled-link" aria-disabled="true">Discord opening soon</span>}</div></div>
        <div className="identity-card-preview"><div className="identity-preview-head"><span>FATEDROP / NETWORK ID</span><i>SIGNAL READY</i></div><div className="identity-preview-person"><b>FD</b><div><small>@YOUR_HANDLE</small><strong>Collector identity</strong><p>FD-••••••••••</p></div></div><div className="identity-preview-meta"><span><small>MEMBER SINCE</small><b>DAY ONE</b></span><span><small>COMPANION</small><b>YOUR SIGNAL</b></span><span><small>ACCESS</small><b>ONE ENTITLEMENT</b></span></div><div className="identity-preview-rings"><i /><i /><i /></div></div>
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
