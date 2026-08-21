import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta, PageHero, SectionHeading, SiteShell } from "@/components/page-shell";
import { FutureExpansion } from "@/components/future-expansion";

export const metadata: Metadata = {
  title: "About FateDrop | The Collector & Indie Network",
  description: "Why FateDrop exists, the principles behind the collector-to-independent-retailer bridge and the longer-term TCG network vision.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Why FateDrop exists"
        title="Build the bridge between collectors and independent TCG retail."
        description="Collectors are surrounded by fragmented stock, noisy alerts and weak price context. Independent retailers can hold exactly the right product and still be hard to discover. FateDrop is being built between those two problems."
      >
        <div className="button-row"><Link className="button button-primary" href="/join">Join the beta <span>↗</span></Link><Link className="text-link" href="#principles">See the principles <span>↓</span></Link></div>
      </PageHero>

      <section className="content-section section-shell"><div className="quote-band"><blockquote>Discovery should be useful for the collector and fair to the business holding the stock.</blockquote><p>That principle is why FateDrop sends customers to retailers instead of replacing them, why price context matters and why the signal lifecycle is designed to say only what the evidence supports.</p></div></section>

      <section className="content-section section-shell" id="principles">
        <SectionHeading eyebrow="The principles" title="A useful network before a noisy one." body="The product can grow, but these rules should stay recognisable as FateDrop expands." />
        <div className="mission-grid" style={{ marginTop: 52 }}>
          {[
            ["01", "Collector clarity", "Make stock movement, price context and the next buying step easier to understand."],
            ["02", "Independent visibility", "Help smaller retailers be found without taking away their brand, checkout or customer relationship."],
            ["03", "Evidence before urgency", "Whisper, Echo, Manifested and Vanished should never claim more certainty than the observed evidence supports."],
            ["04", "One connected network", "Search, FateMatch, True Price, Local Radar, events and alerts should reinforce one another rather than become disconnected products."],
          ].map(([number, title, body]) => <article className="mission-card" key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="content-section section-shell split-section">
        <div className="copy-stack"><p className="eyebrow"><span />What we are proving first</p><h2>Make Pokémon UK genuinely useful before pretending FateDrop is everywhere.</h2><p>The immediate work is simple to describe even if the engineering is not: stronger retailer coverage, reliable signal intelligence, cleaner product identity, transparent True Price and a FateMatch journey collectors can trust.</p><p>Events and Local Radar extend that network into the physical hobby. Retailer insight grows only when the underlying data is strong enough to support it.</p></div>
        <div className="insight-panel"><small>CURRENT PRODUCT CORE</small><div className="point-list"><div><span>01</span><p>Signals: Whisper → Echo → Manifested → Vanished</p></div><div><span>02</span><p>True Price and official RRP context</p></div><div><span>03</span><p>FateMatch across participating retailers</p></div><div><span>04</span><p>Independent retailer and event discovery</p></div></div></div>
      </section>

      <FutureExpansion />
      <FinalCta />
    </SiteShell>
  );
}
