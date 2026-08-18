import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { SignalBeam } from "@/components/signal-beam";
import { getCurrentSnapshot } from "@/lib/auth";
import { buildDashboardData, moneyFromPence, relativeTime, signalLabel } from "@/lib/dashboard";
import { hasPremiumAccess, membershipLabel } from "@/lib/membership";

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

      <div className="fd-command-grid">
        <section className="fd-dash-card fd-command-feed">
          <div className="fd-dash-card-head"><span>RECENT MANIFESTED</span><Link href="/dashboard/alerts">All signals</Link></div>
          <div className="fd-dashboard-list">{data.recentManifested.length ? data.recentManifested.map((item)=><article key={item.id}><span className="fd-signal-thumb">M</span><div><strong>{premium ? item.title : "Premium signal detail"}</strong><small>{premium ? (item.retailer || "Retailer pending") : "Retailer hidden"}</small></div><aside>{premium ? (moneyFromPence(item.deliveredPricePence) || "LIVE") : "LOCKED"}<small>{relativeTime(item.occurredAt,data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No Manifested signals yet.</strong><span>The first confirmed availability event will appear here.</span></div>}</div>
        </section>

        <section className="fd-dash-card fd-command-feed">
          <div className="fd-dash-card-head"><span>EARLY INTELLIGENCE</span><Link href="/dashboard/alerts">Open feed</Link></div>
          <div className="fd-dashboard-list">{data.echoWhispers.length ? data.echoWhispers.map((item)=><article key={item.id}><span className={`fd-signal-thumb ${item.state}`}>{item.state === "echo" ? "E" : "W"}</span><div><strong>{premium ? item.title : "Premium signal detail"}</strong><small>{premium ? (item.detail || item.retailer || signalLabel(item)) : "Actionable context locked"}</small></div><aside>{signalLabel(item)}<small>{relativeTime(item.occurredAt,data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No Whisper / Echo activity yet.</strong><span>Early network movement will surface here.</span></div>}</div>
        </section>
      </div>

      <section className="fd-personal-strip">
        <div><small>YOUR NETWORK</small><strong>{data.personal.signalsSeen}</strong><span>signals seen</span></div>
        <div><small>FATEFIND</small><strong>{data.personal.wishlistHits}</strong><span>watchlist hits</span></div>
        <div><small>STORES</small><strong>{data.personal.storesTracked}</strong><span>tracked retailers</span></div>
        <div><small>TRUE PRICE</small><strong>{moneyFromPence(data.personal.savedPence) || "£0.00"}</strong><span>recorded saving</span></div>
      </section>
    </div>

    <style>{`
      .fd-command-centre{display:grid;gap:22px;padding-bottom:38px}.fd-command-hero{position:relative;min-height:430px;overflow:hidden;padding:38px;border:1px solid rgba(139,102,255,.2);border-radius:26px;background:linear-gradient(90deg,rgba(5,6,12,.94),rgba(6,7,13,.78) 55%,rgba(10,7,20,.5)),url('/assets/cardwave-bg.webp') center right/cover no-repeat;box-shadow:0 30px 80px rgba(0,0,0,.24)}.fd-command-copy{position:relative;z-index:3;max-width:650px}.fd-command-copy>span{color:#76eaff;font-size:9px;font-weight:900;letter-spacing:.19em}.fd-command-copy h1{margin:14px 0;font-size:clamp(3rem,5vw,5.4rem);line-height:.88;letter-spacing:-.065em}.fd-command-copy h1 em{font-style:normal;background:linear-gradient(90deg,#fff,#9beeff 45%,#c096ff);-webkit-background-clip:text;color:transparent}.fd-command-copy p{max-width:580px;color:#aaa4b2;font-size:15px;line-height:1.7}.fd-command-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.fd-command-actions a{min-height:42px;padding:0 15px;display:flex;align-items:center;border:1px solid rgba(255,255,255,.11);border-radius:12px;background:rgba(255,255,255,.04);font-size:10px;font-weight:850}.fd-command-actions a:first-child{border-color:rgba(88,232,255,.24);background:linear-gradient(135deg,rgba(88,232,255,.08),rgba(157,109,255,.09))}.fd-command-signal{position:absolute;z-index:2;right:4%;top:58px;width:min(360px,31vw)}.fd-command-card{width:170px;height:238px;margin:0 auto 10px;padding:14px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid rgba(165,135,255,.35);border-radius:15px;background:radial-gradient(circle at 50% 38%,rgba(88,232,255,.11),transparent 30%),linear-gradient(145deg,rgba(33,22,58,.9),rgba(8,8,14,.97));box-shadow:0 25px 60px rgba(0,0,0,.42),0 0 40px rgba(126,82,255,.13);transform:rotate(5deg)}.fd-command-card small{color:#6fe9fb;font-size:7px;font-weight:900;letter-spacing:.14em}.fd-command-card strong{margin:7px 0;font-size:17px;line-height:1.05}.fd-command-card span{color:#817b88;font-size:8px}.fd-command-metrics{position:absolute;z-index:3;left:38px;right:38px;bottom:28px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));max-width:760px}.fd-command-metrics span{padding:10px 16px;border-left:1px solid rgba(255,255,255,.08);color:#706a77;font-size:7px;font-weight:850;letter-spacing:.1em}.fd-command-metrics span:first-child{padding-left:0;border-left:0}.fd-command-metrics b{display:block;margin-bottom:3px;color:#fff;font-size:18px;letter-spacing:-.02em}.fd-core-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.fd-core-actions>a{min-height:170px;padding:20px;display:grid;grid-template-columns:38px 1fr auto;gap:12px;align-items:start;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:radial-gradient(circle at 100% 0%,rgba(157,109,255,.06),transparent 32%),rgba(11,10,16,.88);transition:.18s ease}.fd-core-actions>a:hover{transform:translateY(-2px);border-color:rgba(88,232,255,.18)}.fd-core-actions>a>span{width:38px;height:38px;display:grid;place-items:center;border:1px solid rgba(157,109,255,.2);border-radius:11px;color:#9eeeff;background:rgba(157,109,255,.06)}.fd-core-actions small{color:#6b6571;font-size:7px;font-weight:900;letter-spacing:.15em}.fd-core-actions strong{display:block;margin:5px 0;font-size:16px}.fd-core-actions p{margin:0;color:#8c8692;font-size:10px;line-height:1.55}.fd-core-actions>a>b{color:#797280}.fd-command-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}.fd-command-feed{padding:24px;min-width:0}.fd-command-feed .fd-dashboard-list article{min-height:76px}.fd-personal-strip{display:grid;grid-template-columns:repeat(4,1fr);overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:18px;background:rgba(9,9,14,.86)}.fd-personal-strip>div{padding:20px;border-left:1px solid rgba(255,255,255,.07)}.fd-personal-strip>div:first-child{border-left:0}.fd-personal-strip small{display:block;color:#6e6875;font-size:7px;font-weight:900;letter-spacing:.13em}.fd-personal-strip strong{display:block;margin:5px 0;font-size:24px}.fd-personal-strip span{color:#8e8795;font-size:9px}@media(max-width:1180px){.fd-core-actions{grid-template-columns:1fr 1fr}.fd-command-signal{opacity:.35}.fd-command-copy{max-width:70%}}@media(max-width:850px){.fd-command-grid{grid-template-columns:1fr}.fd-command-metrics{grid-template-columns:1fr 1fr}.fd-command-hero{min-height:520px}.fd-command-copy{max-width:100%}.fd-command-signal{right:-70px;top:220px;transform:scale(.8)}.fd-personal-strip{grid-template-columns:1fr 1fr}}@media(max-width:560px){.fd-command-hero{padding:25px}.fd-command-copy h1{font-size:2.7rem}.fd-command-metrics{left:25px;right:25px}.fd-core-actions{grid-template-columns:1fr}.fd-personal-strip{grid-template-columns:1fr}.fd-personal-strip>div{border-left:0;border-top:1px solid rgba(255,255,255,.07)}}
    `}</style>
  </DashboardPageShell>;
}
