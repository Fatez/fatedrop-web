import type { Metadata } from "next";
import Link from "next/link";
import { MarketStoryHero } from "@/components/market-story-hero";
import { FinalCta, SectionHeading, SiteShell } from "@/components/page-shell";
import { StockLifecycle } from "@/components/stock-lifecycle";

export const metadata: Metadata = {
  title: "Trust, Signals & True Price | FateDrop",
  description: "See exactly what Whisper, Echo, Manifested and Vanished mean, how FateDrop handles price context and why commercial placement cannot buy trust.",
};

export default function TrustPage() {
  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="Trust by design"
        title="Evidence first. Urgency only when it’s earned."
        description="FateDrop separates early movement from confirmed stock, keeps price context transparent and makes the rules behind every signal clear enough to question."
        image="/assets/home/koru-home-section.png?v=20260822-trust"
        alt="Koru in the FateDrop landscape representing trust, evidence and the signal network"
        proof={["Four signal states", "Evidence before urgency", "True Price transparency", "Trust cannot be bought"]}
        focal="right"
      >
        <div className="button-row"><Link className="button button-primary" href="#stock-lifecycle">See the signal lifecycle <span>↓</span></Link><Link className="button button-secondary" href="/collectors">Explore collector tools</Link></div>
      </MarketStoryHero>

      <section className="content-section section-shell" id="stock-lifecycle">
        <SectionHeading
          eyebrow="The final FateDrop lifecycle"
          title="Whisper. Echo. Manifested. Vanished."
          body="These four words are the network language. They should keep the same meaning on the website, app, Discord and push notifications."
        />
        <div style={{ marginTop: 42 }}><StockLifecycle /></div>
      </section>

      <section className="content-section section-shell split-section">
        <div className="copy-stack">
          <p className="eyebrow"><span />What the stages mean</p>
          <h2>Early movement is useful. Confirmation is different.</h2>
          <p><strong>Whisper</strong> is the pre-event warning: catalogue additions, product movement or other changes suggest something may be coming.</p>
          <p><strong>Echo</strong> is the confirmation layer around traffic, queues, security or access conditions: activity is real enough to get ready, but stock is not yet confirmed.</p>
          <p><strong>Manifested</strong> means confirmed purchasable stock is live. <strong>Vanished</strong> means that previously confirmed availability is gone.</p>
        </div>
        <div className="insight-panel">
          <small>THE RULE</small>
          <div className="quote-band" style={{ margin: 0 }}><blockquote>No stage should promise more than the evidence supports.</blockquote><p>Drop Pulse and other context can describe observed movement, but they do not replace the four lifecycle states.</p></div>
        </div>
      </section>

      <section className="content-section section-shell">
        <SectionHeading
          eyebrow="True Price"
          title="A price without context can be a bad signal too."
          body="FateDrop separates the observed offer from the context used to judge it. Unknown information stays unknown rather than being silently guessed."
        />
        <div className="trust-grid standalone">
          <article><span>Official RRP</span><h3>Start with a real reference point.</h3><p>Where a reliable official RRP is available, FateDrop shows it as the comparison basis rather than inventing a market benchmark.</p></article>
          <article><span>Known delivered cost</span><h3>Include mandatory delivery when it is known.</h3><p>True Price can combine item price with known mandatory delivery. If delivery cannot be established, it remains visibly unknown.</p></article>
          <article><span>RRP difference</span><h3>Show the £ and percentage context.</h3><p>Collectors can see how far an observed offer sits above or below RRP instead of being told that every in-stock listing is automatically a good buy.</p></article>
        </div>
      </section>

      <section className="content-section section-shell">
        <div className="quote-band">
          <p className="eyebrow"><span />FateScore · planned</p>
          <blockquote>Trust should be earned by evidence, never bought.</blockquote>
          <p>FateScore is a planned evidence-led retailer trust model. It is not a live final score today, and any future model must remain explainable, evidence-led and separate from commercial placement.</p>
          <p>A retailer cannot purchase a stronger verification or trust result. Sponsorship and promotion must stay clearly labelled and separate from stock evidence.</p>
        </div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
