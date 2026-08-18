/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSignOut } from "@/components/account-signout";
import { BillingPortalButton, StartMembershipButton } from "@/components/membership-actions";
import { BrandMark } from "@/components/brand-mark";
import { DashboardNav } from "@/components/dashboard-nav";
import { getCurrentSnapshot } from "@/lib/auth";
import { hasPremiumAccess, membershipLabel } from "@/lib/membership";

export async function DashboardPageShell({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect(`/account/login?next=/dashboard`);

  const premium = hasPremiumAccess(snapshot.membership);
  const plan = membershipLabel(snapshot.membership);
  const now = Math.floor(Date.now() / 1000);
  const trialDaysLeft = snapshot.membership.trialEndsAt ? Math.max(0, Math.ceil((snapshot.membership.trialEndsAt - now) / 86_400)) : null;
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_PRICE_PLUS && process.env.STRIPE_PRICE_PRO);
  const trialEligible = !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt;
  const hasOpenSubscription = Boolean(snapshot.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled");

  return (
    <main className="fd-dashboard">
      <aside className="fd-dashboard-sidebar">
        <div className="fd-dashboard-brand"><BrandMark /><small>One identity. Every drop.</small></div>
        <DashboardNav />
        <div className="fd-dashboard-trial-card">
          <span>{premium ? plan : trialEligible ? "14-Day Free Trial" : "Membership"}</span>
          <p>{premium ? (snapshot.membership.status === "trialing" ? `${trialDaysLeft ?? 0} trial days remaining.` : "Premium entitlement active.") : trialEligible ? "Unlock Premium signals, Discord access and deeper discovery." : "Manage or restart your FateDrop membership."}</p>
          {hasOpenSubscription ? <BillingPortalButton /> : <StartMembershipButton tier="plus" label={trialEligible ? "Start free trial" : snapshot.membership.stripeCustomerId ? "Restart Plus" : "Choose Plus"} />}
          <small>{stripeReady ? "Stripe billing ready" : "Stripe connection pending"}</small>
        </div>
        <div className="fd-dashboard-sidebar-art" aria-hidden="true" />
      </aside>

      <section className="fd-dashboard-main">
        <header className="fd-dashboard-topbar">
          <div><span>{eyebrow || title.toUpperCase()}</span><p>{title}</p></div>
          <form action="/dashboard/search" method="get" className="fd-dashboard-search"><span>⌕</span><input name="q" aria-label="Search FateDrop" placeholder="Search products, sets or stores…" /></form>
          <div className="fd-dashboard-top-actions">
            <Link href="/dashboard/profile" className="fd-dashboard-avatar-link" aria-label="Open FateDrop profile">
              {snapshot.account.avatarUrl ? <span style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }} /> : <img src="/assets/fatedrop-logo-mark.png" alt="" />}
            </Link>
            <AccountSignOut />
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
