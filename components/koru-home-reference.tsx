/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { KORU_LIFECYCLE } from "@/lib/koru-brand";

const retailers = [
  "Pokémon Center UK",
  "Titan Cards",
  "Total Cards",
  "Zatu Games",
  "Eterna Collectibles",
  "Gathering Games",
  "Caro Collective",
  "Jet Cards",
] as const;

export function KoruReferenceLanding() {
  return <>
    <section className="kr-shell section-shell" aria-label="FateDrop introduction">
      <div className="kr-landing-card">
        <article className="kr-hero">
          <div className="kr-hero-bg" aria-hidden="true" />
          <div className="kr-hero-shade" aria-hidden="true" />

          <div className="kr-copy">
            <p className="kr-kicker">FATEDROP · UK TCG SIGNAL INTELLIGENCE</p>
            <h1>You don&apos;t chase drops.<br/><em>You get the signal.</em></h1>
            <p className="kr-lede">FateDrop watches participating TCG retailers, adds price context and turns network movement into one clear signal lifecycle.</p>
            <div className="kr-actions">
              <Link className="button kr-primary" href="/join?type=collector">Start Your Free Trial <span>↗</span></Link>
              <Link className="button kr-secondary" href="/collectors">See How It Works</Link>
            </div>
            <div className="kr-proof"><span>POKÉMON TCG FIRST</span><i/><span>INDEPENDENT-FIRST</span><i/><span>EVIDENCE-BACKED SIGNALS</span></div>
          </div>

          <Link className="kr-meet" href="/dashboard/avatar" aria-label="Meet Koru, the FateDrop signal companion">
            <span>Meet <b>Koru.</b></span>
            <p>The voice of the FateDrop network.</p>
            <small>MEET KORU →</small>
          </Link>
        </article>

        <section className="kr-lifecycle" aria-labelledby="kr-lifecycle-title">
          <div className="kr-lifecycle-title">
            <span id="kr-lifecycle-title">The FateDrop Signal Lifecycle</span>
            <small>Four states. One meaning everywhere.</small>
          </div>
          <div className="kr-life-grid">
            {KORU_LIFECYCLE.map((item, index) => <article key={item.state} data-stage={item.state.toLowerCase()}>
              <div className="kr-life-icon">◇</div>
              <div><strong>{item.state.toUpperCase()}</strong><p>{item.copy}</p></div>
              {index < KORU_LIFECYCLE.length - 1 ? <i aria-hidden="true">→</i> : null}
            </article>)}
          </div>
        </section>

        <section className="kr-retailers" aria-label="Participating retailer sources">
          <div className="kr-retailer-title"><span>MONITORING PARTICIPATING RETAILER SOURCES</span><small>Coverage grows as sources are validated.</small></div>
          <div className="kr-retailer-row">{retailers.map((name) => <b key={name}>{name}</b>)}</div>
          <Link href="/businesses">View Retailers <span>→</span></Link>
        </section>
      </div>

      <section className="kr-friends-banner" aria-label="Koru and Friends">
        <img src="/assets/home/koru-and-friends-banner.webp" alt="Koru and Friends together at dusk in the FateDrop universe" />
        <Link className="kr-friends-hotspot" href="/merch" aria-label="Explore Koru and Friends merchandise"><span>Explore Koru &amp; Friends merchandise</span></Link>
        <Link className="kr-friends-mobile-link button kr-primary" href="/merch">Explore Merch <span>↗</span></Link>
      </section>
    </section>

    <style>{`
      .kr-shell{width:min(1520px,calc(100% - 28px));margin:88px auto 0}
      .kr-landing-card,.kr-friends-banner{border:1px solid rgba(205,194,215,.14);border-radius:14px;overflow:hidden;background:#090c12;box-shadow:0 28px 90px rgba(0,0,0,.34)}

      .kr-hero{position:relative;isolation:isolate;min-height:clamp(560px,44vw,720px);overflow:hidden;background:#0a0d14}
      .kr-hero-bg{position:absolute;z-index:-3;inset:0;background-image:url('/assets/home/koru-home-hero.webp');background-position:center center;background-repeat:no-repeat;background-size:cover;filter:saturate(.96) contrast(1.02) brightness(1.02)}
      .kr-hero-shade{position:absolute;z-index:-2;inset:0;background:linear-gradient(90deg,rgba(5,8,14,.7) 0%,rgba(5,8,14,.4) 26%,rgba(5,8,14,.08) 48%,transparent 72%),linear-gradient(180deg,rgba(5,7,12,.02),transparent 68%,rgba(5,7,12,.16) 100%)}
      .kr-copy{position:absolute;z-index:4;left:clamp(28px,4vw,66px);top:50%;width:min(44%,590px);transform:translateY(-52%)}
      .kr-kicker{margin:0 0 18px;color:#9e83ac;font-size:9px;font-weight:850;letter-spacing:.18em}
      .kr-copy h1{margin:0;color:#f0e8df;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3rem,4.6vw,5.9rem);font-weight:500;line-height:.94;letter-spacing:-.052em;text-wrap:balance}
      .kr-copy h1 em{display:inline-block;margin-top:7px;color:transparent;background:linear-gradient(90deg,#a876ce,#9679bd 50%,#7793a8);background-clip:text;font-style:normal}
      .kr-lede{max-width:510px;margin:24px 0 0;color:#c0b6b6;font-size:14px;line-height:1.68}
      .kr-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:27px}
      .kr-primary{background:linear-gradient(135deg,#75558f,#604873)!important;border-color:rgba(207,181,227,.26)!important;color:#fff!important;box-shadow:0 14px 36px rgba(82,57,102,.28)!important}
      .kr-secondary{background:rgba(8,11,17,.72)!important;border-color:rgba(234,225,220,.18)!important;color:#e8e0dc!important;backdrop-filter:blur(10px)}
      .kr-proof{margin-top:28px;display:flex;align-items:center;flex-wrap:wrap;gap:9px;color:#958c90;font-size:7px;font-weight:800;letter-spacing:.12em}
      .kr-proof i{width:3px;height:3px;border-radius:50%;background:#826590}

      .kr-meet{position:absolute;z-index:5;right:clamp(24px,3.2vw,52px);top:50%;width:178px;padding:12px 0;border:0;border-radius:0;background:transparent;text-shadow:0 2px 18px rgba(0,0,0,.9);text-decoration:none;transform:translateY(-8%);transition:transform .2s ease,color .2s ease}
      .kr-meet:hover{transform:translateY(-11%);border-color:rgba(177,136,198,.42)}
      .kr-meet span{display:block;color:#ede4de;font-family:Georgia,serif;font-size:18px}
      .kr-meet b{color:#a27db2;font-weight:500}
      .kr-meet p{margin:6px 0 10px;color:#a69da1;font-size:10px;line-height:1.48}
      .kr-meet small{color:#9a7ca7;font-size:7px;font-weight:800;letter-spacing:.12em}

      .kr-lifecycle{position:relative;padding:20px 28px 18px;border-top:1px solid rgba(255,255,255,.09);background:rgba(7,10,15,.76);backdrop-filter:blur(18px)}
      .kr-lifecycle-title{display:flex;justify-content:center;align-items:center;gap:18px;padding-bottom:15px;border-bottom:1px solid rgba(255,255,255,.055)}
      .kr-lifecycle-title span{color:#e3d9d1;font-family:Georgia,serif;font-size:17px}
      .kr-lifecycle-title small{color:#76727a;font-size:8px;letter-spacing:.12em}
      .kr-life-grid{display:grid;grid-template-columns:repeat(4,1fr);max-width:1220px;margin:0 auto;padding:15px 0 6px}
      .kr-life-grid article{position:relative;display:grid;grid-template-columns:44px 1fr;gap:11px;align-items:start;padding:7px 30px 7px 10px;min-width:0}
      .kr-life-grid article>i{position:absolute;right:10px;top:23px;color:#735d80;font-style:normal}
      .kr-life-icon{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(161,129,177,.36);border-radius:10px;color:#a47db5;background:rgba(104,72,119,.09);font-size:19px;transform:rotate(45deg)}
      .kr-life-grid strong{display:block;color:#e1d9d4;font-size:9px;letter-spacing:.07em}
      .kr-life-grid p{margin:5px 0 0;color:#90898e;font-size:8px;line-height:1.52}
      .kr-life-grid [data-stage='echo'] .kr-life-icon{color:#80a6bf;border-color:rgba(116,158,186,.36)}
      .kr-life-grid [data-stage='manifested'] .kr-life-icon{color:#91aa81;border-color:rgba(133,166,119,.36)}
      .kr-life-grid [data-stage='vanished'] .kr-life-icon{color:#c0ac8d;border-color:rgba(184,163,132,.34)}

      .kr-retailers{display:grid;grid-template-columns:minmax(170px,.65fr) minmax(0,2.4fr) auto;gap:22px;align-items:center;padding:17px 30px;border-top:1px solid rgba(255,255,255,.07);background:rgba(6,9,14,.88)}
      .kr-retailer-title{display:grid;gap:3px}
      .kr-retailer-title span{color:#88818a;font-size:7px;font-weight:800;letter-spacing:.12em}
      .kr-retailer-title small{color:#5f5b62;font-size:7px}
      .kr-retailer-row{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:12px 24px}
      .kr-retailer-row b{color:#c1b9b5;font-size:9px;font-weight:720;letter-spacing:.02em;white-space:nowrap}
      .kr-retailers>a{color:#9b7da8;font-size:8px;font-weight:800;letter-spacing:.08em;text-decoration:none;white-space:nowrap}

      .kr-friends-banner{position:relative;margin-top:12px;line-height:0}
      .kr-friends-banner>img{display:block;width:100%;height:auto;aspect-ratio:1916/821;object-fit:cover}
      .kr-friends-hotspot{position:absolute;right:4.2%;bottom:9.2%;width:16.5%;height:10.5%;border-radius:10px;text-decoration:none;transition:box-shadow .2s ease,background .2s ease}
      .kr-friends-hotspot span{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      .kr-friends-hotspot:hover,.kr-friends-hotspot:focus-visible{background:rgba(150,105,190,.08);box-shadow:0 0 0 2px rgba(178,129,216,.38),0 12px 40px rgba(72,44,95,.24);outline:none}
      .kr-friends-mobile-link{display:none}

      @media(max-width:1080px){
        .kr-copy{width:52%}
        .kr-meet{right:22px;top:auto;bottom:24px;transform:none}
        .kr-meet:hover{transform:translateY(-3px)}
        .kr-retailers{grid-template-columns:1fr}
        .kr-retailer-title{text-align:center}
        .kr-retailer-row{gap:12px 20px}
        .kr-retailers>a{justify-self:center}
      }

      @media(max-width:760px){
        .kr-shell{width:calc(100% - 18px);margin-top:78px}
        .kr-landing-card,.kr-friends-banner{border-radius:12px}
        .kr-hero{min-height:700px}
        .kr-hero-bg{background-position:66% center}
        .kr-hero-shade{background:linear-gradient(180deg,rgba(5,8,14,.26) 0%,rgba(5,8,14,.08) 45%,rgba(5,8,14,.56) 75%,rgba(5,8,14,.82) 100%),linear-gradient(90deg,rgba(5,8,14,.24),transparent 72%)}
        .kr-copy{left:22px;right:22px;top:auto;bottom:112px;width:auto;transform:none}
        .kr-kicker{font-size:8px}
        .kr-copy h1{font-size:clamp(2.65rem,12vw,4.2rem)}
        .kr-lede{max-width:520px;font-size:12px}
        .kr-proof{display:none}
        .kr-meet{top:20px;right:18px;bottom:auto;width:142px;padding:10px 0;background:transparent}
        .kr-meet span{font-size:15px}.kr-meet p{font-size:8px}
        .kr-lifecycle{padding:18px 15px}
        .kr-lifecycle-title{align-items:flex-start;flex-direction:column;gap:4px}
        .kr-life-grid{grid-template-columns:1fr 1fr}
        .kr-life-grid article{padding:12px 16px 12px 5px}
        .kr-life-grid article:nth-child(2)>i{display:none}
        .kr-retailers{padding:17px}
        .kr-retailer-row{gap:10px 15px}
        .kr-retailer-row b{font-size:8px}
        .kr-friends-hotspot{display:none}
        .kr-friends-mobile-link{display:flex;position:relative;margin:12px auto 14px;width:max-content;line-height:1.2}
      }

      @media(max-width:480px){
        .kr-hero{min-height:650px}
        .kr-copy{bottom:94px}
        .kr-copy h1{font-size:2.7rem}
        .kr-actions{display:grid;grid-template-columns:1fr 1fr}
        .kr-actions .button{padding-inline:12px;text-align:center;justify-content:center}
        .kr-meet{width:126px}
        .kr-life-grid{grid-template-columns:1fr}
        .kr-life-grid article{padding:11px 6px}
        .kr-life-grid article>i{display:none}
        .kr-retailer-row{display:grid;grid-template-columns:1fr 1fr;text-align:center}
      }
    `}</style>
  </>;
}
