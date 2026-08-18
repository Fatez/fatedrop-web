import type { Metadata } from "next";
import Link from "next/link";
import { NetworkProof } from "@/components/network-proof";
import { FinalCta, PageHero, SectionHeading, SiteShell } from "@/components/page-shell";

const retailerFaq = [
  ["What does FateDrop cost?", "Free Retailer, Indie at £9.99/month or £99/year and Indie Pro at £24.99/month or £249/year are provisional founding-member prices. Billing is not active."],
  ["Can I join during the beta?", "Yes. Submit a retailer or vendor enquiry. Joining begins with a conversation and verification; an enquiry does not automatically publish a catalogue."],
  ["Which ecommerce platforms are supported?", "Shopify, WooCommerce, product feeds, APIs, CSV, sitemaps and manual onboarding can be assessed. A one-click production integration is not promised for every setup."],
  ["Can I start with a CSV?", "Yes, where the file has enough consistent product, price, availability and URL information. FateDrop will agree the structure before importing it."],
  ["Does FateDrop sell my products?", "No. FateDrop is the discovery layer, not the seller, merchant of record or fulfilment provider."],
  ["Where does the customer check out?", "On your website. The collector follows the product link and confirms final price and availability with you."],
  ["Who handles payments, delivery, returns and customer service?", "The retailer does. Your normal terms, payment provider, fulfilment, returns process and customer relationship remain yours."],
  ["How are prices and availability updated?", "Updates depend on the agreed catalogue source and the data it exposes. Feed, API, CSV, sitemap and manual routes have different freshness; FateDrop does not promise instant updates everywhere."],
  ["Can I review my catalogue before it becomes public?", "Yes. The founding-beta process includes storefront and catalogue-preview review before approved products become discoverable."],
  ["Can I remove my catalogue?", "Yes. A retailer can request removal. Automated self-service removal is not yet live, so the beta team handles the change and confirms it."],
  ["What analytics are currently available?", "Catalogue-health and outbound-interest foundations are being validated. Confirmed sales, conversion attribution and full retailer dashboards are not currently claimed."],
  ["What is planned rather than live?", "Broader automated imports, advanced retailer analytics, privacy-conscious demand intelligence, promotions, Event Vendor Mode at production scale and billing remain active expansion or production-infrastructure work."],
  ["Can online-only retailers participate?", "Yes. A physical shop is not required, but the business and website still need verification."],
  ["Can event vendors join?", "Yes. Vendors can submit the retailer enquiry and describe their event activity. Temporary event inventory remains clearly labelled and is not presented as ordinary shop stock."],
  ["Does paying improve FateScore?", "No. Commercial plans or promotions cannot purchase a stronger trust score."],
  ["How does FateDrop protect collector and retailer data?", "The beta collects only the information needed for an enquiry. Lead records are private, marketing consent is separate, and planned demand insight is aggregated rather than an individual-behaviour feed for retailers."],
] as const;

export const metadata: Metadata = {
  title: "For Independent TCG Businesses | FateDrop",
  description: "Connect your catalogue to FateDrop and help collectors discover your products, storefront and event presence.",
};

export default function BusinessesPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="For retailers & vendors" title="Your stock deserves to be discovered." description="Put products in front of collectors already searching while keeping the transaction, fulfilment, service and customer relationship. Your products. Your prices. Your website. Your checkout.">
        <div className="button-row"><Link className="button button-primary" href="/join?type=business">Connect your catalogue <span>↗</span></Link><Link className="button button-secondary" href="#partner-demo">Request a partner demo</Link></div>
      </PageHero>
      <section className="content-section section-shell split-section">
        <div className="copy-stack"><p className="eyebrow"><span />The discovery problem</p><h2>Great stock can still be almost invisible.</h2><p>Collectors cannot buy what they cannot find. FateDrop makes independent products discoverable across search, local and event journeys—without turning the retailer into a faceless fulfilment endpoint.</p><div className="point-list"><div><span>01</span><p>Your business identity stays attached to your listings.</p></div><div><span>02</span><p>Collectors continue to your existing website to purchase.</p></div><div><span>03</span><p>Catalogue support is assessed with you—never assumed.</p></div></div></div>
        <div className="insight-panel"><small>YOUR CATALOGUE / FATEDROP DISCOVERY</small><div className="search-journey"><div className="search-query">Collector searches the network</div><div className="journey-arrow" /><div className="journey-result"><span className="journey-thumb" /><div><b>Your product is surfaced</b><small>Your store name remains visible</small></div><span>Match</span></div><div className="journey-arrow" /><div className="journey-store"><small>DIRECT TRAFFIC</small><strong>Your product page. Your checkout.</strong><p>FateDrop does not present itself as the stockist.</p></div></div></div>
      </section>
      <section className="onboarding-section section-shell" id="onboarding">
        <div className="onboarding-copy"><p className="eyebrow"><span />Founding retailer onboarding</p><h2>From catalogue to collector search.</h2><p>Start with the safest practical connection for your business. FateDrop does not promise a fixed onboarding time or assume every catalogue is identical.</p><strong className="retailer-promise">Your products. Your prices. Your website. Your checkout.</strong><p>FateDrop does not become the seller and does not handle fulfilment or customer service for retailer purchases.</p><Link className="button button-primary" href="/join?type=business">Connect Your Catalogue <span>↗</span></Link></div>
        <ol className="onboarding-steps">
          {[
            "Tell us about your business and catalogue.",
            "FateDrop verifies the retailer and website.",
            "We agree the safest catalogue connection method.",
            "Products are mapped into the FateDrop network.",
            "The retailer reviews its storefront and catalogue preview.",
            "Approved products become discoverable.",
            "The retailer receives available referral and catalogue-health insight.",
          ].map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}
        </ol>
      </section>
      <NetworkProof foundingInvite={false} />
      <section className="content-section section-shell">
        <SectionHeading eyebrow="Retailer journey" title="More relevant visibility. More qualified traffic. Better demand insight." body="Connect the catalogue you already operate, become discoverable in relevant journeys and learn what collectors want but cannot currently find." />
        <div className="feature-cards">
          {[
            ["01", "Connect or import", "Start with Shopify, WooCommerce, CSV or another structured-feed foundation."],
            ["02", "Verified storefront", "Present business details and catalogue visibility without flattening your identity."],
            ["03", "Relevant search", "Appear when collectors search for products your catalogue currently holds."],
            ["04", "Direct journeys", "Send buyers to your own product pages and checkout. Referral measurement is being validated; clicks are never presented as invented sales."],
            ["05", "Events + releases", "Promote events, preorders and releases with clearly labelled information."],
            ["06", "Demand insight", "Understand available product interest and aggregated searches that find no matching stock."],
            ["07", "Catalogue health", "Identify stale data, broken links and catalogue changes that need attention."],
            ["08", "Stock arrivals", "Observe relevant catalogue arrivals and availability transitions."],
            ["09", "Retailer analytics · active expansion", "Build toward search-visibility and outbound-referral reporting without claiming unverified conversion."],
          ].map(([number, title, body]) => <article className="mini-feature" key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>
      <section className="content-section section-shell" id="partner-demo">
        <div className="quote-band"><blockquote>Connect what you already stock to the collectors already looking.</blockquote><p>Tell us which ecommerce platform you use and how your catalogue is structured. We’ll discuss the right beta route rather than pretending every setup is identical.</p><Link className="button button-primary" href="/join?type=business" style={{ marginTop: 30 }}>Request a partner demo <span>↗</span></Link></div>
      </section>
      <section className="demand-section section-shell">
        <div className="demand-copy"><p className="eyebrow"><span />Demand intelligence · active expansion</p><h2>Know what collectors want before deciding what to stock.</h2><p>Future aggregated, privacy-conscious insight can show where network demand is not being met—without exposing an individual collector’s behaviour to a retailer.</p><Link className="text-link" href="/subscriptions#retailers">See proposed retailer plans <span>→</span></Link></div>
        <div className="demand-signals">{["Frequently searched products", "Wishlist demand", "FateFind requests", "Unavailable network products", "Regional interest", "Missed purchase opportunities", "Release interest", "Event demand"].map((item, index) => <span key={item}><i>{String(index + 1).padStart(2, "0")}</i>{item}<b>Future aggregated insight</b></span>)}</div>
      </section>
      <section className="retailer-faq section-shell" id="retailer-faq">
        <div className="retailer-faq-head"><p className="eyebrow"><span />Retailer FAQ</p><h2>Straight answers before catalogue access.</h2><p>Validated beta, active expansion and production infrastructure are kept separate. If something is not live, the answer says so.</p></div>
        <div className="faq-list">{retailerFaq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
      </section>
      <section className="pricing-section section-shell">
        <SectionHeading eyebrow="Provisional founding-member pricing" title="Start with discovery. Add intelligence as it earns its place." body="Free Retailer, Indie and Indie Pro are proposed subscription tiers. Payment collection is not active." />
        <Link className="button button-primary pricing-cta" href="/subscriptions#retailers">Compare retailer plans <span>↗</span></Link>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
