import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta, PageHero, SectionHeading, SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "About FateDrop",
  description: "FateDrop exists to make collecting easier while helping independent UK TCG businesses become more visible.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Why FateDrop exists" title="A connected network, built independent-first." description="FateDrop is a UK TCG founding-beta discovery network connecting collectors with participating catalogues, evidence-backed stock signals, independent retailers, local shops, events and vendors.">
        <div className="button-row"><Link className="button button-primary" href="/join">Join the beta <span>↗</span></Link></div>
      </PageHero>
      <section className="content-section section-shell"><div className="quote-band"><blockquote>Discovery should be useful for the collector and fair to the business holding the stock.</blockquote><p>That simple idea shapes every part of FateDrop—from direct retailer links to local event visibility.</p></div></section>
      <section className="content-section section-shell">
        <SectionHeading eyebrow="Our principles" title="Build the network we would want to use." body="FateDrop is being shaped around practical value, honest claims and a healthier relationship between technology and independent trade." />
        <div className="mission-grid" style={{ marginTop: 60 }}>
          {[
            ["01", "Collector clarity", "Make products, availability, independents and events easier to understand without burying the useful signal."],
            ["02", "Independent visibility", "Help smaller businesses be found while preserving their own identity, website and checkout."],
            ["03", "Local connection", "Treat card shows, vendors and local shops as part of the same discovery journey—not an afterthought."],
            ["04", "Earned trust", "Label demos, roadmap ideas and changing beta figures honestly. Credibility is built in the small print too."],
          ].map(([number, title, body]) => <article className="mission-card" key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
