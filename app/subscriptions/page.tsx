import type { Metadata } from "next";
import Link from "next/link";
import { StartMembershipButton } from "@/components/membership-actions";
import { MarketStoryHero } from "@/components/market-story-hero";
import { SectionHeading, SiteShell } from "@/components/page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { hasPremiumAccess, TRIAL_DAYS } from "@/lib/membership";
import type { MembershipRecord } from "@/lib/account-storage";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "FateDrop Membership | Collector & Retailer Plans",
  description: "Explore FateDrop collector membership, founding-beta trials and independent-retailer plan direction.",
};

export const dynamic = "force-dynamic";

type CollectorPlan = (typeof siteConfig.collectorPlans)[number];
type RetailerPlan = (typeof siteConfig.retailerPlans)[number];

function CollectorPlanGrid({ plans, signedIn, membership }: { plans: readonly CollectorPlan[]; signedIn: boolean; membership: MembershipRecord | null }) {
  return <div className="plan-grid">{plans.map((plan) => {
    const tier = plan.name === "FateDrop Plus" ? "plus" : plan.name === "FateDrop Pro" ? "pro" : null;
    const currentPremiumPlan = Boolean(tier && membership && hasPremiumAccess(membership) && membership.tier === tier);
    const features = plan.name === "FateDrop Pro"
      ? ["Everything in the current Premium capability foundation", "Final Plus / Pro feature split is still under founding-beta review", "Future advanced tools unlock only when they are genuinely released"]
      : plan.features;
    return <article className={`plan-card${"featured" in plan && plan.featured ? " featured" : ""}`} key={plan.name}>{"featured" in plan && plan.featured ? <span className="price-badge">Best starting point</span> : null}<p>{plan.name}</p><h3>{plan.price}</h3><small>{tier ? `${TRIAL_DAYS}-day free trial before recurring billing when Stripe is live` : "Stay in the network for free"}</small><ul>{features.map((feature) => <li key={feature}>{feature}</li>)}</ul>{tier ? currentPremiumPlan ? <Link href="/account">Current membership · manage <b>↗</b></Link> : signedIn && membership && hasPremiumAccess(membership) ? <Link href="/account">Manage current Premium plan <b>↗</b></Link> : signedIn ? <StartMembershipButton tier={tier} label={`Start ${plan.name.replace("FateDrop ", "")} free trial`} /> : <Link href="/account/register?next=%2Fsubscriptions%23collectors">Create FateDrop ID to start <b>↗</b></Link> : signedIn ? <Link href="/account">Your free FateDrop ID <b>↗</b></Link> : <Link href="/account/register">Create your FateDrop ID <b>↗</b></Link>}</article>;
  })}</div>;
}

function RetailerPlanGrid({ plans }: { plans: readonly RetailerPlan[] }) {
  return <div className="plan-grid">{plans.map((plan) => <article className={`plan-card${"featured" in plan && plan.featured ? " featured" : ""}`} key={plan.name}>{"featured" in plan && plan.featured ? <span className="price-badge">Founding fit</span> : null}<p>{plan.name}</p><h3>{plan.price}</h3>{"secondaryPrice" in plan && plan.secondaryPrice ? <small>{plan.secondaryPrice}</small> : <small>Retailer billing remains founding-beta onboarding</small>}<ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><Link href="/join?type=business">Connect your catalogue <b>↗</b></Link></article>)}</div>;
}

export default async function SubscriptionsPage() {
  let snapshot: Awaited<ReturnType<typeof getCurrentSnapshot>> = null;
  try { snapshot = await getCurrentSnapshot(); } catch { snapshot = null; }
  const signedIn = Boolean(snapshot);
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PLUS && process.env.STRIPE_PRICE_PRO && process.env.STRIPE_WEBHOOK_SECRET);

  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="One FateDrop ID across the network"
        title="Start free. Add signal depth when you need it."
        description="Your FateDrop ID carries the same collector identity and entitlement foundation across the website, app and Premium Discord as each integration is verified. Membership should unlock useful depth, not split the product into three unrelated accounts."
        image="/assets/fatedrop-header.png?v=20260822-membership"
        alt="FateDrop signal artwork representing one connected membership across the network"
        proof={["One FateDrop ID", "Free discovery", "Plus from £4.99", "Cross-platform foundation"]}
        focal="right"
      >
        <div className="button-row"><Link className="button button-primary" href="#collectors">Collector membership <span>↓</span></Link><Link className="button button-secondary" href="/account">My FateDrop ID</Link></div>
      </MarketStoryHero>
      <section className={`billing-warning section-shell${stripeReady ? " billing-ready" : ""}`} role="status"><span>{stripeReady ? "TRIAL READY" : "BILLING FOUNDATION"}</span><p>{stripeReady ? `${TRIAL_DAYS}-day collector trials are connected to Stripe on this deployment. Membership events update the website entitlement record used by account and Discord foundations.` : `The ${TRIAL_DAYS}-day trial, checkout, customer portal and subscription webhook flow are built. Checkout remains disabled until the Stripe account, prices and webhook secret are added.`}</p></section>
      <section className="membership-flow section-shell"><div><span>01</span><b>Create FateDrop ID</b><small>Your permanent network identity.</small></div><i>→</i><div><span>02</span><b>Start free trial</b><small>When billing is connected.</small></div><i>→</i><div><span>03</span><b>Entitlement activates</b><small>Shared network-access foundation.</small></div></section>
      <section className="plan-section section-shell" id="collectors"><SectionHeading eyebrow="Collector membership" title="Free discovery. Premium signal depth." body={`Every collector starts with a FateDrop ID and permanent member-since history. Plus and Pro sit on the same Premium entitlement foundation today; the final higher-tier feature split is still being reviewed during the founding beta.`} /><CollectorPlanGrid plans={siteConfig.collectorPlans} signedIn={signedIn} membership={snapshot?.membership ?? null} /></section>
      <section className="plan-section section-shell" id="retailers"><SectionHeading eyebrow="Retailer membership" title="Connect once. Be discovered across the network." body="Retailer plans remain a guided founding-beta direction while catalogue integrations, analytics and attribution mature. The retailer still owns the customer and checkout." /><RetailerPlanGrid plans={siteConfig.retailerPlans} /></section>
      <section className="content-section section-shell"><div className="quote-band"><p className="eyebrow"><span />One FateDrop identity</p><blockquote>One identity. One entitlement model. Cross-platform by design.</blockquote><p>FateDrop is structured around one entitlement state rather than three unrelated memberships. Website, app and Discord should consume that shared state only as those integrations are individually verified.</p><div className="button-row" style={{ marginTop: 30 }}><Link className="button button-primary" href="/account/register">Create your FateDrop ID <span>↗</span></Link><Link className="button button-secondary" href="/account">Open my profile</Link></div></div></section>
    </SiteShell>
  );
}
