import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { SignalBeam } from "@/components/signal-beam";
import { getCurrentSnapshot } from "@/lib/auth";
import { buildDashboardData, moneyFromPence, relativeTime, signalLabel } from "@/lib/dashboard";
import { formatMemberSince, hasPremiumAccess, membershipLabel, networkAge } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Dashboard | FateDrop",
  description: "Your FateDrop collector workspace.",
  robots: { index: false, follow: false },
};

function metric(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : new Intl.NumberFormat("en-GB").format(value);
}

export default async function DashboardPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard");
  const data = await buildDashboardData(snapshot);
  const premium = hasPremiumAccess(snapshot.membership);
  const plan = membershipLabel(snapshot.membership);
  const network = data.network;
  const latestSignal = [...(network?.recentSignals ?? [])].sort((a, b) => b.occurredAt - a.occurredAt)[0] ?? null;

  return <DashboardPageShell title={`Welcome back, ${snapshot.account.displayName}`} eyebrow="YOUR FATEDROP">
    <div className="fd-era-home">
      <section className="fd-era-hero">
        <div className="fd-era-copy">
          <span>FATEDROP · COLLECTOR INTELLIGENCE</span>
          <h1>{latestSignal ? <>The market moved.<br/><em>Here&apos;s the signal.</em></> : <>Your route into<br/><em>the TCG market.</em></>}</h1>
          <p>{latestSignal ? `${signalLabel(latestSignal)} detected ${relativeTime(latestSignal.occurredAt, data.generatedAt)}${latestSignal.retailer ? ` at ${latestSignal.retailer}` : ""}. Search the network, check True Price and move to the retailer only when the evidence makes sense.` : "Search participating retailers, compare price context, track the products you actually want and let the network surface meaningful changes without inventing noise."}</p>
          <div className="fd-era-actions">
            <Link href="/dashboard/search">Search the network <span>→</span></Link>
            <Link href="/dashboard/alerts">Open live signals <span>→</span></Link>
          </div>
        </div>

        <aside className="fd-era-latest" aria-label="Latest network signal">
          <div className="fd-era-latest-head"><span>LATEST NETWORK STATE</span><i className={latestSignal ? latestSignal.state : "manifested"}>{latestSignal ? signalLabel(latestSignal) : "READY"}</i></div>
          <div className="fd-era-beam"><SignalBeam pulseKey={latestSignal?.id || "network-ready"} state={latestSignal?.state || "manifested"}/></div>
          <div className="fd-era-latest-copy"><small>{latestSignal?.retailer || "CONNECTED RETAILER NETWORK"}</small><strong>{latestSignal ? (premium ? latestSignal.title : "Premium signal detail") : "Waiting for observed movement"}</strong><p>{latestSignal ? (premium ? (latestSignal.detail || "Open the signal feed for the full evidence trail.") : "Upgrade for full product and retailer detail.") : "Whisper, Echo, Manifested and Vanished will resolve here when evidence is persisted."}</p></div>
        </aside>

        <div className="fd-era-metrics">
          <span><small>WHISPER</small><b>{metric(data.publicSignalMetrics.whisper)}</b></span>
          <span><small>ECHO</small><b>{metric(data.publicSignalMetrics.echo)}</b></span>
          <span><small>MANIFESTED</small><b>{metric(data.publicSignalMetrics.manifested)}</b></span>
          <span><small>24H CHANGES</small><b>{metric(network?.metrics.changes24h)}</b></span>
          <span><small>YOUR PLAN</small><b>{plan}</b></span>
        </div>
      </section>

      <section className="fd-era-route" aria-label="Core collector journey">
        <div className="fd-era-route-copy"><small>YOUR COLLECTOR ROUTE</small><h2>Search. Understand. Track. Buy.</h2><p>The dashboard follows the same journey FateDrop is built around: find the product, understand the offer, watch for meaningful movement and continue directly to the retailer.</p></div>
        <div className="fd-era-route-rail"><span>Search</span><i/><span>True Price</span><i/><span>FateFind</span><i/><span>Retailer</span></div>
      </section>

      <section className="fd-era-tools" aria-label="Core FateDrop tools">
        <Link href="/dashboard/search"><small>01 · DISCOVER</small><strong>Network Search</strong><p>Search connected catalogue evidence across the FateDrop retailer network.</p><span>⌕</span></Link>
        <Link href="/dashboard/true-price"><small>02 · COMPARE</small><strong>True Price</strong><p>See item price, official RRP context and known mandatory delivery separately.</p><span>⇄</span></Link>
        <Link href="/dashboard/watchlist"><small>03 · TRACK</small><strong>FateFind</strong><p>Tell FateDrop exactly what you want and the limits that matter to you.</p><span>♡</span></Link>
        <Link href="/dashboard/alerts"><small>04 · DETECT</small><strong>Signal Feed</strong><p>Follow Whisper, Echo, Manifested and Vanished with one consistent meaning.</p><span>◉</span></Link>
      </section>

      <section className="fd-era-intelligence">
        <article className="fd-era-panel">
          <div className="fd-era-panel-head"><div><small>CONFIRMED AVAILABILITY</small><h2>Recent Manifested</h2></div><Link href="/dashboard/alerts">View all →</Link></div>
          <div className="fd-era-feed">{data.recentManifested.length ? data.recentManifested.map((item)=><article key={item.id}><span className="fd-era-state manifested">M</span><div><strong>{premium ? item.title : "Premium signal detail"}</strong><small>{premium ? (item.retailer || "Retailer pending") : "Retailer hidden"}</small></div><aside><b>{premium ? (moneyFromPence(item.deliveredPricePence) || "LIVE") : "LOCKED"}</b><small>{relativeTime(item.occurredAt,data.generatedAt)}</small></aside></article>) : <div className="fd-era-empty"><strong>No Manifested signals yet.</strong><span>Confirmed purchasable availability will appear here when the evidence supports it.</span></div>}</div>
        </article>

        <article className="fd-era-panel">
          <div className="fd-era-panel-head"><div><small>BEFORE STOCK CONFIRMATION</small><h2>Early intelligence</h2></div><Link href="/dashboard/alerts">Open feed →</Link></div>
          <div className="fd-era-feed">{data.echoWhispers.length ? data.echoWhispers.map((item)=><article key={item.id}><span className={`fd-era-state ${item.state}`}>{signalLabel(item).slice(0,1)}</span><div><strong>{premium ? item.title : "Premium signal detail"}</strong><small>{premium ? (item.detail || item.retailer || signalLabel(item)) : "Actionable context locked"}</small></div><aside><b>{signalLabel(item)}</b><small>{relativeTime(item.occurredAt,data.generatedAt)}</small></aside></article>) : <div className="fd-era-empty"><strong>No early intelligence yet.</strong><span>Whisper and Echo activity will surface here only when observed evidence supports it.</span></div>}</div>
        </article>
      </section>

      <section className="fd-era-personal">
        <article className="fd-era-identity">
          <div className="fd-era-personal-head"><div><small>YOUR FATEDROP ID</small><h2>{snapshot.account.displayName}</h2><p>@{snapshot.account.username} · {plan}</p></div><span>{premium ? "PREMIUM" : "FREE"}</span></div>
          <div className="fd-era-facts"><div><small>MEMBER SINCE</small><strong>{formatMemberSince(snapshot.account.createdAt)}</strong></div><div><small>TIME IN NETWORK</small><strong>{networkAge(snapshot.account.createdAt, data.generatedAt)}</strong></div><div><small>FATEDROP ID</small><strong>{snapshot.account.fateId}</strong></div><div><small>DISCORD</small><strong>{snapshot.discord ? "Linked" : "Not linked"}</strong></div></div>
          <div className="fd-era-activity"><div><b>{data.personal.signalsSeen}</b><span>Signals seen</span></div><div><b>{data.personal.wishlistHits}</b><span>FateFind hits</span></div><div><b>{data.personal.storesTracked}</b><span>Stores tracked</span></div><div><b>{moneyFromPence(data.personal.savedPence) || "£0.00"}</b><span>Recorded saving</span></div></div>
          <Link href="/dashboard/profile">Open your identity →</Link>
        </article>

        <article className="fd-era-companion">
          <div className="fd-era-companion-mark" aria-hidden="true"><span>◇</span></div>
          <div><small>KORU &amp; FRIENDS</small><h2>Your companion is part of the journey.<br/><em>Not the product.</em></h2><p>Koru remains FateDrop&apos;s mascot and network voice. Choose Koru, Fenn, Aeris, Nyxen or Solix for your own FateDrop ID while the dashboard stays focused on search, price and signals.</p></div>
          <div className="fd-era-companion-tags"><span>5 ACTIVE COMPANIONS</span><span>ONE SIGNAL LANGUAGE</span><span>3D READY</span></div>
          <Link href="/dashboard/avatar">Choose your companion →</Link>
        </article>
      </section>
    </div>

    <style>{`
      .fd-era-home{display:grid;gap:18px;padding-bottom:46px}.fd-era-hero{position:relative;min-height:520px;padding:42px 42px 104px;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(300px,.55fr);gap:44px;overflow:hidden;border:1px solid rgba(221,203,188,.1);border-radius:28px;background:radial-gradient(circle at 78% 22%,rgba(137,104,132,.12),transparent 25%),radial-gradient(circle at 58% 90%,rgba(155,113,82,.055),transparent 28%),linear-gradient(145deg,#111317,#090b0d 62%,#08090b);box-shadow:0 28px 80px rgba(0,0,0,.2)}.fd-era-hero:after{content:"";position:absolute;right:-6%;top:-24%;width:52%;aspect-ratio:1;border:1px solid rgba(190,158,139,.055);border-radius:46% 54% 38% 62%;transform:rotate(24deg);box-shadow:0 0 0 44px rgba(147,113,137,.018),0 0 0 88px rgba(190,158,139,.012)}.fd-era-copy{position:relative;z-index:2;align-self:center;max-width:750px}.fd-era-copy>span,.fd-era-panel-head small,.fd-era-route-copy small,.fd-era-personal-head small,.fd-era-companion small{color:#b29278;font-size:8px;font-weight:900;letter-spacing:.17em}.fd-era-copy h1{margin:14px 0 20px;color:#efe6df;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3.5rem,5.4vw,6.25rem);font-weight:500;line-height:.9;letter-spacing:-.058em}.fd-era-copy h1 em{color:#b99bb8;font-style:normal}.fd-era-copy p{max-width:650px;margin:0;color:#9f9695;font-size:14px;line-height:1.74}.fd-era-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.fd-era-actions a{min-height:44px;padding:0 15px;display:flex;align-items:center;gap:18px;border:1px solid rgba(221,203,188,.13);border-radius:12px;background:rgba(221,203,188,.035);color:#ddd2ca;font-size:9px;font-weight:850}.fd-era-actions a:first-child{border-color:rgba(183,151,127,.22);background:linear-gradient(135deg,rgba(183,151,127,.085),rgba(137,104,132,.075))}.fd-era-actions span{color:#b99bb8}.fd-era-latest{position:relative;z-index:2;align-self:center;min-height:330px;padding:20px;display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(221,203,188,.11);border-radius:22px;background:linear-gradient(145deg,rgba(19,19,21,.9),rgba(10,11,13,.96));box-shadow:0 24px 55px rgba(0,0,0,.23)}.fd-era-latest-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.fd-era-latest-head>span{color:#746c6c;font-size:6px;font-weight:900;letter-spacing:.15em}.fd-era-latest-head i{padding:6px 8px;border:1px solid rgba(183,151,127,.13);border-radius:999px;color:#ad9688;font-size:6px;font-style:normal;font-weight:900;letter-spacing:.09em}.fd-era-beam{height:150px;margin:12px -10px 4px;overflow:hidden;opacity:.64}.fd-era-latest-copy{margin-top:auto}.fd-era-latest-copy small{display:block;color:#7d7270;font-size:6px;font-weight:900;letter-spacing:.12em}.fd-era-latest-copy strong{display:block;margin:7px 0;color:#e6dcd4;font-family:Georgia,serif;font-size:20px;font-weight:500;line-height:1.08}.fd-era-latest-copy p{margin:0;color:#837b7b;font-size:9px;line-height:1.55}.fd-era-metrics{position:absolute;z-index:3;left:42px;right:42px;bottom:27px;display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid rgba(221,203,188,.08)}.fd-era-metrics span{padding:13px 14px 0;border-left:1px solid rgba(221,203,188,.065)}.fd-era-metrics span:first-child{padding-left:0;border-left:0}.fd-era-metrics small{display:block;color:#655f60;font-size:6px;font-weight:900;letter-spacing:.11em}.fd-era-metrics b{display:block;margin-top:5px;color:#ded4cd;font-size:16px;letter-spacing:-.03em}
      .fd-era-route{padding:30px 32px;display:grid;grid-template-columns:.9fr 1.1fr;gap:38px;align-items:center;border:1px solid rgba(221,203,188,.08);border-radius:20px;background:linear-gradient(110deg,rgba(17,18,20,.9),rgba(10,11,13,.94))}.fd-era-route-copy h2{margin:7px 0;color:#e7ded7;font-family:Georgia,serif;font-size:clamp(2rem,3vw,3.2rem);font-weight:500;letter-spacing:-.045em}.fd-era-route-copy p{max-width:560px;margin:0;color:#817a7a;font-size:10px;line-height:1.65}.fd-era-route-rail{display:grid;grid-template-columns:auto 1fr auto 1fr auto 1fr auto;gap:11px;align-items:center}.fd-era-route-rail span{padding:10px 12px;border:1px solid rgba(183,151,127,.11);border-radius:999px;color:#aa9990;background:rgba(183,151,127,.025);font-size:7px;font-weight:850;letter-spacing:.08em;text-align:center}.fd-era-route-rail i{height:1px;background:linear-gradient(90deg,rgba(183,151,127,.1),rgba(157,126,158,.18))}
      .fd-era-tools{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.fd-era-tools>a{position:relative;min-height:170px;padding:22px;overflow:hidden;border:1px solid rgba(221,203,188,.075);border-radius:18px;background:radial-gradient(circle at 100% 0%,rgba(137,104,132,.045),transparent 31%),#0d0f11;transition:.2s ease}.fd-era-tools>a:hover{transform:translateY(-2px);border-color:rgba(183,151,127,.18);box-shadow:0 16px 44px rgba(0,0,0,.18)}.fd-era-tools small{color:#746969;font-size:6px;font-weight:900;letter-spacing:.14em}.fd-era-tools strong{display:block;margin:12px 0 8px;color:#e4dad3;font-family:Georgia,serif;font-size:22px;font-weight:500}.fd-era-tools p{max-width:250px;margin:0;color:#81797a;font-size:9px;line-height:1.55}.fd-era-tools>a>span{position:absolute;right:18px;bottom:15px;color:#957b8f;font-family:Georgia,serif;font-size:34px;opacity:.72}
      .fd-era-intelligence{display:grid;grid-template-columns:1fr 1fr;gap:18px}.fd-era-panel{padding:25px;min-width:0;border:1px solid rgba(221,203,188,.08);border-radius:20px;background:linear-gradient(145deg,#101214,#0a0b0d)}.fd-era-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:18px}.fd-era-panel-head h2{margin:6px 0 0;color:#e6dcd4;font-family:Georgia,serif;font-size:28px;font-weight:500;letter-spacing:-.04em}.fd-era-panel-head>a{color:#9d8498;font-size:8px;font-weight:850}.fd-era-feed{display:grid}.fd-era-feed>article{min-height:76px;padding:13px 0;display:grid;grid-template-columns:34px 1fr auto;gap:12px;align-items:center;border-top:1px solid rgba(221,203,188,.06)}.fd-era-feed>article:first-child{border-top:0}.fd-era-state{width:32px;height:32px;display:grid;place-items:center;border:1px solid rgba(221,203,188,.09);border-radius:10px;color:#a69083;background:rgba(221,203,188,.025);font-size:8px;font-weight:900}.fd-era-state.echo{color:#a18fa5}.fd-era-state.manifested{color:#92a889}.fd-era-state.vanished{color:#a87979}.fd-era-feed article>div strong{display:block;color:#dcd2cb;font-size:11px;line-height:1.35}.fd-era-feed article>div small{display:block;margin-top:4px;color:#716a6b;font-size:8px}.fd-era-feed aside{text-align:right}.fd-era-feed aside b{display:block;color:#aa9690;font-size:8px}.fd-era-feed aside small{display:block;margin-top:4px;color:#5f595b;font-size:7px}.fd-era-empty{min-height:120px;display:flex;flex-direction:column;justify-content:center;border-top:1px solid rgba(221,203,188,.06)}.fd-era-empty strong{color:#b9aba5;font-family:Georgia,serif;font-size:18px;font-weight:500}.fd-era-empty span{margin-top:6px;color:#746d6e;font-size:9px;line-height:1.5}
      .fd-era-personal{display:grid;grid-template-columns:1.08fr .92fr;gap:18px}.fd-era-identity,.fd-era-companion{position:relative;overflow:hidden;padding:26px;border:1px solid rgba(221,203,188,.08);border-radius:20px;background:radial-gradient(circle at 100% 0%,rgba(137,104,132,.04),transparent 30%),#0d0f11}.fd-era-personal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.fd-era-personal-head h2{margin:6px 0 2px;color:#e5dbd4;font-family:Georgia,serif;font-size:30px;font-weight:500;letter-spacing:-.04em}.fd-era-personal-head p{margin:0;color:#776f70;font-size:9px}.fd-era-personal-head>span{padding:6px 9px;border:1px solid rgba(157,126,158,.14);border-radius:999px;color:#ae94aa;font-size:6px;font-weight:900;letter-spacing:.09em}.fd-era-facts{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin:18px 0}.fd-era-facts div{padding:11px;border:1px solid rgba(221,203,188,.055);border-radius:10px;background:rgba(0,0,0,.13)}.fd-era-facts small{display:block;color:#615b5d;font-size:6px;font-weight:900;letter-spacing:.1em}.fd-era-facts strong{display:block;margin-top:4px;color:#c5b9b2;font-size:10px}.fd-era-activity{display:grid;grid-template-columns:repeat(4,1fr);overflow:hidden;margin-bottom:16px;border:1px solid rgba(221,203,188,.055);border-radius:11px}.fd-era-activity div{padding:11px;border-left:1px solid rgba(221,203,188,.055)}.fd-era-activity div:first-child{border-left:0}.fd-era-activity b{display:block;color:#ddd3cc;font-size:17px}.fd-era-activity span{color:#6e6768;font-size:6px}.fd-era-identity>a,.fd-era-companion>a{color:#aa8fa6;font-size:8px;font-weight:850}.fd-era-companion{display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(circle at 80% 18%,rgba(119,96,111,.1),transparent 28%),radial-gradient(circle at 20% 100%,rgba(154,113,80,.045),transparent 30%),#0d0f11}.fd-era-companion-mark{position:absolute;right:24px;top:20px;width:96px;height:96px;display:grid;place-items:center;border:1px solid rgba(157,126,158,.08);border-radius:48% 52% 42% 58%;transform:rotate(18deg)}.fd-era-companion-mark span{color:#897486;font-size:30px;transform:rotate(-18deg)}.fd-era-companion h2{position:relative;z-index:2;max-width:520px;margin:8px 0;color:#e4dad3;font-family:Georgia,serif;font-size:clamp(1.8rem,2.5vw,2.8rem);font-weight:500;line-height:1;letter-spacing:-.045em}.fd-era-companion h2 em{color:#aa8fa6;font-style:normal}.fd-era-companion p{position:relative;z-index:2;max-width:560px;color:#81797a;font-size:9px;line-height:1.6}.fd-era-companion-tags{position:relative;z-index:2;display:flex;flex-wrap:wrap;gap:6px;margin:18px 0}.fd-era-companion-tags span{padding:6px 8px;border:1px solid rgba(221,203,188,.065);border-radius:999px;color:#887c79;font-size:6px;font-weight:850;letter-spacing:.07em}
      @media(max-width:1180px){.fd-era-hero{grid-template-columns:1fr}.fd-era-latest{max-width:650px}.fd-era-tools{grid-template-columns:1fr 1fr}.fd-era-personal{grid-template-columns:1fr}.fd-era-route{grid-template-columns:1fr}.fd-era-route-rail{max-width:760px}}
      @media(max-width:850px){.fd-era-intelligence{grid-template-columns:1fr}.fd-era-metrics{grid-template-columns:repeat(3,1fr);row-gap:9px}.fd-era-hero{padding-bottom:130px}.fd-era-activity{grid-template-columns:1fr 1fr}}
      @media(max-width:620px){.fd-era-hero{padding:27px 22px 175px;border-radius:20px}.fd-era-copy h1{font-size:3rem}.fd-era-copy p{font-size:11px}.fd-era-metrics{left:22px;right:22px;grid-template-columns:1fr 1fr}.fd-era-tools{grid-template-columns:1fr}.fd-era-route{padding:24px 20px}.fd-era-route-rail{grid-template-columns:1fr 1fr}.fd-era-route-rail i{display:none}.fd-era-facts,.fd-era-activity{grid-template-columns:1fr}.fd-era-activity div{border-left:0;border-top:1px solid rgba(221,203,188,.055)}.fd-era-activity div:first-child{border-top:0}.fd-era-panel,.fd-era-identity,.fd-era-companion{padding:21px}.fd-era-feed>article{grid-template-columns:32px 1fr}.fd-era-feed aside{grid-column:2;text-align:left}.fd-era-latest{min-height:300px}}
    `}</style>
  </DashboardPageShell>;
}
