import Link from "next/link";

const rows = [
  ["Searches multiple participating retailers", "No", "Marketplace listings", "Validated beta"],
  ["Includes independent shops", "Single retailer only", "Varies", "Validated beta"],
  ["Compares known delivery cost", "Usually at checkout", "Varies", "Validated beta"],
  ["Universal Wishlist", "No", "Platform-only", "Interactive preview"],
  ["Structured wanted searches", "Basic alert", "Saved marketplace search", "Interactive preview"],
  ["Stock lifecycle intelligence", "In-stock event", "Availability snapshot", "Validated beta"],
  ["Local shops and events", "No", "Limited", "Active expansion"],
  ["Event-vendor inventory", "No", "No", "Interactive preview"],
  ["Direct retailer checkout", "Yes", "Often marketplace checkout", "Yes"],
  ["Privacy-conscious demand insight", "No", "Platform-owned", "Active expansion"],
] as const;

export function WhyFateDrop() {
  return (
    <section className="why-fatedrop section-shell" aria-labelledby="why-fatedrop-title">
      <div className="why-fatedrop-head"><div><p className="eyebrow"><span />Why FateDrop?</p><h2 id="why-fatedrop-title">Discovery with the network still attached.</h2></div><p>A factual comparison of different discovery models—not a victory lap over unnamed competitors. Planned FateDrop capabilities remain labelled as planned or preview-only.</p></div>
      <div className="comparison-scroll" tabIndex={0} aria-label="Scrollable FateDrop comparison table">
        <table>
          <thead><tr><th scope="col">Capability</th><th scope="col">Conventional retailer alert</th><th scope="col">Marketplace search</th><th scope="col">FateDrop network</th></tr></thead>
          <tbody>{rows.map(([capability, alert, marketplace, fatedrop]) => <tr key={capability}><th scope="row">{capability}</th><td>{alert}</td><td>{marketplace}</td><td><span className={`comparison-state ${fatedrop.toLowerCase().replaceAll(" ", "-")}`}>{fatedrop}</span></td></tr>)}</tbody>
        </table>
      </div>
      <div className="comparison-cta"><p>Useful for free. Deeper stock intelligence and retailer tools sit in clearly labelled provisional plans.</p><div className="button-row"><Link className="button button-primary" href="/join?type=collector">Join the Collector Beta <span>↗</span></Link><Link className="button button-secondary" href="/subscriptions">See Provisional Plans</Link></div></div>
    </section>
  );
}
