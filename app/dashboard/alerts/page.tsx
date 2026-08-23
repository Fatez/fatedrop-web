import type { Metadata } from "next";
import Link from "next/link";
import { CanonicalAlertSignalPack } from "@/components/canonical-alert-signal-pack";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { StartMembershipButton } from "@/components/membership-actions";
import { getCurrentSnapshot } from "@/lib/auth";
import { listCanonicalAlerts, type CanonicalAlert, type CanonicalSignalStage } from "@/lib/canonical-alerts";
import { activityLabel, buildDashboardData, moneyFromPence, relativeTime } from "@/lib/dashboard";
import { hasPremiumAccess, membershipLabel } from "@/lib/membership";
import { listUserFateMatches } from "@/lib/fate-match-storage";
import { serverNowSeconds } from "@/lib/server-time";

export const metadata: Metadata = {
  title: "Alerts | FateDrop Dashboard",
  description: "Your FateDrop hunts, notification history and alert access.",
  robots: { index: false, follow: false },
};

function alertTime(alert: CanonicalAlert) {
  const timestamp = Math.floor(new Date(alert.detectedAt).getTime() / 1000);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function rrpLine(alert: CanonicalAlert) {
  const item = alert.product.pricePence == null ? null : moneyFromPence(alert.product.pricePence);
  const delivered = alert.product.deliveredPricePence == null ? null : moneyFromPence(alert.product.deliveredPricePence);
  const rrp = alert.priceIntelligence.rrpPence == null ? null : moneyFromPence(alert.priceIntelligence.rrpPence);
  const delta = alert.priceIntelligence.rrpDeltaPercent;
  const pieces = [item ? `${item} item` : null, delivered && alert.product.deliveredPricePence !== alert.product.pricePence ? `${delivered} delivered` : null];
  if (rrp) pieces.push(delta == null ? `RRP ${rrp}` : `${delta === 0 ? "At RRP" : delta > 0 ? `+${delta.toFixed(1)}% over RRP` : `${Math.abs(delta).toFixed(1)}% below RRP`} · RRP ${rrp}`);
  return pieces.filter(Boolean).join(" · ");
}

function verdictLine(alert: CanonicalAlert) {
  const intel = alert.priceIntelligence;
  if (alert.fateStage === "VANISHED") {
    const alternatives = alert.preparedLinks.alternatives.length;
    return alternatives
      ? { tone: "better", text: `VANISHED · ${alternatives} LIVE ALTERNATIVE${alternatives === 1 ? "" : "S"} READY` }
      : { tone: "unknown", text: "VANISHED · NO LIVE ALTERNATIVE CURRENTLY VERIFIED" };
  }
  if (alert.fateStage === "WHISPER") {
    return intel.lowestKnown
      ? { tone: "unknown", text: `WHISPER · PRODUCT MOVEMENT · ${intel.lowestKnown.retailer || "ALTERNATIVE"} ALREADY IN NETWORK` }
      : { tone: "unknown", text: "WHISPER · PRODUCT / CATALOGUE MOVEMENT · STOCK NOT CONFIRMED" };
  }
  if (alert.fateStage === "ECHO") {
    return intel.lowestKnown
      ? { tone: "unknown", text: `ECHO · GET READY · ${intel.lowestKnown.retailer || "ALTERNATIVE"} ALREADY IN NETWORK` }
      : { tone: "unknown", text: "ECHO · QUEUE / TRAFFIC / SECURITY READINESS · STOCK NOT CONFIRMED" };
  }
  if (intel.verdict === "BETTER_OFFER_FOUND" && intel.lowestKnown?.comparisonPricePence != null) {
    const lowest = moneyFromPence(intel.lowestKnown.comparisonPricePence);
    const saving = moneyFromPence(intel.savingsPence);
    const basis = intel.comparisonBasis === "delivered" ? "delivered" : "item-price";
    return {
      tone: "better",
      text: `BETTER OFFER FOUND · ${lowest} at ${intel.lowestKnown.retailer || "another retailer"}${saving ? ` · save ${saving}` : ""} · ${basis} comparison`,
    };
  }
  if (intel.verdict === "LOWEST_KNOWN") return { tone: "lowest", text: `LOWEST KNOWN · Best comparable ${intel.comparisonBasis === "delivered" ? "delivered price" : "item price"}` };
  return { tone: "unknown", text: "NO FAIR COMPARISON · Delivery or comparable pricing is incomplete" };
}

function primaryActionLabel(alert: CanonicalAlert) {
  if (alert.fateStage === "MANIFESTED") return "BUY / VIEW PRODUCT ↗";
  if (alert.fateStage === "WHISPER" || alert.fateStage === "ECHO") return "INSPECT PAGE ↗";
  if (alert.fateStage === "VANISHED") return "VIEW LAST PAGE ↗";
  return "VIEW PRODUCT ↗";
}

function companionForStage(stage: CanonicalSignalStage) {
  if (stage === "WHISPER") return "ORU";
  if (stage === "ECHO") return "FENN";
  if (stage === "MANIFESTED") return "KORU";
  if (stage === "VANISHED") return "NIXON";
  return "FATEDROP";
}

function companionVoice(stage: CanonicalSignalStage) {
  if (stage === "WHISPER") return "Oru spotted movement in the network";
  if (stage === "ECHO") return "Fenn picked up readiness activity";
  if (stage === "MANIFESTED") return "Koru found verified purchasable stock";
  if (stage === "VANISHED") return "Nixon saw the verified availability disappear";
  return "FateDrop observed network activity";
}

export default async function AlertsPage() {
  const snapshot = await getCurrentSnapshot();
  const premium = snapshot ? hasPremiumAccess(snapshot.membership) : false;
  const plan = snapshot ? membershipLabel(snapshot.membership) : "Free";
  const data = snapshot ? await buildDashboardData(snapshot) : null;
  let fateFinds: Awaited<ReturnType<typeof listUserFateMatches>> = [];
  let canonicalAlerts: CanonicalAlert[] = [];
  if (snapshot) {
    try { fateFinds = await listUserFateMatches(snapshot.account.id); } catch { fateFinds = []; }
    try { canonicalAlerts = await listCanonicalAlerts({ limit: 20 }); } catch { canonicalAlerts = []; }
  }
  const activeFateFinds = fateFinds.filter((item)=>item.enabled);
  const personalHistory = data?.personal.recent ?? [];
  const trialEligible = Boolean(snapshot && !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt);
  const hasOpenSubscription = Boolean(snapshot?.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled");
  const now = data?.generatedAt ?? serverNowSeconds();

  return <DashboardPageShell title="Alerts" eyebrow="YOUR HUNTS · YOUR NOTIFICATIONS">
    <div className="fd-personal-alerts">
      <section className="fd-alert-personal-hero">
        <div><span>FATEDROP // PERSONAL ALERT CENTRE</span><h1>Your friends are hunting<br/><em>the network for you.</em></h1><p>Oru watches for Whispers, Fenn catches Echoes, Koru confirms Manifested stock and Nixon tracks what Vanishes. The dashboard, app and Discord all follow the same canonical FateDrop lifecycle and the same underlying retailer evidence.</p><div className="fd-alert-hero-actions"><Link href="/dashboard/watchlist">Create FateFind →</Link><Link href="/dashboard/notifications">Notification preferences →</Link><Link href="/dashboard">Open Network Activity →</Link></div></div>
        <div className="fd-alert-personal-metrics"><span><b>{activeFateFinds.length}</b>ACTIVE FATEFINDS</span><span><b>{canonicalAlerts.length}</b>RECENT SIGNALS</span><span><b>{plan}</b>ACCESS</span></div>
      </section>

      {!premium ? <section className="fd-alerts-gate"><div><span>PREMIUM MONITORING</span><h2>Free sees the movement. Premium gets the price intelligence.</h2><p>Canonical signals remain visible, while RRP deltas, cheapest-known comparable offers, prepared retailer links, priority delivery and FateFind automation form the deeper monitoring layer.</p></div>{hasOpenSubscription ? <Link className="button button-primary" href="/dashboard/membership">Manage membership →</Link> : <StartMembershipButton tier="plus" label={trialEligible ? "Start free trial" : snapshot?.membership.stripeCustomerId ? "Restart Plus" : "Choose Plus"}/>}</section> : null}

      <section className="fd-dash-card fd-canonical-alerts"><div className="fd-dash-card-head"><span>CANONICAL SIGNAL INBOX</span><small>{canonicalAlerts.length ? `${canonicalAlerts.length} recent` : "Awaiting signals"}</small></div>{canonicalAlerts.length ? <div className="fd-canonical-list">{canonicalAlerts.map((alert)=>{
        const verdict = verdictLine(alert);
        return <article key={alert.id} className={`fd-canonical-signal ${alert.fateStage.toLowerCase()}`}>
          <div className="fd-canonical-stage"><i/><b>{companionForStage(alert.fateStage)} · {alert.fateStage}</b><small>{relativeTime(alertTime(alert),now)}</small></div>
          <div className="fd-canonical-copy"><strong>{alert.title}</strong><span>{premium ? `${companionVoice(alert.fateStage)} · ${alert.retailer} · ${alert.message}` : `${companionVoice(alert.fateStage)} · Connected retailer · Premium price detail`}</span>{premium && rrpLine(alert) ? <em>{rrpLine(alert)}</em> : null}{premium ? <em className={`verdict ${verdict.tone}`}>{verdict.text}</em> : null}</div>
          <div className="fd-canonical-action">{premium ? <a href={alert.productUrl} target="_blank" rel="noreferrer">{primaryActionLabel(alert)}</a> : <Link href="/dashboard/membership">UNLOCK →</Link>}</div>
          {premium ? <CanonicalAlertSignalPack alert={alert} now={now}/> : null}
        </article>;
      })}</div> : <div className="fd-dashboard-empty"><strong>No canonical signals available.</strong><span>FateDrop does not fabricate an alert when the network has nothing real to report.</span></div>}</section>

      <div className="fd-alert-personal-grid">
        <section className="fd-dash-card fd-alert-finds"><div className="fd-dash-card-head"><span>ACTIVE FATEFINDS</span><Link href="/dashboard/watchlist">Manage hunts</Link></div>{activeFateFinds.length ? <div className="fd-dashboard-list">{activeFateFinds.slice(0,8).map((hunt)=><article key={hunt.id}><span className="fd-store-thumb">◎</span><div><strong>{hunt.query || "Resolved product"}</strong><small>{hunt.maxTruePricePence !== null ? `Max £${(hunt.maxTruePricePence/100).toFixed(2)} delivered` : "Any True Price"}{hunt.maxPercentAboveRrp !== null ? ` · max +${hunt.maxPercentAboveRrp}% RRP` : ""} · {hunt.scope}</small></div><aside>WATCHING<small>A qualifying result becomes a FateMatch</small></aside></article>)}</div> : <div className="fd-dashboard-empty"><strong>No active FateFinds yet.</strong><span>Create a structured product hunt and FateDrop can evaluate matching network opportunities.</span><Link className="fd-dashboard-wide-button" href="/dashboard/watchlist">Create FateFind →</Link></div>}</section>

        <section className="fd-dash-card fd-alert-delivery"><div className="fd-dash-card-head"><span>DELIVERY CHANNELS</span><Link href="/dashboard/notifications">Edit preferences</Link></div><div className="fd-delivery-list"><div><b>WEB</b><span>Canonical signal inbox plus account notification history.</span><i className="live">AVAILABLE</i></div><div><b>DISCORD</b><span>Oru, Fenn, Koru and Nixon route the same canonical lifecycle into their dedicated Discord channels when configured.</span><i className="pending">CONFIGURATION-DEPENDENT</i></div><div><b>APP PUSH</b><span>Device registration and exact-alert routing are connected; remote delivery remains feature-gated until controlled production testing.</span><i className="pending">VALIDATING</i></div></div><p>Oru/Whisper, Fenn/Echo, Koru/Manifested, Nixon/Vanished, price and FateMatch preferences share one account-level persistence model. FateDrop never treats an unconfigured channel as delivered.</p></section>
      </div>

      <section className="fd-dash-card fd-alert-history"><div className="fd-dash-card-head"><span>YOUR NOTIFICATION / HUNT HISTORY</span><small>{personalHistory.length ? `${personalHistory.length} recent` : "No personal events yet"}</small></div>{personalHistory.length && data ? <div className="fd-dashboard-list">{personalHistory.map((event)=><article key={event.id}><span className="fd-store-thumb">◇</span><div><strong>{event.title || activityLabel(event)}</strong><small>{event.subtitle || event.retailer || activityLabel(event)}</small></div><aside>{event.amountPence ? moneyFromPence(event.amountPence) : activityLabel(event).toUpperCase()}<small>{relativeTime(event.occurredAt,data.generatedAt)}</small></aside></article>)}</div> : <div className="fd-dashboard-empty"><strong>Nothing has been sent to you yet.</strong><span>Network activity can still be happening above; this list only grows from real personal/account events.</span></div>}</section>

      <section className="fd-dash-card fd-alert-model"><div><span>UNIVERSAL SIGNAL LANGUAGE</span><h2>Oru whispers. Fenn echoes. Koru finds it. Nixon sees it vanish.</h2></div><p>Oru/Whisper means product or catalogue movement before confirmed stock. Fenn/Echo is queue, traffic, security or access readiness. Koru/Manifested means verified purchasable availability. Nixon/Vanished means previously verified availability is gone. The meaning does not change between Discord, web or app.</p></section>
    </div>
    <style>{`
      .fd-personal-alerts{display:grid;gap:20px}.fd-alert-personal-hero{position:relative;overflow:hidden;min-height:330px;padding:34px;border:1px solid rgba(157,109,255,.18);border-radius:24px;background:linear-gradient(90deg,rgba(6,7,13,.95),rgba(6,7,13,.66)),url('/assets/cardwave-bg.webp') center right/cover no-repeat}.fd-alert-personal-hero>div:first-child{max-width:720px}.fd-alert-personal-hero span{color:#73e9fb;font-size:9px;font-weight:900;letter-spacing:.18em}.fd-alert-personal-hero h1{margin:13px 0;font-size:clamp(2.5rem,4.5vw,4.7rem);line-height:.91;letter-spacing:-.055em}.fd-alert-personal-hero h1 em{font-style:normal;background:linear-gradient(90deg,#fff,#a5efff,#bd94ff);-webkit-background-clip:text;color:transparent}.fd-alert-personal-hero p{max-width:680px;color:#9c95a4;font-size:14px;line-height:1.65}.fd-alert-hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.fd-alert-hero-actions a{padding:10px 13px;border:1px solid rgba(88,232,255,.18);border-radius:10px;color:#c9f7ff;font-size:8px;font-weight:900;text-decoration:none}.fd-alert-personal-metrics{position:absolute;left:34px;bottom:26px;display:flex;gap:28px}.fd-alert-personal-metrics span{color:#6d6774;font-size:7px}.fd-alert-personal-metrics b{display:block;color:#fff;font-size:17px;letter-spacing:0}.fd-alerts-gate{border:1px solid rgba(155,92,255,.3);background:linear-gradient(100deg,rgba(79,30,141,.17),rgba(10,9,15,.95));border-radius:18px;padding:22px;display:flex;align-items:center;justify-content:space-between;gap:24px}.fd-alerts-gate span{font-size:9px;letter-spacing:.16em;color:#ad77ff;font-weight:800}.fd-alerts-gate h2{font-size:19px;margin:6px 0}.fd-alerts-gate p{color:#918a99;margin:0;font-size:12px;max-width:780px}.fd-canonical-alerts{padding:24px}.fd-canonical-list{display:grid;gap:9px;margin-top:16px}.fd-canonical-signal{display:grid;grid-template-columns:150px 1fr auto;gap:18px;align-items:center;padding:15px;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.018)}.fd-canonical-stage{display:grid;gap:4px}.fd-canonical-stage i{width:7px;height:7px;border-radius:50%;background:#8d6cff;box-shadow:0 0 14px #8d6cff}.fd-canonical-signal.whisper .fd-canonical-stage i{background:#70def0;box-shadow:0 0 14px #70def0}.fd-canonical-signal.manifested .fd-canonical-stage i{background:#54e5ab;box-shadow:0 0 14px #54e5ab}.fd-canonical-signal.vanished .fd-canonical-stage i{background:#ff6b79;box-shadow:0 0 14px #ff6b79}.fd-canonical-stage b{font-size:8px;letter-spacing:.1em;color:#c2afff}.fd-canonical-signal.whisper .fd-canonical-stage b{color:#86eefa}.fd-canonical-signal.manifested .fd-canonical-stage b{color:#68e8b7}.fd-canonical-stage small{color:#665f6c;font-size:7px}.fd-canonical-copy{display:grid;gap:4px;min-width:0}.fd-canonical-copy strong{color:#f5f3f8;font-size:12px}.fd-canonical-copy span{color:#827b89;font-size:9px}.fd-canonical-copy em{font-style:normal;color:#70def0;font-size:8px;font-weight:800}.fd-canonical-copy .verdict{font-weight:900;letter-spacing:.03em}.fd-canonical-copy .verdict.better{color:#ffbd62}.fd-canonical-copy .verdict.lowest{color:#62e9b1}.fd-canonical-copy .verdict.unknown{color:#706a77}.fd-canonical-action a{display:block;padding:9px 11px;border:1px solid rgba(116,225,244,.15);border-radius:9px;color:#9beeff;font-size:7px;font-weight:900;text-decoration:none;white-space:nowrap}.fd-alert-personal-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:20px}.fd-alert-finds,.fd-alert-delivery,.fd-alert-history{padding:24px}.fd-delivery-list{display:grid;gap:8px;margin-top:16px}.fd-delivery-list>div{display:grid;grid-template-columns:75px 1fr auto;gap:10px;align-items:center;padding:12px;border:1px solid rgba(255,255,255,.065);border-radius:11px;background:rgba(255,255,255,.02)}.fd-delivery-list b{font-size:9px}.fd-delivery-list span{color:#85808c;font-size:9px}.fd-delivery-list i{font-size:6px;font-style:normal;font-weight:900;letter-spacing:.08em}.fd-alert-delivery>p{color:#77717e;font-size:9px;line-height:1.55}.fd-alert-model{padding:24px 28px;display:grid;grid-template-columns:.8fr 1.2fr;gap:28px;align-items:center}.fd-alert-model span{color:#73e9fb;font-size:8px;font-weight:900;letter-spacing:.14em}.fd-alert-model h2{margin:7px 0 0;font-size:22px}.fd-alert-model p{margin:0;color:#908a97;font-size:11px;line-height:1.65}@media(max-width:900px){.fd-alert-personal-grid,.fd-alert-model{grid-template-columns:1fr}.fd-canonical-signal{grid-template-columns:110px 1fr}.fd-canonical-action{grid-column:2}.fd-alert-personal-metrics{gap:14px;flex-wrap:wrap}.fd-delivery-list>div{grid-template-columns:1fr}}@media(max-width:650px){.fd-alert-personal-hero{padding:25px;min-height:430px}.fd-alert-personal-metrics{left:25px}.fd-alerts-gate{display:block}.fd-canonical-alerts,.fd-alert-finds,.fd-alert-delivery,.fd-alert-history{padding:20px}.fd-canonical-signal{grid-template-columns:1fr}.fd-canonical-action{grid-column:1}}
    `}</style>
  </DashboardPageShell>;
}