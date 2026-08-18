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

  return <main className="fd-dashboard fd-collector-dashboard">
    <div className="fd-dashboard-atmosphere" aria-hidden="true"><i/><i/><i/><span/></div>
    <aside className="fd-dashboard-sidebar">
      <div className="fd-dashboard-brand"><BrandMark/><small>Detect · Compare · Connect</small></div>
      <DashboardNav/>
      <div className="fd-dashboard-trial-card">
        <span>{premium ? plan : trialEligible ? "14-Day Free Trial" : "Membership"}</span>
        <p>{premium ? (snapshot.membership.status === "trialing" ? `${trialDaysLeft ?? 0} trial days remaining.` : "Premium entitlement active.") : trialEligible ? "Unlock Premium signals, Discord access and deeper discovery." : "Manage or restart your FateDrop membership."}</p>
        {hasOpenSubscription ? <BillingPortalButton/> : <StartMembershipButton tier="plus" label={trialEligible ? "Start free trial" : snapshot.membership.stripeCustomerId ? "Restart Plus" : "Choose Plus"}/>} 
        <small>{stripeReady ? "Stripe billing ready" : "Stripe connection pending"}</small>
      </div>
      <div className="fd-dashboard-sidebar-art" aria-hidden="true"/>
    </aside>

    <section className="fd-dashboard-main">
      <header className="fd-dashboard-topbar">
        <div className="fd-dashboard-page-id"><span>{eyebrow || title.toUpperCase()}</span><p>{title}</p><small>FATEDROP // COLLECTOR NETWORK</small></div>
        <Link className="fd-dashboard-live-link" href="/dashboard/alerts"><i/><span><small>LIVE NETWORK</small><b>Open signals</b></span><strong>→</strong></Link>
        <div className="fd-dashboard-top-actions">
          <Link href="/dashboard/profile" className="fd-dashboard-avatar-link" aria-label="Open FateDrop profile">{snapshot.account.avatarUrl ? <span style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }}/> : <img src="/assets/fatedrop-logo-mark.png" alt=""/>}</Link>
          <AccountSignOut/>
        </div>
      </header>
      <div className="fd-dashboard-content-frame">{children}</div>
    </section>

    <style>{`
      .fd-collector-dashboard{position:relative;isolation:isolate;display:grid!important;grid-template-columns:268px minmax(0,1fr)!important;min-height:100vh;background:#06070c!important}
      .fd-dashboard-atmosphere{position:fixed;z-index:-2;inset:0;overflow:hidden;pointer-events:none;background:linear-gradient(90deg,rgba(5,6,11,.98) 0 22%,rgba(5,6,11,.88) 40%,rgba(5,6,11,.65)),url('/assets/cardwave-bg.webp') center right/cover no-repeat;opacity:.62}
      .fd-dashboard-atmosphere:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 78% 8%,rgba(116,64,255,.12),transparent 30%),linear-gradient(180deg,rgba(5,6,11,.28),rgba(5,6,11,.82) 88%)}
      .fd-dashboard-atmosphere i{position:absolute;z-index:2;width:46vw;height:1px;right:-7vw;background:linear-gradient(90deg,transparent,rgba(88,232,255,.12),rgba(157,109,255,.2),transparent);transform:rotate(-18deg)}.fd-dashboard-atmosphere i:nth-child(1){top:18%}.fd-dashboard-atmosphere i:nth-child(2){top:48%;right:-2vw}.fd-dashboard-atmosphere i:nth-child(3){top:75%;right:-13vw}
      .fd-dashboard-atmosphere span{position:absolute;z-index:2;right:8%;top:15%;width:180px;height:250px;border:1px solid rgba(157,109,255,.05);border-radius:18px;transform:rotate(13deg);box-shadow:-34px 26px 0 -1px rgba(88,232,255,.025),-68px 52px 0 -1px rgba(157,109,255,.025)}

      .fd-collector-dashboard .fd-dashboard-sidebar{box-sizing:border-box!important;width:268px!important;min-width:268px!important;max-width:268px!important;height:100vh!important;position:sticky!important;top:0!important;overflow-y:auto!important;overflow-x:hidden!important;background:linear-gradient(180deg,rgba(9,9,15,.985),rgba(6,7,11,.97))!important;border-right:1px solid rgba(157,109,255,.13)!important}
      .fd-collector-dashboard .fd-dashboard-sidebar nav,.fd-collector-dashboard .fd-dashboard-sidebar nav>div{min-width:0!important;width:100%!important;max-width:100%!important}.fd-collector-dashboard .fd-dashboard-sidebar nav a{box-sizing:border-box!important;width:100%!important;min-width:0!important;max-width:100%!important;white-space:nowrap!important;overflow:hidden!important}
      .fd-collector-dashboard .fd-dashboard-main{min-width:0!important;width:100%!important;max-width:100%!important;overflow:hidden!important}.fd-collector-dashboard .fd-dashboard-brand small{color:#817a89;letter-spacing:.08em}

      .fd-dashboard-content-frame{position:relative;min-width:0}.fd-dashboard-content-frame:before{content:"";position:absolute;z-index:-1;left:0;right:0;top:-18px;height:180px;border-radius:28px;background:linear-gradient(110deg,rgba(157,109,255,.04),transparent 35%,rgba(88,232,255,.028));pointer-events:none}
      .fd-dashboard-page-id{min-width:190px}.fd-dashboard-page-id>span{color:#78eaff!important;font-size:8px!important;font-weight:900!important;letter-spacing:.17em!important}.fd-dashboard-page-id>p{font-size:19px!important;font-weight:850!important;letter-spacing:-.035em!important}.fd-dashboard-page-id>small{display:block;margin-top:3px;color:#5f5a65;font-size:6px;font-weight:850;letter-spacing:.16em}
      .fd-dashboard-live-link{margin-left:auto;margin-right:14px;min-width:170px;min-height:48px;padding:8px 11px;display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:9px;border:1px solid rgba(88,232,255,.14);border-radius:14px;background:linear-gradient(135deg,rgba(88,232,255,.045),rgba(157,109,255,.05));text-decoration:none}.fd-dashboard-live-link>i{width:7px;height:7px;border-radius:50%;background:#63e9a8;box-shadow:0 0 12px rgba(99,233,168,.7)}.fd-dashboard-live-link span{display:flex;flex-direction:column;gap:2px}.fd-dashboard-live-link small{color:#6f6976;font-size:6px;font-weight:900;letter-spacing:.13em}.fd-dashboard-live-link b{font-size:10px}.fd-dashboard-live-link strong{color:#8eefff;font-size:15px}

      .fd-collector-dashboard .fd-dash-card{position:relative;border-color:rgba(255,255,255,.09)!important;border-radius:20px!important;background:radial-gradient(circle at 100% 0%,rgba(157,109,255,.045),transparent 28%),linear-gradient(145deg,rgba(16,15,24,.91),rgba(9,9,14,.94))!important;box-shadow:inset 0 1px rgba(255,255,255,.03),0 18px 55px rgba(0,0,0,.13)!important}
      .fd-collector-dashboard .fd-dash-card:after{content:"";position:absolute;pointer-events:none;left:10%;right:10%;top:-1px;height:1px;background:linear-gradient(90deg,transparent,rgba(92,232,255,.16),rgba(174,101,255,.2),transparent);opacity:.65}
      .fd-collector-dashboard .fd-dash-card-head span{font-size:10px!important;font-weight:900!important;letter-spacing:.13em!important}.fd-collector-dashboard .fd-dash-card-head small,.fd-collector-dashboard .fd-dash-card-head i,.fd-collector-dashboard .fd-dash-card-head a{font-size:9px!important}.fd-collector-dashboard .fd-network-message h1{letter-spacing:-.045em}.fd-collector-dashboard .fd-network-message p{font-size:14px!important;line-height:1.68!important}.fd-collector-dashboard .fd-dashboard-list article strong{font-size:13px!important;line-height:1.35!important}.fd-collector-dashboard .fd-dashboard-list article small{font-size:10px!important;line-height:1.45!important}.fd-collector-dashboard .fd-dashboard-wide-button{min-height:43px!important;border-radius:12px!important;font-size:10px!important;font-weight:850!important}.fd-collector-dashboard button,.fd-collector-dashboard a{transition:border-color .18s ease,background .18s ease,transform .18s ease,box-shadow .18s ease}

      @media(max-width:980px){.fd-collector-dashboard{grid-template-columns:228px minmax(0,1fr)!important}.fd-collector-dashboard .fd-dashboard-sidebar{width:228px!important;min-width:228px!important;max-width:228px!important}.fd-dashboard-live-link{min-width:145px}}
      @media(max-width:760px){.fd-collector-dashboard{display:block!important}.fd-collector-dashboard .fd-dashboard-sidebar{position:relative!important;width:100%!important;min-width:100%!important;max-width:100%!important;height:auto!important}.fd-dashboard-topbar{flex-wrap:wrap}.fd-dashboard-live-link{order:3;width:100%;margin:8px 0 0}.fd-dashboard-page-id>small{display:none}}
    `}</style>
  </main>;
}
