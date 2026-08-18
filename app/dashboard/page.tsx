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
  description: "Your FateDrop collector command centre.",
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

  return <DashboardPageShell title={`Welcome back, ${snapshot.account.displayName}`} eyebrow="COLLECTOR COMMAND CENTRE">
    <div className="fd-command-centre">
      <section className="fd-command-hero">
        <div className="fd-command-copy">
          <span>FATEDROP // LIVE NETWORK</span>
          <h1>{latestSignal ? <>The network just <em>moved.</em></> : <>Waiting for the next <em>signal.</em></>}</h1>
          <p>{latestSignal ? `${signalLabel(latestSignal)} detected ${relativeTime(latestSignal.occurredAt, data.generatedAt)}${latestSignal.retailer ? ` at ${latestSignal.retailer}` : ""}.` : "FateDrop is watching the connected network. When stock, catalogue or availability changes, the signal resolves here first."}</p>
          <div className="fd-command-actions"><Link href="/dashboard/alerts">Open live signals →</Link><Link href="/dashboard/true-price">Compare True Price →</Link></div>
        </div>
        <div className="fd-command-signal">
          <div className="fd-command-card"><small>{latestSignal ? signalLabel(latestSignal).toUpperCase() : "NETWORK READY"}</small><strong>{latestSignal ? (premium ? latestSignal.title : "Premium signal") : "FateDrop Signal"}</strong><span>{latestSignal?.retailer || "Detect · Compare · Connect"}</span></div>
          <SignalBeam pulseKey={latestSignal?.id || "network-ready"} state={latestSignal?.state || "manifested"}/>
        </div>
        <div className="fd-command-metrics"><span><b>{metric(network?.metrics.manifested)}</b>MANIFESTED</span><span><b>{metric(network?.metrics.echo)}</b>ECHO</span><span><b>{metric(network?.metrics.changes24h)}</b>24H CHANGES</span><span><b>{plan}</b>YOUR PLAN</span></div>
      </section>

      <section className="fd-core-actions" aria-label="Core FateDrop actions">
        <Link href="/dashboard/true-price"><span>⇄</span><div><small>COMPARE</small><strong>True Price</strong><p>Search one product and expose RRP, delivery and the real cost across the network.</p></div><b>→</b></Link>
        <Link href="/dashboard/alerts"><span>◉</span><div><small>DETECT</small><strong>Live Signals</strong><p>Whisper, Echo, Manifested and Vanished lifecycle intelligence.</p></div><b>→</b></Link>
        <Link href="/dashboard/stores"><span>⌂</span><div><small>CONNECT</small><strong>Indie Stores</strong><p>Enter connected FateDrop storefronts and browse retailer catalogues.</p></div><b>→</b></Link>
        <Link href="/dashboard/watchlist"><span>♡</span><div><small>TRACK</small><strong>Watchlist / FateFind</strong><p>Keep the products you care about ready for automated monitoring.</p></div><b>→</b></Link>
      </section>

      <section className="fd-home-personal-grid">
        <article className="fd-personal-card fd-living-panel">
          <div className="fd-personal-card-head"><div><small>YOUR FATEDROP</small><h2>{snapshot.account.displayName}</h2><p>@{snapshot.account.username} · {plan}</p></div><span>{premium ? "♛ PREMIUM" : "FREE MEMBER"}</span></div>
          <div className="fd-personal-facts"><div><small>MEMBER SINCE</small><strong>{formatMemberSince(snapshot.account.createdAt)}</strong></div><div><small>TIME IN NETWORK</small><strong>{networkAge(snapshot.account.createdAt, data.generatedAt)}</strong></div><div><small>FATEDROP ID</small><strong>{snapshot.account.fateId}</strong></div><div><small>DISCORD</small><strong>{snapshot.discord ? "Linked" : "Not linked"}</strong></div></div>
          <div className="fd-personal-activity"><div><b>{data.personal.signalsSeen}</b><span>Signals seen</span></div><div><b>{data.personal.wishlistHits}</b><span>FateFind hits</span></div><div><b>{data.personal.storesTracked}</b><span>Stores tracked</span></div><div><b>{moneyFromPence(data.personal.savedPence) || "£0.00"}</b><span>Recorded saving</span></div></div>
          <Link href="/dashboard/profile">Open your FateDrop identity →</Link>
        </article>

        <article className="fd-fatewindow-home fd-living-panel">
          <div><span>NEW · FATEWINDOW BETA</span><h2>Don&apos;t just know it&apos;s in stock.<br/><em>Know if it&apos;s worth moving.</em></h2><p>FateWindow combines verified RRP, delivered True Price and network availability to classify a buying moment as Buy Window, No Rush, Watch or Wait.</p></div>
          <div className="fd-window-states"><span className="buy">BUY WINDOW</span><span className="calm">NO RUSH</span><span className="watch">WATCH</span><span className="wait">WAIT</span></div>
          <div className="fd-window-status"><i/><div><small>CURRENT BETA STATUS</small><strong>Decision engine wired · official RRP evidence building</strong></div></div>
          <Link href="/dashboard/true-price">Try FateWindow in True Price →</Link>
        </article>
      </section>

      <div className="fd-command-grid">
        <section className="fd-dash-card fd-command-feed fd-living-panel">
          <div className="fd-dash-card-head"><span>RECENT MANIFESTED</span><Link href="/dashboard/alerts">All signals</Link></div>
          <div className="fd-dashboard-list">{data.recentManifested.length ? data.recentManifested.map((item)=><article key={item.id}><span className="fd-signal-thumb">M</span><div><strong>{premium ? item.title : "Premium signal detail"}</strong><small>{premium ? (item.retailer || "Retailer pending") : "Retailer hidden"}</small></div><aside>{premium ? (moneyFromPence(item.deliveredPricePence) || "LIVE") : "LOCKED"}<small>{relativeTime(item.occurredAt,data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No Manifested signals yet.</strong><span>The first confirmed availability event will appear here.</span></div>}</div>
        </section>

        <section className="fd-dash-card fd-command-feed fd-living-panel">
          <div className="fd-dash-card-head"><span>EARLY INTELLIGENCE</span><Link href="/dashboard/alerts">Open feed</Link></div>
          <div className="fd-dashboard-list">{data.echoWhispers.length ? data.echoWhispers.map((item)=><article key={item.id}><span className={`fd-signal-thumb ${item.state}`}>{item.state === "echo" ? "E" : "W"}</span><div><strong>{premium ? item.title : "Premium signal detail"}</strong><small>{premium ? (item.detail || item.retailer || signalLabel(item)) : "Actionable context locked"}</small></div><aside>{signalLabel(item)}<small>{relativeTime(item.occurredAt,data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No Whisper / Echo activity yet.</strong><span>Early network movement will surface here.</span></div>}</div>
        </section>
      </div>
    </div>

    <style>{`
      .fd-command-centre{display:grid;gap:22px;padding-bottom:38px}.fd-command-hero{position:relative;min-height:430px;overflow:hidden;padding:38px;border:1px solid rgba(139,102,255,.2);border-radius:26px;background:linear-gradient(90deg,rgba(5,6,12,.94),rgba(6,7,13,.78) 55%,rgba(10,7,20,.5)),url('/assets/cardwave-bg.webp') center right/cover no-repeat;box-shadow:0 30px 80px rgba(0,0,0,.24)}.fd-command-copy{position:relative;z-index:3;max-width:650px}.fd-command-copy>span{color:#76eaff;font-size:9px;font-weight:900;letter-spacing:.19em}.fd-command-copy h1{margin:14px 0;font-size:clamp(3rem,5vw,5.4rem);line-height:.88;letter-spacing:-.065em}.fd-command-copy h1 em{font-style:normal;background:linear-gradient(90deg,#fff,#9beeff 45%,#c096ff);-webkit-background-clip:text;color:transparent}.fd-command-copy p{max-width:580px;color:#aaa4b2;font-size:15px;line-height:1.7}.fd-command-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.fd-command-actions a{min-height:42px;padding:0 15px;display:flex;align-items:center;border:1px solid rgba(255,255,255,.11);border-radius:12px;background:rgba(255,255,255,.04);font-size:10px;font-weight:850}.fd-command-actions a:first-child{border-color:rgba(88,232,255,.24);background:linear-gradient(135deg,rgba(88,232,255,.08),rgba(157,109,255,.09))}.fd-command-signal{position:absolute;z-index:2;right:4%;top:58px;width:min(360px,31vw)}.fd-command-card{width:170px;height:238px;margin:0 auto 10px;padding:14px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid rgba(165,135,255,.35);border-radius:15px;background:radial-gradient(circle at 50% 38%,rgba(88,232,255,.11),transparent 30%),linear-gradient(145deg,rgba(33,22,58,.9),rgba(8,8,14,.97));box-shadow:0 25px 60px rgba(0,0,0,.42),0 0 40px rgba(126,82,255,.13);transform:rotate(5deg)}.fd-command-card small{color:#6fe9fb;font-size:7px;font-weight:900;letter-spacing:.14em}.fd-command-card strong{margin:7px 0;font-size:17px;line-height:1.05}.fd-command-card span{color:#817b88;font-size:8px}.fd-command-metrics{position:absolute;z-index:3;left:38px;right:38px;bottom:28px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));max-width:760px}.fd-command-metrics span{padding:10px 16px;border-left:1px solid rgba(255,255,255,.08);color:#706a77;font-size:7px;font-weight:850;letter-spacing:.1em}.fd-command-metrics span:first-child{padding-left:0;border-left:0}.fd-command-metrics b{display:block;margin-bottom:3px;color:#fff;font-size:18px;letter-spacing:-.02em}.fd-core-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.fd-core-actions>a{position:relative;min-height:170px;padding:20px;display:grid;grid-template-columns:38px 1fr auto;gap:12px;align-items:start;overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:radial-gradient(circle at 100% 0%,rgba(157,109,255,.06),transparent 32%),rgba(11,10,16,.88);transition:.18s ease}.fd-core-actions>a:after,.fd-living-panel:after{content:"";position:absolute;left:-45%;top:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(100deg,transparent,rgba(104,232,251,.045),rgba(174,102,255,.055),transparent);transform:skewX(-18deg);transition:transform .55s ease}.fd-core-actions>a:hover:after,.fd-living-panel:hover:after{transform:translateX(360%) skewX(-18deg)}.fd-core-actions>a:hover{transform:translateY(-2px);border-color:rgba(88,232,255,.18);box-shadow:0 16px 45px rgba(0,0,0,.18)}.fd-core-actions>a>span{width:38px;height:38px;display:grid;place-items:center;border:1px solid rgba(157,109,255,.2);border-radius:11px;color:#9eeeff;background:rgba(157,109,255,.06)}.fd-core-actions small{color:#6b6571;font-size:7px;font-weight:900;letter-spacing:.15em}.fd-core-actions strong{display:block;margin:5px 0;font-size:16px}.fd-core-actions p{margin:0;color:#8c8692;font-size:10px;line-height:1.55}.fd-core-actions>a>b{color:#797280}.fd-home-personal-grid{display:grid;grid-template-columns:minmax(0,1.18fr) minmax(0,.82fr);gap:22px}.fd-living-panel{position:relative;overflow:hidden}.fd-personal-card,.fd-fatewindow-home{padding:26px;border:1px solid rgba(255,255,255,.08);border-radius:20px;background:radial-gradient(circle at 100% 0%,rgba(157,109,255,.06),transparent 30%),rgba(9,9,14,.88)}.fd-personal-card-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.fd-personal-card-head small,.fd-fatewindow-home>div>span{color:#73e9fb;font-size:8px;font-weight:900;letter-spacing:.16em}.fd-personal-card-head h2{margin:6px 0 2px;font-size:27px;letter-spacing:-.04em}.fd-personal-card-head p{margin:0;color:#8a8491;font-size:11px}.fd-personal-card-head>span{padding:7px 9px;border:1px solid rgba(157,109,255,.2);border-radius:999px;color:#c6a9ff;font-size:7px;font-weight:900;letter-spacing:.08em}.fd-personal-facts{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:20px 0}.fd-personal-facts div{padding:11px;border:1px solid rgba(255,255,255,.055);border-radius:11px;background:rgba(0,0,0,.16)}.fd-personal-facts small{display:block;color:#67616d;font-size:6px;font-weight:900;letter-spacing:.11em}.fd-personal-facts strong{display:block;margin-top:4px;font-size:11px}.fd-personal-activity{display:grid;grid-template-columns:repeat(4,1fr);overflow:hidden;margin-bottom:16px;border:1px solid rgba(255,255,255,.06);border-radius:12px}.fd-personal-activity div{padding:11px;border-left:1px solid rgba(255,255,255,.06)}.fd-personal-activity div:first-child{border-left:0}.fd-personal-activity b{display:block;font-size:18px}.fd-personal-activity span{color:#746e7b;font-size:7px}.fd-personal-card>a,.fd-fatewindow-home>a{color:#91edfb;font-size:9px;font-weight:850;text-decoration:none}.fd-fatewindow-home{display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(circle at 85% 15%,rgba(88,232,255,.08),transparent 28%),radial-gradient(circle at 100% 100%,rgba(157,109,255,.09),transparent 32%),rgba(9,9,14,.9)}.fd-fatewindow-home h2{margin:9px 0;font-size:clamp(1.65rem,2.2vw,2.45rem);line-height:.98;letter-spacing:-.045em}.fd-fatewindow-home h2 em{font-style:normal;color:#bf9cff}.fd-fatewindow-home p{color:#918b98;font-size:11px;line-height:1.55}.fd-window-states{display:flex;flex-wrap:wrap;gap:6px;margin:16px 0}.fd-window-states span{padding:6px 8px;border:1px solid rgba(255,255,255,.08);border-radius:999px;font-size:6px;font-weight:900;letter-spacing:.08em}.fd-window-states .buy{color:#72e8ae}.fd-window-states .calm{color:#79eaff}.fd-window-states .watch{color:#c4a4ff}.fd-window-states .wait{color:#ffc06d}.fd-window-status{display:grid;grid-template-columns:9px 1fr;gap:9px;align-items:center;margin-bottom:16px;padding:10px;border:1px solid rgba(255,255,255,.055);border-radius:11px;background:rgba(0,0,0,.16)}.fd-window-status i{width:7px;height:7px;border-radius:50%;background:#bb94ff;box-shadow:0 0 14px rgba(187,148,255,.5)}.fd-window-status small{display:block;color:#696370;font-size:6px;font-weight:900;letter-spacing:.11em}.fd-window-status strong{font-size:9px}.fd-command-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}.fd-command-feed{padding:24px;min-width:0;transition:.18s ease}.fd-command-feed:hover{transform:translateY(-1px);border-color:rgba(88,232,255,.13)!important}.fd-command-feed .fd-dashboard-list article{min-height:76px}@media(max-width:1180px){.fd-core-actions{grid-template-columns:1fr 1fr}.fd-command-signal{opacity:.35}.fd-command-copy{max-width:70%}.fd-home-personal-grid{grid-template-columns:1fr}}@media(max-width:850px){.fd-command-grid{grid-template-columns:1fr}.fd-command-metrics{grid-template-columns:1fr 1fr}.fd-command-hero{min-height:520px}.fd-command-copy{max-width:100%}.fd-command-signal{right:-70px;top:220px;transform:scale(.8)}.fd-personal-activity{grid-template-columns:1fr 1fr}}@media(max-width:560px){.fd-command-hero{padding:25px}.fd-command-copy h1{font-size:2.7rem}.fd-command-metrics{left:25px;right:25px}.fd-core-actions{grid-template-columns:1fr}.fd-personal-facts,.fd-personal-activity{grid-template-columns:1fr}.fd-personal-activity div{border-left:0;border-top:1px solid rgba(255,255,255,.06)}}
    `}</style>
  </DashboardPageShell>;
}
