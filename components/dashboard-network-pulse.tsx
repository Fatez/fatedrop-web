type DashboardNetworkPulseProps = {
  retailers: number | null | undefined;
  products: number | null | undefined;
  signals: number | null | undefined;
};

const networkNodes = [
  { x: 238, y: 94 },
  { x: 198, y: 121 },
  { x: 279, y: 158 },
  { x: 219, y: 207 },
  { x: 252, y: 202 },
  { x: 191, y: 219 },
  { x: 239, y: 253 },
  { x: 181, y: 281 },
  { x: 216, y: 290 },
  { x: 314, y: 294 },
  { x: 297, y: 244 },
  { x: 272, y: 316 },
  { x: 113, y: 232 },
  { x: 329, y: 221 },
  { x: 256, y: 137 },
  { x: 204, y: 171 },
] as const;

const networkRoutes = [
  [0, 1], [0, 14], [1, 15], [14, 2], [15, 3], [2, 4], [3, 4], [3, 5],
  [3, 6], [4, 6], [4, 10], [5, 7], [6, 7], [6, 8], [6, 10], [7, 8],
  [8, 9], [8, 11], [9, 10], [9, 11], [10, 13], [10, 9], [12, 5],
] as const;

function metric(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : new Intl.NumberFormat("en-GB").format(value);
}

export function DashboardNetworkPulse({ retailers, products, signals }: DashboardNetworkPulseProps) {
  const visibleNodeCount = retailers === null || retailers === undefined
    ? 0
    : Math.min(networkNodes.length, Math.max(0, Math.ceil(retailers)));
  const visibleNodes = networkNodes.slice(0, visibleNodeCount);
  const visibleRoutes = networkRoutes.filter(([from, to]) => from < visibleNodeCount && to < visibleNodeCount);
  const networkAvailable = retailers !== null && retailers !== undefined && products !== null && products !== undefined;

  return (
    <div className="fd-pulse-layout">
      <div className="fd-pulse-visual">
        <div className="fd-pulse-status"><i className={networkAvailable ? "live" : ""}/><span>{networkAvailable ? "NETWORK DATA LIVE" : "NETWORK DATA UNAVAILABLE"}</span></div>
        <svg className="fd-pulse-map" viewBox="0 0 430 360" role="img" aria-label="Schematic United Kingdom FateDrop network footprint">
          <defs>
            <linearGradient id="fdNetworkLand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#111a24" />
              <stop offset="62%" stopColor="#0b1118" />
              <stop offset="100%" stopColor="#080c11" />
            </linearGradient>
            <linearGradient id="fdNetworkRoute" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#b79a6a" stopOpacity=".36" />
              <stop offset="55%" stopColor="#9a6dcc" stopOpacity=".7" />
              <stop offset="100%" stopColor="#78bed1" stopOpacity=".42" />
            </linearGradient>
            <radialGradient id="fdNetworkVioletGlow">
              <stop offset="0%" stopColor="#b67be8" stopOpacity=".9" />
              <stop offset="52%" stopColor="#8253b9" stopOpacity=".34" />
              <stop offset="100%" stopColor="#8253b9" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="fdNetworkCyanGlow">
              <stop offset="0%" stopColor="#94d6e7" stopOpacity=".88" />
              <stop offset="52%" stopColor="#5aa7bc" stopOpacity=".28" />
              <stop offset="100%" stopColor="#5aa7bc" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="fd-map-grid" aria-hidden="true">
            <path d="M24 80H406M24 140H406M24 200H406M24 260H406M24 320H406" />
            <path d="M70 26V338M140 26V338M210 26V338M280 26V338M350 26V338" />
          </g>

          <g className="fd-uk-land">
            <path className="land" d="M225 24C245 23 268 31 282 45C292 55 287 67 276 75C292 83 298 97 289 109C282 118 272 122 278 135C284 147 296 154 300 169C304 184 299 196 306 208C314 220 331 227 335 242C338 254 330 265 335 276C340 287 358 293 361 306C364 320 351 331 334 334C316 337 301 328 288 331C274 335 265 346 248 343C231 340 220 325 209 318C197 310 185 312 174 306C163 300 158 289 165 279C171 270 183 265 181 254C179 244 163 240 162 228C161 216 177 208 182 197C188 184 178 174 177 162C176 150 188 143 185 132C181 120 164 114 166 101C168 89 183 83 180 70C178 60 189 52 198 47C203 35 211 26 225 24Z" />
            <path className="land" d="M112 199C128 196 143 203 147 216C151 229 143 244 130 251C118 258 101 253 96 241C91 228 96 207 112 199Z" />
            <path className="island" d="M190 30L181 22L186 14L198 18Z" />
            <path className="island" d="M169 54L158 48L161 38L174 42Z" />
          </g>

          <g className="fd-network-routes" aria-hidden="true">
            {visibleRoutes.map(([from, to], index) => {
              const a = networkNodes[from];
              const b = networkNodes[to];
              return <line key={`${from}-${to}-${index}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
            })}
          </g>

          <g className="fd-network-nodes" aria-hidden="true">
            {visibleNodes.map((node, index) => <g key={`${node.x}-${node.y}`} className={index % 4 === 0 ? "major" : index % 3 === 0 ? "cyan" : ""}>
              <circle className="halo" cx={node.x} cy={node.y} r={index % 4 === 0 ? 18 : 12} />
              <circle className="ring" cx={node.x} cy={node.y} r={index % 4 === 0 ? 5.2 : 4.2} />
              <circle className="core" cx={node.x} cy={node.y} r={index % 4 === 0 ? 2.2 : 1.7} />
            </g>)}
          </g>

          <path className="fd-map-scan" d="M82 287C152 249 207 216 271 174C318 143 349 105 376 58" aria-hidden="true" />
        </svg>
        <div className="fd-pulse-map-caption"><b>UK NETWORK FOOTPRINT</b><span>Schematic geography · node density follows the active-retailer count, not exact branch locations.</span></div>
      </div>

      <div className="fd-pulse-intelligence">
        <div className="fd-pulse-intro"><span>FATEDROP NETWORK INTELLIGENCE</span><strong>A real network should look like one.</strong><p>Retailers, catalogue coverage and persisted signal activity are surfaced as canonical network metrics. No decorative counts. No browser-made business truth.</p></div>
        <div className="fd-pulse-metrics">
          <article><small>ACTIVE RETAILERS</small><b>{metric(retailers)}</b><span>Catalogue network</span></article>
          <article><small>PRODUCTS TRACKED</small><b>{metric(products)}</b><span>Canonical catalogue</span></article>
          <article><small>SIGNALS · 7D</small><b>{metric(signals)}</b><span>Persisted activity</span></article>
        </div>
        <div className="fd-pulse-legend"><span><i className="gold"/>Network route</span><span><i className="violet"/>Signal node</span><span><i className="cyan"/>Active pulse</span></div>
      </div>

      <style>{`
        .fd-reference-grid>.fd-network-pulse-card{grid-column:1/-1;order:-1;min-height:0;padding-bottom:0}.fd-network-pulse-card>.fd-pulse-layout{padding:0 18px 52px}
        .fd-pulse-layout{display:grid;grid-template-columns:minmax(460px,1.35fr) minmax(320px,.75fr);gap:26px;align-items:stretch;min-height:390px}.fd-pulse-visual{position:relative;min-height:370px;overflow:hidden;border:1px solid rgba(183,154,106,.12);border-radius:10px;background:radial-gradient(circle at 44% 48%,rgba(93,65,127,.15),transparent 33%),radial-gradient(circle at 58% 54%,rgba(65,128,145,.08),transparent 28%),linear-gradient(145deg,#0c131b,#080c11 70%)}.fd-pulse-visual:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 67%,rgba(8,12,17,.72) 100%),linear-gradient(180deg,rgba(255,255,255,.012),transparent 24%)}.fd-pulse-status{position:absolute;z-index:3;left:14px;top:13px;display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid rgba(183,154,106,.13);border-radius:999px;background:rgba(7,11,15,.74);backdrop-filter:blur(8px);color:#8f8884;font-size:7px;font-weight:850;letter-spacing:.11em}.fd-pulse-status i{width:6px;height:6px;border-radius:50%;background:#665f5d}.fd-pulse-status i.live{background:#7fc5d9;box-shadow:0 0 10px rgba(127,197,217,.55)}.fd-pulse-map{position:absolute;inset:6px 10px 20px 2px;width:calc(100% - 12px);height:calc(100% - 26px);filter:drop-shadow(0 14px 26px rgba(0,0,0,.28))}.fd-map-grid path{fill:none;stroke:rgba(159,177,188,.045);stroke-width:.75}.fd-uk-land .land{fill:url(#fdNetworkLand);stroke:rgba(183,154,106,.58);stroke-width:1.35}.fd-uk-land .island{fill:#0d151d;stroke:rgba(183,154,106,.36);stroke-width:1}.fd-network-routes line{stroke:url(#fdNetworkRoute);stroke-width:1.15;stroke-linecap:round;filter:drop-shadow(0 0 4px rgba(135,91,177,.22))}.fd-network-nodes .halo{fill:url(#fdNetworkVioletGlow);opacity:.72;transform-box:fill-box;transform-origin:center;animation:fdPulseBreath 3.8s ease-in-out infinite}.fd-network-nodes .ring{fill:#0b1118;stroke:#b79a6a;stroke-width:1}.fd-network-nodes .core{fill:#ad75db}.fd-network-nodes g.cyan .halo{fill:url(#fdNetworkCyanGlow)}.fd-network-nodes g.cyan .ring{stroke:#7fc5d9}.fd-network-nodes g.cyan .core{fill:#8fd2e1}.fd-network-nodes g.major .ring{stroke-width:1.4}.fd-network-nodes g.major .core{fill:#d1b37c}.fd-map-scan{fill:none;stroke:rgba(125,199,218,.2);stroke-width:1;stroke-dasharray:3 7}.fd-pulse-map-caption{position:absolute;z-index:3;left:14px;right:14px;bottom:12px;display:flex;justify-content:space-between;gap:18px;align-items:end}.fd-pulse-map-caption b{color:#bca27b;font-size:7px;letter-spacing:.13em}.fd-pulse-map-caption span{max-width:360px;color:#77777a;font-size:7px;line-height:1.45;text-align:right}
        .fd-pulse-intelligence{display:grid;align-content:center;gap:18px;padding:18px 6px 18px 0}.fd-pulse-intro>span{color:#ae8f66;font-size:7px;font-weight:900;letter-spacing:.15em}.fd-pulse-intro>strong{display:block;margin-top:7px;color:#e5dbd3;font-family:Georgia,'Times New Roman',serif;font-size:27px;font-weight:500;line-height:1.05;letter-spacing:-.035em}.fd-pulse-intro p{margin:9px 0 0;color:#8e878a;font-size:10px;line-height:1.6}.fd-pulse-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.fd-pulse-metrics article{min-width:0;padding:12px 10px;border:1px solid rgba(221,203,188,.075);border-radius:8px;background:linear-gradient(145deg,rgba(255,255,255,.02),rgba(255,255,255,.006))}.fd-pulse-metrics small{display:block;color:#8d7c6b;font-size:6px;font-weight:900;letter-spacing:.09em;white-space:nowrap}.fd-pulse-metrics b{display:block;margin:5px 0 3px;overflow:hidden;text-overflow:ellipsis;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:27px;font-weight:500;letter-spacing:-.035em}.fd-pulse-metrics span{color:#777378;font-size:7px}.fd-pulse-legend{display:flex;flex-wrap:wrap;gap:13px;padding-top:12px;border-top:1px solid rgba(221,203,188,.06);color:#777277;font-size:7px}.fd-pulse-legend span{display:flex;align-items:center;gap:5px}.fd-pulse-legend i{width:6px;height:6px;border-radius:50%}.fd-pulse-legend .gold{background:#b79a6a}.fd-pulse-legend .violet{background:#a36ed0;box-shadow:0 0 8px rgba(163,110,208,.3)}.fd-pulse-legend .cyan{background:#7fc5d9;box-shadow:0 0 8px rgba(127,197,217,.3)}
        @keyframes fdPulseBreath{0%,100%{opacity:.48;transform:scale(.86)}50%{opacity:.82;transform:scale(1.08)}}@media(prefers-reduced-motion:reduce){.fd-network-nodes .halo{animation:none}}
        @media(max-width:980px){.fd-pulse-layout{grid-template-columns:1fr}.fd-pulse-visual{min-height:350px}.fd-pulse-intelligence{padding:0 2px}.fd-pulse-intro{max-width:760px}.fd-pulse-intro>strong{font-size:24px}}
        @media(max-width:620px){.fd-network-pulse-card>.fd-pulse-layout{padding:0 10px 48px}.fd-pulse-layout{gap:15px;min-height:0}.fd-pulse-visual{min-height:300px}.fd-pulse-map{inset:14px 0 28px;width:100%;height:calc(100% - 42px)}.fd-pulse-map-caption{display:grid;gap:3px}.fd-pulse-map-caption span{max-width:none;text-align:left}.fd-pulse-intro>strong{font-size:22px}.fd-pulse-metrics{grid-template-columns:1fr}.fd-pulse-metrics article{display:grid;grid-template-columns:1fr auto;align-items:end;gap:2px 10px}.fd-pulse-metrics small{grid-column:1}.fd-pulse-metrics b{grid-column:2;grid-row:1/3;margin:0;font-size:25px}.fd-pulse-metrics span{grid-column:1}.fd-pulse-legend{gap:9px}}
      `}</style>
    </div>
  );
}
