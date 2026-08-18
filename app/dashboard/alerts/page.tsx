import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { LiveAlertFeed } from "@/components/live-alert-feed";
import { StartMembershipButton } from "@/components/membership-actions";
import { getCurrentSnapshot } from "@/lib/auth";
import { getLatestNetworkMetricSnapshot } from "@/lib/dashboard-storage";
import { hasPremiumAccess, membershipLabel } from "@/lib/membership";
import { serverNowSeconds } from "@/lib/server-time";

export const metadata: Metadata = {
  title: "Alerts | FateDrop Dashboard",
  description: "Live FateDrop lifecycle signals for collectors.",
  robots: { index: false, follow: false },
};

export default async function AlertsPage() {
  const snapshot = await getCurrentSnapshot();
  const network = await getLatestNetworkMetricSnapshot();
  const unlocked = snapshot ? hasPremiumAccess(snapshot.membership) : false;
  const plan = snapshot ? membershipLabel(snapshot.membership) : "Free";
  const now = serverNowSeconds();
  const signals = [...(network?.recentSignals ?? [])].sort((a, b) => b.occurredAt - a.occurredAt);
  const initialSignals = unlocked ? signals : signals.map((signal) => ({ ...signal, title: "Premium signal detail", retailer: null, detail: null, deliveredPricePence: null }));
  const trialEligible = Boolean(snapshot && !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt);
  const hasOpenSubscription = Boolean(snapshot?.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled");
  const counts = {
    whisper: signals.filter((item) => item.state === "whisper").length,
    manifested: signals.filter((item) => item.state === "manifested").length,
    vanished: signals.filter((item) => item.state === "vanished").length,
    echo: signals.filter((item) => item.state === "echo").length,
  };

  return <DashboardPageShell title="Alerts" eyebrow="LIVE SIGNAL NETWORK">
    <div className="fd-alerts-content">
      <section className="fd-alert-hero">
        <div><span>FATEDROP // SIGNAL ENGINE</span><h1>When the network moves,<br/><em>you should feel it.</em></h1><p>Leave this page open. FateDrop checks the persisted network feed every ten seconds; when a new lifecycle event arrives, a new Signal Card materialises and its beam fires.</p></div>
        <div className="fd-alert-orbit" aria-hidden="true"><i/><i/><b>◇</b></div>
        <div className="fd-alert-counts"><span><b>{counts.whisper}</b>WHISPER</span><span><b>{counts.manifested}</b>MANIFESTED</span><span><b>{counts.echo}</b>ECHO</span><span><b>{counts.vanished}</b>VANISHED</span></div>
      </section>

      {!unlocked ? <section className="fd-alerts-gate"><div><span>PREMIUM SIGNAL INTELLIGENCE</span><h2>The movement is visible. The actionable intelligence is locked.</h2><p>{plan} access can see lifecycle activity. Plus and Pro reveal the product, retailer and price context; the live API redacts those fields before they reach a free member's browser.</p></div>{hasOpenSubscription ? <Link className="button button-primary" href="/dashboard/membership">Manage membership →</Link> : <StartMembershipButton tier="plus" label={trialEligible ? "Start free trial" : snapshot?.membership.stripeCustomerId ? "Restart Plus" : "Choose Plus"}/>}</section> : null}

      <LiveAlertFeed initialSignals={initialSignals} initialNow={now} initialSource={network?.source ?? null} unlocked={unlocked}/>
    </div>

    <style>{`
      .fd-alerts-content{display:grid;gap:18px}.fd-alert-hero{position:relative;overflow:hidden;min-height:320px;padding:34px;border:1px solid rgba(157,109,255,.18);border-radius:24px;background:linear-gradient(90deg,rgba(6,7,13,.94),rgba(6,7,13,.62)),url('/assets/cardwave-bg.webp') center right/cover no-repeat}.fd-alert-hero>div:first-child{position:relative;z-index:2;max-width:690px}.fd-alert-hero span{color:#73e9fb;font-size:9px;font-weight:900;letter-spacing:.18em}.fd-alert-hero h1{margin:13px 0;font-size:clamp(2.4rem,4.5vw,4.6rem);line-height:.91;letter-spacing:-.055em}.fd-alert-hero h1 em{font-style:normal;background:linear-gradient(90deg,#fff,#a5efff,#bd94ff);-webkit-background-clip:text;color:transparent}.fd-alert-hero p{max-width:620px;color:#9c95a4;font-size:14px;line-height:1.65}.fd-alert-orbit{position:absolute;right:8%;top:50%;width:190px;height:190px;transform:translateY(-50%)}.fd-alert-orbit i{position:absolute;inset:0;border:1px solid rgba(119,228,255,.13);border-radius:50%}.fd-alert-orbit i:nth-child(2){inset:28px;border-color:rgba(177,104,255,.18)}.fd-alert-orbit b{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(12deg);width:60px;height:84px;display:grid;place-items:center;border:1px solid rgba(157,109,255,.38);border-radius:8px;color:#aeefff;background:rgba(157,109,255,.08);box-shadow:0 0 55px rgba(111,93,255,.2)}.fd-alert-counts{position:absolute;left:34px;bottom:25px;display:flex;gap:28px}.fd-alert-counts span{color:#6d6774;font-size:7px}.fd-alert-counts b{display:block;color:#fff;font-size:17px;letter-spacing:0}.fd-alerts-gate{border:1px solid rgba(155,92,255,.3);background:linear-gradient(100deg,rgba(79,30,141,.17),rgba(10,9,15,.95));border-radius:18px;padding:22px;display:flex;align-items:center;justify-content:space-between;gap:24px}.fd-alerts-gate span{font-size:9px;letter-spacing:.16em;color:#ad77ff;font-weight:800}.fd-alerts-gate h2{font-size:19px;margin:6px 0}.fd-alerts-gate p{color:#918a99;margin:0;font-size:12px;max-width:780px}.fd-alerts-feed{border:1px solid rgba(255,255,255,.075);background:#09080d;border-radius:22px;overflow:hidden}.fd-alerts-feedhead{display:flex;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #1b1820}.fd-alerts-feedhead span{display:block;font-size:10px;letter-spacing:.14em;font-weight:850}.fd-alerts-feedhead small,.fd-alerts-feedhead b{color:#716b79;font-size:9px}.fd-signal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:#19161e}.fd-signal-card{position:relative;padding:20px;background:radial-gradient(circle at 100% 0%,rgba(157,109,255,.055),transparent 30%),#0b0a10}.fd-signal-card-top{display:flex;justify-content:space-between;align-items:center}.fd-signal-card-top>span{display:flex;align-items:center;gap:8px;color:#8d8695;font-size:8px;font-weight:900;letter-spacing:.13em}.fd-signal-card-top i{width:26px;height:26px;display:grid;place-items:center;border:1px solid rgba(157,109,255,.2);border-radius:8px;color:#b794ff;font-style:normal}.fd-signal-card-top time{color:#655f6b;font-size:9px}.fd-signal-card h2{margin:16px 0 3px;font-size:17px}.fd-signal-card p{margin:0 0 13px;color:#817a88;font-size:10px}.fd-signal-detail{min-height:38px;margin:12px 0;color:#a59eab;font-size:11px;line-height:1.5}.fd-signal-card footer{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.fd-signal-card footer span{padding:8px;border:1px solid rgba(255,255,255,.055);border-radius:9px;background:rgba(0,0,0,.18)}.fd-signal-card footer small{display:block;color:#5f5966;font-size:6px;letter-spacing:.1em}.fd-signal-card footer b{font-size:9px}.fd-alert-blur{filter:blur(5px);user-select:none}.fd-alert-lock{position:absolute;right:18px;top:57px;color:#ad77ff}.fd-alerts-empty{text-align:center;padding:70px 20px}.fd-alerts-empty>span{font-size:34px;color:#8e63c7}.fd-alerts-empty p{color:#817a88}@media(max-width:900px){.fd-signal-grid{grid-template-columns:1fr}.fd-alert-orbit{opacity:.25}.fd-alert-hero>div:first-child{max-width:90%}}@media(max-width:650px){.fd-alert-hero{padding:25px;min-height:380px}.fd-alert-counts{left:25px;gap:14px;flex-wrap:wrap}.fd-alerts-gate{display:block}.fd-signal-card footer{grid-template-columns:1fr 1fr}}
    `}</style>
  </DashboardPageShell>;
}
