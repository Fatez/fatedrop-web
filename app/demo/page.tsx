import type { Metadata } from "next";
import Link from "next/link";
import { FateDropDemoSection } from "@/components/koru-final-sections";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Try FateDrop | Interactive Product Demo",
  description: "Explore the current FateDrop collector journey across Search, FateFind, FateMatch, Alerts, Network and your shared FateDrop ID before joining the beta.",
};

export default function DemoPage() {
  return (
    <SiteShell>
      <section className="fd-demo-cinematic section-shell">
        <div className="fd-demo-cinematic-art" role="img" aria-label="Koru and friends overlooking the FateDrop signal network" />
        <div className="fd-demo-cinematic-shade" aria-hidden="true" />
        <div className="fd-demo-cinematic-copy">
          <p className="eyebrow"><span />TRY FATEDROP</p>
          <h1>See how the signal<br/>becomes a decision.</h1>
          <p>FateDrop is more than a stock feed. Search shows what exists, FateFind explains the strongest value now, FateMatch keeps watching your conditions, and Alerts tell you what genuinely changed.</p>
          <div className="button-row">
            <Link className="button button-primary" href="#interactive-demo">Use the interactive app <span>↓</span></Link>
            <Link className="button button-secondary" href="/collectors">Understand the collector tools</Link>
          </div>
        </div>
        <div className="fd-demo-cinematic-proof">
          <span><small>01</small><b>SEARCH</b><em>Find what exists</em></span>
          <i>→</i>
          <span><small>02</small><b>FATEFIND</b><em>Compare value now</em></span>
          <i>→</i>
          <span><small>03</small><b>FATEMATCH</b><em>Watch your conditions</em></span>
          <i>→</i>
          <span><small>04</small><b>ALERTS</b><em>Know what happened</em></span>
        </div>
      </section>

      <FateDropDemoSection />

      <section className="content-section section-shell">
        <div className="quote-band">
          <p className="eyebrow"><span />WHAT THIS DEMO IS SHOWING</p>
          <blockquote>One collector journey. Different tools for different jobs.</blockquote>
          <p>The interactive phone uses sample data, but its structure now mirrors the current mobile app: Home and Alerts sit beside Network and Profile, while the centre FateDrop tool launcher opens Search, FateFind and FateMatch. Retailer checkout remains external because FateDrop helps you find and understand the opportunity — the retailer still makes the sale.</p>
          <div className="button-row" style={{ marginTop: 28 }}><Link className="button button-secondary" href="/subscriptions#collectors">See Free vs FateDrop Plus</Link><Link className="text-link" href="/about#future">See the wider roadmap <span>→</span></Link></div>
        </div>
      </section>

      <style>{`
        .fd-demo-cinematic{position:relative;isolation:isolate;min-height:clamp(560px,48vw,760px);margin-top:96px;overflow:hidden;border:1px solid rgba(220,203,189,.13);border-radius:28px;background:radial-gradient(circle at 72% 24%,rgba(111,78,129,.18),transparent 28%),linear-gradient(145deg,#11151a,#080b0f 72%);box-shadow:0 30px 100px rgba(0,0,0,.28)}
        .fd-demo-cinematic-art{position:absolute;inset:0;background-image:linear-gradient(90deg,rgba(7,10,14,.04),rgba(7,10,14,.02)),url('/assets/demo/interactive-demo-hero.webp');background-size:cover;background-position:center 42%;filter:saturate(.8) contrast(.95) brightness(.82)}
        .fd-demo-cinematic-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,9,13,.94) 0%,rgba(6,9,13,.82) 31%,rgba(6,9,13,.32) 59%,rgba(6,9,13,.15) 100%),linear-gradient(180deg,rgba(6,9,13,.1),rgba(6,9,13,.7) 100%)}
        .fd-demo-cinematic-copy{position:absolute;z-index:2;left:clamp(28px,5vw,78px);top:50%;max-width:720px;transform:translateY(-52%)}.fd-demo-cinematic-copy .eyebrow{color:#c1a2c5}.fd-demo-cinematic-copy h1{margin:18px 0 22px;color:#f2e9e2;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3.4rem,6vw,6.8rem);font-weight:500;line-height:.91;letter-spacing:-.055em}.fd-demo-cinematic-copy>p:not(.eyebrow){max-width:650px;margin:0;color:#b6adb0;font-size:15px;line-height:1.75}.fd-demo-cinematic-copy .button-row{margin-top:28px}
        .fd-demo-cinematic-proof{position:absolute;z-index:2;left:clamp(28px,5vw,78px);right:clamp(28px,5vw,78px);bottom:28px;display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;gap:9px;align-items:center;padding:11px 13px;border:1px solid rgba(220,203,189,.09);border-radius:13px;background:rgba(8,11,15,.76);backdrop-filter:blur(14px)}.fd-demo-cinematic-proof>span{display:grid;grid-template-columns:auto 1fr;gap:2px 8px;align-items:center}.fd-demo-cinematic-proof small{grid-row:1/3;color:#7b697d;font-size:9px;font-weight:900}.fd-demo-cinematic-proof b{color:#ddd2cb;font-size:10px;letter-spacing:.07em}.fd-demo-cinematic-proof em{color:#8b8287;font-size:10px;font-style:normal}.fd-demo-cinematic-proof>i{color:#66586a;font-style:normal}
        @media(max-width:800px){.fd-demo-cinematic{width:calc(100% - 18px);margin-top:78px;min-height:700px;border-radius:20px}.fd-demo-cinematic-art{background-position:61% center}.fd-demo-cinematic-shade{background:linear-gradient(180deg,rgba(6,9,13,.22),rgba(6,9,13,.88) 58%,rgba(6,9,13,.97))}.fd-demo-cinematic-copy{left:24px;right:24px;top:auto;bottom:185px;transform:none}.fd-demo-cinematic-copy h1{font-size:clamp(3rem,13vw,4.8rem)}.fd-demo-cinematic-copy>p:not(.eyebrow){font-size:12px}.fd-demo-cinematic-proof{left:18px;right:18px;bottom:18px;grid-template-columns:1fr 1fr}.fd-demo-cinematic-proof>i{display:none}}
      `}</style>
    </SiteShell>
  );
}
