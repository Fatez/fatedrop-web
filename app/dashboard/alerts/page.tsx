import type { Metadata } from "next";
import { StartMembershipButton } from "@/components/membership-actions";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { getLatestNetworkMetricSnapshot, type NetworkSignal, type SignalLifecycle } from "@/lib/dashboard-storage";
import { hasPremiumAccess, membershipLabel } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Alerts | FateDrop Dashboard",
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
        <div className="fd-alert-titleline"><div className={unlocked ? "" : "fd-alert-blur"}><strong>{signal.title}</strong><small>{signal.retailer || "Retailer pending"}</small></div><time>{relativeTime(signal.occurredAt, now)}</time></div>
        <p className={unlocked ? "" : "fd-alert-blur fd-alert-detail"}>{signal.detail || meta.description}</p>
        <div className="fd-alert-facts"><span><small>DELIVERED</small><b className={unlocked ? "" : "fd-alert-blur"}>{money(signal.deliveredPricePence)}</b></span><span><small>STATE</small><b>{meta.label}</b></span><span><small>DETECTED</small><b>{relativeTime(signal.occurredAt, now)}</b></span></div>
      </div>
      {!unlocked ? <div className="fd-alert-lock" aria-label="Premium signal details locked">♛</div> : null}
    </article>
  );
}

export default async function AlertsPage() {
  const snapshot = await getCurrentSnapshot();
  const network = await getLatestNetworkMetricSnapshot();
  const unlocked = snapshot ? hasPremiumAccess(snapshot.membership) : false;
  const plan = snapshot ? membershipLabel(snapshot.membership) : "Free";
  const now = Math.floor(Date.now() / 1000);
  const signals = [...(network?.recentSignals ?? [])].sort((a, b) => b.occurredAt - a.occurredAt);
  const counts = {
    whisper: signals.filter((item) => item.state === "whisper").length,
    manifested: signals.filter((item) => item.state === "manifested").length,
    vanished: signals.filter((item) => item.state === "vanished").length,
    echo: signals.filter((item) => item.state === "echo").length,
  };

  return (
    <DashboardPageShell title="Alerts" eyebrow="LIVE SIGNAL NETWORK">
      <div className="fd-alerts-content">
        <section className="fd-dash-card fd-network-card">
          <div className="fd-dash-card-head"><span>LIVE SIGNAL NETWORK</span><i className={network ? "live" : "pending"}>{network ? "● CONNECTED" : "○ AWAITING FEED"}</i></div>
          <div className="fd-network-message"><h1>Whisper. Manifested. Vanished. Echo.</h1><p>One evidence-led feed from FateDrop Cloud to the website, Discord and eventually app push.</p></div>
          <div className="fd-network-metrics"><div><strong>{counts.whisper}</strong><span>WHISPER</span><small>Early activity</small></div><div><strong>{counts.manifested}</strong><span>MANIFESTED</span><small>Available</small></div><div><strong>{counts.vanished}</strong><span>VANISHED</span><small>Gone</small></div><div><strong>{counts.echo}</strong><span>ECHO</span><small>Returned</small></div></div>
        </section>

        {!unlocked ? <section className="fd-alerts-gate"><div><span>PREMIUM SIGNAL INTELLIGENCE</span><h2>The feed is active. Actionable details are locked.</h2><p>{plan} access can see the signal state, while a Premium trial reveals product, retailer and price intelligence.</p></div><StartMembershipButton tier="plus" label="Start free trial" /></section> : null}

        <section className="fd-alerts-feed">
          <div className="fd-alerts-feedhead"><div><span>NETWORK FEED</span><small>{network ? `Source: ${network.source}` : "Awaiting FateDrop Cloud"}</small></div><b>{signals.length} SIGNAL{signals.length === 1 ? "" : "S"}</b></div>
          {signals.length ? signals.map((signal) => <SignalCard key={signal.id} signal={signal} unlocked={unlocked} now={now} />) : <div className="fd-alerts-empty"><span>◌</span><h2>No persisted signals yet.</h2><p>Real lifecycle events will appear here automatically when FateDrop Cloud publishes them.</p></div>}
        </section>
      </div>

      <style>{`
        .fd-alerts-content{display:grid;gap:18px}.fd-alerts-gate{border:1px solid rgba(155,92,255,.38);background:linear-gradient(100deg,rgba(79,30,141,.22),rgba(10,9,15,.95));border-radius:20px;padding:24px;display:flex;align-items:center;justify-content:space-between;gap:24px}.fd-alerts-gate span{font-size:10px;letter-spacing:.16em;color:#ad77ff;font-weight:800}.fd-alerts-gate h2{font-size:20px;margin:7px 0 6px}.fd-alerts-gate p{color:#9992a6;margin:0;max-width:720px;font-size:13px}.fd-alerts-feed{border:1px solid #201d27;background:#0a090e;border-radius:22px;overflow:hidden}.fd-alerts-feedhead{display:flex;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #1b1820}.fd-alerts-feedhead span{display:block;font-size:11px;letter-spacing:.14em;font-weight:800}.fd-alerts-feedhead small{color:#716b79;font-size:10px}.fd-alerts-feedhead b{color:#827b8b;font-size:10px;letter-spacing:.12em}.fd-alert-row{position:relative;display:grid;grid-template-columns:88px 1fr;min-height:152px;border-bottom:1px solid #17141c}.fd-alert-row:last-child{border-bottom:0}.fd-alert-row:before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px}.fd-alert-row.state-whisper:before{background:#d79c31}.fd-alert-row.state-manifested:before{background:#8752db}.fd-alert-row.state-vanished:before{background:#e6515f}.fd-alert-row.state-echo:before{background:#35bdd0}.fd-alert-state{border-right:1px solid #17141c;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px}.fd-alert-state>span{height:36px;width:36px;border-radius:12px;background:#15121a;display:grid;place-items:center;font-weight:900}.fd-alert-state small{font-size:8px;letter-spacing:.1em;color:#78717f}.fd-alert-body{padding:19px 22px}.fd-alert-titleline{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.fd-alert-titleline strong{display:block;font-size:16px}.fd-alert-titleline small{display:block;color:#817a88;margin-top:4px;font-size:11px}.fd-alert-titleline time{color:#716b79;font-size:10px;white-space:nowrap}.fd-alert-body p{color:#aaa3b1;font-size:12px;margin:13px 0 17px}.fd-alert-facts{display:flex;gap:34px}.fd-alert-facts span{display:flex;flex-direction:column;gap:4px}.fd-alert-facts small{font-size:8px;letter-spacing:.12em;color:#5f5966}.fd-alert-facts b{font-size:11px}.fd-alert-blur{filter:blur(6px);user-select:none;pointer-events:none;opacity:.65}.fd-alert-row.locked{background:linear-gradient(90deg,rgba(155,92,255,.035),transparent)}.fd-alert-lock{position:absolute;right:22px;bottom:18px;color:#a56cff;border:1px solid rgba(165,108,255,.3);width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#100d16}.fd-alerts-empty{text-align:center;padding:70px 20px}.fd-alerts-empty>span{font-size:30px;color:#7952af}.fd-alerts-empty p{max-width:580px;margin:auto;color:#817a88;font-size:12px}@media(max-width:760px){.fd-alerts-gate{display:block}.fd-alerts-gate button{margin-top:16px}.fd-alert-row{grid-template-columns:62px 1fr}.fd-alert-body{padding:16px 13px}.fd-alert-facts{gap:15px;flex-wrap:wrap}.fd-alert-lock{right:12px;bottom:12px}}
      `}</style>
    </DashboardPageShell>
  );
}
