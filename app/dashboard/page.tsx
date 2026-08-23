import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardNetworkPulse } from "@/components/dashboard-network-pulse";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { buildDashboardData, moneyFromPence, relativeTime, signalLabel } from "@/lib/dashboard";
import type { NetworkSignal } from "@/lib/dashboard-storage";
import { hasPremiumAccess } from "@/lib/membership";
import { niceSignalHealthScale, signalHealthChartCoordinates, signalHealthChartPath, type SignalHealthChartPoint } from "@/lib/signal-health-chart";

export const metadata: Metadata = {
  title: "Dashboard | FateDrop",
  description: "Your FateDrop collector workspace.",
  robots: { index: false, follow: false },
};

const lifecycle = [
  ["whisper", "Whisper", "Early movement detected."],
  ["echo", "Echo", "Access or traffic is building."],
  ["manifested", "Manifested", "Confirmed live. Get in."],
  ["vanished", "Vanished", "Confirmed availability is gone."],
] as const;

type LifecycleKey = typeof lifecycle[number][0];

function metric(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : new Intl.NumberFormat("en-GB").format(value);
}

function dayLabel(timestamp: number) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", timeZone: "UTC" }).format(new Date(timestamp * 1000));
}

function peakPoint(points: SignalHealthChartPoint[]) {
  return points.reduce<SignalHealthChartPoint | null>((peak, point) => !peak || point.value > peak.value ? point : peak, null);
}

function titleInitials(title: string) {
  return title.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "FD";
}

function truePriceGroup(signals: NetworkSignal[]) {
  const groups = new Map<string, NetworkSignal[]>();
  for (const signal of signals) {
    if (signal.state !== "manifested" || signal.deliveredPricePence === null) continue;
    const key = signal.title.trim().toLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), signal]);
  }
  return [...groups.values()]
    .sort((a, b) => b.length - a.length || (b[0]?.occurredAt ?? 0) - (a[0]?.occurredAt ?? 0))[0] ?? null;
}

export default async function DashboardPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard");

  const data = await buildDashboardData(snapshot);
  const premium = hasPremiumAccess(snapshot.membership);
  const network = data.network;
  const recentSignals = [...(network?.recentSignals ?? [])].sort((a, b) => b.occurredAt - a.occurredAt).slice(0, 5);
  const priceGroup = truePriceGroup(network?.recentSignals ?? []);
  const recentDrops = data.recentManifested.slice(0, 4);
  const fateFinds = data.personal.watchlist.slice(0, 3);
  const stores = data.personal.favoriteStores.slice(0, 5);
  const series = Object.fromEntries(
    lifecycle.map(([key]) => [key, data.signalSummary?.[key].trend ?? []]),
  ) as Record<LifecycleKey, SignalHealthChartPoint[]>;
  const alertSeries = Object.fromEntries(
    lifecycle.map(([key]) => [key, data.signalDeliverySummary?.[key].trend.map((point) => ({ measuredAt: point.measuredAt, value: point.sent })) ?? []]),
  ) as Record<LifecycleKey, SignalHealthChartPoint[]>;
  const sentScaleMax = niceSignalHealthScale(Math.max(0, ...Object.values(alertSeries).flat().map((point) => point.value)));
  const signalActivity7d = lifecycle.every(([key]) => data.publicSignalMetrics[key] === null || data.publicSignalMetrics[key] === undefined)
    ? null
    : lifecycle.reduce((total, [key]) => total + (data.publicSignalMetrics[key] ?? 0), 0);

  return <DashboardPageShell title={`Dashboard · ${snapshot.account.displayName}`} eyebrow="COLLECTOR WORKSPACE">
    <div className="fd-reference-home">
      <section className="fd-overview-card fd-ref-card">
        <div className="fd-ref-card-head">
          <div><h1>Signals Overview</h1><p>Real Signal Intelligence detections and actual alert-delivery health across the last seven UTC days.</p></div>
          <Link href="/dashboard/alerts">View all signals <span>→</span></Link>
        </div>
        <div className="fd-lifecycle-grid">
          {lifecycle.map(([key, label, description]) => {
            const points = series[key];
            const today = data.signalSummary?.[key].today ?? null;
            const delivery = data.signalDeliverySummary?.[key] ?? null;
            const alertPoints = alertSeries[key];
            const alertCoordinates = signalHealthChartCoordinates(alertPoints, sentScaleMax);
            const detectedPeak = peakPoint(points);
            return <article className={`fd-lifecycle-card ${key}`} key={key}>
              <div><small>{label}</small><span>{description}</span></div>
              <em className="fd-lifecycle-window">7D DETECTED</em>
              <div className="fd-lifecycle-value"><strong>{metric(data.publicSignalMetrics[key])}</strong><i aria-hidden="true" /></div>
              {delivery ? <>
                <div className="fd-alert-chart-head"><span>ALERTS SENT / UTC DAY</span><b>{metric(delivery.sent)} sent / 7D</b></div>
                <div className="fd-alert-chart">
                  <svg viewBox="0 0 120 46" preserveAspectRatio="none" aria-label={`${label} alerts actually sent per UTC day over the last seven days, zero to ${sentScaleMax} alerts per day`} role="img">
                    <line className="fd-zero-baseline" x1="0" y1="41" x2="120" y2="41" />
                    <path d={signalHealthChartPath(alertPoints, sentScaleMax)} />
                    {alertCoordinates.map((point) => <circle key={point.measuredAt} cx={point.x} cy={point.y} r="1.5" />)}
                  </svg>
                  <div className="fd-alert-axis" aria-hidden="true"><span>0</span><span>{metric(sentScaleMax)} / day</span></div>
                </div>
                <div className="fd-lifecycle-days" aria-label={`${label} sent-alert daily counts`}>
                  {alertPoints.map((point) => <span key={point.measuredAt}><small>{dayLabel(point.measuredAt)}</small><b>{metric(point.value)}</b></span>)}
                </div>
              </> : <div className="fd-chart-unavailable"><strong>Alert delivery ledger unavailable</strong><span>No sent-alert line is inferred from detections.</span></div>}
              <p className="fd-detection-context">{today !== null ? `${metric(today)} detected today${detectedPeak ? ` · peak ${metric(detectedPeak.value)} on ${dayLabel(detectedPeak.measuredAt)}` : ""}` : "Signal ledger unavailable"}</p>
              {delivery ? <div className="fd-delivery-health">
                <span><small>7D SENT</small><b>{metric(delivery.sent)}</b></span>
                <span><small>POLICY SUPPRESSED</small><b>{metric(delivery.policySkipped)}</b></span>
                <span className={delivery.issues > 0 ? "issue" : undefined}><small>DELIVERY ISSUES</small><b>{metric(delivery.issues)}</b></span>
              </div> : <div className="fd-delivery-unavailable">Sent, suppressed and issue totals unavailable</div>}
            </article>;
          })}
        </div>
      </section>

      <section className="fd-reference-grid">
        <article className="fd-ref-card fd-recent-signals">
          <div className="fd-ref-card-head compact"><div><h2>Recent Signals</h2><p>Latest network movement.</p></div></div>
          <div className="fd-ref-list">
            {recentSignals.length ? recentSignals.map((item) => <div className="fd-signal-row" key={item.id}>
              <span className={`fd-mini-thumb ${item.state}`}>{titleInitials(item.title)}</span>
              <div><small>{premium ? (item.retailer || signalLabel(item)) : signalLabel(item)}</small><strong>{premium ? item.title : "Premium signal detail"}</strong></div>
              <aside><b className={item.state}>{signalLabel(item)}</b><small>{relativeTime(item.occurredAt, data.generatedAt)}</small></aside>
            </div>) : <div className="fd-ref-empty"><strong>No persisted signals yet.</strong><span>The feed stays empty until the network records real evidence.</span></div>}
          </div>
          <Link className="fd-card-link" href="/dashboard/alerts">View all signals <span>→</span></Link>
        </article>

        <article className="fd-ref-card fd-true-price-card">
          <div className="fd-ref-card-head compact"><div><h2>True Price Comparison</h2><p>What you really pay.</p></div></div>
          {priceGroup ? <div className="fd-price-table">
            <div className="fd-price-head"><span>Store</span><span>Known true price</span><span>Observed</span></div>
            {priceGroup.slice(0, 4).map((item) => <div className="fd-price-row" key={item.id}><strong>{item.retailer || "Retailer pending"}</strong><b>{moneyFromPence(item.deliveredPricePence) || "—"}</b><small>{relativeTime(item.occurredAt, data.generatedAt)}</small></div>)}
            <p><b>{priceGroup[0]?.title}</b> · Item price + known mandatory delivery = True Price. Compare who is actually cheapest before checkout.</p>
          </div> : <div className="fd-ref-empty tall"><strong>No comparable True Prices yet.</strong><span>FateDrop only compares delivered totals when the required price and delivery evidence is known.</span></div>}
          <Link className="fd-card-link" href="/dashboard/true-price">View full comparison <span>→</span></Link>
        </article>

        <article className="fd-ref-card fd-fatefind-card">
          <div className="fd-ref-card-head compact"><div><h2>FateFind</h2><p>Your saved hunts — FateMatch is a live offer that matches your rules.</p></div></div>
          <div className="fd-fatefind-list">
            {fateFinds.length ? fateFinds.map((item) => <div key={item.id}><span><strong>{item.title || "Saved FateFind"}</strong><small>{item.subtitle || item.retailer || "Network-wide hunt"}</small></span><b>{item.amountPence ? moneyFromPence(item.amountPence) : "•"}</b></div>) : <div className="fd-ref-empty"><strong>No FateFind activity yet.</strong><span>Tell FateDrop what you want and what you’re willing to pay. We keep watching the network for you.</span></div>}
          </div>
          <Link className="fd-card-link" href="/dashboard/watchlist">Manage FateFinds <span>→</span></Link>
        </article>

        <article className="fd-ref-card fd-network-pulse-card">
          <div className="fd-ref-card-head compact"><div><h2>Network Pulse</h2><p>Live across the network.</p></div></div>
          <DashboardNetworkPulse retailers={network?.metrics.catalogueRetailers} products={network?.metrics.productsTracked} signals={signalActivity7d} />
          <Link className="fd-card-link" href="/dashboard/stores">View network <span>→</span></Link>
        </article>

        <article className="fd-ref-card fd-recent-drops">
          <div className="fd-ref-card-head compact"><div><h2>Recent Manifested Drops</h2><p>Confirmed live stock.</p></div></div>
          <div className="fd-drop-grid">
            {recentDrops.length ? recentDrops.map((item) => <div className="fd-drop-mini" key={item.id}><span className="fd-drop-art"><i />{titleInitials(item.title)}</span><strong>{premium ? item.title : "Premium product"}</strong><small>{premium ? (item.retailer || "Retailer pending") : "Retailer hidden"}</small><b>{premium ? (moneyFromPence(item.deliveredPricePence) || "LIVE") : "LOCKED"}</b></div>) : <div className="fd-ref-empty"><strong>No Manifested drops yet.</strong><span>Confirmed live products will appear here.</span></div>}
          </div>
          <Link className="fd-card-link" href="/dashboard/alerts">View all drops <span>→</span></Link>
        </article>

        <article className="fd-ref-card fd-retailer-card">
          <div className="fd-ref-card-head compact"><div><h2>Independent Stores</h2><p>Discover more places to buy.</p></div></div>
          <div className="fd-retailer-list">
            {stores.length ? stores.map((store) => <div key={`${store.name}-${store.latestAt}`}><span className="fd-store-mark">◇</span><strong>{store.name}</strong><small>{store.count} tracked action{store.count === 1 ? "" : "s"}</small><b>{relativeTime(store.latestAt, data.generatedAt)}</b></div>) : <div className="fd-ref-empty"><strong>No independent stores in your activity yet.</strong><span>Explore the FateDrop network to discover more places to buy directly from the retailer.</span></div>}
          </div>
          <Link className="fd-card-link" href="/dashboard/stores">Explore Independent Stores <span>→</span></Link>
        </article>

        <article className="fd-koru-dashboard-card" aria-label="Koru FateDrop network guide artwork">
          <Link className="fd-koru-action" href="/dashboard/avatar" aria-label="Choose your Koru and Friends companion">Choose your companion <span>→</span></Link>
        </article>
      </section>
    </div>

    <style>{`
      .fd-reference-home{display:grid;gap:10px;max-width:1600px;margin:0 auto}.fd-ref-card{position:relative;min-width:0;overflow:hidden;border:1px solid rgba(221,203,188,.085);border-radius:11px;background:linear-gradient(145deg,#0e1216,#0a0d11 72%);box-shadow:inset 0 1px rgba(255,255,255,.018)}.fd-overview-card{padding:18px 18px 16px}.fd-ref-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.fd-ref-card-head h1,.fd-ref-card-head h2{margin:0;color:#eee5dd;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:14px;font-weight:700;letter-spacing:-.02em}.fd-ref-card-head h1{font-size:15px}.fd-ref-card-head p{margin:3px 0 0;color:#777074;font-size:8px;line-height:1.45}.fd-ref-card-head>a{color:#aa72d5;font-size:8px;font-weight:750;text-decoration:none}.fd-ref-card-head>a span,.fd-card-link span{margin-left:6px}.fd-ref-card-head.compact{padding:16px 16px 10px}.fd-lifecycle-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:14px}.fd-lifecycle-card{position:relative;min-height:268px;padding:14px;overflow:hidden;border:1px solid rgba(221,203,188,.07);border-radius:9px;background:linear-gradient(145deg,#101419,#0b0f13)}.fd-lifecycle-card>div:first-child{display:grid;gap:2px}.fd-lifecycle-card small{font-size:9px;font-weight:700}.fd-lifecycle-card>div:first-child span{color:#736d72;font-size:7px}.fd-lifecycle-window{position:absolute;right:12px;top:13px;color:#6d666c;font-size:5px;font-style:normal;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.fd-lifecycle-value{position:relative;z-index:2;margin-top:17px;display:flex;align-items:center;justify-content:space-between}.fd-lifecycle-value strong{font-family:Georgia,serif;font-size:27px;font-weight:500}.fd-lifecycle-value i{width:33px;height:33px;border:1px solid currentColor;border-radius:50%;opacity:.45;box-shadow:0 0 18px currentColor}.fd-alert-chart-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;color:#615b61;font-size:5px;font-weight:850;letter-spacing:.08em}.fd-alert-chart-head b{color:#958d93;font-size:6px;letter-spacing:0}.fd-alert-chart{margin-top:3px}.fd-lifecycle-card svg{display:block;width:100%;height:49px;overflow:visible}.fd-lifecycle-card svg path{fill:none;stroke:currentColor;stroke-width:1.2;vector-effect:non-scaling-stroke;opacity:.82}.fd-lifecycle-card svg circle{fill:currentColor;stroke:#0c1014;stroke-width:.8;vector-effect:non-scaling-stroke}.fd-lifecycle-card svg .fd-zero-baseline{stroke:rgba(183,174,179,.22);stroke-width:.65;vector-effect:non-scaling-stroke}.fd-alert-axis{display:flex;justify-content:space-between;margin-top:-2px;color:#555057;font-size:4.5px;font-weight:700}.fd-lifecycle-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;margin-top:4px}.fd-lifecycle-days span{display:grid;gap:1px;min-width:0;text-align:center}.fd-lifecycle-days small{overflow:hidden;color:#5f5960;font-size:5px;font-weight:700;white-space:nowrap}.fd-lifecycle-days b{color:#aaa1a8;font-size:6px;font-weight:700}.fd-detection-context{margin:8px 0 0;color:#706970;font-size:6px;line-height:1.35}.fd-delivery-health{display:grid;grid-template-columns:.75fr 1.35fr 1fr;gap:5px;margin-top:8px}.fd-delivery-health span{display:grid;gap:2px;padding:5px 6px;border:1px solid rgba(221,203,188,.055);border-radius:6px;background:rgba(255,255,255,.012)}.fd-delivery-health small{color:#625c62;font-size:4.5px;font-weight:850;letter-spacing:.06em}.fd-delivery-health b{color:#a9a0a6;font-size:7px}.fd-delivery-health span.issue{border-color:rgba(179,78,86,.18)}.fd-delivery-health span.issue b{color:#b65b62}.fd-chart-unavailable{display:grid;gap:3px;min-height:86px;margin-top:10px;padding:12px 10px;align-content:center;border:1px dashed rgba(221,203,188,.08);border-radius:7px;background:rgba(255,255,255,.01)}.fd-chart-unavailable strong{color:#817980;font-size:6px}.fd-chart-unavailable span,.fd-delivery-unavailable{color:#676168;font-size:6px}.fd-delivery-unavailable{margin-top:8px}.fd-lifecycle-card.whisper{color:#9f64dc}.fd-lifecycle-card.echo{color:#8c66c5}.fd-lifecycle-card.manifested{color:#85a876}.fd-lifecycle-card.vanished{color:#b34e56}
      .fd-reference-grid{display:grid;grid-template-columns:1.05fr 1.05fr .82fr 1.18fr;gap:10px;align-items:stretch}.fd-recent-signals,.fd-true-price-card,.fd-fatefind-card,.fd-network-pulse-card{min-height:350px}.fd-ref-list{display:grid;padding:0 12px}.fd-signal-row{min-height:55px;padding:8px 3px;display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:9px;align-items:center;border-top:1px solid rgba(221,203,188,.055)}.fd-signal-row:first-child{border-top:0}.fd-mini-thumb{width:36px;height:36px;display:grid;place-items:center;border:1px solid rgba(158,113,194,.18);border-radius:7px;background:radial-gradient(circle at 50% 35%,rgba(139,77,190,.18),transparent 55%),#13161b;color:#ab83c7;font-family:Georgia,serif;font-size:10px}.fd-mini-thumb.manifested{color:#89aa7a;border-color:rgba(133,168,118,.18)}.fd-mini-thumb.vanished{color:#bb5a61;border-color:rgba(179,78,86,.2)}.fd-mini-thumb.echo{color:#9871cd}.fd-signal-row>div{display:grid;gap:3px;min-width:0}.fd-signal-row>div small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#6f686d;font-size:6px}.fd-signal-row>div strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px}.fd-signal-row aside{display:grid;justify-items:end;gap:4px}.fd-signal-row aside b{padding:3px 5px;border-radius:999px;background:rgba(158,102,205,.08);color:#9870c0;font-size:5px;font-weight:900;text-transform:uppercase}.fd-signal-row aside b.manifested{color:#7fa272;background:rgba(127,162,114,.08)}.fd-signal-row aside b.vanished{color:#b3585f;background:rgba(179,88,95,.08)}.fd-signal-row aside small{color:#625c61;font-size:6px}.fd-card-link{position:absolute;left:15px;bottom:12px;color:#a66fd0;font-size:7px;font-weight:750;text-decoration:none}.fd-ref-empty{padding:16px;display:grid;gap:5px;color:#6f686d}.fd-ref-empty strong{color:#bcb3b0;font-size:9px}.fd-ref-empty span{font-size:7px;line-height:1.5}.fd-ref-empty.tall{min-height:205px;align-content:center}
      .fd-price-table{padding:2px 14px 42px}.fd-price-head,.fd-price-row{display:grid;grid-template-columns:minmax(0,1fr) 95px 70px;gap:8px;align-items:center}.fd-price-head{padding:10px 5px 7px;color:#625c61;font-size:6px}.fd-price-row{min-height:43px;padding:0 5px;border-top:1px solid rgba(221,203,188,.055)}.fd-price-row strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#bdb4b1;font-size:8px}.fd-price-row b{color:#d8d0ca;font-size:8px}.fd-price-row small{color:#635d61;font-size:6px;text-align:right}.fd-price-table>p{margin:10px 5px 0;color:#5f595e;font-size:6px;line-height:1.5}.fd-fatefind-list{display:grid;padding:2px 12px 42px}.fd-fatefind-list>div:not(.fd-ref-empty){min-height:60px;padding:9px 10px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;border:1px solid rgba(221,203,188,.055);border-radius:8px;background:#0f1317;margin-top:7px}.fd-fatefind-list span{display:grid;gap:4px;min-width:0}.fd-fatefind-list strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px}.fd-fatefind-list small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#6b6469;font-size:6px}.fd-fatefind-list b{min-width:25px;height:25px;padding:0 7px;display:grid;place-items:center;border-radius:9px;background:rgba(129,74,174,.16);color:#c09add;font-size:7px}.fd-network-pulse-card{padding-bottom:35px}.fd-network-pulse-card>.fd-pulse-layout{padding:0 8px}
      .fd-recent-drops,.fd-retailer-card{min-height:270px}.fd-drop-grid{padding:0 12px 40px;display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.fd-drop-mini{min-width:0;display:grid;gap:4px}.fd-drop-art{position:relative;aspect-ratio:.8/1;display:grid;place-items:center;overflow:hidden;border:1px solid rgba(221,203,188,.08);border-radius:7px;background:radial-gradient(circle at 50% 25%,rgba(141,86,178,.18),transparent 44%),linear-gradient(155deg,#17181b,#0c1014);color:#c1a4d2;font-family:Georgia,serif;font-size:13px}.fd-drop-art i{position:absolute;width:54%;height:54%;border:1px solid rgba(190,151,213,.13);transform:rotate(45deg)}.fd-drop-mini strong{overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;color:#c8bfba;font-size:7px;line-height:1.3}.fd-drop-mini small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#655f63;font-size:5px}.fd-drop-mini>b{color:#d9d0ca;font-size:7px}.fd-retailer-list{display:grid;padding:0 12px 40px}.fd-retailer-list>div:not(.fd-ref-empty){min-height:42px;display:grid;grid-template-columns:26px minmax(0,1fr) auto auto;gap:8px;align-items:center;border-top:1px solid rgba(221,203,188,.055)}.fd-retailer-list>div:first-child{border-top:0}.fd-store-mark{width:22px;height:22px;display:grid;place-items:center;border-radius:6px;background:rgba(150,96,184,.09);color:#9f79ba;font-size:10px}.fd-retailer-list strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px}.fd-retailer-list small{color:#655f64;font-size:6px}.fd-retailer-list b{color:#927d6d;font-size:6px;font-weight:650}
      .fd-koru-dashboard-card{position:relative;grid-column:3 / 5;min-height:270px;overflow:hidden;border:1px solid rgba(181,151,128,.16);border-radius:11px;background:#090d11 url('/assets/dashboard/koru-network-guide.png') center center/cover no-repeat;box-shadow:inset 0 1px rgba(255,255,255,.02)}.fd-koru-action{position:absolute;z-index:2;left:14px;top:14px;padding:8px 10px;border:1px solid rgba(215,190,166,.18);border-radius:8px;background:rgba(6,10,14,.66);backdrop-filter:blur(10px);color:#d4bea8;font-size:7px;font-weight:800;text-decoration:none;letter-spacing:.02em;transition:.16s ease}.fd-koru-action:hover{border-color:rgba(215,190,166,.32);background:rgba(6,10,14,.82);transform:translateY(-1px)}.fd-koru-action span{margin-left:5px}
      @media(max-width:1320px){.fd-reference-grid{grid-template-columns:1fr 1fr}.fd-network-pulse-card,.fd-fatefind-card,.fd-recent-signals,.fd-true-price-card{min-height:330px}.fd-koru-dashboard-card{grid-column:1 / 3}.fd-drop-grid{grid-template-columns:repeat(4,1fr)}}
      @media(max-width:820px){.fd-lifecycle-grid{grid-template-columns:1fr 1fr}.fd-reference-grid{grid-template-columns:1fr}.fd-koru-dashboard-card{grid-column:auto;min-height:260px;background-position:center}.fd-drop-grid{grid-template-columns:repeat(2,1fr)}.fd-recent-signals,.fd-true-price-card,.fd-fatefind-card,.fd-network-pulse-card{min-height:310px}}
      @media(max-width:520px){.fd-overview-card{padding:14px 12px}.fd-ref-card-head{flex-direction:column}.fd-lifecycle-grid{grid-template-columns:1fr}.fd-lifecycle-card{min-height:258px}.fd-lifecycle-window{right:10px;top:11px}.fd-koru-dashboard-card{min-height:190px;aspect-ratio:1916/821;background-position:center}.fd-koru-action{left:9px;top:9px;padding:7px 8px;font-size:6px}.fd-price-head,.fd-price-row{grid-template-columns:1fr 82px}.fd-price-head span:last-child,.fd-price-row small{display:none}.fd-retailer-list>div:not(.fd-ref-empty){grid-template-columns:26px minmax(0,1fr) auto}.fd-retailer-list small{display:none}}
    `}</style>
  </DashboardPageShell>;
}
