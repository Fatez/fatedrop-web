import Image from "next/image";
import { getLatestFreshNetworkMetricSnapshot } from "@/lib/network-snapshot-freshness";

type DashboardNetworkPulseProps = {
  retailers: number | null | undefined;
  products: number | null | undefined;
  signals: number | null | undefined;
};

function metric(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : new Intl.NumberFormat("en-GB").format(value);
}

export async function DashboardNetworkPulse({ retailers, products, signals }: DashboardNetworkPulseProps) {
  const latestSnapshot = await getLatestFreshNetworkMetricSnapshot();
  const visibleRetailers = latestSnapshot ? retailers : null;
  const visibleProducts = latestSnapshot ? products : null;

  return (
    <div className="fd-pulse-layout">
      <div className="fd-pulse-map" role="img" aria-label="Illustrative FateDrop United Kingdom network artwork">
        <Image src="/assets/dashboard/network-pulse-map.svg" alt="" fill sizes="(max-width: 620px) 100vw, 420px" />
      </div>
      <div className="fd-pulse-metrics">
        <span><b>{metric(visibleRetailers)}</b><small>Retailers<br/>active</small></span>
        <span><b>{metric(visibleProducts)}</b><small>Products<br/>tracked</small></span>
        <span><b>{metric(signals)}</b><small>Signals<br/>7D</small></span>
      </div>
      <div className="fd-pulse-explain">
        <strong>The live heartbeat of FateDrop.</strong>
        <span>See the latest available network scale alongside canonical seven-day signal activity. The map is illustrative; stale or unavailable snapshot metrics stay unknown rather than being guessed.</span>
      </div>
      <style>{`
        .fd-pulse-layout{min-height:258px;display:grid;grid-template-columns:minmax(0,1fr) 128px;align-items:center;gap:4px;position:relative;padding-bottom:46px}.fd-pulse-map{width:100%;height:220px;overflow:hidden;border-radius:8px;position:relative;background:#090d12}.fd-pulse-map:after{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 72%,rgba(9,13,18,.42)),linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.1))}.fd-pulse-map img{object-fit:cover;object-position:center;opacity:.92}.fd-pulse-metrics{display:grid;gap:22px}.fd-pulse-metrics span{display:grid;gap:4px}.fd-pulse-metrics b{color:#f1e8e1;font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:500;letter-spacing:-.04em}.fd-pulse-metrics small{color:#a0989c;font-size:11px;line-height:1.45;letter-spacing:.02em}.fd-pulse-explain{position:absolute;left:8px;right:8px;bottom:2px;padding-top:12px;border-top:1px solid rgba(221,203,188,.06);display:grid;gap:3px}.fd-pulse-explain strong{color:#d0c6c0;font-size:11px}.fd-pulse-explain span{color:#938b90;font-size:10px;line-height:1.55}@media(max-width:620px){.fd-pulse-layout{grid-template-columns:1fr;padding-bottom:68px}.fd-pulse-map{height:180px}.fd-pulse-metrics{grid-template-columns:repeat(3,1fr);gap:12px}.fd-pulse-metrics b{font-size:30px}}
      `}</style>
    </div>
  );
}
