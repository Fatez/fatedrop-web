/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { KORU_BRAND, KORU_LIFECYCLE } from "@/lib/koru-brand";

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
              <Link className="button kr-secondary" href="/how-it-works">See How It Works</Link>
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
          <Link href="/indies">View Retailers <span>→</span></Link>
        </section>
      </div>

      <section className="kr-friends" aria-labelledby="kr-friends-title">
        <div className="kr-friends-copy">
          <p>KORU &amp; FRIENDS</p>
          <h2 id="kr-friends-title">The world around the signal.</h2>
          <span>Koru is the voice of FateDrop. Koru &amp; Friends carries that identity into community, collectibles and merch while the core intelligence stays serious.</span>
          <Link className="button kr-secondary" href="/merch">Explore Merch <span>↗</span></Link>
        </div>
        <div className="kr-friends-art"><img src={KORU_BRAND.friendsArtwork} alt="Koru and friends" /></div>
        <div className="kr-friends-note"><b>WEAR THE SIGNAL.</b><span>Explore Koru &amp; Friends.</span></div>
      </section>
    </section>

    <style>{`
      .kr-shell{width:min(1520px,calc(100% - 28px));margin:88px auto 0}.kr-landing-card,.kr-friends{border:1px solid rgba(205,194,215,.14);border-radius:14px;overflow:hidden;background:#090c12;box-shadow:0 28px 90px rgba(0,0,0,.34)}
      .kr-hero{position:relative;isolation:isolate;min-height:clamp(560px,44vw,720px);overflow:hidden;background:#0a0d14}.kr-hero-bg{position:absolute;z-index:-3;inset:0;background-image:url('/assets/home/koru-home-hero.webp'),url('/assets/fatedrop-header.webp');background-position:center,center;background-repeat:no-repeat,no-repeat;background-size:cover,cover;filter:saturate(.74) contrast(.98) brightness(.8)}.kr-hero-shade{position:absolute;z-index:-2;inset:0;background:linear-gradient(90deg,rgba(5,8,14,.95) 0%,rgba(5,8,14,.86) 25%,rgba(5,8,14,.42) 43%,rgba(5,8,14,.06) 65%,rgba(5,8,14,.15) 100%),linear-gradient(180deg,rgba(5,7,12,.12),transparent 52%,rgba(5,7,12,.64) 100%)}
      .kr-copy{position:absolute;z-index:4;left:clamp(28px,4vw,66px);top:50%;width:min(44%,590px);transform:translateY(-52%)}.kr-kicker{margin:0 0 18px;color:#9e83ac;font-size:9px;font-weight:850;letter-spacing:.18em}.kr-copy h1{margin:0;color:#f0e8df;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3rem,4.6vw,5.9rem);font-weight:500;line-height:.94;letter-spacing:-.052em;text-wrap:balance}.kr-copy h1 em{display:inline-block;margin-top:7px;color:transparent;background:linear-gradient(90deg,#a876ce,#9679bd 50%,#7793a8);background-clip:text;font-style:normal}.kr-lede{max-width:510px;margin:24px 0 0;color:#c0b6b6;font-size:14px;line-height:1.68}.kr-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:27px}.kr-primary{background:linear-gradient(135deg,#75558f,#604873)!important;border-color:rgba(207,181,227,.26)!important;color:#fff!important;box-shadow:0 14px 36px rgba(82,57,102,.28)!important}.kr-secondary{background:rgba(8,11,17,.72)!important;border-color:rgba(234,225,220,.18)!important;color:#e8e0dc!important;backdrop-filter:blur(10px)}.kr-proof{margin-top:28px;display:flex;align-items:center;flex-wrap:wrap;gap:9px;color:#958c90;font-size:7px;font-weight:800;letter-spacing:.12em}.kr-proof i{width:3px;height:3px;border-radius:50%;background:#826590}
      .kr-meet{position:absolute;z-index:5;right:clamp(24px,3.2vw,52px);top:50%;width:178px;padding:16px 17px;border:1px solid rgba(236,226,220,.14);border-radius:12px;background:rgba(6,9,14,.48);backdrop-filter:blur(14px);text-decoration:none;transform:translateY(-8%);transition:transform .2s ease,border-color .2s ease}.kr-meet:hover{transform:translateY(-11%);border-color:rgba(177,136,198,.42)}.kr-meet span{display:block;color:#ede4de;font-family:Georgia,serif;font-size:18px}.kr-meet b{color:#a27db2;font-weight:500}.kr-meet p{margin:6px 0 10px;color:#a69da1;font-size:10px;line-height:1.48}.kr-meet small{color:#9a7ca7;font-size:7px;font-weight:800;letter-spacing:.12em}
      .kr-lifecycle{padding:20px 28px 18px;border-top:1px solid rgba(255,255,255,.07);background:linear-gradient(180deg,#0a0e15,#080b11)}.kr-lifecycle-title{display:flex;justify-content:center;align-items:center;gap:18px;padding-bottom:15px;border-bottom:1px solid rgba(255,255,255,.055)}.kr-lifecycle-title span{color:#e3d9d1;font-family:Georgia,serif;font-size:17px}.kr-lifecycle-title small{color:#76727a;font-size:8px;letter-spacing:.12em}.kr-life-grid{display:grid;grid-template-columns:repeat(4,1fr);max-width:1220px;margin:0 auto;padding:15px 0 6px}.kr-life-grid article{position:relative;display:grid;grid-template-columns:44px 1fr;gap:11px;align-items:start;padding:7px 30px 7px 10px;min-width:0}.kr-life-grid article>i{position:absolute;right:10px;top:23px;color:#735d80;font-style:normal}.kr-life-icon{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(161,129,177,.36);border-radius:10px;color:#a47db5;background:rgba(104,72,119,.09);font-size:19px;transform:rotate(45deg)}.kr-life-grid strong{display:block;color:#e1d9d4;font-size:9px;letter-spacing:.07em}.kr-life-grid p{margin:5px 0 0;color:#90898e;font-size:8px;line-height:1.52}.kr-life-grid [data-stage='echo'] .kr-life-icon{color:#80a6bf;border-color:rgba(116,158,186,.36)}.kr-life-grid [data-stage='manifested'] .kr-life-icon{color:#91aa81;border-color:rgba(133,166,119,.36)}.kr-life-grid [data-stage='vanished'] .kr-life-icon{color:#c0ac8d;border-color:rgba(184,163,132,.34)}
      .kr-retailers{display:grid;grid-template-columns:minmax(170px,.65fr) minmax(0,2.4fr) auto;gap:22px;align-items:center;padding:17px 30px;border-top:1px solid rgba(255,255,255,.055);background:#080b10}.kr-retailer-title{display:grid;gap:3px}.kr-retailer-title span{color:#88818a;font-size:7px;font-weight:800;letter-spacing:.12em}.kr-retailer-title small{color:#5f5b62;font-size:7px}.kr-retailer-row{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:12px 24px}.kr-retailer-row b{color:#c1b9b5;font-size:9px;font-weight:720;letter-spacing:.02em;white-space:nowrap}.kr-retailers>a{color:#9b7da8;font-size:8px;font-weight:800;letter-spacing:.08em;text-decoration:none;white-space:nowrap}
      .kr-friends{position:relative;min-height:250px;margin-top:10px;display:grid;grid-template-columns:minmax(300px,.8fr) minmax(420px,1.4fr) minmax(150px,.35fr);align-items:stretch;background:linear-gradient(100deg,#0d1017,#0a0d13)}.kr-friends-copy{position:relative;z-index:3;padding:30px 34px;display:flex;flex-direction:column;justify-content:center}.kr-friends-copy>p{margin:0 0 7px;color:#a47bb1;font-size:10px;font-weight:850;letter-spacing:.08em}.kr-friends-copy h2{margin:0;color:#e6ddd6;font-family:Georgia,serif;font-size:clamp(1.8rem,2.3vw,2.7rem);font-weight:500;letter-spacing:-.03em}.kr-friends-copy>span{max-width:430px;margin:10px 0 18px;color:#9d969a;font-size:10px;line-height:1.55}.kr-friends-copy .button{align-self:flex-start}.kr-friends-art{position:relative;overflow:hidden}.kr-friends-art:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#0c0f16 0%,transparent 20%,transparent 78%,#0a0d13 100%)}.kr-friends-art img{width:100%;height:100%;object-fit:cover;object-position:center 58%;filter:saturate(.58) contrast(.9) brightness(.73) sepia(.05)}.kr-friends-note{display:flex;flex-direction:column;justify-content:flex-end;padding:26px 25px;background:linear-gradient(180deg,rgba(11,14,20,.2),#0a0d13)}.kr-friends-note b{color:#bbb0b6;font-size:8px;letter-spacing:.11em}.kr-friends-note span{margin-top:5px;color:#746f76;font-size:8px}
      @media(max-width:1080px){.kr-copy{width:52%}.kr-meet{right:22px;top:auto;bottom:24px;transform:none}.kr-meet:hover{transform:translateY(-3px)}.kr-retailers{grid-template-columns:1fr}.kr-retailer-title{text-align:center}.kr-retailer-row{gap:12px 20px}.kr-retailers>a{justify-self:center}.kr-friends{grid-template-columns:.9fr 1.4fr}.kr-friends-note{display:none}}
      @media(max-width:760px){.kr-shell{width:calc(100% - 18px);margin-top:78px}.kr-landing-card,.kr-friends{border-radius:12px}.kr-hero{min-height:700px}.kr-hero-bg{background-position:66% center,center}.kr-hero-shade{background:linear-gradient(180deg,rgba(5,8,14,.72) 0%,rgba(5,8,14,.5) 28%,rgba(5,8,14,.14) 48%,rgba(5,8,14,.86) 78%,rgba(5,8,14,.97) 100%),linear-gradient(90deg,rgba(5,8,14,.55),transparent 70%)}.kr-copy{left:22px;right:22px;top:auto;bottom:112px;width:auto;transform:none}.kr-kicker{font-size:8px}.kr-copy h1{font-size:clamp(2.65rem,12vw,4.2rem)}.kr-lede{max-width:520px;font-size:12px}.kr-proof{display:none}.kr-meet{top:20px;right:18px;bottom:auto;width:142px;padding:12px 13px;background:rgba(5,8,14,.6)}.kr-meet span{font-size:15px}.kr-meet p{font-size:8px}.kr-lifecycle{padding:18px 15px}.kr-lifecycle-title{align-items:flex-start;flex-direction:column;gap:4px}.kr-life-grid{grid-template-columns:1fr 1fr}.kr-life-grid article{padding:12px 16px 12px 5px}.kr-life-grid article:nth-child(2)>i{display:none}.kr-retailers{padding:17px}.kr-retailer-row{gap:10px 15px}.kr-retailer-row b{font-size:8px}.kr-friends{grid-template-columns:1fr;min-height:0}.kr-friends-copy{padding:26px 24px}.kr-friends-art{height:230px;order:-1}.kr-friends-art:after{background:linear-gradient(180deg,transparent 52%,#0b0e14 100%)}.kr-friends-copy>span{font-size:9px}}
      @media(max-width:480px){.kr-hero{min-height:650px}.kr-copy{bottom:94px}.kr-copy h1{font-size:2.7rem}.kr-actions{display:grid;grid-template-columns:1fr 1fr}.kr-actions .button{padding-inline:12px;text-align:center;justify-content:center}.kr-meet{width:126px}.kr-life-grid{grid-template-columns:1fr}.kr-life-grid article{padding:11px 6px}.kr-life-grid article>i{display:none}.kr-retailer-row{display:grid;grid-template-columns:1fr 1fr;text-align:center}.kr-friends-art{height:205px}}
    `}</style>
  </>;
}
