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
import { serverNowSeconds } from "@/lib/server-time";

export async function DashboardPageShell({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect(`/account/login?next=/dashboard`);

  const premium = hasPremiumAccess(snapshot.membership);
  const plan = membershipLabel(snapshot.membership);
  const now = serverNowSeconds();
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
          <form action="/dashboard/search" method="get" className="fd-dashboard-search fd-dashboard-search-upgraded">
            <span className="fd-dashboard-search-icon" aria-hidden="true">⌕</span>
            <label>
              <small>SEARCH FATEDROP</small>
              <input name="q" aria-label="Search FateDrop" placeholder="Products, sets, stores…" />
            </label>
            <button type="submit" aria-label="Run FateDrop search">→</button>
          </form>
          <div className="fd-dashboard-top-actions">
            <Link href="/dashboard/profile" className="fd-dashboard-avatar-link" aria-label="Open FateDrop profile">
              {snapshot.account.avatarUrl ? <span style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }} /> : <img src="/assets/fatedrop-logo-mark.png" alt="" />}
            </Link>
            <AccountSignOut />
          </div>
        </header>
        {children}
      </section>

      <style>{`
        .fd-dashboard-search-upgraded{position:relative;min-width:min(430px,38vw);min-height:58px;padding:7px 7px 7px 14px;display:grid;grid-template-columns:30px 1fr 42px;align-items:center;gap:8px;border:1px solid rgba(157,109,255,.3);border-radius:17px;background:radial-gradient(circle at 15% 0%,rgba(88,232,255,.08),transparent 45%),linear-gradient(135deg,rgba(255,255,255,.065),rgba(255,255,255,.025));box-shadow:0 12px 36px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.04);transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}
        .fd-dashboard-search-upgraded:focus-within{border-color:rgba(88,232,255,.58);box-shadow:0 0 0 3px rgba(88,232,255,.08),0 16px 42px rgba(49,31,93,.2);transform:translateY(-1px)}
        .fd-dashboard-search-icon{font-size:24px;line-height:1;color:#b89cff;text-align:center;filter:drop-shadow(0 0 10px rgba(157,109,255,.25))}
        .fd-dashboard-search-upgraded label{display:flex;min-width:0;flex-direction:column;gap:2px;cursor:text}
        .fd-dashboard-search-upgraded label small{font-size:8px;font-weight:850;letter-spacing:.16em;color:#817b8d}
        .fd-dashboard-search-upgraded input{width:100%;padding:0;border:0;outline:0;background:transparent;color:#fff;font-size:14px;font-weight:650;line-height:1.4}
        .fd-dashboard-search-upgraded input::placeholder{color:#77717f;font-weight:520}
        .fd-dashboard-search-upgraded button{width:42px;height:42px;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:linear-gradient(135deg,#f5f6ff,#c8f8ff 58%,#b79dff);color:#09080d;font-size:19px;font-weight:900;cursor:pointer;box-shadow:0 8px 22px rgba(88,232,255,.11);transition:transform .2s ease,box-shadow .2s ease}
        .fd-dashboard-search-upgraded button:hover{transform:translateX(2px);box-shadow:0 10px 28px rgba(88,232,255,.2)}
        @media(max-width:980px){.fd-dashboard-search-upgraded{min-width:260px}.fd-dashboard-search-upgraded label small{display:none}}
        @media(max-width:760px){.fd-dashboard-topbar{flex-wrap:wrap}.fd-dashboard-search-upgraded{order:3;width:100%;min-width:100%;margin-top:8px}}
      `}</style>
    </main>
  );
}
