import Link from "next/link";

const rows = [
  ["Searches multiple participating retailers", "No", "Marketplace listings", "Cloud-connected beta"],
  ["Includes independent shops", "Single retailer only", "Varies", "Expanding beta"],
  ["Compares known delivery cost", "Usually at checkout", "Varies", "Cloud-connected beta"],
  ["Universal Wishlist", "No", "Platform-only", "Persistence foundation"],
  ["Structured wanted searches", "Basic alert", "Saved marketplace search", "FateFind beta"],
  ["Stock lifecycle intelligence", "In-stock event", "Availability snapshot", "Evidence-backed beta"],
  ["Local shops and events", "No", "Limited", "Active expansion"],
  ["Event-vendor inventory", "No", "No", "Hold / foundation"],
  ["Direct retailer checkout", "Yes", "Often marketplace checkout", "Yes"],
  ["Privacy-conscious demand insight", "No", "Platform-owned", "Backend foundation"],
] as const;

export function WhyFateDrop() {
  return (
    <section className="why-fatedrop section-shell" aria-labelledby="why-fatedrop-title">
      <div className="why-fatedrop-head"><div><p className="eyebrow"><span />Why FateDrop?</p><h2 id="why-fatedrop-title">Discovery with the network still attached.</h2></div><p>A factual comparison of different discovery models—not a victory lap over unnamed competitors. FateDrop capabilities stay labelled according to the evidence and implementation actually available.</p></div>
      <div className="comparison-scroll" tabIndex={0} aria-label="Scrollable FateDrop comparison table">
        <table>
          <thead><tr><th scope="col">Capability</th><th scope="col">Conventional retailer alert</th><th scope="col">Marketplace search</th><th scope="col">FateDrop network</th></tr></thead>
          <tbody>{rows.map(([capability, alert, marketplace, fatedrop]) => <tr key={capability}><th scope="row">{capability}</th><td>{alert}</td><td>{marketplace}</td><td><span className={`comparison-state ${fatedrop.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-")}`}>{fatedrop}</span></td></tr>)}</tbody>
        </table>
      </div>
      <div className="comparison-cta"><p>Useful for free. Deeper stock intelligence and retailer tools sit in clearly labelled provisional plans.</p><div className="button-row"><Link className="button button-primary" href="/join?type=collector">Join the Collector Beta <span>↗</span></Link><Link className="button button-secondary" href="/subscriptions">See Provisional Plans</Link></div></div>
    </section>
  );
}
