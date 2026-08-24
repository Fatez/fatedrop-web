import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertStageTrend } from "@/components/alert-stage-trend";
import { CanonicalAlertSignalPack } from "@/components/canonical-alert-signal-pack";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { StartMembershipButton } from "@/components/membership-actions";
import { getCurrentSnapshot } from "@/lib/auth";
import { listCanonicalAlerts, type CanonicalAlert, type CanonicalSignalStage } from "@/lib/canonical-alerts";
import { getCanonicalSignalTrend } from "@/lib/canonical-alert-trends";
import { activityLabel, buildDashboardData, moneyFromPence, relativeTime, signalCauseLabel } from "@/lib/dashboard";
import type { NetworkSignal, SignalKind } from "@/lib/dashboard-storage";
import { listUserFateMatches } from "@/lib/fate-match-storage";
import { hasPremiumAccess, membershipLabel } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Alerts | FateDrop Dashboard",
  description: "FateDrop's precise signal activity ledger: lifecycle, cause, retailer, product, price context and evidence.",
  robots: { index: false, follow: false },
};

const lifecycle = ["WHISPER", "ECHO", "MANIFESTED", "VANISHED"] as const;
type FilterStage = typeof lifecycle[number];

const alertStageMeta = [
  { state: "whisper", stage: "WHISPER", companion: "ORU", description: "Catalogue and product movement before verified purchasable stock." },
  { state: "echo", stage: "ECHO", companion: "FENN", description: "Queue, traffic, security and access-readiness activity." },
  { state: "manifested", stage: "MANIFESTED", companion: "KORU", description: "Verified purchasable availability observed by the FateDrop network." },
  { state: "vanished", stage: "VANISHED", companion: "NYXEN", description: "Previously verified availability that is no longer purchasable." },
] as const;

const causeOptions: readonly [SignalKind, string][] = [
  ["catalogue_new", "Catalogue new"],
  ["catalogue_state_change", "Catalogue change"],
  ["price_change", "Price change"],
  ["launch_date_change", "Launch change"],
  ["queue", "Queue"],
  ["security", "Security"],
  ["access_blocked", "Access control"],
  ["new_listing_live", "New listing live"],
  ["availability_live", "Availability live"],
  ["restock", "Restock"],
  ["sold_out", "Sold out"],
  ["lifecycle_unspecified", "Cause unclassified"],
] as const;

function alertTime(alert: CanonicalAlert) {
  const timestamp = Math.floor(new Date(alert.detectedAt).getTime() / 1000);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function priceContext(alert: CanonicalAlert) {
  const item = moneyFromPence(alert.product.pricePence);
  const delivered = moneyFromPence(alert.product.deliveredPricePence);
  const rrp = moneyFromPence(alert.priceIntelligence.rrpPence);
  const delta = alert.priceIntelligence.rrpDeltaPercent;
  const pieces = [item ? `${item} item` : null];
  if (delivered && alert.product.deliveredPricePence !== alert.product.pricePence) pieces.push(`${delivered} True Price`);
  if (rrp) pieces.push(delta == null ? `RRP ${rrp}` : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}% vs RRP · ${rrp}`);
  return pieces.filter(Boolean).join(" · ");
}

function verdict(alert: CanonicalAlert) {
  if (alert.fateStage === "WHISPER") return "Movement only · stock is not confirmed";
  if (alert.fateStage === "ECHO") return "Get ready · stock is not confirmed";
  if (alert.fateStage === "VANISHED") return alert.preparedLinks.alternatives.length ? `${alert.preparedLinks.alternatives.length} live alternative${alert.preparedLinks.alternatives.length === 1 ? "" : "s"} known` : "Previously confirmed availability is gone";
  if (alert.priceIntelligence.verdict === "LOWEST_KNOWN") return "Lowest known comparable offer";
  if (alert.priceIntelligence.verdict === "BETTER_OFFER_FOUND") return "A better comparable offer exists";
  return "Live · fair price comparison incomplete";
}

function primaryActionLabel(stage: CanonicalSignalStage) {
  if (stage === "MANIFESTED") return "BUY / VIEW ↗";
  if (stage === "VANISHED") return "LAST PAGE ↗";
  return "INSPECT ↗";
}

function causeFor(alert: CanonicalAlert, exactSignals: Map<string, NetworkSignal>) {
  const signal = exactSignals.get(alert.id);
  const label = signal ? signalCauseLabel(signal) : null;
  const kind = signal?.kind && signal.kind !== signal.state ? signal.kind : "lifecycle_unspecified";
  return { key: kind as SignalKind, label: label ?? "Cause unclassified" };
}

function filterHref(input: { stage?: string; cause?: string; q?: string }) {
  const params = new URLSearchParams();
  if (input.stage) params.set("stage", input.stage);
  if (input.cause) params.set("cause", input.cause);
  if (input.q) params.set("q", input.q);
  const query = params.toString();
  return query ? `/dashboard/alerts?${query}` : "/dashboard/alerts";
}

export default async function AlertsPage({ searchParams }: { searchParams: Promise<{ stage?: string; cause?: string; q?: string }> }) {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard/alerts");
  const params = await searchParams;
  const premium = hasPremiumAccess(snapshot.membership);
  const plan = membershipLabel(snapshot.membership);
  const data = await buildDashboardData(snapshot);
  const stage = lifecycle.includes((params.stage ?? "").toUpperCase() as FilterStage) ? (params.stage ?? "").toUpperCase() as FilterStage : null;
  const cause = causeOptions.some(([key]) => key === params.cause) ? params.cause as SignalKind : null;
  const q = (params.q ?? "").trim().slice(0, 120);

  let alerts: CanonicalAlert[] = [];
  let fateFinds: Awaited<ReturnType<typeof listUserFateMatches>> = [];
  let alertTrend: Awaited<ReturnType<typeof getCanonicalSignalTrend>> | null = null;
  try { alerts = await listCanonicalAlerts({ limit: 100 }); } catch { alerts = []; }
  try { fateFinds = await listUserFateMatches(snapshot.account.id); } catch { fateFinds = []; }
  try { alertTrend = await getCanonicalSignalTrend(7); } catch { alertTrend = null; }

  const exactSignals = new Map((data.network?.recentSignals ?? []).map((signal) => [signal.id, signal]));
  const stageCounts = Object.fromEntries(lifecycle.map((key) => [key, alerts.filter((alert) => alert.fateStage === key).length])) as Record<FilterStage, number>;
  const filtered = alerts.filter((alert) => {
    if (stage && alert.fateStage !== stage) return false;
    const exactCause = causeFor(alert, exactSignals);
    if (cause && exactCause.key !== cause) return false;
    if (q) {
      const haystack = `${alert.title} ${alert.retailer} ${alert.message}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase())) return false;
    }
    return lifecycle.includes(alert.fateStage as FilterStage);
  });

  const activeFateFinds = fateFinds.filter((item) => item.enabled);
  const personalHistory = data.personal.recent;
  const trialEligible = !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt;
  const hasOpenSubscription = Boolean(snapshot.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled");

  return <DashboardPageShell title="Alerts" eyebrow="NETWORK FLIGHT RECORDER">
    <div className="fd-ledger-page">
      <section className="fd-ledger-hero fd-dash-card">
        <div className="fd-ledger-intro"><span>PRECISE SIGNAL ACTIVITY</span><h1>Every alarm should tell you exactly what happened.</h1><p><b>Lifecycle</b> tells you where the opportunity is: Whisper, Echo, Manifested or Vanished. <b>Cause</b> tells you why that record exists: catalogue change, queue, security, restock, sold out and so on. They are recorded separately so the dashboard never turns every bit of activity into the same alarm.</p></div>
        <div className="fd-ledger-stages">{lifecycle.map((key) => <Link className={stage === key ? `active ${key.toLowerCase()}` : key.toLowerCase()} key={key} href={filterHref({ stage: stage === key ? undefined : key, cause: cause ?? undefined, q: q || undefined })}><span>{key}</span><strong>{stageCounts[key]}</strong><small>{key === "WHISPER" ? "something changed" : key === "ECHO" ? "get ready" : key === "MANIFESTED" ? "confirmed live" : "confirmed gone"}</small></Link>)}</div>
      </section>

      {alertTrend ? <section className="fd-alert-trends-shell">
        <div className="fd-alert-trends-heading">
          <div><span>7 DAY SIGNAL ACTIVITY</span><h2>Each companion has its own network pulse.</h2></div>
          <p>These lines come from persisted canonical Whisper, Echo, Manifested and Vanished signals. They measure network activity, not Discord delivery attempts.</p>
        </div>
        <div className="fd-alert-trends-grid">
          {alertStageMeta.map((meta) => {
            const trend = alertTrend.byState[meta.state];
            return <AlertStageTrend key={meta.state} stage={meta.stage} companion={meta.companion} description={meta.description} total={trend.total} points={trend.points}/>;
          })}
        </div>
      </section> : null}

      {!premium ? <section className="fd-ledger-gate"><div><span>PREMIUM DETAIL</span><h2>Free can see movement. Premium gets the buying intelligence.</h2><p>Retailer identity, exact price/RRP context, prepared links, signal threads and active FateFind automation remain the deeper monitoring layer.</p></div>{hasOpenSubscription ? <Link className="button button-primary" href="/dashboard/membership">Manage membership →</Link> : <StartMembershipButton tier="plus" label={trialEligible ? "Start free trial" : snapshot.membership.stripeCustomerId ? "Restart Plus" : "Choose Plus"}/>}</section> : null}

      <section className="fd-ledger-filter fd-dash-card">
        <form action="/dashboard/alerts" method="get">
          <label className="wide"><span>SEARCH ACTIVITY</span><input name="q" defaultValue={q} placeholder="Product, retailer or reason…" /></label>
          <label><span>LIFECYCLE</span><select name="stage" defaultValue={stage ?? ""}><option value="">All four states</option>{lifecycle.map((key) => <option value={key} key={key}>{key}</option>)}</select></label>
          <label><span>EXACT CAUSE</span><select name="cause" defaultValue={cause ?? ""}><option value="">All causes</option>{causeOptions.map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
          <button type="submit">FILTER →</button>
          {(stage || cause || q) ? <Link href="/dashboard/alerts">CLEAR</Link> : null}
        </form>
        <p>Cause filters only use a precise cause when FateDrop actually received one. Older or incomplete records stay <b>Cause unclassified</b> rather than being guessed.</p>
      </section>

      <section className="fd-ledger-card fd-dash-card">
        <header><div><span>SIGNAL LEDGER</span><h2>{filtered.length} record{filtered.length === 1 ? "" : "s"} in this view</h2></div><small>{plan} access · newest first</small></header>
        {filtered.length ? <div className="fd-ledger-list">{filtered.map((alert) => {
          const exactCause = causeFor(alert, exactSignals);
          const stageClass = alert.fateStage.toLowerCase();
          const context = priceContext(alert);
          return <article className={`fd-ledger-row ${stageClass}`} key={alert.id}>
            <div className="fd-ledger-state"><i/><b>{alert.fateStage}</b><em>{exactCause.label}</em><small>{relativeTime(alertTime(alert), data.generatedAt)}</small></div>
            <div className="fd-ledger-product"><small>{premium ? alert.retailer : "Connected retailer"}</small><strong>{premium ? alert.title : "Premium signal detail"}</strong><p>{premium ? alert.message : alert.fateStage === "WHISPER" ? "Product or catalogue movement detected." : alert.fateStage === "ECHO" ? "Access, queue or security readiness changed." : alert.fateStage === "MANIFESTED" ? "Confirmed purchasable availability is live." : "Previously confirmed availability is gone."}</p>{premium && context ? <em>{context}</em> : null}<em className="verdict">{verdict(alert)}</em></div>
            <div className="fd-ledger-actions">{premium ? <a className="primary" href={alert.productUrl} target="_blank" rel="noreferrer">{primaryActionLabel(alert.fateStage)}</a> : <Link className="primary" href="/dashboard/membership">UNLOCK →</Link>}<Link href={`/dashboard/true-price?q=${encodeURIComponent(alert.preparedLinks.compareQuery)}`}>TRUE PRICE</Link><Link href={`/dashboard/watchlist?q=${encodeURIComponent(alert.preparedLinks.fateFindQuery)}`}>FATEFIND</Link></div>
            {premium ? <CanonicalAlertSignalPack alert={alert} now={data.generatedAt}/> : null}
          </article>;
        })}</div> : <div className="fd-dashboard-empty"><strong>No signals match this view.</strong><span>Clear a filter or wait for new evidence. FateDrop does not create filler activity.</span></div>}
      </section>

      <div className="fd-ledger-support-grid">
        <section className="fd-dash-card fd-ledger-hunts"><header><div><span>YOUR FATEFINDS</span><h2>{activeFateFinds.length} active hunt{activeFateFinds.length === 1 ? "" : "s"}</h2></div><Link href="/dashboard/watchlist">Manage →</Link></header><p>A FateFind is what you asked FateDrop to hunt. A FateMatch is a real observed offer that satisfies those rules.</p>{activeFateFinds.length ? <div>{activeFateFinds.slice(0,4).map((hunt) => <span key={hunt.id}><b>{hunt.query || "Resolved product"}</b><small>{hunt.maxTruePricePence !== null ? `Max £${(hunt.maxTruePricePence / 100).toFixed(2)} True Price` : "No True Price cap"}</small></span>)}</div> : <Link className="fd-ledger-wide-link" href="/dashboard/watchlist">Create your first FateFind →</Link>}</section>
        <section className="fd-dash-card fd-ledger-delivery"><header><div><span>WHERE ALERTS REACH YOU</span><h2>One preference record.</h2></div><Link href="/dashboard/notifications">Edit →</Link></header><p>Website, app and Discord consume the same lifecycle preferences only when that channel is actually configured and entitled. An unavailable channel is never reported as delivered.</p><div><span><b>WEB</b><small>Available</small></span><span><b>APP PUSH</b><small>Controlled validation</small></span><span><b>DISCORD</b><small>Configuration dependent</small></span></div></section>
      </div>

      <section className="fd-dash-card fd-ledger-personal"><header><div><span>YOUR PERSONAL HISTORY</span><h2>What FateDrop has recorded for your account.</h2></div><small>{personalHistory.length} recent</small></header>{personalHistory.length ? <div className="fd-dashboard-list">{personalHistory.map((event) => <article key={event.id}><span className="fd-store-thumb">◇</span><div><strong>{event.title || activityLabel(event)}</strong><small>{event.subtitle || event.retailer || activityLabel(event)}</small></div><aside>{event.amountPence ? moneyFromPence(event.amountPence) : activityLabel(event).toUpperCase()}<small>{relativeTime(event.occurredAt, data.generatedAt)}</small></aside></article>)}</div> : <div className="fd-dashboard-empty"><strong>No personal events yet.</strong><span>The network ledger above can still be active; this section only records events tied to your account.</span></div>}</section>
    </div>

    <style>{`
      .fd-ledger-page{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-ledger-page .fd-dash-card{border-color:rgba(221,203,188,.085);background:linear-gradient(145deg,#0e1216,#090d11 74%);border-radius:12px}.fd-ledger-hero{padding:26px;background:radial-gradient(circle at 88% 6%,rgba(123,74,155,.13),transparent 30%),linear-gradient(145deg,#101318,#090c10 70%)!important}.fd-ledger-intro>span,.fd-ledger-card header span,.fd-ledger-hunts header span,.fd-ledger-delivery header span,.fd-ledger-personal header span{color:#aa886d;font-size:7px;font-weight:900;letter-spacing:.16em}.fd-ledger-intro h1{max-width:930px;margin:9px 0 13px;color:#eee4da;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.5rem,4vw,4.7rem);font-weight:500;line-height:.94;letter-spacing:-.05em}.fd-ledger-intro p{max-width:950px;margin:0;color:#918885;font-size:11px;line-height:1.72}.fd-ledger-intro p b{color:#d9cbc0}.fd-ledger-stages{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:22px}.fd-ledger-stages a{padding:12px;border:1px solid rgba(221,203,188,.07);border-radius:9px;background:rgba(255,255,255,.016);text-decoration:none}.fd-ledger-stages a.active{background:rgba(121,78,149,.08);border-color:rgba(171,126,195,.22)}.fd-ledger-stages span{display:block;font-size:7px;font-weight:900;letter-spacing:.1em}.fd-ledger-stages strong{display:block;margin:5px 0;color:#e4dad2;font-family:Georgia,serif;font-size:25px;font-weight:500}.fd-ledger-stages small{color:#6f6868;font-size:6px}.fd-ledger-stages .whisper span{color:#a970d6}.fd-ledger-stages .echo span{color:#9574c7}.fd-ledger-stages .manifested span{color:#86a777}.fd-ledger-stages .vanished span{color:#b95a61}.fd-ledger-gate{padding:18px 20px;display:flex;justify-content:space-between;gap:24px;align-items:center;border:1px solid rgba(171,126,195,.17);border-radius:11px;background:linear-gradient(100deg,rgba(99,61,122,.08),#0b0e12)}.fd-ledger-gate span{color:#a785b1;font-size:7px;font-weight:900;letter-spacing:.14em}.fd-ledger-gate h2{margin:5px 0;color:#d9cfc7;font-size:16px}.fd-ledger-gate p{max-width:900px;margin:0;color:#7f7777;font-size:9px;line-height:1.55}
      .fd-alert-trends-shell{padding:20px;border:1px solid rgba(221,203,188,.085);border-radius:12px;background:linear-gradient(145deg,#0e1216,#090d11 74%)}.fd-alert-trends-heading{display:flex;justify-content:space-between;gap:28px;align-items:end;margin-bottom:15px}.fd-alert-trends-heading span{color:#aa886d;font-size:7px;font-weight:900;letter-spacing:.16em}.fd-alert-trends-heading h2{margin:5px 0 0;color:#ded4cc;font-family:Georgia,serif;font-size:21px;font-weight:500}.fd-alert-trends-heading p{max-width:520px;margin:0;color:#817978;font-size:9px;line-height:1.55}.fd-alert-trends-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.fd-stage-trend{min-width:0;padding:13px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:#0b0f13;color:#a970d6}.fd-stage-trend.echo{color:#9574c7}.fd-stage-trend.manifested{color:#86a777}.fd-stage-trend.vanished{color:#b95a61}.fd-stage-trend-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.fd-stage-companion small,.fd-stage-trend-total small{display:block;color:#716a6b;font-size:6px;font-weight:900;letter-spacing:.1em}.fd-stage-companion strong{display:block;margin-top:2px;color:currentColor;font-size:8px;letter-spacing:.08em}.fd-stage-trend-total{text-align:right}.fd-stage-trend-total b{display:block;color:#eee4da;font-size:17px}.fd-stage-trend>p{min-height:34px;margin:10px 0 7px;color:#817978;font-size:7px;line-height:1.45}.fd-stage-chart svg{display:block;width:100%;height:auto;overflow:visible}.fd-stage-chart .grid{stroke:rgba(255,255,255,.055);stroke-width:1}.fd-stage-chart .line{fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}.fd-stage-chart .point{fill:#0b0f13;stroke:currentColor;stroke-width:2.2}.fd-stage-chart-axis{display:grid;grid-template-columns:1fr auto 1fr;gap:4px;color:#625c5e;font-size:5px;font-weight:800;letter-spacing:.05em}.fd-stage-chart-axis span:nth-child(2){text-align:center}.fd-stage-chart-axis span:last-child{text-align:right}
            .fd-ledger-filter{padding:16px}.fd-ledger-filter form{display:grid;grid-template-columns:minmax(240px,1.4fr) 180px 190px auto auto;gap:8px;align-items:end}.fd-ledger-filter label{display:grid;gap:5px}.fd-ledger-filter label>span{color:#716a6b;font-size:6px;font-weight:900;letter-spacing:.11em}.fd-ledger-filter input,.fd-ledger-filter select{height:40px;padding:0 10px;border:1px solid rgba(221,203,188,.08);border-radius:8px;background:#0b0f13;color:#d8cec7}.fd-ledger-filter button,.fd-ledger-filter form>a{height:40px;padding:0 13px;display:grid;place-items:center;border:1px solid rgba(171,126,195,.18);border-radius:8px;background:rgba(117,74,143,.07);color:#c5a4d1;font-size:7px;font-weight:900;text-decoration:none}.fd-ledger-filter>p{margin:10px 1px 0;color:#6f6868;font-size:7px}.fd-ledger-filter>p b{color:#a89992}
      .fd-ledger-card,.fd-ledger-personal,.fd-ledger-hunts,.fd-ledger-delivery{padding:20px}.fd-ledger-card>header,.fd-ledger-personal>header,.fd-ledger-hunts>header,.fd-ledger-delivery>header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.fd-ledger-card h2,.fd-ledger-personal h2,.fd-ledger-hunts h2,.fd-ledger-delivery h2{margin:5px 0 0;color:#ded4cc;font-family:Georgia,serif;font-size:21px;font-weight:500}.fd-ledger-card header small,.fd-ledger-personal header>small{color:#716a6b;font-size:7px}.fd-ledger-list{display:grid;gap:7px;margin-top:16px}.fd-ledger-row{display:grid;grid-template-columns:145px minmax(0,1fr) 124px;gap:14px;align-items:start;padding:14px;border:1px solid rgba(221,203,188,.065);border-radius:9px;background:#0b0f13}.fd-ledger-state{display:grid;gap:4px}.fd-ledger-state i{width:7px;height:7px;border-radius:50%;background:#956ac0;box-shadow:0 0 12px rgba(149,106,192,.48)}.fd-ledger-row.whisper .fd-ledger-state i{background:#9e69ce}.fd-ledger-row.manifested .fd-ledger-state i{background:#7fa170}.fd-ledger-row.vanished .fd-ledger-state i{background:#b6535a}.fd-ledger-state b{font-size:7px;letter-spacing:.1em}.fd-ledger-state em{font-style:normal;color:#aa886d;font-size:6px;font-weight:850;letter-spacing:.07em;text-transform:uppercase}.fd-ledger-state small{color:#625c5e;font-size:6px}.fd-ledger-product{display:grid;gap:4px;min-width:0}.fd-ledger-product>small{color:#756e6e;font-size:6px}.fd-ledger-product>strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#d7cdc5;font-size:10px}.fd-ledger-product p{margin:0;color:#7e7675;font-size:8px;line-height:1.45}.fd-ledger-product em{font-style:normal;color:#9b918c;font-size:7px}.fd-ledger-product em.verdict{color:#a78770}.fd-ledger-actions{display:grid;gap:6px}.fd-ledger-actions a{min-height:30px;padding:0 8px;display:grid;place-items:center;border:1px solid rgba(221,203,188,.07);border-radius:7px;color:#9d8ca5;font-size:6px;font-weight:900;text-decoration:none}.fd-ledger-actions a.primary{border-color:rgba(171,126,195,.19);color:#c5a2d2;background:rgba(112,70,140,.06)}.fd-ledger-row :global(.canonical-signal-pack){grid-column:1/-1}.fd-ledger-support-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.fd-ledger-hunts header a,.fd-ledger-delivery header a{color:#b48ac3;font-size:7px;font-weight:900;text-decoration:none}.fd-ledger-hunts>p,.fd-ledger-delivery>p{color:#817978;font-size:9px;line-height:1.6}.fd-ledger-hunts>div{display:grid;gap:6px}.fd-ledger-hunts>div span{padding:9px;border:1px solid rgba(221,203,188,.055);border-radius:7px;display:flex;justify-content:space-between;gap:10px}.fd-ledger-hunts b{font-size:8px}.fd-ledger-hunts small{color:#706969;font-size:7px}.fd-ledger-wide-link{color:#b58ac6;font-size:8px;font-weight:900;text-decoration:none}.fd-ledger-delivery>div{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.fd-ledger-delivery>div span{padding:10px;border:1px solid rgba(221,203,188,.055);border-radius:7px}.fd-ledger-delivery b,.fd-ledger-delivery small{display:block}.fd-ledger-delivery b{font-size:7px}.fd-ledger-delivery small{margin-top:3px;color:#6e6768;font-size:6px}.fd-ledger-personal .fd-dashboard-list{margin-top:14px}
      @media(max-width:1050px){.fd-alert-trends-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.fd-ledger-filter form{grid-template-columns:1fr 1fr}.fd-ledger-filter .wide{grid-column:1/-1}.fd-ledger-row{grid-template-columns:120px minmax(0,1fr)}.fd-ledger-actions{grid-column:1/-1;grid-template-columns:repeat(3,1fr)}.fd-ledger-support-grid{grid-template-columns:1fr}}
      @media(max-width:700px){.fd-alert-trends-heading{display:block}.fd-alert-trends-heading p{margin-top:8px}.fd-alert-trends-grid{grid-template-columns:1fr}.fd-ledger-stages{grid-template-columns:1fr 1fr}.fd-ledger-gate{align-items:flex-start;flex-direction:column}.fd-ledger-filter form{grid-template-columns:1fr}.fd-ledger-filter .wide{grid-column:auto}.fd-ledger-row{grid-template-columns:1fr}.fd-ledger-actions{grid-column:auto}.fd-ledger-delivery>div{grid-template-columns:1fr}.fd-ledger-hero,.fd-ledger-card,.fd-ledger-personal,.fd-ledger-hunts,.fd-ledger-delivery{padding:17px}}
    `}</style>
  </DashboardPageShell>;
}
