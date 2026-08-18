import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SectionHeading, SiteShell } from "@/components/page-shell";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "FateDrop Subscriptions | Collector & Retailer Plans",
  description: "Explore provisional FateDrop founding-member subscriptions for collectors and independent TCG retailers.",
};

function PlanGrid({ plans, role }: { plans: typeof siteConfig.collectorPlans | typeof siteConfig.retailerPlans; role: "collector" | "business" }) {
  return <div className="plan-grid">{plans.map((plan) => <article className={"plan-card" + ("featured" in plan && plan.featured ? " featured" : "")} key={plan.name}>{"featured" in plan && plan.featured ? <span className="price-badge">Founding fit</span> : null}<p>{plan.name}</p><h3>{plan.price}</h3>{"secondaryPrice" in plan && plan.secondaryPrice ? <small>{plan.secondaryPrice}</small> : <small>Provisional founding-member pricing</small>}<ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><Link href={`/join?type=${role}`}>{role === "collector" ? "Join the Collector Beta" : "Connect Your Catalogue"} <b>↗</b></Link></article>)}</div>;
}

export default function SubscriptionsPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Provisional founding-member pricing" title="A subscription model built around useful outcomes." description="Collectors can pay for deeper stock intelligence. Retailers can pay for wider catalogue distribution and demand insight. The sale still belongs to the retailer.">
        <div className="button-row"><Link className="button button-primary" href="#collectors">Collector plans <span>↓</span></Link><Link className="button button-secondary" href="#retailers">Retailer plans</Link></div>
      </PageHero>
      <section className="billing-warning section-shell" role="status"><span>Billing status</span><p>No payment collection is active. Authentication, subscription management, billing terms and payment processing must be connected before any paid plan can be purchased.</p></section>
      <section className="plan-section section-shell" id="collectors"><SectionHeading eyebrow="B2C subscriptions" title="Free discovery. Premium stock intelligence." body="FateDrop remains useful for free, while proposed paid tiers add more specific alerts, saved searches, lifecycle intelligence and collection tools." /><PlanGrid plans={siteConfig.collectorPlans} role="collector" /></section>
      <section className="plan-section section-shell" id="retailers"><SectionHeading eyebrow="B2B subscriptions" title="Connect once. Be discovered across the network." body="Retailer plans are proposed around catalogue reach, monitoring, storefronts, analytics, events and privacy-conscious demand intelligence." /><PlanGrid plans={siteConfig.retailerPlans} role="business" /></section>
      <section className="content-section section-shell"><div className="quote-band"><p className="eyebrow"><span />B2B2C</p><blockquote>The retailer keeps the checkout. FateDrop brings the search.</blockquote><p>Qualified outbound traffic is not the same as a confirmed sale. Conversion reporting will only be claimed when proper attribution exists.</p><div className="button-row" style={{ marginTop: 30 }}><Link className="button button-primary" href="/join?type=collector">Join as a collector <span>↗</span></Link><Link className="button button-secondary" href="/join?type=business">Connect your catalogue</Link></div></div></section>
    </SiteShell>
  );
}
