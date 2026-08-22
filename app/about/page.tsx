import type { Metadata } from "next";
import Link from "next/link";
import { MarketStoryHero } from "@/components/market-story-hero";
import { FinalCta, SectionHeading, SiteShell } from "@/components/page-shell";
import { FutureExpansion } from "@/components/future-expansion";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About FateDrop | The Collector & Indie Network",
  description: "Why FateDrop exists, the principles behind the collector-to-independent-retailer bridge and the longer-term TCG network vision.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="Why FateDrop exists"
        title="A better bridge between collectors and the stores holding the stock."
        description="Collectors face fragmented stock, noisy alerts and weak price context. Independent TCG retailers can hold exactly the right product and still be hard to discover. FateDrop is being built between those two problems."
        image="/assets/home/koru-home-hero.png?v=20260822-about"
        alt="Koru overlooking the FateDrop landscape and wider collector-retailer network"
        proof={["Collector clarity", "Independent visibility", "Evidence-led signals", "One connected TCG network"]}
        focal="right"
      >
        <div className="button-row"><Link className="button button-primary" href="/join">Join the beta <span>↗</span></Link><Link className="text-link" href="#principles">See the principles <span>↓</span></Link></div>
      </MarketStoryHero>

      <section className="content-section section-shell"><div className="quote-band"><blockquote>Discovery should be useful for the collector and fair to the business holding the stock.</blockquote><p>That principle is why FateDrop sends customers to retailers instead of replacing them, why price context matters and why the signal lifecycle is designed to say only what the evidence supports.</p></div></section>

      <section className="content-section section-shell" id="principles">
        <SectionHeading eyebrow="The principles" title="A useful network before a noisy one." body="The product can grow, but these rules should stay recognisable as FateDrop expands." />
        <div className="mission-grid" style={{ marginTop: 52 }}>
          {[
            ["01", "Collector clarity", "Make stock movement, price context and the next buying step easier to understand."],
            ["02", "Independent visibility", "Help smaller retailers be found without taking away their brand, checkout or customer relationship."],
            ["03", "Evidence before urgency", "Whisper, Echo, Manifested and Vanished should never claim more certainty than the observed evidence supports."],
            ["04", "One connected network", "Search, FateFind/FateMatch, True Price, Local Radar, events and alerts should reinforce one another rather than become disconnected products."],
          ].map(([number, title, body]) => <article className="mission-card" key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="content-section section-shell split-section">
        <div className="copy-stack"><p className="eyebrow"><span />What we are proving first</p><h2>Make Pokémon UK genuinely useful before pretending FateDrop is everywhere.</h2><p>The immediate work is simple to describe even if the engineering is not: stronger retailer coverage, reliable signal intelligence, cleaner product identity, transparent True Price and a FateFind-to-FateMatch journey collectors can trust.</p><p>Events and Local Radar extend that network into the physical hobby. Retailer insight grows only when the underlying data is strong enough to support it.</p></div>
        <div className="insight-panel"><small>CURRENT PRODUCT CORE</small><div className="point-list"><div><span>01</span><p>Signals: Whisper → Echo → Manifested → Vanished</p></div><div><span>02</span><p>True Price and official RRP context</p></div><div><span>03</span><p>FateFind hunts → FateMatch results</p></div><div><span>04</span><p>Independent retailer and event discovery</p></div></div></div>
      </section>

      <FutureExpansion />

      <section className="content-section section-shell" id="roadmap">
        <SectionHeading
          eyebrow="Planned network ideas"
          title="Keep the future visible—just not in the way of the product today."
          body="These concepts remain planned rather than promised. They live here so the homepage can stay focused on what collectors and independents can understand now."
        />
        <div className="value-network-grid" style={{ marginTop: 42 }}>
          {siteConfig.roadmap.map((item, index) => (
            <article key={item.name}>
              <span>{String(index + 1).padStart(2, "0")} · {item.status.toUpperCase()}</span>
              <h3>{item.name}</h3>
              <p>Planned direction. Scope, release order and final availability remain subject to product validation.</p>
            </article>
          ))}
        </div>
      </section>

      <FinalCta />
    </SiteShell>
  );
}
