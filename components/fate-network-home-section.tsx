import Link from "next/link";

export function FateNetworkHomeSection() {
  return (
    <section className="content-section section-shell split-section" aria-labelledby="fate-network-home-title">
      <div className="copy-stack">
        <p className="eyebrow"><span />Fate Network</p>
        <h2 id="fate-network-home-title">One connected market. More useful places to buy.</h2>
        <p>Fate Network is the retailer layer underneath Search, FateFind and FateMatch. Major retailers, specialist TCG stores and independent businesses can all become part of the answer when FateDrop has reliable product, catalogue or availability evidence.</p>
        <p>FateDrop does not become the shop. It creates the discovery and intelligence layer, then sends the collector directly to the retailer to confirm the final offer and buy.</p>
        <div className="button-row">
          <Link className="button button-primary" href="/collectors">For collectors <span>↗</span></Link>
          <Link className="button button-secondary" href="/businesses">For retailers</Link>
        </div>
      </div>

      <div className="insight-panel retailer-network-panel fd-network-intel">
        <header className="fd-network-brandbar">
          <div>
            <span className="fd-network-monogram">FD</span>
            <div><b>FATEDROP</b><small>FATE NETWORK · INTELLIGENCE LAYER</small></div>
          </div>
          <em>OBSERVED RETAILER EVIDENCE</em>
        </header>

        <div className="fd-network-intro">
          <small>ONE NETWORK → FOUR USEFUL ANSWERS</small>
          <h3>Retailer evidence becomes a collector decision.</h3>
          <p>FateDrop keeps discovery, value, watch conditions and signal confidence separate so early movement never masquerades as confirmed stock.</p>
        </div>

        <div className="fd-network-sources" aria-label="Fate Network retailer coverage">
          <span>MAJOR RETAILERS</span><i />
          <span>SPECIALIST TCG</span><i />
          <span>INDEPENDENTS</span>
        </div>

        <div className="fd-network-tools">
          <article>
            <small>SEARCH</small>
            <strong>What exists?</strong>
            <p>Observed products, retailers, stock state, item price and verified RRP/reference.</p>
          </article>
          <article>
            <small>FATEFIND</small>
            <strong>What is strongest value now?</strong>
            <p>Compare like-for-like offers. Known delivery and True Price appear only when the evidence supports them.</p>
          </article>
          <article>
            <small>FATEMATCH</small>
            <strong>When should I act?</strong>
            <p>FateDrop Cloud watches your chosen stock, price, True Price, RRP or retailer conditions.</p>
          </article>
          <article>
            <small>ALERTS</small>
            <strong>What changed?</strong>
            <p>Whisper, Echo, Manifested and Vanished keep early signals separate from verified availability.</p>
          </article>
        </div>

        <div className="fd-network-confidence" aria-label="FateDrop signal lifecycle">
          <small>SIGNAL CONFIDENCE</small>
          <div><span>WHISPER</span><i>→</i><span>ECHO</span><i>→</i><span>MANIFESTED</span><i>→</i><span>VANISHED</span></div>
        </div>

        <footer className="fd-network-direct">
          <div><small>FATEDROP INTELLIGENCE</small><strong>Find the right retailer. Buy from the retailer.</strong></div>
          <span>CHECKOUT STAYS WITH THE STORE ↗</span>
        </footer>

        <style>{`
          .fd-network-intel{padding:0!important;overflow:hidden;border:1px solid rgba(220,203,189,.12)!important;border-radius:24px!important;background:radial-gradient(circle at 92% 0%,rgba(114,88,107,.19),transparent 30%),linear-gradient(160deg,#111016 0%,#0c0f13 60%,#0a0d10 100%)!important;box-shadow:0 30px 90px rgba(0,0,0,.28)}
          .fd-network-brandbar{padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:18px;border-bottom:1px solid rgba(220,203,189,.08);background:rgba(8,10,13,.52)}
          .fd-network-brandbar>div{display:flex;align-items:center;gap:11px}.fd-network-monogram{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(182,151,125,.22);border-radius:10px;background:linear-gradient(145deg,#1b161d,#11151a);color:#d8c7ba;font-family:Georgia,serif;font-size:12px;font-weight:700;letter-spacing:-.03em}.fd-network-brandbar b{display:block;color:#ede2da;font-size:11px;letter-spacing:.15em}.fd-network-brandbar small{display:block;margin-top:3px;color:#8d8184;font-size:7px;font-weight:800;letter-spacing:.12em}.fd-network-brandbar em{padding:6px 8px;border:1px solid rgba(137,170,144,.15);border-radius:999px;color:#8ea294;background:rgba(93,124,101,.04);font-size:7px;font-style:normal;font-weight:900;letter-spacing:.09em;white-space:nowrap}
          .fd-network-intro{padding:25px 24px 18px}.fd-network-intro>small{color:#b6977d;font-size:8px;font-weight:900;letter-spacing:.13em}.fd-network-intro h3{max-width:580px;margin:10px 0 10px;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2rem,3vw,3.2rem);font-weight:500;line-height:.98;letter-spacing:-.045em}.fd-network-intro p{max-width:650px;margin:0;color:#938b90;font-size:11px;line-height:1.62}
          .fd-network-sources{margin:0 24px 16px;padding:10px 12px;display:grid;grid-template-columns:auto 1fr auto 1fr auto;gap:10px;align-items:center;border:1px solid rgba(220,203,189,.06);border-radius:11px;background:rgba(255,255,255,.012)}.fd-network-sources span{color:#8f8383;font-size:7px;font-weight:900;letter-spacing:.08em;white-space:nowrap}.fd-network-sources i{height:1px;background:linear-gradient(90deg,rgba(114,88,107,.2),rgba(182,151,125,.45),rgba(114,88,107,.2))}
          .fd-network-tools{padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:9px}.fd-network-tools article{min-height:142px;padding:15px;border:1px solid rgba(220,203,189,.065);border-radius:13px;background:linear-gradient(145deg,rgba(255,255,255,.018),rgba(255,255,255,.006))}.fd-network-tools article:nth-child(2){border-color:rgba(114,88,107,.19);background:linear-gradient(145deg,rgba(114,88,107,.07),rgba(255,255,255,.006))}.fd-network-tools article:nth-child(4){border-color:rgba(137,170,144,.13)}.fd-network-tools small{color:#a48470;font-size:8px;font-weight:900;letter-spacing:.11em}.fd-network-tools strong{display:block;margin-top:17px;color:#ddd3cc;font-family:Georgia,serif;font-size:16px;font-weight:500;line-height:1.12}.fd-network-tools p{margin:7px 0 0;color:#827b80;font-size:9px;line-height:1.5}
          .fd-network-confidence{margin:12px 24px 0;padding:12px 14px;border:1px solid rgba(220,203,189,.06);border-radius:11px;background:#0b0e12}.fd-network-confidence>small{display:block;margin-bottom:9px;color:#7d706b;font-size:7px;font-weight:900;letter-spacing:.11em}.fd-network-confidence>div{display:grid;grid-template-columns:auto auto auto auto auto auto auto;gap:6px;align-items:center}.fd-network-confidence span{padding:6px 7px;border:1px solid rgba(220,203,189,.07);border-radius:999px;color:#9a8f90;font-size:7px;font-weight:850;text-align:center}.fd-network-confidence span:nth-of-type(1){color:#b8a073}.fd-network-confidence span:nth-of-type(2){color:#8fa0aa}.fd-network-confidence span:nth-of-type(3){color:#91a995}.fd-network-confidence span:nth-of-type(4){color:#a67d82}.fd-network-confidence i{color:#5d5559;font-size:8px;font-style:normal}
          .fd-network-direct{margin-top:14px;padding:18px 20px;display:flex;align-items:end;justify-content:space-between;gap:20px;border-top:1px solid rgba(220,203,189,.08);background:linear-gradient(90deg,rgba(114,88,107,.08),rgba(137,170,144,.035))}.fd-network-direct small{display:block;color:#91796a;font-size:7px;font-weight:900;letter-spacing:.11em}.fd-network-direct strong{display:block;margin-top:4px;color:#e2d8d0;font-family:Georgia,serif;font-size:17px;font-weight:500}.fd-network-direct>span{color:#8ea294;font-size:7px;font-weight:900;letter-spacing:.08em;text-align:right}
          @media(max-width:620px){.fd-network-brandbar{align-items:flex-start;flex-direction:column}.fd-network-brandbar em{white-space:normal}.fd-network-tools{grid-template-columns:1fr}.fd-network-tools article{min-height:auto}.fd-network-sources{grid-template-columns:1fr}.fd-network-sources i{display:none}.fd-network-confidence>div{grid-template-columns:1fr}.fd-network-confidence i{display:none}.fd-network-direct{align-items:flex-start;flex-direction:column}.fd-network-direct>span{text-align:left}}
        `}</style>
      </div>
    </section>
  );
}
