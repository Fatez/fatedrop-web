import type { Metadata } from "next";
import Link from "next/link";
import { MarketStoryHero } from "@/components/market-story-hero";
import { FinalCta, SectionHeading, SiteShell } from "@/components/page-shell";

const networkLayers = [
  ["Connect your catalogue", "FateDrop agrees a practical data route with your business so approved products can enter the Fate Network with the right retailer identity, product mapping and availability evidence."],
  ["Meet collector intent", "When collectors search, use FateFind or trigger a FateMatch, your genuine stock can become part of the answer when it is relevant. The network creates discovery at the moment demand exists."],
  ["Keep the customer journey", "FateDrop sends the collector to your product page. Your website remains the checkout, and you keep your brand, payments, fulfilment, returns and customer relationship."],
] as const;

const retailerBenefits = [
  ["01", "Relevant discovery", "Appear when collectors are already searching for products your connected catalogue can genuinely offer instead of relying only on social reach or somebody already knowing your store exists."],
  ["02", "Search + FateFind exposure", "Your stock can appear in normal Search and in FateFind comparisons when product identity, availability and comparison evidence make the offer relevant."],
  ["03", "FateMatch handoffs", "When your live offer satisfies a collector's personal FateMatch conditions, FateDrop can route that high-intent collector directly to your product page."],
  ["04", "Your checkout stays yours", "FateDrop is not trying to become the merchant of record. You keep your website, payment flow, fulfilment, returns policy and customer relationship."],
  ["05", "Proof of network value", "The Indie workspace can measure product appearances, FateFind appearances, best-value wins, storefront views, outbound retailer visits and FateMatch handoffs without pretending every click became a sale."],
  ["06", "Aggregated demand insight", "As evidence grows, privacy-safe demand signals can show what collectors are looking for and where connected catalogue stock may be missing without exposing individual users."],
] as const;

const proofMetrics = [
  ["Product appearances", "How often your connected products were surfaced through FateDrop discovery."],
  ["FateFind appearances", "How often an eligible offer entered a live value comparison."],
  ["Best Value wins", "How often the visible FateFind comparison identified your eligible offer as the strongest-value option."],
  ["Retailer visits sent", "Measured outbound handoffs from FateDrop to your website."],
  ["FateMatch handoffs", "High-intent retailer visits created when your offer satisfied a user's watch conditions."],
  ["Demand gaps", "Aggregated product demand that can be highlighted only when catalogue/product identity evidence is strong enough to support the comparison."],
] as const;

const retailerFaq = [
  ["What is the Fate Network?", "It is the connected retailer-and-collector layer inside FateDrop. Retailer stock enters the network; collector searches, FateFind comparisons and FateMatch intent can discover that stock; FateDrop then sends the collector to the retailer."],
  ["Does FateDrop sell my products?", "No. FateDrop is the discovery and intelligence layer. The retailer remains the seller and merchant of record."],
  ["Where does the customer check out?", "On your website. FateDrop links the collector to your product page so final stock, price, delivery and fulfilment can be confirmed directly with you."],
  ["How can a catalogue connect?", "Shopify, WooCommerce, feeds, APIs, CSV, sitemaps or a guided manual route can be assessed during founding-beta onboarding. The exact method depends on the evidence your store can provide reliably."],
  ["What about singles?", "The Fate Network is designed to support more than headline sealed drops. Where a retailer can expose reliable singles catalogue, identity, condition and availability data, those listings can become part of the connected discovery model as coverage develops."],
  ["Can I review my storefront before it is public?", "Yes. Retailer identity and catalogue presentation should be reviewed before approved products become discoverable."],
  ["Can paying improve trust or ranking?", "No. A retailer subscription pays for catalogue connection and business tools. It cannot buy stronger verification, a better RRP verdict, alert priority or organic FateFind ranking."],
  ["Does FateDrop claim it generated my sales?", "Not from a click alone. FateDrop can truthfully measure visibility and retailer handoffs. Verified revenue attribution would only be shown later where the retailer deliberately provides suitable conversion evidence."],
] as const;

export const metadata: Metadata = {
  title: "Fate Network for TCG Retailers | FateDrop",
  description: "Connect your TCG catalogue to the Fate Network, reach collectors already searching for relevant stock, measure qualified traffic and keep your own website and checkout.",
};

export default function BusinessesPage() {
  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="Fate Network · For retailers"
        title="Put your stock where collectors are already looking."
        description="The Fate Network connects retailer supply with real collector intent. Connect your catalogue so relevant stock can be discovered through Search, FateFind and FateMatch while your business keeps the transaction, the customer and the checkout."
        image="/assets/market/retailers.png"
        alt="FateDrop retailer artwork showing an independent trading-card store"
        proof={["Connect genuine stock", "Reach active collector demand", "Measure FateDrop traffic", "Keep your checkout"]}
      >
        <div className="button-row"><Link className="button button-primary" href="/join?type=business">Join the Fate Network <span>↗</span></Link><Link className="text-link" href="#what-is-the-network">See how the network works <span>↓</span></Link></div>
      </MarketStoryHero>

      <section className="content-section section-shell" id="what-is-the-network">
        <SectionHeading
          eyebrow="What joining means"
          title="Your catalogue becomes part of a connected discovery network."
          body="A smaller retailer should not need national advertising reach to be useful to a collector. If you genuinely have the product, FateDrop's job is to understand that stock, connect it with relevant collector intent and make the route into your store easier."
        />
        <div className="value-network-grid" style={{ marginTop: 42 }}>
          {networkLayers.map(([title, body]) => <article key={title}><span>FATE NETWORK</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="content-section section-shell split-section" id="how-it-works">
        <div className="copy-stack">
          <p className="eyebrow"><span />The retailer bridge</p>
          <h2>Not a marketplace. A route from demand into your store.</h2>
          <p>Collectors are already looking for products, comparing value and waiting for the right buying conditions. The Fate Network lets connected retailers participate in those moments without handing the transaction to FateDrop.</p>
          <strong className="retailer-promise">Your products. Your prices. Your website. Your checkout.</strong>
          <p>FateDrop can surface evidence-backed availability and value context, then the collector continues to your existing product page to buy. Your store remains visible throughout the journey instead of becoming an anonymous line in a price table.</p>
        </div>
        <div className="insight-panel retailer-network-panel">
          <small>YOUR STOCK → FATE NETWORK → COLLECTOR INTENT</small>
          <div className="retailer-network-flow" aria-label="Retailer catalogue through the Fate Network to a collector"><span>Catalogue</span><i /><span>Fate Network</span><i /><span>Collector</span><i /><span>Your checkout</span></div>
          <div className="search-journey">
            <div className="search-query">Collector searches, compares or waits</div>
            <div className="journey-arrow" />
            <div className="journey-result"><span className="journey-thumb" /><div><b>Your relevant offer can become discoverable</b><small>Retailer identity, stock, price and evidence remain attached</small></div><span>Matched</span></div>
            <div className="journey-arrow" />
            <div className="journey-store"><small>DIRECT RETAILER JOURNEY</small><strong>Your product page. Your customer.</strong><p>Search can find it. FateFind can compare it. FateMatch can hand over a qualifying buyer.</p></div>
          </div>
        </div>
      </section>

      <section className="content-section section-shell">
        <SectionHeading
          eyebrow="Why the network matters for smaller stores"
          title="Good stock should not be invisible because your audience is smaller."
          body="A specialist or independent TCG store may have useful inventory without the search presence, marketing budget or social following of a national retailer. FateDrop can help close that discovery gap by connecting catalogue evidence to collectors who are already looking for the same products."
        />
        <div className="feature-cards">
          {retailerBenefits.map(([number, title, body]) => <article className="mini-feature" key={title}><div className="mini-feature-top"><span>{number}</span></div><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="content-section section-shell split-section">
        <div className="copy-stack">
          <p className="eyebrow"><span />A simple example</p>
          <h2>A deep specialist catalogue can become a reason collectors find you.</h2>
          <p>Imagine a smaller TCG business with a strong singles catalogue but a limited national online presence. A collector elsewhere in the UK may never know that store has the exact card they need.</p>
          <p>When reliable catalogue, product identity, condition and availability evidence is connected, the Fate Network can create that missing route: the collector looks for the item, FateDrop finds the relevant listing, and the collector reaches the retailer directly.</p>
          <div className="point-list">
            <div><span>01</span><p>Your catalogue exposes a genuine listing with enough evidence to identify it correctly.</p></div>
            <div><span>02</span><p>A collector searches for that product or creates relevant intent inside FateDrop.</p></div>
            <div><span>03</span><p>The Fate Network can make your listing discoverable when it is a legitimate match.</p></div>
            <div><span>04</span><p>FateDrop records the handoff and sends the collector to your store to complete the transaction.</p></div>
          </div>
        </div>
        <div className="insight-panel collector-radar-panel">
          <small>SMALLER REACH ≠ SMALLER OPPORTUNITY</small>
          <div className="collector-discovery-rail" aria-label="Specialist catalogue discovery journey"><span>Your catalogue</span><i /><span>Product match</span><i /><span>Collector intent</span><i /><span>Store visit</span></div>
          <div className="search-journey">
            <div className="search-query">⌕ Collector searches for a specific card or product</div>
            <div className="journey-result"><span className="journey-thumb" /><div><b>Specialist retailer listing matched</b><small>Only where catalogue and identity evidence supports it</small></div><span>Found</span></div>
            <div className="journey-arrow" />
            <div className="journey-store"><small>FATEDROP HANDOFF</small><strong>Traffic goes to your store.</strong><p>You keep the sale journey; FateDrop can measure that it created the referral.</p></div>
          </div>
        </div>
      </section>

      <section className="content-section section-shell" id="proof">
        <SectionHeading
          eyebrow="Prove the value first"
          title="The retailer dashboard should show what FateDrop actually did for you."
          body="The founding-retailer strategy is simple: connect good businesses, create useful collector traffic and measure it honestly. Instead of asking a retailer to believe a sales pitch, FateDrop can show the visibility and high-intent handoffs the network has already created."
        />
        <div className="value-network-grid" style={{ marginTop: 42 }}>
          {proofMetrics.map(([title, body]) => <article key={title}><span>MEASURABLE PROOF</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="content-section section-shell">
        <div className="quote-band">
          <p className="eyebrow"><span />Commercial trust</p>
          <blockquote>Retailers pay for tools — not for a better answer.</blockquote>
          <p>FateDrop Indie can fund catalogue connection, storefront control, analytics, demand insight and other business capabilities. It cannot buy stronger verification, a better RRP verdict, alert priority or organic FateFind placement. Collector trust is more valuable to the network than sponsored manipulation.</p>
          <div className="button-row" style={{ marginTop: 28 }}><Link className="button button-secondary" href="/collectors">See the collector side</Link><Link className="text-link" href="/trust">Read the trust model <span>→</span></Link></div>
        </div>
      </section>

      <section className="onboarding-section section-shell" id="onboarding">
        <div className="onboarding-copy"><p className="eyebrow"><span />Founding Fate Network retailers</p><h2>Connect carefully. Prove the value. Grow from real usage.</h2><p>Different businesses expose catalogue data in different ways. FateDrop agrees the safest practical route with the retailer, verifies the presentation and then lets real collector behaviour show where the network creates value.</p><Link className="button button-primary" href="/join?type=business">Start a retailer enquiry <span>↗</span></Link></div>
        <ol className="onboarding-steps">
          {[
            "Tell FateDrop about your business, website and the stock or catalogue you want to connect.",
            "Verify the retailer and agree the safest reliable connection method.",
            "Map approved products into the Fate Network and review how the store is presented.",
            "Measure real discovery, FateFind exposure, FateMatch handoffs and outbound retailer traffic.",
          ].map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}
        </ol>
      </section>

      <section className="retailer-faq section-shell" id="retailer-faq">
        <div className="retailer-faq-head"><p className="eyebrow"><span />Fate Network retailer FAQ</p><h2>Straight answers before catalogue access.</h2><p>FateDrop should be clear about what enters the network, what the retailer keeps and what our analytics can honestly prove.</p></div>
        <div className="faq-list">{retailerFaq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="content-section section-shell">
        <div className="quote-band"><p className="eyebrow"><span />Where this grows</p><blockquote>More connected supply makes the collector tools better. More collector intent makes the retailer network more valuable.</blockquote><p>That is the network effect FateDrop is designed around: better catalogue coverage improves Search, FateFind and FateMatch; stronger collector usage creates more qualified discovery for connected retailers; measured results make it easier for more good stores to justify joining.</p><div className="button-row" style={{ marginTop: 28 }}><Link className="button button-secondary" href="/subscriptions#retailers">See retailer membership</Link><Link className="text-link" href="/about#future">See the wider vision <span>→</span></Link></div></div>
      </section>

      <FinalCta />
    </SiteShell>
  );
}
