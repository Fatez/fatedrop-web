import type { Metadata } from "next";
import Link from "next/link";
import { FateDropDemoSection } from "@/components/koru-final-sections";
import { PageHero, SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Try FateDrop | Interactive Product Demo",
  description: "Explore FateDrop's collector journey across search, price context, signals, retailer discovery and account tools before joining the beta.",
};

export default function DemoPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Try FateDrop"
        title="See the intelligence before you subscribe."
        description="The interactive demo shows how FateDrop connects network search, price context, alerts and retailer discovery into one collector journey. It is a product preview, not a fake checkout."
      >
        <div className="button-row">
          <Link className="button button-primary" href="#interactive-demo">Open the demo <span>↓</span></Link>
          <Link className="button button-secondary" href="/subscriptions#collectors">See membership</Link>
        </div>
      </PageHero>

      <FateDropDemoSection />

      <section className="content-section section-shell">
        <div className="quote-band">
          <p className="eyebrow"><span />What comes next</p>
          <blockquote>Keep the demo focused on what FateDrop can explain today.</blockquote>
          <p>The wider roadmap lives separately so the product preview stays clear. Future network ideas, multi-TCG direction and longer-term tools remain planned until they are genuinely ready.</p>
          <div className="button-row" style={{ marginTop: 28 }}><Link className="button button-secondary" href="/about#future">See the future of FateDrop</Link><Link className="text-link" href="/collectors">Explore collector tools <span>→</span></Link></div>
        </div>
      </section>
    </SiteShell>
  );
}
