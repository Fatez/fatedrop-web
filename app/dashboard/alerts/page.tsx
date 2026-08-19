import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { StartMembershipButton } from "@/components/membership-actions";
import { getCurrentSnapshot } from "@/lib/auth";
import { activityLabel, buildDashboardData, moneyFromPence, relativeTime } from "@/lib/dashboard";
import { hasPremiumAccess, membershipLabel } from "@/lib/membership";
import { listUserFateMatches } from "@/lib/fate-match-storage";

export const metadata: Metadata = {
  title: "Alerts | FateDrop Dashboard",
  description: "Your FateDrop hunts, notification history and alert access.",
  robots: { index: false, follow: false },
};

export default async function AlertsPage() {
  const snapshot = await getCurrentSnapshot();
  const premium = snapshot ? hasPremiumAccess(snapshot.membership) : false;
  const plan = snapshot ? membershipLabel(snapshot.membership) : "Free";
  const data = snapshot ? await buildDashboardData(snapshot) : null;
  let fateFinds: Awaited<ReturnType<typeof listUserFateMatches>> = [];
  if (snapshot) {
    try { fateFinds = await listUserFateMatches(snapshot.account.id); } catch { fateFinds = []; }
  }
  const activeFateFinds = fateFinds.filter((item)=>item.enabled);
  const personalHistory = data?.personal.recent ?? [];
  const trialEligible = Boolean(snapshot && !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt);
  const hasOpenSubscription = Boolean(snapshot?.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled");

  return <DashboardPageShell title="Alerts" eyebrow="YOUR HUNTS · YOUR NOTIFICATIONS">
    <div className="fd-personal-alerts">
      <section className="fd-alert-personal-hero">
        <div><span>FATEDROP // PERSONAL ALERT CENTRE</span><h1>Network activity is global.<br/><em>Alerts are yours.</em></h1><p>Alerts now focuses on the things FateDrop is watching or has delivered for you: active FateFind hunts, successful FateMatch activity and your notification history. The global network heartbeat belongs on Home.</p><div className="fd-alert-hero-actions"><Link href="/dashboard/watchlist">Create FateFind →</Link><Link href="/dashboard">Open Network Activity →</Link></div></div>
        <div className="fd-alert-personal-metrics"><span><b>{activeFateFinds.length}</b>ACTIVE FATEFINDS</span><span><b>{personalHistory.length}</b>RECENT PERSONAL EVENTS</span><span><b>{plan}</b>ACCESS</span></div>
      </section>

      {!premium ? <section className="fd-alerts-gate"><div><span>PREMIUM MONITORING</span><h2>Free stays useful. Premium does more of the watching.</h2><p>FateFind is designed as one of the clearest Premium carrots: define the product and price/RRP conditions, then let FateDrop evaluate qualifying network opportunities instead of repeating the hunt manually.</p></div>{hasOpenSubscription ? <Link className="button button-primary" href="/dashboard/membership">Manage membership →</Link> : <StartMembershipButton tier="plus" label={trialEligible ? "Start free trial" : snapshot?.membership.stripeCustomerId ? "Restart Plus" : "Choose Plus"}/>}</section> : null}

      <div className="fd-alert-personal-grid">
        <section className="fd-dash-card fd-alert-finds"><div className="fd-dash-card-head"><span>ACTIVE FATEFINDS</span><Link href="/dashboard/watchlist">Manage hunts</Link></div>{activeFateFinds.length ? <div className="fd-dashboard-list">{activeFateFinds.slice(0,8).map((hunt)=><article key={hunt.id}><span className="fd-store-thumb">◎</span><div><strong>{hunt.query || "Resolved product"}</strong><small>{hunt.maxTruePricePence !== null ? `Max £${(hunt.maxTruePricePence/100).toFixed(2)} delivered` : "Any True Price"}{hunt.maxPercentAboveRrp !== null ? ` · max +${hunt.maxPercentAboveRrp}% RRP` : ""} · {hunt.scope}</small></div><aside>WATCHING<small>A qualifying result becomes a FateMatch</small></aside></article>)}</div> : <div className="fd-dashboard-empty"><strong>No active FateFinds yet.</strong><span>Create a structured product hunt and FateDrop can evaluate matching network opportunities.</span><Link className="fd-dashboard-wide-button" href="/dashboard/watchlist">Create FateFind →</Link></div>}</section>

        <section className="fd-dash-card fd-alert-delivery"><div className="fd-dash-card-head"><span>DELIVERY CHANNELS</span><small>Shared entitlement foundation</small></div><div className="fd-delivery-list"><div><b>WEB</b><span>Dashboard notification history and account activity.</span><i className="live">AVAILABLE</i></div><div><b>DISCORD</b><span>Premium role/alert delivery when Discord is connected and enabled.</span><i className="pending">CONFIGURATION-DEPENDENT</i></div><div><b>APP PUSH</b><span>Intended shared FateDrop entitlement channel; mobile integration is being reconciled separately.</span><i className="pending">FOUNDATION</i></div></div><p>Global per-signal preference storage is not being faked here. Echo, Manifested, price and channel preferences should become one cross-platform account model rather than browser-only toggles.</p></section>
      </div>

      <section className="fd-dash-card fd-alert-history"><div className="fd-dash-card-head"><span>YOUR NOTIFICATION / HUNT HISTORY</span><small>{personalHistory.length ? `${personalHistory.length} recent` : "No personal events yet"}</small></div>{personalHistory.length && data ? <div className="fd-dashboard-list">{personalHistory.map((event)=><article key={event.id}><span className="fd-store-thumb">◇</span><div><strong>{event.title || activityLabel(event)}</strong><small>{event.subtitle || event.retailer || activityLabel(event)}</small></div><aside>{event.amountPence ? moneyFromPence(event.amountPence) : activityLabel(event).toUpperCase()}<small>{relativeTime(event.occurredAt,data.generatedAt)}</small></aside></article>)}</div> : <div className="fd-dashboard-empty"><strong>Nothing has been sent to you yet.</strong><span>Network activity can still be happening on Home; this list only grows from real personal/account events.</span></div>}</section>

      <section className="fd-dash-card fd-alert-model"><div><span>PUBLIC SIGNAL LANGUAGE</span><h2>Echo when something is moving. Manifested when it is real.</h2></div><p>Whisper remains internal engine terminology. Early queue/security/catalogue conditions can surface as Echo when they are meaningful enough; confirmed availability and confirmed restocks surface as Manifested. Vanished remains contextual history when availability is lost.</p></section>
    </div>
    <style>{`
      .fd-personal-alerts{display:grid;gap:20px}.fd-alert-personal-hero{position:relative;overflow:hidden;min-height:330px;padding:34px;border:1px solid rgba(157,109,255,.18);border-radius:24px;background:linear-gradient(90deg,rgba(6,7,13,.95),rgba(6,7,13,.66)),url('/assets/cardwave-bg.webp') center right/cover no-repeat}.fd-alert-personal-hero>div:first-child{max-width:720px}.fd-alert-personal-hero span{color:#73e9fb;font-size:9px;font-weight:900;letter-spacing:.18em}.fd-alert-personal-hero h1{margin:13px 0;font-size:clamp(2.5rem,4.5vw,4.7rem);line-height:.91;letter-spacing:-.055em}.fd-alert-personal-hero h1 em{font-style:normal;background:linear-gradient(90deg,#fff,#a5efff,#bd94ff);-webkit-background-clip:text;color:transparent}.fd-alert-personal-hero p{max-width:680px;color:#9c95a4;font-size:14px;line-height:1.65}.fd-alert-hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.fd-alert-hero-actions a{padding:10px 13px;border:1px solid rgba(88,232,255,.18);border-radius:10px;color:#c9f7ff;font-size:8px;font-weight:900;text-decoration:none}.fd-alert-personal-metrics{position:absolute;left:34px;bottom:26px;display:flex;gap:28px}.fd-alert-personal-metrics span{color:#6d6774;font-size:7px}.fd-alert-personal-metrics b{display:block;color:#fff;font-size:17px;letter-spacing:0}.fd-alerts-gate{border:1px solid rgba(155,92,255,.3);background:linear-gradient(100deg,rgba(79,30,141,.17),rgba(10,9,15,.95));border-radius:18px;padding:22px;display:flex;align-items:center;justify-content:space-between;gap:24px}.fd-alerts-gate span{font-size:9px;letter-spacing:.16em;color:#ad77ff;font-weight:800}.fd-alerts-gate h2{font-size:19px;margin:6px 0}.fd-alerts-gate p{color:#918a99;margin:0;font-size:12px;max-width:780px}.fd-alert-personal-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:20px}.fd-alert-finds,.fd-alert-delivery,.fd-alert-history{padding:24px}.fd-delivery-list{display:grid;gap:8px;margin-top:16px}.fd-delivery-list>div{display:grid;grid-template-columns:75px 1fr auto;gap:10px;align-items:center;padding:12px;border:1px solid rgba(255,255,255,.065);border-radius:11px;background:rgba(255,255,255,.02)}.fd-delivery-list b{font-size:9px}.fd-delivery-list span{color:#85808c;font-size:9px}.fd-delivery-list i{font-size:6px;font-style:normal;font-weight:900;letter-spacing:.08em}.fd-alert-delivery>p{color:#77717e;font-size:9px;line-height:1.55}.fd-alert-model{padding:24px 28px;display:grid;grid-template-columns:.8fr 1.2fr;gap:28px;align-items:center}.fd-alert-model span{color:#73e9fb;font-size:8px;font-weight:900;letter-spacing:.14em}.fd-alert-model h2{margin:7px 0 0;font-size:22px}.fd-alert-model p{margin:0;color:#908a97;font-size:11px;line-height:1.65}@media(max-width:900px){.fd-alert-personal-grid,.fd-alert-model{grid-template-columns:1fr}.fd-alert-personal-metrics{gap:14px;flex-wrap:wrap}.fd-delivery-list>div{grid-template-columns:1fr}}@media(max-width:650px){.fd-alert-personal-hero{padding:25px;min-height:430px}.fd-alert-personal-metrics{left:25px}.fd-alerts-gate{display:block}.fd-alert-finds,.fd-alert-delivery,.fd-alert-history{padding:20px}}
    `}</style>
  </DashboardPageShell>;
}
