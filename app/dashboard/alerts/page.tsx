import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StartMembershipButton } from "@/components/membership-actions";
import { getCurrentSnapshot } from "@/lib/auth";
import { getLatestNetworkMetricSnapshot, type NetworkSignal, type SignalLifecycle } from "@/lib/dashboard-storage";
import { hasPremiumAccess, membershipLabel } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Alerts | FateDrop",
  description: "Live FateDrop lifecycle signals for collectors.",
  robots: { index: false, follow: false },
};

const stateMeta: Record<SignalLifecycle, { label: string; glyph: string; description: string }> = {
  whisper: { label: "WHISPER", glyph: "W", description: "Early catalogue activity before verified availability." },
  manifested: { label: "MANIFESTED", glyph: "M", description: "Verified purchasable stock detected." },
  vanished: { label: "VANISHED", glyph: "V", description: "Previously purchasable stock is no longer verified available." },
  echo: { label: "ECHO", glyph: "E", description: "Previously available stock has returned." },
};

function money(pence: number | null | undefined) {
  if (pence === null || pence === undefined) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

function relativeTime(timestamp: number, now: number) {
  const seconds = Math.max(0, now - timestamp);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86_400)}d ago`;
}

function SignalCard({ signal, unlocked, now }: { signal: NetworkSignal; unlocked: boolean; now: number }) {
  const meta = stateMeta[signal.state];
  return (
    <article className={`fd-alert-row state-${signal.state} ${unlocked ? "" : "locked"}`}>
      <div className="fd-alert-state"><span>{meta.glyph}</span><small>{meta.label}</small></div>
      <div className="fd-alert-body">
        <div className="fd-alert-titleline">
          <div className={unlocked ? "" : "fd-alert-blur"}>
            <strong>{signal.title}</strong>
            <small>{signal.retailer || "Retailer pending"}</small>
          </div>
          <time>{relativeTime(signal.occurredAt, now)}</time>
        </div>
        <p className={unlocked ? "" : "fd-alert-blur fd-alert-detail"}>{signal.detail || meta.description}</p>
        <div className="fd-alert-facts">
          <span><small>DELIVERED</small><b className={unlocked ? "" : "fd-alert-blur"}>{money(signal.deliveredPricePence)}</b></span>
          <span><small>STATE</small><b>{meta.label}</b></span>
          <span><small>DETECTED</small><b>{relativeTime(signal.occurredAt, now)}</b></span>
        </div>
      </div>
      {!unlocked ? <div className="fd-alert-lock" aria-label="Premium signal details locked">♛</div> : null}
    </article>
  );
}

export default async function AlertsPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard/alerts");

  const network = await getLatestNetworkMetricSnapshot();
  const unlocked = hasPremiumAccess(snapshot.membership);
  const plan = membershipLabel(snapshot.membership);
  const now = Math.floor(Date.now() / 1000);
  const signals = [...(network?.recentSignals ?? [])].sort((a, b) => b.occurredAt - a.occurredAt);
  const counts = {
    whisper: signals.filter((item) => item.state === "whisper").length,
    manifested: signals.filter((item) => item.state === "manifested").length,
    vanished: signals.filter((item) => item.state === "vanished").length,
    echo: signals.filter((item) => item.state === "echo").length,
  };

  return (
    <main className="fd-alerts-page">
      <header className="fd-alerts-topbar">
        <div>
          <Link href="/dashboard" className="fd-alerts-back">← Dashboard</Link>
          <span className="fd-alerts-kicker">LIVE SIGNAL NETWORK</span>
          <h1>Alerts</h1>
          <p>Whisper, Manifested, Vanished and Echo — one evidence-led feed.</p>
        </div>
        <div className={`fd-alerts-access ${unlocked ? "unlocked" : "locked"}`}>
          <span>{unlocked ? "● LIVE ACCESS" : "♛ PREMIUM"}</span>
          <strong>{plan}</strong>
        </div>
      </header>

      {!unlocked ? (
        <section className="fd-alerts-gate">
          <div><span>PREMIUM SIGNAL INTELLIGENCE</span><h2>The network is active. The actionable details are locked.</h2><p>Start your free trial to reveal product, retailer and price intelligence across the live FateDrop signal feed.</p></div>
          <StartMembershipButton tier="plus" label="Start free trial" />
        </section>
      ) : null}

      <section className="fd-alerts-stats" aria-label="Signal totals in latest network snapshot">
        {(Object.keys(stateMeta) as SignalLifecycle[]).map((state) => <div key={state} className={`state-${state}`}><span>{stateMeta[state].glyph}</span><strong>{counts[state]}</strong><small>{stateMeta[state].label}</small></div>)}
      </section>

      <section className="fd-alerts-feed">
        <div className="fd-alerts-feedhead"><div><span>NETWORK FEED</span><small>{network ? `Source: ${network.source}` : "Awaiting FateDrop Cloud"}</small></div><b>{signals.length} SIGNAL{signals.length === 1 ? "" : "S"}</b></div>
        {signals.length ? signals.map((signal) => <SignalCard key={signal.id} signal={signal} unlocked={unlocked} now={now} />) : (
          <div className="fd-alerts-empty"><span>◌</span><h2>No persisted signals yet.</h2><p>The page is connected to FateDrop&apos;s network store. Real lifecycle events will appear here when the Cloud Signal Engine publishes them.</p></div>
        )}
      </section>

      <section className="fd-alerts-legend">
        {(Object.keys(stateMeta) as SignalLifecycle[]).map((state) => <div key={state}><span className={`legend-dot state-${state}`} /> <strong>{stateMeta[state].label}</strong><p>{stateMeta[state].description}</p></div>)}
      </section>

      <style>{`
        .fd-alerts-page{min-height:100vh;background:#07070b;color:#f6f2ff;padding:48px clamp(20px,5vw,72px) 80px;font-family:var(--font-geist-sans),Arial,sans-serif}.fd-alerts-page *{box-sizing:border-box}.fd-alerts-topbar{max-width:1280px;margin:0 auto 28px;display:flex;justify-content:space-between;gap:24px;align-items:flex-end}.fd-alerts-back{display:inline-block;color:#a9a3b5;text-decoration:none;margin-bottom:34px;font-size:13px}.fd-alerts-back:hover{color:#fff}.fd-alerts-kicker{display:block;color:#9b5cff;font-size:11px;letter-spacing:.19em;font-weight:800}.fd-alerts-topbar h1{font-size:clamp(42px,7vw,82px);letter-spacing:-.055em;line-height:.9;margin:12px 0 14px}.fd-alerts-topbar p{color:#9d98aa;margin:0;max-width:620px}.fd-alerts-access{min-width:170px;border:1px solid #26222d;border-radius:16px;background:#0d0c12;padding:16px 18px}.fd-alerts-access span{font-size:10px;letter-spacing:.12em;color:#9b5cff;display:block;margin-bottom:7px}.fd-alerts-access.unlocked span{color:#4ce6a6}.fd-alerts-access strong{font-size:14px}.fd-alerts-gate{max-width:1280px;margin:0 auto 22px;border:1px solid rgba(155,92,255,.38);background:linear-gradient(100deg,rgba(79,30,141,.22),rgba(10,9,15,.95));border-radius:20px;padding:24px;display:flex;align-items:center;justify-content:space-between;gap:24px}.fd-alerts-gate span{font-size:10px;letter-spacing:.16em;color:#ad77ff;font-weight:800}.fd-alerts-gate h2{font-size:20px;margin:7px 0 6px}.fd-alerts-gate p{color:#9992a6;margin:0;max-width:720px;font-size:13px}.fd-alerts-stats{max-width:1280px;margin:0 auto 22px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.fd-alerts-stats>div{border:1px solid #201d27;background:#0c0b10;border-radius:15px;padding:16px;display:grid;grid-template-columns:34px 1fr;grid-template-rows:auto auto;align-items:center}.fd-alerts-stats>div>span{grid-row:1/3;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:#17131e;font-size:11px;font-weight:900}.fd-alerts-stats strong{font-size:22px}.fd-alerts-stats small{font-size:9px;color:#77707f;letter-spacing:.13em}.state-whisper>span,.legend-dot.state-whisper{color:#f2bd55}.state-manifested>span,.legend-dot.state-manifested{color:#a875ff}.state-vanished>span,.legend-dot.state-vanished{color:#ff6b77}.state-echo>span,.legend-dot.state-echo{color:#52dff2}.fd-alerts-feed{max-width:1280px;margin:0 auto;border:1px solid #201d27;background:#0a090e;border-radius:22px;overflow:hidden}.fd-alerts-feedhead{display:flex;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #1b1820}.fd-alerts-feedhead span{display:block;font-size:11px;letter-spacing:.14em;font-weight:800}.fd-alerts-feedhead small{color:#716b79;font-size:10px}.fd-alerts-feedhead b{color:#827b8b;font-size:10px;letter-spacing:.12em}.fd-alert-row{position:relative;display:grid;grid-template-columns:88px 1fr;min-height:152px;border-bottom:1px solid #17141c}.fd-alert-row:last-child{border-bottom:0}.fd-alert-row:before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:#7750b4}.fd-alert-row.state-whisper:before{background:#d79c31}.fd-alert-row.state-manifested:before{background:#8752db}.fd-alert-row.state-vanished:before{background:#e6515f}.fd-alert-row.state-echo:before{background:#35bdd0}.fd-alert-state{border-right:1px solid #17141c;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px}.fd-alert-state>span{height:36px;width:36px;border-radius:12px;background:#15121a;display:grid;place-items:center;font-weight:900}.fd-alert-state small{font-size:8px;letter-spacing:.1em;color:#78717f}.fd-alert-body{padding:19px 22px}.fd-alert-titleline{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.fd-alert-titleline strong{display:block;font-size:16px}.fd-alert-titleline small{display:block;color:#817a88;margin-top:4px;font-size:11px}.fd-alert-titleline time{color:#716b79;font-size:10px;white-space:nowrap}.fd-alert-body p{color:#aaa3b1;font-size:12px;margin:13px 0 17px}.fd-alert-facts{display:flex;gap:34px}.fd-alert-facts span{display:flex;flex-direction:column;gap:4px}.fd-alert-facts small{font-size:8px;letter-spacing:.12em;color:#5f5966}.fd-alert-facts b{font-size:11px}.fd-alert-blur{filter:blur(6px);user-select:none;pointer-events:none;opacity:.65}.fd-alert-row.locked{background:linear-gradient(90deg,rgba(155,92,255,.035),transparent)}.fd-alert-lock{position:absolute;right:22px;bottom:18px;color:#a56cff;border:1px solid rgba(165,108,255,.3);width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#100d16}.fd-alerts-empty{text-align:center;padding:70px 20px}.fd-alerts-empty>span{font-size:30px;color:#7952af}.fd-alerts-empty h2{font-size:19px}.fd-alerts-empty p{max-width:580px;margin:auto;color:#817a88;font-size:12px}.fd-alerts-legend{max-width:1280px;margin:18px auto 0;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.fd-alerts-legend>div{padding:15px;border:1px solid #1d1a22;border-radius:14px;background:#0a090d}.legend-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:currentColor;margin-right:6px}.fd-alerts-legend strong{font-size:10px;letter-spacing:.1em}.fd-alerts-legend p{color:#716b79;font-size:10px;line-height:1.45;margin:7px 0 0}@media(max-width:760px){.fd-alerts-page{padding:28px 14px 60px}.fd-alerts-topbar{display:block}.fd-alerts-access{margin-top:20px}.fd-alerts-gate{display:block}.fd-alerts-gate button,.fd-alerts-gate a{margin-top:16px}.fd-alerts-stats,.fd-alerts-legend{grid-template-columns:repeat(2,1fr)}.fd-alert-row{grid-template-columns:62px 1fr}.fd-alert-body{padding:16px 13px}.fd-alert-facts{gap:15px;flex-wrap:wrap}.fd-alert-titleline{gap:8px}.fd-alert-state small{font-size:7px}.fd-alert-lock{right:12px;bottom:12px}}
      `}</style>
    </main>
  );
}
