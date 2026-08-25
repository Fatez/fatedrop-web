import Link from "next/link";

const lifecycle = [
  ["01", "Whisper", "Product or catalogue movement. Stock is not confirmed."],
  ["02", "Echo", "Access, queue, traffic or security readiness changed."],
  ["03", "Manifested", "Purchasable availability is confirmed live."],
  ["04", "Vanished", "Previously confirmed availability is no longer live."],
] as const;

export function FateDropValueSectionV2() {
  return <section className="fdv2 section-shell" id="what-fatedrop-does" aria-labelledby="fdv2-title">
    <header className="fdv2-head">
      <div><p>WHAT FATEDROP ACTUALLY DOES</p><h2 id="fdv2-title">Different tools.<br/>One shared intelligence network.</h2><span>Search finds what exists. FateFind compares the strongest value now. FateMatch watches a specific product until your conditions are met. Alerts explain what changed. Underneath all of it, FateDrop keeps product identity, stock evidence, RRP/reference and retailer context connected.</span></div>
      <aside><small>THE SIMPLE VERSION</small><strong>FateDrop does the checking before you reach checkout.</strong><span>You still buy directly from the retailer.</span></aside>
    </header>

    <div className="fdv2-grid">
      <article>
        <div className="fdv2-number"><span>01</span><small>SIGNAL INTELLIGENCE</small></div>
        <h3>Know what changed — and how certain it is.</h3>
        <p>FateDrop does not treat every website movement as confirmed stock. The four-stage lifecycle separates early evidence, access readiness, verified live availability and the moment that availability disappears.</p>
        <div className="fdv2-lifecycle">{lifecycle.map(([number, label, copy]) => <span key={label}><b>{number}</b><strong>{label}</strong><small>{copy}</small></span>)}</div>
      </article>

      <article>
        <div className="fdv2-number"><span>02</span><small>FATEFIND · BEST VALUE NOW</small></div>
        <h3>Compare value, not just the smallest £ number.</h3>
        <p>FateFind is the proven comparison experience: search the product, choose comparable configurations and let FateDrop compare item price against the correct verified RRP/reference. Known delivery stays separate and True Price is shown when the mandatory cost is genuinely known.</p>
        <div className="fdv2-flow"><span><small>SEARCH</small><b>Comparable live options</b></span><i>→</i><span><small>RRP / REFERENCE</small><b>Judge value position</b></span><i>→</i><span className="answer"><small>FATE VERDICT</small><b>Strongest value now</b></span></div>
      </article>

      <article>
        <div className="fdv2-number"><span>03</span><small>FATEMATCH · WATCH MY CONDITIONS</small></div>
        <h3>Stop repeatedly checking the same product.</h3>
        <p>Choose the item you want and tell FateDrop what would make it worth acting on: stock, maximum item price, maximum True Price, RRP percentage or retailer conditions. FateDrop Cloud keeps watching and only produces a FateMatch when an observed offer genuinely qualifies.</p>
        <div className="fdv2-flow"><span><small>YOU CHOOSE</small><b>Product + conditions</b></span><i>→</i><span><small>FATEDROP CLOUD</small><b>Keeps watching</b></span><i>→</i><span className="answer"><small>QUALIFIES</small><b>FATEMATCH — LIVE NOW</b></span></div>
      </article>

      <article>
        <div className="fdv2-number"><span>04</span><small>THE INDIE BRIDGE</small></div>
        <h3>Help collectors find shops they may never have discovered.</h3>
        <p>Connected independent retailers can expose genuine catalogue evidence to the same Search and FateFind journeys without becoming a FateDrop marketplace. If their offer is useful, collectors can discover it and continue to that retailer&apos;s own website and checkout.</p>
        <div className="fdv2-flow"><span><small>INDIE</small><b>Connected catalogue</b></span><i>→</i><span><small>FATEDROP</small><b>Evidence + discovery</b></span><i>→</i><span className="answer"><small>COLLECTOR</small><b>Buy direct from store</b></span></div>
        <small className="fdv2-neutral">Paid retailer tools can improve business capability. They cannot buy a better FateFind verdict, artificial trust or RRP treatment.</small>
      </article>
    </div>

    <footer className="fdv2-footer"><div><small>ONE COLLECTOR JOURNEY</small><strong>Search → FateFind → FateMatch → Alert → retailer.</strong></div><div><Link className="button button-primary" href="/demo">Try the interactive demo <span>↗</span></Link><Link className="button button-secondary" href="/collectors">Explore collector tools</Link></div></footer>

    <style>{`
      .fdv2{width:min(1560px,calc(100% - 32px));margin:18px auto 0;padding:clamp(30px,4vw,58px);border:1px solid rgba(220,203,189,.1);border-radius:24px;background:radial-gradient(circle at 84% 0%,rgba(126,87,143,.12),transparent 27%),linear-gradient(180deg,#0e1217,#080b0f);box-shadow:0 28px 90px rgba(0,0,0,.2)}.fdv2-head{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(290px,.6fr);gap:48px;align-items:end}.fdv2-head>div>p{margin:0 0 14px;color:#b6977d;font-size:9px;font-weight:900;letter-spacing:.16em}.fdv2-head h2{max-width:920px;margin:0;color:#f0e7e0;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3rem,5.5vw,6rem);font-weight:500;line-height:.94;letter-spacing:-.052em}.fdv2-head>div>span{display:block;max-width:900px;margin-top:24px;color:#a29a9e;font-size:14px;line-height:1.75}.fdv2-head aside{padding:22px;border:1px solid rgba(220,203,189,.08);border-radius:14px;background:rgba(8,11,15,.6);display:grid;gap:7px}.fdv2-head aside small{color:#8f7a6c;font-size:9px;font-weight:900;letter-spacing:.12em}.fdv2-head aside strong{color:#e3d9d2;font-family:Georgia,serif;font-size:24px;font-weight:500;line-height:1.08}.fdv2-head aside span{color:#857e82;font-size:11px}.fdv2-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:38px}.fdv2-grid>article{position:relative;min-height:390px;padding:30px;overflow:hidden;border:1px solid rgba(220,203,189,.07);border-radius:18px;background:linear-gradient(145deg,#101419,#090d11)}.fdv2-grid>article:after{content:'';position:absolute;right:-80px;bottom:-100px;width:250px;height:250px;border:1px solid rgba(181,144,188,.06);border-radius:43% 57% 48% 52%;transform:rotate(22deg)}.fdv2-number{display:flex;justify-content:space-between;gap:20px}.fdv2-number>span{color:#7f6b7d;font-family:Georgia,serif;font-size:27px}.fdv2-number small{color:#9f846f;font-size:9px;font-weight:900;letter-spacing:.11em}.fdv2-grid h3{max-width:700px;margin:30px 0 12px;color:#e4dad2;font-family:Georgia,serif;font-size:clamp(2rem,3vw,3.5rem);font-weight:500;line-height:.98;letter-spacing:-.04em}.fdv2-grid>article>p{max-width:760px;margin:0;color:#978f94;font-size:13px;line-height:1.72}.fdv2-lifecycle{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:25px}.fdv2-lifecycle>span{min-height:120px;padding:11px;border:1px solid rgba(220,203,189,.055);border-radius:10px;background:rgba(255,255,255,.014);display:flex;flex-direction:column}.fdv2-lifecycle b{color:#665e64;font-size:9px}.fdv2-lifecycle strong{margin-top:14px;color:#d6ccc5;font-size:10px;text-transform:uppercase}.fdv2-lifecycle small{margin-top:5px;color:#767075;font-size:9px;line-height:1.42}.fdv2-flow{position:relative;z-index:1;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:7px;align-items:center;margin-top:27px}.fdv2-flow>span{min-height:84px;padding:12px;border:1px solid rgba(220,203,189,.055);border-radius:10px;background:rgba(255,255,255,.014);display:flex;flex-direction:column;justify-content:flex-end}.fdv2-flow small{color:#7e726c;font-size:8px;font-weight:900;letter-spacing:.08em}.fdv2-flow b{margin-top:5px;color:#d7cec7;font-size:11px}.fdv2-flow>i{color:#665a63;font-style:normal}.fdv2-flow .answer{border-color:rgba(137,170,144,.14);background:rgba(103,140,111,.035)}.fdv2-flow .answer small{color:#809b86}.fdv2-neutral{position:relative;z-index:1;display:block;margin-top:13px;color:#82797e;font-size:10px;line-height:1.5}.fdv2-footer{margin-top:12px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:24px;border:1px solid rgba(220,203,189,.06);border-radius:14px;background:#090d11}.fdv2-footer>div:first-child{display:grid;gap:4px}.fdv2-footer small{color:#817269;font-size:9px;font-weight:900;letter-spacing:.1em}.fdv2-footer strong{color:#ddd3cc;font-family:Georgia,serif;font-size:18px;font-weight:500}.fdv2-footer>div:last-child{display:flex;gap:8px}@media(max-width:1040px){.fdv2-head{grid-template-columns:1fr}.fdv2-head aside{max-width:620px}.fdv2-lifecycle{grid-template-columns:1fr 1fr}.fdv2-flow{grid-template-columns:1fr}.fdv2-flow>i{display:none}}@media(max-width:760px){.fdv2{width:calc(100% - 18px);padding:26px 18px;border-radius:18px}.fdv2-grid{grid-template-columns:1fr}.fdv2-grid>article{min-height:auto;padding:24px 20px}.fdv2-lifecycle{grid-template-columns:1fr}.fdv2-footer{align-items:flex-start;flex-direction:column}.fdv2-footer>div:last-child{width:100%;flex-direction:column}}
    `}</style>
  </section>;
}
