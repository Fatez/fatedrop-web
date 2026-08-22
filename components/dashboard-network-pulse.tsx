type DashboardNetworkPulseProps = {
  retailers: number | null | undefined;
  products: number | null | undefined;
  signals: number | null | undefined;
};

const nodes = [
  [17, 25, 2.6], [25, 18, 1.8], [30, 31, 2.2], [39, 23, 1.5], [47, 32, 2.8],
  [56, 18, 1.7], [65, 28, 2.1], [74, 20, 1.5], [80, 36, 2.5], [70, 45, 1.9],
  [57, 43, 3.1], [45, 49, 1.7], [33, 45, 2.3], [22, 53, 1.6], [29, 65, 2.5],
  [43, 62, 1.8], [55, 68, 2.4], [67, 62, 1.7], [77, 72, 2.6], [60, 81, 1.8],
  [45, 79, 2.7], [31, 82, 1.5], [19, 75, 2.1], [84, 55, 1.7],
] as const;

const edges = [
  [0,1],[0,2],[1,3],[2,3],[2,12],[3,4],[4,5],[4,6],[4,10],[5,6],[6,7],[6,8],[6,9],
  [8,9],[9,10],[9,23],[10,11],[10,17],[11,12],[11,15],[12,13],[12,15],[13,14],[14,15],[14,22],
  [15,16],[16,17],[16,20],[17,18],[17,23],[18,19],[18,23],[19,20],[20,21],[20,22],[21,22],
] as const;

function metric(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : new Intl.NumberFormat("en-GB").format(value);
}

export function DashboardNetworkPulse({ retailers, products, signals }: DashboardNetworkPulseProps) {
  return (
    <div className="fd-pulse-layout">
      <svg className="fd-pulse-map" viewBox="0 0 100 100" role="img" aria-label="Decorative FateDrop network topology">
        <defs>
          <radialGradient id="fdPulseGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(184,111,255,.92)" />
            <stop offset="55%" stopColor="rgba(126,73,204,.45)" />
            <stop offset="100%" stopColor="rgba(126,73,204,0)" />
          </radialGradient>
        </defs>
        {edges.map(([from, to], index) => {
          const a = nodes[from];
          const b = nodes[to];
          return <line key={index} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
        })}
        {nodes.map(([x, y, radius], index) => <g key={index} className={index % 5 === 0 ? "major" : ""}>
          <circle className="halo" cx={x} cy={y} r={radius * 3.4} />
          <circle className="node" cx={x} cy={y} r={radius} />
        </g>)}
      </svg>
      <div className="fd-pulse-metrics">
        <span><b>{metric(retailers)}</b><small>Retailers<br/>active</small></span>
        <span><b>{metric(products)}</b><small>Products<br/>tracked</small></span>
        <span><b>{metric(signals)}</b><small>Signals<br/>7D</small></span>
      </div>
      <div className="fd-pulse-explain">
        <strong>The live heartbeat of FateDrop.</strong>
        <span>See the size and activity of the FateDrop network in real time — active retailers, tracked products and live signal activity. The map is decorative; the numbers come from real network data.</span>
      </div>
      <style>{`
        .fd-pulse-layout{min-height:238px;display:grid;grid-template-columns:minmax(0,1fr) 100px;align-items:center;gap:4px;position:relative;padding-bottom:46px}.fd-pulse-map{width:100%;height:220px;overflow:visible;filter:drop-shadow(0 0 16px rgba(146,80,226,.13))}.fd-pulse-map line{stroke:rgba(148,86,222,.34);stroke-width:.42}.fd-pulse-map .halo{fill:url(#fdPulseGlow);opacity:.22}.fd-pulse-map .node{fill:#8e56c9;stroke:rgba(222,188,255,.65);stroke-width:.35}.fd-pulse-map g.major .halo{opacity:.46}.fd-pulse-map g.major .node{fill:#b77bea}.fd-pulse-metrics{display:grid;gap:18px}.fd-pulse-metrics span{display:grid;gap:4px}.fd-pulse-metrics b{color:#eee5dd;font-family:Georgia,'Times New Roman',serif;font-size:29px;font-weight:500;letter-spacing:-.04em}.fd-pulse-metrics small{color:#82797d;font-size:8px;line-height:1.4;letter-spacing:.02em}.fd-pulse-explain{position:absolute;left:8px;right:8px;bottom:2px;padding-top:10px;border-top:1px solid rgba(221,203,188,.06);display:grid;gap:3px}.fd-pulse-explain strong{color:#bdb3ad;font-size:7px}.fd-pulse-explain span{color:#6e676b;font-size:6px;line-height:1.5}@media(max-width:620px){.fd-pulse-layout{grid-template-columns:1fr;padding-bottom:68px}.fd-pulse-map{height:180px}.fd-pulse-metrics{grid-template-columns:repeat(3,1fr);gap:12px}.fd-pulse-metrics b{font-size:24px}}
      `}</style>
    </div>
  );
}
