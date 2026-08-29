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
  title: "FateDrop Membership | Collector & Retailer Access",
  description: "Explore FateDrop Plus for collectors and founding Fate Network retailer access during beta.",
};

export const dynamic = "force-dynamic";

type CollectorPlan = (typeof siteConfig.collectorPlans)[number];
type RetailerPlan = (typeof siteConfig.retailerPlans)[number];

function CollectorPlanGrid({ plans, signedIn, membership }: { plans: readonly CollectorPlan[]; signedIn: boolean; membership: MembershipRecord | null }) {
  return <div className="plan-grid">{plans.map((plan) => {
    const paid = plan.name === "FateDrop Plus";
    const currentPremiumPlan = Boolean(paid && membership && hasPremiumAccess(membership));
    return <article className={`plan-card${"featured" in plan && plan.featured ? " featured" : ""}`} key={plan.name}>{"featured" in plan && plan.featured ? <span className="price-badge">Full FateDrop experience</span> : null}<p>{plan.name}</p><h3>{plan.price}</h3><small>{paid ? `${TRIAL_DAYS}-day free trial before recurring billing when Stripe is live` : "Stay in the network for free"}</small><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>{paid ? currentPremiumPlan ? <Link href="/account">Current membership · manage <b>↗</b></Link> : signedIn ? <StartMembershipButton tier="plus" label="Start FateDrop Plus free trial" /> : <Link href="/account/register?next=%2Fsubscriptions%23collectors">Create FateDrop ID to start <b>↗</b></Link> : signedIn ? <Link href="/account">Your free FateDrop ID <b>↗</b></Link> : <Link href="/account/register">Create your FateDrop ID <b>↗</b></Link>}</article>;
  })}</div>;
}

function RetailerPlanGrid({ plans }: { plans: readonly RetailerPlan[] }) {
  return <div className="plan-grid">{plans.map((plan) => <article className={`plan-card${"featured" in plan && plan.featured ? " featured" : ""}`} key={plan.name}>{"featured" in plan && plan.featured ? <span className="price-badge">Founding beta access</span> : null}<p>{plan.name}</p><h3>{plan.price}</h3>{"secondaryPrice" in plan && plan.secondaryPrice ? <small>{plan.secondaryPrice}</small> : <small>Organic retailer discovery remains free</small>}<ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><Link href="/join?type=business">Connect your catalogue <b>↗</b></Link></article>)}</div>;
}

export default async function SubscriptionsPage() {
  let snapshot: Awaited<ReturnType<typeof getCurrentSnapshot>> = null;
  try { snapshot = await getCurrentSnapshot(); } catch { snapshot = null; }
  const signedIn = Boolean(snapshot);
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PLUS && process.env.STRIPE_WEBHOOK_SECRET);

  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="One FateDrop ID across the network"
        title="Start free. Unlock the full signal when you need it."
        description="Collectors get one simple upgrade: FateDrop Plus. The same FateDrop ID carries profile, membership and eligible access across the website, app and connected Discord — no separate app tier and no duplicate subscription identity."
        image="/assets/membership/fatedrop-balance-membership.webp?v=20260829"
        alt="FateDrop violet and gold crystal companions balancing collector cards"
        proof={["One FateDrop ID", "Free discovery", "One Plus tier", "App + Web + Discord entitlement"]}
        focal="center"
      >
        <div className="button-row"><Link className="button button-primary" href="#collectors">Collector membership <span>↓</span></Link><Link className="button button-secondary" href="#retailers">Retailer access</Link></div>
      </MarketStoryHero>
      <section className={`billing-warning section-shell${stripeReady ? " billing-ready" : ""}`} role="status"><span>{stripeReady ? "TRIAL READY" : "BILLING FOUNDATION"}</span><p>{stripeReady ? `${TRIAL_DAYS}-day FateDrop Plus trials are connected to Stripe on this deployment. Verified subscription events update the one entitlement consumed by website, app and Discord.` : `The ${TRIAL_DAYS}-day Plus trial, checkout, customer portal and subscription webhook flow are built. Checkout remains disabled until the Stripe account, Plus price and webhook secret are connected.`}</p></section>
      <section className="membership-flow section-shell"><div><span>01</span><b>Create FateDrop ID</b><small>Your permanent network identity.</small></div><i>→</i><div><span>02</span><b>Start Plus trial</b><small>One paid collector plan.</small></div><i>→</i><div><span>03</span><b>Access syncs</b><small>Web · App · connected Discord.</small></div></section>
      <section className="plan-section section-shell" id="collectors"><SectionHeading eyebrow="Collector membership" title="Free discovery. One paid upgrade." body="Free lets collectors understand and explore the FateDrop network. FateDrop Plus unlocks the personal automation, instant delivery and deeper intelligence that costs the network money to provide." /><CollectorPlanGrid plans={siteConfig.collectorPlans} signedIn={signedIn} membership={snapshot?.membership ?? null} /></section>
      <section className="plan-section section-shell" id="retailers"><SectionHeading eyebrow="Fate Network retailer access" title="Connect useful stock to collector demand." body="Retailers do not pay to become more trusted or to outrank a better deal. Founding Fate Network retailers can join the beta without a settled paid tier while FateDrop proves catalogue connection, discovery and measurable handoff value first." /><RetailerPlanGrid plans={siteConfig.retailerPlans} /></section>
      <section className="content-section section-shell"><div className="quote-band"><p className="eyebrow"><span />Two sides of one network</p><blockquote>Help collectors find value. Help useful retailers be found.</blockquote><p>Collector membership funds the intelligence and delivery layer. Future retailer revenue can fund catalogue connection and business tools only after the value is proven. Payment cannot buy a false RRP verdict, alert priority or better organic ranking.</p><div className="button-row" style={{ marginTop: 30 }}><Link className="button button-primary" href="/account/register">Create your FateDrop ID <span>↗</span></Link><Link className="button button-secondary" href="/join?type=business">Join as a retailer</Link></div></div></section>
    </SiteShell>
  );
}
