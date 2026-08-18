import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta, PageHero, SectionHeading, SiteShell } from "@/components/page-shell";
import { StockLifecycle } from "@/components/stock-lifecycle";

export const metadata: Metadata = {
  title: "Trust, FateScore & Stock Signals | FateDrop",
  description: "How FateDrop separates verification, measured evidence, stock transitions and future price guidance.",
};

export default function TrustPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Trust by design" title="Evidence—not manufactured confidence." description="FateDrop separates business verification from measured performance, supports stock labels with observed transitions and keeps promotions clearly labelled.">
        <div className="button-row"><Link className="button button-primary" href="/join?type=collector">Join the Collector Beta <span>↗</span></Link><Link className="text-link" href="#stock-lifecycle">See the stock lifecycle <span>↓</span></Link></div>
      </PageHero>

      <section className="content-section section-shell">
        <SectionHeading eyebrow="Three trust layers" title="Confidence should be earned in public." body="A verified business is not automatically a top performer, a sponsored placement is not a recommendation and missing evidence never becomes an invented score." />
        <div className="trust-grid standalone">
          <article><span>FateScore · validated beta model</span><h3>Verification and performance stay separate.</h3><p>FateScore is an evidence-led retailer trust model. Where there is not enough reliable evidence, the honest result is “Not enough data”.</p></article>
          <article><span>Drop Pulse · validated beta</span><h3>A label needs an observed transition.</h3><p>Labels such as just listed, recently restocked or price dropped must be supported by timestamps or catalogue history.</p></article>
          <article><span>FateFair · active expansion</span><h3>Price guidance needs context.</h3><p>Future guidance is designed to consider comparable offers, condition, grade, delivery, history, freshness and sample size.</p></article>
        </div>
      </section>

      <section className="content-section section-shell" id="stock-lifecycle">
        <div className="copy-stack lifecycle-page-copy"><p className="eyebrow"><span />From first signal to return</p><h2>Detect earlier catalogue signals—not only conventional in-stock events.</h2><p>Whisper may provide useful early context before a conventional public in-stock event. Signal timing and completeness depend on the catalogue data each retailer makes available; FateDrop does not claim to be guaranteed first or instant everywhere.</p><span className="status-chip validated">Evidence-backed beta lifecycle</span></div>
        <StockLifecycle />
      </section>

      <section className="content-section section-shell">
        <div className="quote-band"><p className="eyebrow"><span />No pay-to-trust</p><blockquote>A retailer cannot purchase a stronger trust score.</blockquote><p>Commercial placements must be clearly labelled. Outbound clicks are referrals—not confirmed sales unless proper conversion attribution exists.</p></div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
