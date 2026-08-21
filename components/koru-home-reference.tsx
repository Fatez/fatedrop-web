/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { KORU_BRAND, KORU_LIFECYCLE } from "@/lib/koru-brand";

const retailers = ["Pokémon Center UK", "Titan Cards", "Total Cards", "Zatu", "Independent Network"];

const featureCards = [
  { name: "SEARCH", copy: "One search across participating catalogues." },
  { name: "TRUE PRICE", copy: "See buying context against official RRP." },
  { name: "FATEFIND", copy: "Tell the network what you want watched." },
  { name: "INDIE NETWORK", copy: "Discover stores while checkout stays theirs." },
] as const;

export function KoruReferenceLanding() {
  return <>
    <section className="kr-shell section-shell" aria-label="FateDrop introduction">
      <div className="kr-layout">
        <article className="kr-hero">
          <div className="kr-hero-bg" aria-hidden="true" />

          <div className="kr-copy">
            <p className="kr-kicker">FATEDROP · UK TCG SIGNAL INTELLIGENCE</p>
            <h1>You don&apos;t chase drops.<br/><em>You get the signal.</em></h1>
            <p className="kr-lede">FateDrop watches participating TCG retailers, gives movement a clear lifecycle and adds price context before you decide what to buy.</p>
            <div className="button-row">
              <Link className="button kr-primary" href="/join?type=collector">Start Your Free Trial <span>↗</span></Link>
              <Link className="button kr-secondary" href="/how-it-works">See How It Works</Link>
            </div>
            <div className="kr-proof"><span>POKÉMON TCG FIRST</span><i/><span>INDEPENDENT-FIRST</span><i/><span>EVIDENCE-BACKED SIGNALS</span></div>
          </div>

          <div className="kr-art" aria-label="Koru, FateDrop signal companion">
            <div className="kr-art-glow" aria-hidden="true" />
            <div className="kr-signal-card kr-signal-card-one" aria-hidden="true"><span>FATE</span><b>DROP</b></div>
            <div className="kr-signal-card kr-signal-card-two" aria-hidden="true"><span>K-09</span><b>WATCH</b></div>
            <img src={KORU_BRAND.fullArtwork} alt="Koru, FateDrop's signal companion" />
            <div className="kr-meet"><span>Meet <b>Koru.</b></span><p>The voice of the FateDrop network.</p></div>
          </div>

          <div className="kr-lifecycle">
            <div className="kr-lifecycle-title"><span>The FateDrop Signal Lifecycle</span><small>Four states. One meaning everywhere.</small></div>
            <div className="kr-life-grid">
              {KORU_LIFECYCLE.map((item, index) => <article key={item.state} data-stage={item.state.toLowerCase()}>
                <div className="kr-life-icon">◇</div>
                <div><strong>{item.state.toUpperCase()}</strong><p>{item.copy}</p></div>
                {index < KORU_LIFECYCLE.length - 1 ? <i aria-hidden="true">→</i> : null}
              </article>)}
            </div>
            <div className="kr-retailers">
              <span>MONITORING PARTICIPATING RETAILER SOURCES</span>
              <div>{retailers.map((name) => <b key={name}>{name}</b>)}</div>
              <Link href="/indies">View retailers →</Link>
            </div>
          </div>
        </article>

        <aside className="kr-voice">
          <div className="kr-voice-copy">
            <p>KORU — THE VOICE OF FATEDROP</p>
            <h2>Calm. Observant.<br/>Always listening.</h2>
            <span>Koru turns network movement into a recognisable voice while the evidence underneath stays precise.</span>
            <ul>
              <li>Muted, matte visual treatment</li>
              <li>Thoughtful and watchful</li>
              <li>Guides collectors through the signal</li>
              <li>One mascot across the network</li>
            </ul>
            <div className="kr-swatches"><i/><i/><i/><i/><i/></div>
          </div>
          <img src={KORU_BRAND.portrait} alt="Portrait of Koru" />
        </aside>

        <aside className="kr-intel">
          <div className="kr-panel-head"><span>THE FATEDROP NETWORK</span><small>Koru is the voice. The system does the work.</small></div>
          <div className="kr-feature-grid">{featureCards.map((item, index) => <article key={item.name}><small>0{index + 1}</small><b>{item.name}</b><p>{item.copy}</p></article>)}</div>
          <Link href="/features">Explore the network <span>→</span></Link>
        </aside>
      </div>

      <div className="kr-friends">
        <div className="kr-friends-copy"><p>KORU &amp; FRIENDS</p><h2>A world around the signal.</h2><span>Character-led community, collectible identity and merch — without turning the product itself into a toy.</span><Link className="button kr-secondary" href="/merch">Explore Merch <span>↗</span></Link></div>
        <img src={KORU_BRAND.friendsArtwork} alt="Koru and friends" />
        <div className="kr-friends-note"><b>THE SIGNAL STAYS SERIOUS.</b><span>The personality lives around it.</span></div>
      </div>
    </section>

    <style>{`
      .kr-shell{margin-top:88px}.kr-layout{display:grid;grid-template-columns:minmax(0,1.62fr) minmax(350px,.98fr);grid-template-rows:286px 398px;gap:10px}.kr-hero,.kr-voice,.kr-intel,.kr-friends{border:1px solid rgba(209,197,218,.13);border-radius:13px;background:#0b0d13;overflow:hidden;box-shadow:0 24px 72px rgba(0,0,0,.28)}
      .kr-hero{position:relative;isolation:isolate;grid-row:1/3;min-height:694px;background:#0c0f17}.kr-hero-bg{position:absolute;z-index:-3;inset:0;background:linear-gradient(90deg,rgba(7,9,15,.97) 0%,rgba(7,9,15,.84) 31%,rgba(7,9,15,.2) 58%,rgba(7,9,15,.44) 100%),linear-gradient(180deg,rgba(7,9,14,.04),rgba(8,10,15,.12) 52%,rgba(6,8,13,.92)),url('/assets/fatedrop-header.webp') center/cover no-repeat;filter:saturate(.5) sepia(.08) contrast(.94)}.kr-hero:after{content:"";position:absolute;z-index:-1;inset:0;background:radial-gradient(circle at 62% 43%,rgba(135,96,157,.2),transparent 28%),linear-gradient(180deg,transparent 58%,rgba(8,10,16,.58))}
      .kr-copy{position:absolute;z-index:6;left:clamp(28px,3.5vw,58px);top:clamp(48px,5vw,76px);width:min(46%,510px)}.kr-kicker{margin:0 0 18px;color:#9a86a6;font-size:9px;font-weight:800;letter-spacing:.17em}.kr-copy h1{margin:0;color:#eee6dc;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.75rem,4.25vw,5.6rem);font-weight:500;letter-spacing:-.047em;line-height:.95}.kr-copy h1 em{display:inline-block;margin-top:4px;color:transparent;background:linear-gradient(90deg,#a47ac9,#8f76b7 52%,#718ba1);background-clip:text;font-style:normal}.kr-lede{max-width:470px;margin:22px 0;color:#bab1b0;font-size:13px;line-height:1.62}.kr-primary{background:linear-gradient(135deg,#74568e,#5d496e)!important;border-color:rgba(205,178,226,.24)!important;color:#faf6fb!important;box-shadow:0 12px 30px rgba(87,63,104,.24)!important}.kr-secondary{background:rgba(12,14,20,.7)!important;border-color:rgba(229,220,217,.16)!important}.kr-proof{margin-top:26px;display:flex;align-items:center;flex-wrap:wrap;gap:9px;color:#857d82;font-size:7px;font-weight:800;letter-spacing:.11em}.kr-proof i{width:3px;height:3px;border-radius:50%;background:#795f87}
      .kr-art{position:absolute;z-index:2;right:0;top:0;width:61%;height:68%;overflow:hidden}.kr-art-glow{position:absolute;inset:5% 2% 2% 10%;background:radial-gradient(circle at 50% 48%,rgba(141,103,162,.24),transparent 32%)}.kr-art>img{position:absolute;z-index:2;right:-5%;top:-17%;width:92%;height:126%;object-fit:cover;object-position:center 50%;filter:saturate(.48) contrast(.83) brightness(.7) sepia(.07)}.kr-art:after{content:"";position:absolute;z-index:3;inset:0;background:linear-gradient(90deg,rgba(8,10,16,.44),transparent 28%,transparent 75%,rgba(8,10,16,.22)),linear-gradient(180deg,transparent 58%,rgba(8,10,16,.74))}.kr-meet{position:absolute;z-index:6;right:27px;bottom:27px;width:142px;padding:12px 13px;border:1px solid rgba(229,220,215,.11);border-radius:10px;background:rgba(7,9,14,.58);backdrop-filter:blur(12px)}.kr-meet span{display:block;color:#e2dad3;font-family:Georgia,serif;font-size:14px}.kr-meet b{color:#9a79aa;font-weight:500}.kr-meet p{margin:4px 0 0;color:#9b9497;font-size:8px;line-height:1.45}
      .kr-signal-card{position:absolute;z-index:5;width:64px;aspect-ratio:.68;padding:8px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid rgba(203,177,211,.35);border-radius:7px;background:linear-gradient(150deg,#22212b,#11131a);box-shadow:0 15px 35px rgba(0,0,0,.36),inset 0 0 0 2px rgba(114,83,130,.1);color:#a789b4;font-size:6px;letter-spacing:.11em}.kr-signal-card b{color:#d8ccda;font-size:7px}.kr-signal-card-one{left:13%;top:31%;transform:rotate(-8deg)}.kr-signal-card-two{left:70%;top:19%;transform:rotate(8deg);opacity:.62}
      .kr-lifecycle{position:absolute;z-index:8;left:26px;right:26px;bottom:20px;padding:17px 19px 12px;border:1px solid rgba(220,208,208,.11);border-radius:12px;background:rgba(7,9,14,.88);backdrop-filter:blur(14px)}.kr-lifecycle-title{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:0 3px 12px;border-bottom:1px solid rgba(255,255,255,.06)}.kr-lifecycle-title span{color:#dfd6cf;font-family:Georgia,serif;font-size:13px}.kr-lifecycle-title small{color:#77727a;font-size:7px;letter-spacing:.11em}.kr-life-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;padding:10px 0 8px}.kr-life-grid article{position:relative;display:grid;grid-template-columns:34px 1fr;gap:8px;padding:5px 18px 5px 3px;min-width:0}.kr-life-grid article>i{position:absolute;right:6px;top:15px;color:#705a7b;font-style:normal}.kr-life-icon{width:27px;height:27px;display:grid;place-items:center;border:1px solid rgba(163,132,178,.32);border-radius:8px;color:#a07bad;background:rgba(102,72,117,.08);font-size:16px;transform:rotate(45deg)}.kr-life-grid strong{display:block;color:#ddd5d1;font-size:8px;letter-spacing:.06em}.kr-life-grid p{margin:4px 0 0;color:#888389;font-size:7px;line-height:1.42}.kr-life-grid [data-stage='echo'] .kr-life-icon{color:#79a0b8;border-color:rgba(111,151,177,.32)}.kr-life-grid [data-stage='manifested'] .kr-life-icon{color:#8aa27e;border-color:rgba(129,157,117,.32)}.kr-life-grid [data-stage='vanished'] .kr-life-icon{color:#b6a790;border-color:rgba(174,158,136,.3)}.kr-retailers{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;padding-top:10px;border-top:1px solid rgba(255,255,255,.055)}.kr-retailers>span{color:#6e6970;font-size:6px;letter-spacing:.1em}.kr-retailers>div{display:flex;justify-content:center;flex-wrap:wrap;gap:16px}.kr-retailers b{color:#aaa3a1;font-size:7px;font-weight:700}.kr-retailers a{color:#9782a2;font-size:7px;text-decoration:none}
      .kr-voice{position:relative;display:grid;grid-template-columns:.86fr 1.14fr;background:linear-gradient(135deg,#0f1018,#0a0c12)}.kr-voice-copy{position:relative;z-index:3;padding:19px 8px 16px 22px}.kr-voice-copy>p{margin:0 0 8px;color:#a77db4;font-size:9px;font-weight:800;letter-spacing:.07em}.kr-voice-copy h2{margin:0;color:#e0d8d3;font-family:Georgia,serif;font-size:20px;font-weight:500;line-height:1.02}.kr-voice-copy>span{display:block;margin-top:9px;color:#aaa2a5;font-size:8px;line-height:1.45}.kr-voice-copy ul{margin:11px 0 0;padding:0;display:grid;gap:5px;list-style:none}.kr-voice-copy li{position:relative;padding-left:13px;color:#a9a1a6;font-size:7px}.kr-voice-copy li:before{content:'◇';position:absolute;left:0;color:#9875aa}.kr-voice>img{position:absolute;right:-2%;top:-15%;width:58%;height:126%;object-fit:cover;filter:saturate(.48) contrast(.82) brightness(.67) sepia(.08)}.kr-voice:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#0d0f16 0%,rgba(13,15,22,.92) 40%,transparent 68%),linear-gradient(180deg,transparent 60%,rgba(7,9,14,.45))}.kr-swatches{position:absolute;z-index:5;left:22px;bottom:14px;display:flex;gap:6px}.kr-swatches i{width:22px;height:22px;border-radius:4px;background:#5f496c}.kr-swatches i:nth-child(2){background:#5b5c78}.kr-swatches i:nth-child(3){background:#536675}.kr-swatches i:nth-child(4){background:#3d4a52}.kr-swatches i:nth-child(5){background:#9a806b}
      .kr-intel{padding:18px 20px;background:linear-gradient(150deg,#0d1017,#080b10)}.kr-panel-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-end;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.06)}.kr-panel-head span{color:#a47ab1;font-size:9px;font-weight:800;letter-spacing:.07em}.kr-panel-head small{color:#77727a;font-size:7px}.kr-feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.kr-feature-grid article{min-height:118px;padding:14px;border:1px solid rgba(255,255,255,.065);border-radius:9px;background:rgba(255,255,255,.018)}.kr-feature-grid small{color:#6e6375;font-size:7px}.kr-feature-grid b{display:block;margin-top:13px;color:#d8d0cc;font-size:9px;letter-spacing:.06em}.kr-feature-grid p{margin:7px 0 0;color:#858088;font-size:8px;line-height:1.45}.kr-intel>a{display:inline-block;margin-top:13px;color:#9a7ba7;font-size:8px;font-weight:700;text-decoration:none}
      .kr-friends{position:relative;min-height:184px;margin-top:10px;display:grid;grid-template-columns:.88fr 1.5fr .58fr;align-items:stretch;background:linear-gradient(90deg,#10121a,#0d1017 42%,#0a0c12)}.kr-friends-copy{position:relative;z-index:3;padding:24px 0 22px 26px}.kr-friends-copy>p{margin:0;color:#a37aaf;font-size:9px;font-weight:800;letter-spacing:.08em}.kr-friends-copy h2{margin:6px 0 7px;color:#ded6d0;font-family:Georgia,serif;font-size:21px;font-weight:500}.kr-friends-copy>span{display:block;max-width:360px;color:#989196;font-size:8px;line-height:1.48}.kr-friends-copy .button{margin-top:13px;padding:8px 12px;font-size:7px}.kr-friends>img{align-self:end;width:100%;height:184px;object-fit:cover;object-position:center 56%;filter:saturate(.52) contrast(.86) brightness(.73) sepia(.06);mask-image:linear-gradient(90deg,transparent 0,#000 8%,#000 94%,transparent)}.kr-friends-note{display:flex;flex-direction:column;justify-content:center;padding:20px;border-left:1px solid rgba(255,255,255,.06)}.kr-friends-note b{color:#c3b7c5;font-size:8px;letter-spacing:.07em}.kr-friends-note span{margin-top:6px;color:#7f7a81;font-size:8px;line-height:1.45}
      @media(max-width:1100px){.kr-layout{grid-template-columns:1fr;grid-template-rows:auto}.kr-hero{grid-row:auto;min-height:720px}.kr-voice{min-height:300px}.kr-intel{min-height:auto}.kr-friends{grid-template-columns:1fr 1.3fr}.kr-friends-note{display:none}}
      @media(max-width:720px){.kr-shell{width:calc(100% - 20px);margin-top:82px}.kr-hero{min-height:850px}.kr-copy{position:relative;left:auto;top:auto;width:auto;padding:34px 24px 0}.kr-copy h1{font-size:clamp(2.65rem,13vw,4.4rem)}.kr-art{top:310px;width:100%;height:310px}.kr-art>img{right:-10%;width:95%;top:-20%}.kr-lifecycle{left:12px;right:12px;bottom:12px;padding:14px 12px}.kr-lifecycle-title{align-items:flex-start;flex-direction:column}.kr-life-grid{grid-template-columns:1fr 1fr;gap:4px}.kr-life-grid article>i{display:none}.kr-retailers{grid-template-columns:1fr}.kr-retailers>div{justify-content:flex-start}.kr-voice{grid-template-columns:1fr;min-height:390px}.kr-voice-copy{padding:24px}.kr-voice>img{right:-18%;top:2%;width:78%;height:104%}.kr-voice:after{background:linear-gradient(90deg,#0d0f16 0%,rgba(13,15,22,.9) 52%,transparent 82%)}.kr-intel{padding:18px 14px}.kr-feature-grid{grid-template-columns:1fr}.kr-feature-grid article{min-height:auto}.kr-friends{grid-template-columns:1fr;min-height:auto}.kr-friends-copy{padding:22px}.kr-friends>img{height:210px;mask-image:linear-gradient(180deg,transparent 0,#000 14%,#000 100%)}}
    `}</style>
  </>;
}
