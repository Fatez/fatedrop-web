import type { Metadata } from "next";
import Link from "next/link";
import { MarketStoryHero } from "@/components/market-story-hero";
import { FinalCta, SectionHeading, SiteShell } from "@/components/page-shell";

const retailerBenefits = [
  ["01", "Relevant discovery", "Appear when collectors are already searching for products your connected catalogue can genuinely offer."],
  ["02", "Your checkout stays yours", "FateDrop sends the collector to your website. You keep your brand, payments, fulfilment, returns and customer relationship."],
  ["03", "Better price context", "True Price and RRP context helps collectors understand an offer instead of reducing every decision to the lowest headline number."],
  ["04", "Local + event visibility", "Physical shops, event attendance and organiser-backed vendor information can join the same discovery journey where evidence exists."],
] as const;

const retailerFaq = [
  ["Does FateDrop sell my products?", "No. FateDrop is the discovery and intelligence layer. The retailer remains the seller and merchant of record."],
  ["Where does the customer check out?", "On your website. FateDrop links the collector to your product page so final stock, price and fulfilment can be confirmed with you."],
  ["How can a catalogue connect?", "Shopify, WooCommerce, feeds, APIs, CSV, sitemaps or a guided manual route can be assessed during founding-beta onboarding."],
  ["Can I review my storefront before it is public?", "Yes. Retailer identity and catalogue presentation should be reviewed before approved products become discoverable."],
  ["Can paying improve trust status?", "No. Commercial placement cannot purchase stronger verification or evidence. Promotion and trust remain separate."],
  ["What insight is planned?", "FateDrop is building toward privacy-conscious catalogue health, search-interest and unmet-demand insight without exposing individual collector behaviour."],
] as const;

export const metadata: Metadata = {
  title: "For Independent TCG Retailers | FateDrop",
  description: "Connect an independent TCG catalogue to FateDrop, become discoverable to collectors already searching and keep your own website and checkout.",
};

export default function BusinessesPage() {
  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="For independent TCG retailers"
        title="The bridge between indie stores and collector demand."
        description="Bring your catalogue into FateDrop so collectors can discover your products while they are already searching the market. We provide the discovery, signals and price context; the customer still buys directly from you."
        image="/assets/market/retailers.png"
        alt="FateDrop retailer artwork showing an independent trading-card store"
        proof={["Surface live products", "Reach active collectors", "Keep your checkout", "Join the indie network"]}
      >
        <div className="button-row"><Link className="button button-primary" href="/join?type=business">Connect your catalogue <span>↗</span></Link><Link className="text-link" href="#how-it-works">See how the bridge works <span>↓</span></Link></div>
      </MarketStoryHero>

      <section className="content-section section-shell split-section" id="how-it-works">
        <div className="copy-stack">
          <p className="eyebrow"><span />The FateDrop bridge</p>
          <h2>Not a marketplace. A discovery route into your store.</h2>
          <p>FateDrop is designed around a simple principle: collectors need a better way to discover relevant stock, while independents need a better way to be seen. Connecting those two does not require taking over the transaction.</p>
          <strong className="retailer-promise">Your products. Your prices. Your website. Your checkout.</strong>
          <p>We surface evidence-backed availability and price context, then the collector continues to your existing product page to buy.</p>
        </div>
        <div className="insight-panel retailer-network-panel">
          <small>COLLECTOR DEMAND → FATEDROP → YOUR STORE</small>
          <div className="retailer-network-flow" aria-label="Retailer catalogue to collector journey"><span>Catalogue</span><i /><span>FateDrop</span><i /><span>Collector</span><i /><span>Your checkout</span></div>
          <div className="search-journey">
            <div className="search-query">Collector searches or creates a FateFind</div>
            <div className="journey-arrow" />
            <div className="journey-result"><span className="journey-thumb" /><div><b>A qualifying FateMatch can surface your product</b><small>Retailer identity stays visible</small></div><span>Found</span></div>
            <div className="journey-arrow" />
            <div className="journey-store"><small>DIRECT RETAILER JOURNEY</small><strong>Your product page. Your checkout.</strong><p>FateDrop does not pretend to be the stockist.</p></div>
          </div>
        </div>
      </section>

      <section className="content-section section-shell">
        <SectionHeading
          eyebrow="Why join the network"
          title="Visibility that respects the business behind the stock."
          body="The goal is not to flatten every retailer into one anonymous price list. FateDrop should make the offer easier to discover while keeping the store attached to it."
        />
        <div className="feature-cards">
          {retailerBenefits.map(([number, title, body]) => <article className="mini-feature" key={title}><div className="mini-feature-top"><span>{number}</span></div><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="onboarding-section section-shell" id="onboarding">
        <div className="onboarding-copy"><p className="eyebrow"><span />Founding retailer onboarding</p><h2>Connect carefully. Publish confidently.</h2><p>Different shops expose catalogue data in different ways. FateDrop agrees the safest practical route with the retailer rather than pretending every business has the same setup.</p><Link className="button button-primary" href="/join?type=business">Start a retailer enquiry <span>↗</span></Link></div>
        <ol className="onboarding-steps">
          {[
            "Tell FateDrop about your business, website and catalogue.",
            "Verify the retailer and agree the connection method.",
            "Map products into the network and review presentation.",
            "Publish approved catalogue visibility and refine from real usage.",
          ].map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}
        </ol>
      </section>

      <section className="content-section section-shell">
        <div className="quote-band"><p className="eyebrow"><span />Where this grows</p><blockquote>Better discovery first. Better demand intelligence once the evidence earns it.</blockquote><p>FateDrop is building toward aggregated search interest, unmet demand and catalogue-health insight. Those tools should help an indie make better decisions without exposing an individual collector&apos;s private behaviour.</p><div className="button-row" style={{ marginTop: 28 }}><Link className="button button-secondary" href="/subscriptions#retailers">See retailer plans</Link><Link className="text-link" href="/about#future">See the wider vision <span>→</span></Link></div></div>
      </section>

      <section className="retailer-faq section-shell" id="retailer-faq">
        <div className="retailer-faq-head"><p className="eyebrow"><span />Retailer FAQ</p><h2>Straight answers before catalogue access.</h2><p>The public site should be clear about what FateDrop does and what remains the retailer&apos;s responsibility.</p></div>
        <div className="faq-list">{retailerFaq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
      </section>

      <FinalCta />
    </SiteShell>
  );
}
