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
    <DashboardPageShell title="Membership" eyebrow="BILLING + ACCESS">
      <div className="fd-dashboard-grid">
        {params.billing === "success" ? <section className="fd-dash-card"><div className="fd-dash-card-head"><span>STRIPE CHECKOUT</span><i className="live">RETURNED</i></div><div className="fd-network-message"><h1>Checkout completed.</h1><p>Stripe will confirm the subscription through the signed webhook. Your membership and Discord entitlement update from that authoritative event.</p></div></section> : null}
        {params.billing === "cancelled" ? <section className="fd-dash-card"><div className="fd-dash-card-head"><span>STRIPE CHECKOUT</span><i className="pending">CANCELLED</i></div><div className="fd-network-message"><h1>No changes were made.</h1><p>You returned from Stripe without completing checkout.</p></div></section> : null}

        <section className="fd-dash-card fd-billing-card">
          <div className="fd-dash-card-head"><span>YOUR MEMBERSHIP</span><i className={premium ? "live" : "pending"}>{snapshot?.membership.status?.toUpperCase() || "FREE"}</i></div>
          <div className="fd-billing-state"><strong>{plan}</strong><span>{premium ? "PREMIUM ACCESS" : "STANDARD ACCESS"}</span></div>
          <div className="fd-billing-facts"><span><small>STRIPE CUSTOMER</small><b>{snapshot?.membership.stripeCustomerId ? "Connected" : "Not created"}</b></span><span><small>SUBSCRIPTION</small><b>{snapshot?.membership.stripeSubscriptionId ? "Connected" : "Not created"}</b></span><span><small>TRIAL ENDS</small><b>{dateLabel(snapshot?.membership.trialEndsAt)}</b></span><span><small>PERIOD ENDS</small><b>{dateLabel(snapshot?.membership.currentPeriodEnd)}</b></span></div>
          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {hasOpenSubscription ? <BillingPortalButton /> : <><StartMembershipButton tier="plus" label={`${startLabel} Plus${trialEligible ? " trial" : ""}`} /><StartMembershipButton tier="pro" label={`${startLabel} Pro${trialEligible ? " trial" : ""}`} />{snapshot?.membership.stripeCustomerId ? <BillingPortalButton /> : null}</>}
          </div>
        </section>

        <section className="fd-dash-card">
          <div className="fd-dash-card-head"><span>STRIPE READINESS</span><i className={readiness.configured ? "live" : "pending"}>{readiness.configured ? "READY" : "SETUP REQUIRED"}</i></div>
          <div className="fd-billing-facts"><span><small>MODE</small><b>{readiness.mode.toUpperCase()}</b></span><span><small>CHECKOUT</small><b>{readiness.checkoutConfigured ? "Configured" : "Pending"}</b></span><span><small>WEBHOOK</small><b>{readiness.webhookConfigured ? "Configured" : "Pending"}</b></span><span><small>TRIAL</small><b>{trialEligible ? `${readiness.trialDays} days · ${readiness.requireCardForTrial ? "card required" : "no card required"}` : "Already used / not eligible"}</b></span></div>
          {!readiness.configured ? <p style={{ marginTop: 18 }}>Remaining server configuration: {readiness.missing.join(", ")}.</p> : <p style={{ marginTop: 18 }}>The application-side Stripe integration is configured. A real end-to-end payment test is still required before live billing should be opened to customers.</p>}
        </section>
      </div>
    </DashboardPageShell>
  );
}
