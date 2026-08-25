import Link from "next/link";
import { InteractivePhoneDemo } from "@/components/interactive-phone-demo";

export function FateDropDemoSectionV2() {
  return <section className="fdd2 section-shell" id="interactive-demo" aria-labelledby="fdd2-title">
    <div className="fdd2-copy">
      <p>INTERACTIVE PRODUCT DEMO</p>
      <h2 id="fdd2-title">Use FateDrop like a collector would.</h2>
      <span>The phone now follows the current native app structure rather than an old website mock. Home and Alerts are primary surfaces; Network and Profile stay visible; the centre FateDrop button opens the three jobs that matter most: Search, FateFind and FateMatch.</span>
      <div className="fdd2-steps">
        <article><b>01</b><div><strong>SEARCH</strong><small>Find the product and see what the network currently knows.</small></div></article>
        <article><b>02</b><div><strong>FATEFIND</strong><small>Compare comparable live options and understand the strongest value now.</small></div></article>
        <article><b>03</b><div><strong>FATEMATCH</strong><small>Set stock or buying conditions and let FateDrop Cloud keep watching.</small></div></article>
        <article><b>04</b><div><strong>ALERT</strong><small>When an offer genuinely qualifies, see FATEMATCH — LIVE NOW and continue to the retailer.</small></div></article>
      </div>
      <div className="fdd2-note"><small>THIS IS SAMPLE DATA</small><strong>The behaviour is the point — not a fake checkout.</strong><span>FateDrop helps you find, compare and monitor the opportunity. The retailer remains the seller.</span></div>
      <div className="button-row"><Link className="button button-primary" href="/join?type=collector">Join the collector beta <span>↗</span></Link><Link className="button button-secondary" href="/subscriptions#collectors">See Free vs Plus</Link></div>
    </div>
    <div className="fdd2-stage"><div className="fdd2-aura" aria-hidden="true"/><InteractivePhoneDemo/></div>
    <style>{`
      .fdd2{width:min(1560px,calc(100% - 32px));margin:34px auto 90px;padding:clamp(30px,4vw,56px);display:grid;grid-template-columns:minmax(0,.82fr) minmax(520px,1.18fr);gap:42px;align-items:center;overflow:hidden;border:1px solid rgba(220,203,189,.08);border-radius:26px;background:radial-gradient(circle at 82% 15%,rgba(126,87,143,.1),transparent 27%),linear-gradient(145deg,#0e1217,#080b0f)}.fdd2-copy>p{margin:0 0 14px;color:#b6977d;font-size:9px;font-weight:900;letter-spacing:.16em}.fdd2-copy h2{max-width:700px;margin:0;color:#f0e7df;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3rem,5vw,5.5rem);font-weight:500;line-height:.95;letter-spacing:-.052em}.fdd2-copy>span{display:block;max-width:760px;margin-top:22px;color:#9f979b;font-size:13px;line-height:1.75}.fdd2-steps{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:24px 0}.fdd2-steps article{min-height:92px;padding:12px;border:1px solid rgba(220,203,189,.06);border-radius:10px;background:rgba(255,255,255,.014);display:grid;grid-template-columns:28px 1fr;gap:9px;align-items:start}.fdd2-steps article>b{width:28px;height:28px;display:grid;place-items:center;border:1px solid rgba(183,151,125,.17);border-radius:8px;color:#bc9b79;font-size:9px}.fdd2-steps article>div{display:grid;gap:4px}.fdd2-steps strong{color:#d8cec7;font-size:10px;letter-spacing:.07em}.fdd2-steps small{color:#7e777b;font-size:10px;line-height:1.45}.fdd2-note{margin-bottom:26px;padding:13px 14px;border-left:2px solid rgba(183,151,125,.22);background:rgba(183,151,125,.025);display:grid;gap:3px}.fdd2-note small{color:#9e826d;font-size:9px;font-weight:900;letter-spacing:.1em}.fdd2-note strong{color:#d9d0c9;font-size:12px}.fdd2-note span{color:#817a7e;font-size:10px;line-height:1.5}.fdd2-stage{position:relative;min-height:720px;display:grid;place-items:center}.fdd2-aura{position:absolute;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(126,87,143,.18),rgba(183,151,125,.04) 42%,transparent 70%);filter:blur(10px)}.fdd2-stage>*:not(.fdd2-aura){position:relative;z-index:1}@media(max-width:1120px){.fdd2{grid-template-columns:1fr}.fdd2-stage{min-height:650px}}@media(max-width:720px){.fdd2{width:calc(100% - 18px);padding:26px 18px;border-radius:20px}.fdd2-steps{grid-template-columns:1fr}.fdd2-stage{min-height:590px}.fdd2-copy h2{font-size:clamp(2.7rem,12vw,4.2rem)}}
    `}</style>
  </section>;
}
