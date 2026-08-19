import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta, PageHero, SectionHeading, SiteShell } from "@/components/page-shell";
import { StockLifecycle } from "@/components/stock-lifecycle";

export const metadata: Metadata = {
  title: "Trust & Stock Signals | FateDrop",
  description: "How FateDrop separates verification, measured evidence, public Echo/Manifested/Vanished signals and planned price guidance.",
};

export default function TrustPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Trust by design" title="Evidence—not manufactured confidence." description="FateDrop separates business verification from measured evidence, supports stock labels with observed transitions and keeps promotions clearly labelled.">
        <div className="button-row"><Link className="button button-primary" href="/join?type=collector">Join the Collector Beta <span>↗</span></Link><Link className="text-link" href="#stock-lifecycle">See the stock lifecycle <span>↓</span></Link></div>
      </PageHero>

      <section className="content-section section-shell">
        <SectionHeading eyebrow="Three trust layers" title="Confidence should be earned in public." body="A verified business is not automatically a top performer, a sponsored placement is not a recommendation and missing evidence never becomes an invented score." />
        <div className="trust-grid standalone">
          <article><span>Evidence model · foundation</span><h3>Verification and performance stay separate.</h3><p>FateScore is a planned evidence-led retailer trust model, not a live public ranking. Until the scoring inputs and publication policy are implemented and validated, FateDrop should show the evidence it actually has rather than invent a score.</p></article>
          <article><span>Drop Pulse · foundation</span><h3>Activity needs observed movement.</h3><p>Drop Pulse is an evidence-context layer, not a lifecycle state. Labels such as high activity, just listed, recently restocked or price dropped need timestamps or catalogue history before they are shown.</p></article>
          <article><span>FateFair · planned</span><h3>Price guidance needs context.</h3><p>Future FateFair guidance is intended to consider comparable offers, condition, grade, delivery, history, freshness and sample size. It is not presented as live guidance today.</p></article>
        </div>
      </section>

      <section className="content-section section-shell" id="stock-lifecycle">
        <div className="copy-stack lifecycle-page-copy"><p className="eyebrow"><span />From early movement to confirmed stock</p><h2>Echo when something is moving. Manifested when it is real.</h2><p>Echo is the public early-intelligence state for meaningful precursor movement such as catalogue, metadata, queue or security-condition changes. It does not guarantee that stock is imminent. Manifested marks confirmed meaningful availability or restock evidence, while Vanished records previously confirmed availability being lost. Whisper remains internal engine terminology.</p><span className="status-chip validated">Evidence-backed beta lifecycle</span></div>
        <StockLifecycle />
      </section>

      <section className="content-section section-shell">
        <div className="quote-band"><p className="eyebrow"><span />No pay-to-trust</p><blockquote>A retailer cannot purchase a stronger trust result.</blockquote><p>Commercial placements must be clearly labelled. Outbound clicks are referrals—not confirmed sales unless proper conversion attribution exists.</p></div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
