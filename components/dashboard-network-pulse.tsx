type DashboardNetworkPulseProps = {
  retailers: number | null | undefined;
  products: number | null | undefined;
  signals: number | null | undefined;
};

function metric(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : new Intl.NumberFormat("en-GB").format(value);
}

export function DashboardNetworkPulse({ retailers, products, signals }: DashboardNetworkPulseProps) {
  const networkAvailable = retailers !== null && retailers !== undefined && products !== null && products !== undefined;

  return (
    <div className="fd-pulse-layout">
      <div className="fd-pulse-art">
        <img src="/assets/dashboard/network-pulse-map.svg" alt="Stylised FateDrop United Kingdom retailer network artwork" />
        <span className={`fd-pulse-status ${networkAvailable ? "live" : ""}`}><i />{networkAvailable ? "NETWORK DATA LIVE" : "NETWORK DATA UNAVAILABLE"}</span>
        <small>UK NETWORK · ILLUSTRATIVE VIEW</small>
      </div>

      <div className="fd-pulse-intelligence">
        <div className="fd-pulse-intro">
          <span>FATEDROP NETWORK INTELLIGENCE</span>
          <strong>A real network should look like one.</strong>
          <p>Retailers, Products and Signals are surfaced from canonical network metrics. No decorative counts. No browser-made business truth.</p>
        </div>
        <div className="fd-pulse-metrics">
          <article><span><small>ACTIVE RETAILERS</small><em>Catalogue network</em></span><b>{metric(retailers)}</b></article>
          <article><span><small>PRODUCTS TRACKED</small><em>Canonical catalogue</em></span><b>{metric(products)}</b></article>
          <article><span><small>SIGNALS · 7D</small><em>Persisted activity</em></span><b>{metric(signals)}</b></article>
        </div>
        <p className="fd-pulse-note">Artwork is illustrative; the displayed metrics come from FateDrop network data.</p>
      </div>

      <style>{`
        .fd-pulse-layout{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(190px,.85fr);gap:12px;align-items:stretch;min-height:250px;padding:0 14px 14px}.fd-pulse-art{position:relative;min-height:236px;overflow:hidden;border:1px solid rgba(183,154,106,.13);border-radius:9px;background:#090d12}.fd-pulse-art:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 64%,rgba(8,12,17,.28)),linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.16))}.fd-pulse-art img{width:100%;height:100%;display:block;object-fit:cover;object-position:center;opacity:.9}.fd-pulse-status{position:absolute;z-index:2;left:10px;top:10px;display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid rgba(183,154,106,.18);border-radius:999px;background:rgba(6,9,12,.78);color:#918780;font-size:7px;font-weight:900;letter-spacing:.1em;backdrop-filter:blur(7px)}.fd-pulse-status i{width:5px;height:5px;border-radius:50%;background:#665f5d}.fd-pulse-status.live{color:#c5aa7e}.fd-pulse-status.live i{background:#c8a66f;box-shadow:0 0 9px rgba(200,166,111,.48)}.fd-pulse-art>small{position:absolute;z-index:2;left:10px;bottom:9px;color:#bca27b;font-size:7px;font-weight:850;letter-spacing:.12em}.fd-pulse-intelligence{display:grid;align-content:center;gap:10px;padding:3px 0}.fd-pulse-intro>span{color:#ae8f66;font-size:7px;font-weight:900;letter-spacing:.13em}.fd-pulse-intro>strong{display:block;margin-top:5px;color:#e5dbd3;font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:500;line-height:1.05;letter-spacing:-.03em}.fd-pulse-intro p{margin:6px 0 0;color:#958d8d;font-size:9px;line-height:1.5}.fd-pulse-metrics{display:grid;gap:5px}.fd-pulse-metrics article{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 8px;border:1px solid rgba(221,203,188,.07);border-radius:7px;background:rgba(255,255,255,.014)}.fd-pulse-metrics article>span{min-width:0}.fd-pulse-metrics small{display:block;color:#a18d78;font-size:8px;font-weight:900;letter-spacing:.06em}.fd-pulse-metrics em{display:block;margin-top:2px;color:#746d6d;font-size:7px;font-style:normal}.fd-pulse-metrics b{flex:0 0 auto;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:500;letter-spacing:-.03em}.fd-pulse-note{margin:0;color:#716a69;font-size:7px;line-height:1.45}@media(max-width:760px){.fd-pulse-layout{grid-template-columns:1fr}.fd-pulse-art{min-height:190px}.fd-pulse-intelligence{padding-bottom:2px}}@media(max-width:430px){.fd-pulse-layout{padding-inline:10px}.fd-pulse-art{min-height:165px}.fd-pulse-intro>strong{font-size:18px}}
      `}</style>
    </div>
  );
}
