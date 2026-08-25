import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { BillingPortalButton, StartMembershipButton } from "@/components/membership-actions";
import { getCurrentSnapshot } from "@/lib/auth";
import { billingReadiness } from "@/lib/billing";
import { hasPremiumAccess, membershipLabel } from "@/lib/membership";

export const metadata: Metadata = { title: "Membership | FateDrop Dashboard", robots: { index: false, follow: false } };

function dateLabel(timestamp: number | null | undefined) {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/London" }).format(new Date(timestamp * 1000));
}

export default async function DashboardMembershipPage({ searchParams }: { searchParams: Promise<{ billing?: string }> }) {
  const snapshot = await getCurrentSnapshot();
  const readiness = billingReadiness();
  const params = await searchParams;
  const premium = snapshot ? hasPremiumAccess(snapshot.membership) : false;
  const plan = snapshot ? membershipLabel(snapshot.membership) : "Free";
  const trialEligible = Boolean(snapshot && !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt);
  const hasOpenSubscription = Boolean(snapshot?.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled");
  const startLabel = trialEligible ? "Start" : snapshot?.membership.stripeCustomerId ? "Restart" : "Choose";

  return (
    <DashboardPageShell title="Membership" eyebrow="FREE OR FATEDROP PLUS">
      <div className="fd-membership-page">
        {params.billing === "success" ? <section className="fd-dash-card fd-membership-notice success"><div className="fd-dash-card-head"><span>STRIPE CHECKOUT</span><i className="live">RETURNED</i></div><div className="fd-network-message"><h2>Checkout completed.</h2><p>Stripe confirms the subscription through the signed webhook. FateDrop then updates the one authoritative membership record used by Website, App and linked Discord.</p></div></section> : null}
        {params.billing === "cancelled" ? <section className="fd-dash-card fd-membership-notice"><div className="fd-dash-card-head"><span>STRIPE CHECKOUT</span><i className="pending">CANCELLED</i></div><div className="fd-network-message"><h2>No membership change was made.</h2><p>You returned from Stripe without completing checkout.</p></div></section> : null}

        <section className="fd-dash-card fd-membership-hero">
          <div className="fd-membership-copy"><span>ONE CONSUMER MEMBERSHIP</span><h1>Use FateDrop for free.<br/><em>Unlock the deeper intelligence with Plus.</em></h1><p>There is no separate App plan and no consumer Pro tier. One FateDrop Plus entitlement follows the same FateDrop ID across Website, the native App and linked Discord wherever that delivery surface is enabled.</p></div>
          <aside><small>FATEDROP PLUS</small><strong>£4.99</strong><span>/ month</span><b>7-DAY TRIAL</b><p>One membership. No duplicate App or Discord subscription.</p></aside>
        </section>

        <section className="fd-membership-plans">
          <article className="fd-dash-card"><span>FREE</span><h2>Useful discovery stays open.</h2><p>Free should be genuinely useful without giving away the entire premium intelligence layer.</p><ul><li>FateDrop ID</li><li>Search current network knowledge</li><li>Retailer and Indie discovery</li><li>Events and Local Radar discovery where available</li><li>Basic Wishlist</li><li>Direct retailer purchasing</li></ul></article>
          <article className="fd-dash-card plus"><span>FATEDROP PLUS</span><h2>For collectors who want FateDrop working for them.</h2><p>Plus adds the parts that require ongoing monitoring, deeper value intelligence and premium delivery.</p><ul><li>Full FateFind value intelligence</li><li>FateMatch watches and buying conditions</li><li>Whisper · Echo · Manifested · Vanished detail</li><li>True Price context inside FateFind when delivery is known</li><li>Advanced alert filtering</li><li>Eligible App + Discord premium notifications</li></ul></article>
        </section>

        <section className="fd-dash-card fd-billing-card fd-current-membership">
          <div className="fd-dash-card-head"><span>YOUR CURRENT ACCESS</span><i className={premium ? "live" : "pending"}>{snapshot?.membership.status?.toUpperCase() || "FREE"}</i></div>
          <div className="fd-billing-state"><strong>{plan}</strong><span>{premium ? "FATEDROP PLUS" : "FREE ACCESS"}</span></div>
          <div className="fd-billing-facts"><span><small>STRIPE CUSTOMER</small><b>{snapshot?.membership.stripeCustomerId ? "Connected" : "Not created"}</b></span><span><small>SUBSCRIPTION</small><b>{snapshot?.membership.stripeSubscriptionId ? "Connected" : "Not created"}</b></span><span><small>TRIAL ENDS</small><b>{dateLabel(snapshot?.membership.trialEndsAt)}</b></span><span><small>PERIOD ENDS</small><b>{dateLabel(snapshot?.membership.currentPeriodEnd)}</b></span></div>
          <div className="fd-membership-actions">
            {hasOpenSubscription ? <BillingPortalButton /> : <><StartMembershipButton tier="plus" label={`${startLabel} FateDrop Plus${trialEligible ? " trial" : ""}`} />{snapshot?.membership.stripeCustomerId ? <BillingPortalButton /> : null}</>}
          </div>
        </section>

        <section className="fd-dash-card fd-membership-sync"><div><span>WHAT HAPPENS AFTER YOU UPGRADE</span><h2>One entitlement becomes available to the rest of FateDrop.</h2></div><div className="fd-membership-sync-flow"><span><b>1</b><strong>STRIPE</strong><small>Payment or trial state</small></span><i>→</i><span><b>2</b><strong>FATEDROP ID</strong><small>Authoritative entitlement</small></span><i>→</i><span><b>3</b><strong>APP</strong><small>Refreshes account access</small></span><i>→</i><span><b>4</b><strong>DISCORD</strong><small>Linked role eligibility</small></span></div></section>

        <section className="fd-dash-card fd-membership-readiness">
          <div className="fd-dash-card-head"><span>BETA BILLING READINESS</span><i className={readiness.configured ? "live" : "pending"}>{readiness.configured ? "APPLICATION READY" : "SETUP REQUIRED"}</i></div>
          <p>This technical panel remains visible during beta so billing cannot quietly go live before the full purchase → entitlement → App → Discord journey is verified.</p>
          <div className="fd-billing-facts"><span><small>MODE</small><b>{readiness.mode.toUpperCase()}</b></span><span><small>CHECKOUT</small><b>{readiness.checkoutConfigured ? "Configured" : "Pending"}</b></span><span><small>WEBHOOK</small><b>{readiness.webhookConfigured ? "Configured" : "Pending"}</b></span><span><small>TRIAL</small><b>{trialEligible ? `${readiness.trialDays} days · ${readiness.requireCardForTrial ? "card required" : "no card required"}` : "Already used / not eligible"}</b></span></div>
          {!readiness.configured ? <p>Remaining server configuration: {readiness.missing.join(", ")}.</p> : <p>The application-side Stripe integration is configured. A real end-to-end payment test is still required before live billing should be opened to customers.</p>}
        </section>
      </div>
      <style>{`
        .fd-membership-page{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-membership-page .fd-dash-card{border-color:rgba(221,203,188,.085);border-radius:12px;background:linear-gradient(145deg,#0e1216,#090d11 74%)}.fd-membership-notice{padding:20px}.fd-membership-hero{padding:30px;display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:30px;align-items:center;background:radial-gradient(circle at 90% 8%,rgba(126,87,143,.15),transparent 30%),linear-gradient(145deg,#101419,#090d11 70%)!important}.fd-membership-copy>span,.fd-membership-sync>div>span{color:#aa886d;font-size:10px;font-weight:900;letter-spacing:.14em}.fd-membership-copy h1{max-width:900px;margin:9px 0 14px;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.6rem,4.3vw,5rem);font-weight:500;line-height:.94;letter-spacing:-.05em}.fd-membership-copy h1 em{font-style:normal;color:#baa6bb}.fd-membership-copy p{max-width:820px;color:#a0989d;font-size:14px;line-height:1.75}.fd-membership-hero>aside{padding:22px;border:1px solid rgba(183,151,125,.15);border-radius:14px;background:linear-gradient(145deg,rgba(126,87,143,.06),rgba(183,151,125,.025));display:grid;grid-template-columns:auto 1fr;align-items:end;gap:4px 8px}.fd-membership-hero aside small{grid-column:1/-1;color:#9c816d;font-size:10px;font-weight:900;letter-spacing:.12em}.fd-membership-hero aside strong{color:#eee4dc;font-family:Georgia,serif;font-size:52px;font-weight:500;line-height:1}.fd-membership-hero aside span{padding-bottom:6px;color:#8e858a}.fd-membership-hero aside b{grid-column:1/-1;margin-top:7px;color:#91aa96;font-size:10px;letter-spacing:.09em}.fd-membership-hero aside p{grid-column:1/-1;margin:4px 0 0;color:#827a7f;font-size:11px;line-height:1.5}.fd-membership-plans{display:grid;grid-template-columns:1fr 1fr;gap:12px}.fd-membership-plans article{padding:24px}.fd-membership-plans article.plus{border-color:rgba(183,151,125,.15);background:radial-gradient(circle at 100% 0,rgba(126,87,143,.09),transparent 32%),linear-gradient(145deg,#101419,#090d11 74%)}.fd-membership-plans article>span{color:#a78973;font-size:10px;font-weight:900;letter-spacing:.14em}.fd-membership-plans h2,.fd-membership-sync h2{margin:7px 0 8px;color:#e2d8d0;font-family:Georgia,serif;font-size:25px;font-weight:500}.fd-membership-plans p{margin:0;color:#91898d;font-size:12px;line-height:1.65}.fd-membership-plans ul{margin:18px 0 0;padding:0;list-style:none;display:grid;gap:8px}.fd-membership-plans li{padding:9px 0;border-top:1px solid rgba(221,203,188,.055);color:#b2a9ac;font-size:12px}.fd-membership-plans li:before{content:'◇';margin-right:9px;color:#9e7e68}.fd-current-membership,.fd-membership-readiness{padding:24px}.fd-membership-actions{margin-top:20px;display:flex;gap:12px;flex-wrap:wrap}.fd-membership-sync{padding:24px;display:grid;grid-template-columns:.8fr 1.2fr;gap:28px;align-items:center}.fd-membership-sync-flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;gap:7px;align-items:center}.fd-membership-sync-flow>span{min-height:72px;padding:10px;border:1px solid rgba(221,203,188,.06);border-radius:9px;display:grid;grid-template-columns:23px 1fr;gap:2px 7px;align-content:center}.fd-membership-sync-flow b{grid-row:1/3;width:23px;height:23px;display:grid;place-items:center;border:1px solid rgba(183,151,125,.17);border-radius:7px;color:#bd9b79}.fd-membership-sync-flow strong{font-size:9px;letter-spacing:.06em}.fd-membership-sync-flow small{color:#777074;font-size:9px}.fd-membership-sync-flow>i{color:#61575e;font-style:normal}.fd-membership-readiness>p{max-width:900px;color:#91898d;font-size:12px;line-height:1.65}@media(max-width:1050px){.fd-membership-hero,.fd-membership-sync{grid-template-columns:1fr}.fd-membership-sync-flow{grid-template-columns:1fr 1fr}.fd-membership-sync-flow>i{display:none}}@media(max-width:700px){.fd-membership-plans{grid-template-columns:1fr}.fd-membership-hero,.fd-current-membership,.fd-membership-readiness,.fd-membership-sync{padding:18px}.fd-membership-sync-flow{grid-template-columns:1fr}}
      `}</style>
    </DashboardPageShell>
  );
}
