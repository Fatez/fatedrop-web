import type { Metadata } from "next";
import Link from "next/link";
import { MarketStoryHero } from "@/components/market-story-hero";
import { FinalCta, SectionHeading, SiteShell } from "@/components/page-shell";
import { FutureExpansion } from "@/components/future-expansion";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About FateDrop | TCG Intelligence & Fate Network",
  description: "Why FateDrop exists, how the Fate Network connects collector intent with retailer supply, and how FateFind, FateMatch, Fate Trader and signal intelligence fit together.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="Why FateDrop exists"
        title="A clearer path through a fragmented collecting market."
        description="Collectors face scattered stock, noisy alerts, weak price context and disconnected places to buy or trade. FateDrop is being built as the intelligence layer that connects those journeys without becoming the retailer or rewriting the evidence."
        image="/assets/market/about.png"
        alt="FateDrop companions overlooking a distant city and mountain landscape at sunrise"
        proof={["Collector clarity", "Fate Network discovery", "Evidence-led signals", "Connected buying and trading"]}
        focal="right"
      >
        <div className="button-row"><Link className="button button-primary" href="/join">Join the beta <span>↗</span></Link><Link className="text-link" href="#principles">Why we built FateDrop <span>↓</span></Link></div>
      </MarketStoryHero>

      <section className="content-section section-shell"><div className="quote-band"><blockquote>Discovery should be useful for the collector and fair to the people holding the stock or cards.</blockquote><p>That principle is why FateDrop sends customers to retailers instead of replacing them, why retailer payment cannot buy a better organic answer, why price context matters and why the signal lifecycle says only what the evidence supports.</p></div></section>

      <section className="content-section section-shell" id="principles">
        <SectionHeading eyebrow="The principles" title="A useful network before a noisy one." body="The product can grow, but these rules should stay recognisable as FateDrop expands." />
        <div className="mission-grid" style={{ marginTop: 52 }}>
          {[
            ["01", "Collector clarity", "Make stock movement, price context and the next buying or trading step easier to understand."],
            ["02", "Network fairness", "Help useful retailers and collector opportunities be found because the evidence supports them — not because somebody paid for a better answer."],
            ["03", "Evidence before urgency", "Whisper, Echo, Manifested and Vanished should never claim more certainty than the observed evidence supports."],
            ["04", "One connected network", "Search, FateFind, FateMatch, Fate Trader, True Price, Local Radar, events and alerts should reinforce one another rather than become disconnected products."],
          ].map(([number, title, body]) => <article className="mission-card" key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="content-section section-shell split-section">
        <div className="copy-stack"><p className="eyebrow"><span />What we are proving first</p><h2>Make Pokémon UK genuinely useful before pretending FateDrop is everywhere.</h2><p>The immediate work is simple to describe even if the engineering is not: stronger retailer coverage, reliable signal intelligence, cleaner product identity, transparent value context and collector journeys that can be understood without learning our internal architecture.</p><p>Fate Network connects retailer supply. Fate Trader extends the network to collector-to-collector trading. Events and Local Radar extend it into the physical hobby. Each layer should earn its place by being useful and evidence-backed.</p></div>
        <div className="insight-panel"><small>CURRENT PRODUCT CORE</small><div className="point-list"><div><span>01</span><p>Signals: Whisper → Echo → Manifested → Vanished</p></div><div><span>02</span><p>FateFind: compare the strongest live value now, with RRP/reference and True Price context</p></div><div><span>03</span><p>FateMatch: watch a specific product until your buying conditions qualify</p></div><div><span>04</span><p>Fate Network + Fate Trader: retailer discovery and collector trading as separate journeys</p></div></div></div>
      </section>

      <FutureExpansion />

      <section className="content-section section-shell" id="roadmap">
        <SectionHeading
          eyebrow="Planned network ideas"
          title="Keep the future visible — without cluttering the product today."
          body="Only current strategic directions belong here. Old experimental names and abandoned concepts should not compete with the tools collectors are actually learning to use."
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
