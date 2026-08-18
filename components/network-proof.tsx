import Link from "next/link";
import { siteConfig } from "@/lib/site-data";

export function NetworkProof({ foundingInvite = true }: { foundingInvite?: boolean }) {
  return (
    <section className="network-proof section-shell" aria-labelledby="network-proof-title">
      <div className="network-proof-copy">
        <p className="eyebrow"><span />Network proof</p>
        <h2 id="network-proof-title">Measured progress. No borrowed credibility.</h2>
        <p>These figures describe validated catalogue coverage and monitoring health. They are not customer, revenue, conversion or sales numbers.</p>
        <div className="status-legend" aria-label="Evidence status">
          <span className="status-chip validated">Validated beta</span>
          <span className="status-chip expansion">Catalogue totals change as sources update</span>
        </div>
      </div>
      <div className="network-proof-grid">
        {siteConfig.snapshot.map((item) => <article key={item.label}><strong>{item.value}</strong><span>{item.label}</span><small>Validated beta snapshot</small></article>)}
      </div>
      <div className="network-targets"><div><span>TARGET SCALE</span><p>Ambition—not current achievement.</p></div>{siteConfig.networkTargets.map((item) => <span key={item.label}><strong>{item.value}</strong>{item.label}<small>Target scale</small></span>)}</div>
      {foundingInvite ? <div className="founding-proof-invite"><div><span>FOUNDING RETAILER INVITATION</span><strong>Help turn catalogue evidence into the first genuine FateDrop case study.</strong><p>No invented logos, testimonials or results. Founding partners will be shown only with permission and verifiable evidence.</p></div><Link className="button button-secondary" href="/join?type=business">Request a Partner Demo <b>↗</b></Link></div> : null}
    </section>
  );
}
