import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SectionHeading, SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Free Drops | FateDrop Community Giveaways",
  description: "Free Drops are planned FateDrop community and retailer-supported giveaways designed to reward collectors and support independent TCG businesses.",
};

const examples = ["TCG products", "Shop credit", "Event tickets", "FateDrop merchandise", "Wishlist fulfilment", "Free-delivery vouchers", "Founding-member prizes", "Retailer-sponsored products"];

export default function FreeDropsPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Community + retailer supported" title="Everybody loves a free drop." description="Free Drops will create genuine opportunities for collectors while giving participating independent businesses clearly labelled exposure and qualified visits.">
        <div className="button-row"><Link className="button button-primary" href="/join?type=collector">Join Free Drops <span>↗</span></Link><Link className="button button-secondary" href="/join?type=business">Sponsor a Drop</Link></div>
      </PageHero>
      <section className="coming-soon-banner section-shell"><span className="status-chip expansion">Coming soon</span><h2>Free Drops are coming soon. Join the founding list.</h2><p>There is no active giveaway today. A real Drop will only launch with published eligibility, prize details, closing date, privacy information, terms and a fair selection process.</p></section>
      <section className="content-section section-shell"><SectionHeading eyebrow="Possible Free Drops" title="Useful prizes. Clear rules. No casino nonsense." body="The format is designed around community rewards and retailer discovery—not paid entries, unlimited purchasable chances or transferable tokens." /><div className="drop-example-grid">{examples.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3><p>Potential future prize format · not currently active</p></article>)}</div></section>
      <section className="content-section section-shell"><div className="value-network-grid free-benefits"><article><span>Collectors</span><h3>A genuine chance to win.</h3><p>Relevant products, tickets, credit or supporter merchandise with clear entry rules.</p></article><article><span>Retailers</span><h3>Labelled exposure with intent.</h3><p>Introduce a product or shop to collectors without purchasing trust or disguising promotion.</p></article><article><span>FateDrop</span><h3>Grow the useful network.</h3><p>Attract founding members while sending more discovery back towards participating independents.</p></article></div></section>
      <section className="content-section section-shell"><div className="quote-band"><blockquote>Free should feel generous—not suspiciously complicated.</blockquote><p>No paid entry system is being built in this phase. The next step is a founding-interest list, followed by proper promotion terms when a real prize and sponsor exist.</p><div className="button-row" style={{ marginTop: 30 }}><Link className="button button-primary" href="/join?type=collector">Join the founding list <span>↗</span></Link><Link className="button button-secondary" href="/join?type=business">Become a Partner</Link></div></div></section>
    </SiteShell>
  );
}
