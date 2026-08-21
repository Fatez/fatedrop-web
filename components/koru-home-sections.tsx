/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { InteractivePhoneDemo } from "@/components/interactive-phone-demo";
import { KORU_BRAND, KORU_LIFECYCLE, KORU_MERCH } from "@/lib/koru-brand";

export function KoruHomeHero() {
  return <>
    <section className="koru-home-hero section-shell">
      <div className="koru-home-sky" aria-hidden="true"/>
      <div className="koru-home-copy">
        <p className="koru-kicker">FATEDROP · UK TCG SIGNAL INTELLIGENCE</p>
        <h1>You don&apos;t chase drops.<br/><em>You get the signal.</em></h1>
        <p className="koru-home-lede">Search participating TCG catalogues, compare the real buying context and follow evidence-backed movement before, during and after a drop.</p>
        <div className="button-row">
          <Link className="button koru-primary" href="/join?type=collector">Join the Collector Beta <span>↗</span></Link>
          <Link className="button koru-secondary" href="/how-it-works">See How It Works</Link>
        </div>
        <div className="koru-home-trust"><span>POKÉMON TCG FIRST</span><i/><span>INDEPENDENT-FIRST DISCOVERY</span><i/><span>REAL EVIDENCE · NO INVENTED SIGNALS</span></div>
      </div>

      <div className="koru-hero-art" aria-label="Koru, the FateDrop signal companion, with a trading card signal">
        <div className="koru-art-backdrop"/>
        <img src={KORU_BRAND.fullArtwork} alt="Koru, FateDrop's signal companion"/>
        <div className="koru-art-matte" aria-hidden="true"/>
        <div className="koru-card-signal" aria-hidden="true">
          <div className="koru-card-face">
            <small>FATEDROP / SIGNAL CARD</small>
            <div className="koru-card-image"><img src={KORU_BRAND.portrait} alt=""/></div>
            <strong>NETWORK WATCHER</strong>
            <span>WHISPER · ECHO · MANIFESTED · VANISHED</span>
            <b>K-09</b>
          </div>
        </div>
        <div className="koru-meet"><span>MEET <b>KORU.</b></span><p>The voice of the FateDrop network.</p></div>
      </div>

      <div className="koru-lifecycle-panel">
        <div className="koru-lifecycle-title"><span>THE FATEDROP SIGNAL LIFECYCLE</span><small>Four states. One meaning everywhere.</small></div>
        <div className="koru-lifecycle-grid">{KORU_LIFECYCLE.map((item, index) => <article key={item.state} data-stage={item.state.toLowerCase()}>
          <div className="koru-stage-icon">◇</div>
          <div><strong>{item.state.toUpperCase()}</strong><p>{item.copy}</p></div>
          {index < KORU_LIFECYCLE.length - 1 ? <i aria-hidden="true">→</i> : null}
        </article>)}</div>
      </div>
    </section>

    <style>{`
      .koru-home-hero{position:relative;isolation:isolate;margin-top:96px;min-height:760px;padding:clamp(34px,5vw,72px);display:grid;grid-template-columns:minmax(0,.94fr) minmax(430px,1.06fr);grid-template-rows:1fr auto;gap:26px 30px;overflow:hidden;border:1px solid rgba(203,190,214,.14);border-radius:28px;background:linear-gradient(145deg,#11101a 0%,#0b0c12 50%,#0a0b10 100%);box-shadow:0 34px 110px rgba(0,0,0,.42)}
      .koru-home-sky{position:absolute;z-index:-3;inset:0;background:radial-gradient(circle at 67% 40%,rgba(117,89,137,.18),transparent 33%),radial-gradient(circle at 85% 20%,rgba(107,129,139,.12),transparent 22%),linear-gradient(180deg,rgba(11,13,19,.3),rgba(5,7,11,.94)),url('/assets/fatedrop-header.webp') center/cover no-repeat;filter:saturate(.48) sepia(.05);opacity:.78}.koru-home-sky:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(9,9,14,.96) 0%,rgba(9,9,14,.84) 34%,rgba(9,9,14,.18) 62%,rgba(9,9,14,.52) 100%)}
      .koru-home-copy{position:relative;z-index:4;align-self:center;max-width:680px;padding-block:18px}.koru-kicker{margin:0 0 22px;color:#9c8ba6;font-size:10px;font-weight:850;letter-spacing:.18em}.koru-home-copy h1{margin:0;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3.25rem,6vw,6.7rem);font-weight:500;line-height:.94;letter-spacing:-.055em;color:#eee7df}.koru-home-copy h1 em{display:inline-block;margin-top:7px;color:transparent;background:linear-gradient(90deg,#a47ace,#8f79b8 50%,#798ea4);background-clip:text;font-style:normal}.koru-home-lede{max-width:590px;margin:29px 0;color:#bbb2b2;font-size:16px;line-height:1.72}.koru-primary{color:#f8f4f5!important;background:linear-gradient(135deg,#745b8b,#5f4b73)!important;box-shadow:0 14px 40px rgba(94,72,112,.22)!important}.koru-secondary{border-color:rgba(226,218,216,.18)!important;background:rgba(15,16,22,.54)!important}.koru-home-trust{margin-top:36px;display:flex;align-items:center;flex-wrap:wrap;gap:10px;color:#7f7980;font-size:8px;font-weight:800;letter-spacing:.12em}.koru-home-trust i{width:3px;height:3px;border-radius:50%;background:#7d668d}
      .koru-hero-art{position:relative;z-index:2;align-self:stretch;min-height:530px;overflow:hidden;border:1px solid rgba(216,205,197,.1);border-radius:24px;background:linear-gradient(180deg,#171721,#0d0d13)}.koru-hero-art>img{position:absolute;z-index:1;left:13%;top:-16%;width:79%;height:124%;object-fit:cover;object-position:center 53%;filter:saturate(.48) contrast(.82) brightness(.68) sepia(.07);opacity:.96}.koru-art-backdrop{position:absolute;z-index:0;inset:0;background:radial-gradient(circle at 55% 54%,rgba(112,88,129,.28),transparent 31%),linear-gradient(180deg,rgba(119,100,117,.08),rgba(6,8,12,.76))}.koru-art-matte{position:absolute;z-index:2;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(11,11,16,.22),transparent 33%,transparent 65%,rgba(10,11,15,.36)),linear-gradient(180deg,rgba(191,164,143,.06),transparent 38%,rgba(7,8,12,.48));mix-blend-mode:screen;opacity:.72}.koru-meet{position:absolute;z-index:5;right:28px;bottom:30px;width:160px;padding:14px 15px;border:1px solid rgba(230,222,216,.12);border-radius:13px;background:rgba(10,11,16,.58);backdrop-filter:blur(13px)}.koru-meet span{display:block;color:#ded6d1;font-family:Georgia,serif;font-size:14px}.koru-meet b{color:#9b7cad;font-weight:500}.koru-meet p{margin:5px 0 0;color:#9d9699;font-size:9px;line-height:1.45}
      .koru-card-signal{position:absolute;z-index:6;left:5.5%;top:24%;width:128px;aspect-ratio:.69;transform:rotate(-6deg);filter:drop-shadow(0 18px 30px rgba(0,0,0,.48))}.koru-card-face{height:100%;padding:7px;display:flex;flex-direction:column;border:1px solid rgba(227,214,194,.52);border-radius:8px;background:linear-gradient(145deg,#bda98f,#796d69 13%,#252631 14%,#161821 86%,#8b758d 87%,#c6b39c);box-shadow:inset 0 0 0 3px rgba(11,12,16,.76),0 0 28px rgba(143,106,163,.22)}.koru-card-face>small{padding:3px 2px;color:#d2c7bd;font-size:5px;letter-spacing:.12em}.koru-card-image{height:62%;overflow:hidden;border:1px solid rgba(216,198,174,.28);background:#11131a}.koru-card-image img{width:100%;height:100%;object-fit:cover;filter:saturate(.5) contrast(.87) brightness(.75) sepia(.06)}.koru-card-face>strong{margin-top:6px;color:#eee8df;font-family:Georgia,serif;font-size:9px}.koru-card-face>span{margin-top:4px;color:#958c91;font-size:4.5px;line-height:1.4}.koru-card-face>b{margin-top:auto;align-self:flex-end;color:#a988b7;font-size:7px}
      .koru-lifecycle-panel{position:relative;z-index:7;grid-column:1/-1;padding:22px 26px;border:1px solid rgba(217,207,204,.11);border-radius:18px;background:rgba(8,10,15,.82);backdrop-filter:blur(15px)}.koru-lifecycle-title{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:17px}.koru-lifecycle-title span{color:#d9d0cb;font-family:Georgia,serif;font-size:15px}.koru-lifecycle-title small{color:#716d75;font-size:8px;letter-spacing:.12em}.koru-lifecycle-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0}.koru-lifecycle-grid article{position:relative;display:grid;grid-template-columns:42px 1fr;gap:10px;align-items:start;padding:12px 22px 12px 0}.koru-lifecycle-grid article>i{position:absolute;right:8px;top:23px;color:#716178;font-style:normal}.koru-stage-icon{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(170,145,182,.3);border-radius:10px;color:#9c7faf;background:rgba(117,91,133,.09);font-size:21px;transform:rotate(45deg)}.koru-stage-icon::first-letter{transform:rotate(-45deg)}.koru-lifecycle-grid strong{display:block;color:#dfd9d4;font-size:9px;letter-spacing:.08em}.koru-lifecycle-grid p{margin:6px 0 0;color:#88838a;font-size:8px;line-height:1.5}.koru-lifecycle-grid [data-stage='echo'] .koru-stage-icon{color:#7895aa;border-color:rgba(112,147,169,.34);background:rgba(92,130,154,.08)}.koru-lifecycle-grid [data-stage='manifested'] .koru-stage-icon{color:#80977d;border-color:rgba(120,154,119,.34);background:rgba(104,143,100,.08)}.koru-lifecycle-grid [data-stage='vanished'] .koru-stage-icon{color:#b0a69a;border-color:rgba(171,160,145,.3);background:rgba(150,139,124,.07)}
      @media(max-width:980px){.koru-home-hero{grid-template-columns:1fr;padding:34px;min-height:auto}.koru-home-copy{padding-top:26px}.koru-hero-art{min-height:590px}.koru-lifecycle-grid{grid-template-columns:1fr 1fr}.koru-lifecycle-grid article:nth-child(2)>i{display:none}}
      @media(max-width:620px){.koru-home-hero{width:calc(100% - 24px);margin-top:88px;padding:24px 18px;border-radius:20px}.koru-home-copy h1{font-size:clamp(2.8rem,14vw,4.2rem)}.koru-home-lede{font-size:14px}.koru-hero-art{min-height:500px}.koru-hero-art>img{left:-3%;width:108%}.koru-card-signal{left:10px;top:30%;width:94px}.koru-meet{right:12px;bottom:14px;width:142px}.koru-lifecycle-panel{padding:18px 14px}.koru-lifecycle-title{align-items:flex-start;flex-direction:column}.koru-lifecycle-grid{grid-template-columns:1fr}.koru-lifecycle-grid article{padding-right:0}.koru-lifecycle-grid article>i{display:none}}
    `}</style>
  </>;
}

export function KoruVoiceSection() {
  return <section className="koru-voice section-shell">
    <div className="koru-voice-copy">
      <p className="eyebrow"><span/>Koru — the voice of FateDrop</p>
      <h2>Calm. Observant.<br/>Always listening.</h2>
      <p>Koru gives FateDrop a recognisable face without replacing the evidence. The network still tells you exactly what it knows; Koru simply makes each stage easier to recognise.</p>
      <ul><li>Muted, matte visual treatment</li><li>Thoughtful and watchful—not noisy</li><li>Guides collectors through the signal lifecycle</li><li>One mascot across every TCG</li><li>Koru &amp; Friends reserved for the wider brand universe</li></ul>
      <Link className="text-link" href="/dashboard/avatar">Meet Koru in FateDrop <span>→</span></Link>
    </div>
    <div className="koru-voice-art"><img src={KORU_BRAND.portrait} alt="Portrait of Koru"/><span>KORU · K-09</span></div>
    <style>{`
      .koru-voice{margin-top:92px;display:grid;grid-template-columns:.9fr 1.1fr;gap:18px;align-items:stretch}.koru-voice-copy,.koru-voice-art{border:1px solid rgba(255,255,255,.075);border-radius:24px;background:#0c0c12}.koru-voice-copy{padding:clamp(28px,4vw,52px)}.koru-voice-copy h2{margin:0 0 18px;font-family:Georgia,serif;font-size:clamp(2.4rem,4.7vw,5rem);font-weight:500;line-height:.95;letter-spacing:-.05em;color:#e7dfd9}.koru-voice-copy>p:not(.eyebrow){max-width:620px;color:#999298;font-size:14px;line-height:1.7}.koru-voice-copy ul{margin:24px 0 28px;padding:0;display:grid;gap:10px;list-style:none}.koru-voice-copy li{position:relative;padding-left:22px;color:#b2a9ad;font-size:11px}.koru-voice-copy li:before{content:'◇';position:absolute;left:0;color:#987cac}.koru-voice-art{position:relative;min-height:500px;overflow:hidden;background:radial-gradient(circle at 50% 42%,rgba(114,94,128,.16),transparent 38%),#0b0c11}.koru-voice-art img{position:absolute;inset:-8% -2% -4%;width:104%;height:112%;object-fit:cover;filter:saturate(.43) contrast(.78) brightness(.67) sepia(.08)}.koru-voice-art:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(151,124,111,.04),transparent 50%,rgba(5,6,9,.58))}.koru-voice-art>span{position:absolute;z-index:2;left:20px;bottom:18px;padding:8px 10px;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:rgba(7,8,11,.66);color:#9b879f;font-size:7px;font-weight:900;letter-spacing:.16em}@media(max-width:850px){.koru-voice{grid-template-columns:1fr}.koru-voice-art{min-height:420px}}
    `}</style>
  </section>;
}

export function KoruAppSection() {
  return <section className="koru-app section-shell">
    <div className="koru-app-head"><div><p className="eyebrow"><span/>Koru in the app</p><h2>The signal follows you.</h2></div><p>Koru stays restrained inside the product: present around important network moments, but never in the way of Search, True Price, FateFind or the evidence behind an alert.</p></div>
    <div className="koru-app-grid">
      <div className="koru-phone-stage"><InteractivePhoneDemo/></div>
      <div className="koru-app-card"><img src={KORU_BRAND.portrait} alt="Koru in the FateDrop app"/><div><small>KORU SAYS</small><strong>I&apos;ll watch the network.</strong><p>You focus on the pulls.</p><span>CURRENT STATUS · ALL SYSTEMS ON WATCH</span></div></div>
      <div className="koru-tcg-context"><small>TCG CONTEXT</small><strong>Cards belong in the product story.</strong><p>Product cards, RRP and retailer evidence stay central. Koru supports that collector world rather than turning FateDrop into a generic character app.</p><div className="mini-card-stack"><i/><i/><i/></div></div>
    </div>
    <style>{`
      .koru-app{margin-top:92px;padding:32px;border:1px solid rgba(255,255,255,.07);border-radius:26px;background:linear-gradient(145deg,#0e0f15,#090a0e)}.koru-app-head{display:flex;align-items:end;justify-content:space-between;gap:30px;margin-bottom:28px}.koru-app-head h2{margin:0;font-family:Georgia,serif;font-size:clamp(2.5rem,5vw,5rem);font-weight:500;letter-spacing:-.05em}.koru-app-head>p{max-width:530px;margin:0;color:#8c8790;font-size:12px;line-height:1.65}.koru-app-grid{display:grid;grid-template-columns:1.1fr .75fr .75fr;gap:14px;align-items:stretch}.koru-phone-stage,.koru-app-card,.koru-tcg-context{min-height:520px;border:1px solid rgba(255,255,255,.07);border-radius:20px;background:#090a0f}.koru-phone-stage{display:grid;place-items:center;overflow:hidden}.koru-phone-stage .phone-frame{transform:scale(.78);margin:-65px 0}.koru-app-card{position:relative;overflow:hidden}.koru-app-card>img{position:absolute;inset:0;width:100%;height:62%;object-fit:cover;filter:saturate(.46) contrast(.8) brightness(.66) sepia(.06)}.koru-app-card:after{content:'';position:absolute;inset:32% 0 0;background:linear-gradient(180deg,transparent,#090a0f 36%)}.koru-app-card>div{position:absolute;z-index:2;left:20px;right:20px;bottom:20px}.koru-app-card small,.koru-tcg-context small{color:#9a7da8;font-size:7px;font-weight:900;letter-spacing:.15em}.koru-app-card strong{display:block;margin-top:8px;font-family:Georgia,serif;font-size:22px;font-weight:500}.koru-app-card p{margin:6px 0 18px;color:#9a949b;font-size:11px}.koru-app-card span{display:block;padding:9px 10px;border:1px solid rgba(255,255,255,.07);border-radius:9px;color:#747078;font-size:6px;letter-spacing:.09em;background:rgba(255,255,255,.02)}.koru-tcg-context{position:relative;padding:24px;overflow:hidden}.koru-tcg-context strong{display:block;margin-top:10px;font-family:Georgia,serif;font-size:28px;font-weight:500;line-height:1.05;color:#ddd6d1}.koru-tcg-context p{color:#8c878e;font-size:11px;line-height:1.6}.mini-card-stack{position:absolute;left:24px;right:24px;bottom:25px;height:210px}.mini-card-stack i{position:absolute;left:50%;bottom:0;width:124px;height:176px;border:1px solid rgba(205,186,164,.34);border-radius:10px;background:linear-gradient(145deg,#988675 0 5%,#171923 6% 94%,#8b718f 95%);box-shadow:0 14px 35px rgba(0,0,0,.35)}.mini-card-stack i:after{content:'FATEDROP';position:absolute;inset:12px;border:1px solid rgba(255,255,255,.08);display:grid;place-items:center;color:#8c7699;font-size:7px;letter-spacing:.15em}.mini-card-stack i:nth-child(1){transform:translateX(-76%) rotate(-12deg)}.mini-card-stack i:nth-child(2){z-index:2;transform:translateX(-50%) rotate(0deg)}.mini-card-stack i:nth-child(3){transform:translateX(-24%) rotate(12deg)}@media(max-width:980px){.koru-app-grid{grid-template-columns:1fr 1fr}.koru-phone-stage{grid-column:1/-1}.koru-app-head{align-items:flex-start;flex-direction:column}}@media(max-width:620px){.koru-app{width:calc(100% - 24px);padding:20px}.koru-app-grid{grid-template-columns:1fr}.koru-phone-stage{grid-column:auto}.koru-app-card,.koru-tcg-context{min-height:460px}}
    `}</style>
  </section>;
}

export function KoruFriendsHomeTeaser() {
  return <section className="koru-friends-home section-shell">
    <div className="koru-friends-image"><img src={KORU_MERCH.universe} alt="Koru and Friends FateDrop character universe"/></div>
    <div className="koru-friends-copy"><p className="eyebrow"><span/>Koru &amp; Friends</p><h2>The network has a face now.</h2><p>Koru remains the lead mascot. Friends expand FateDrop into original community artwork, supporter apparel and future collectibles without becoming separate TCG mascots.</p><div className="button-row"><Link className="button button-secondary" href="/merch">Explore Koru &amp; Friends</Link><Link className="text-link" href="/dashboard/avatar">Meet Koru <span>→</span></Link></div></div>
    <style>{`
      .koru-friends-home{margin-top:92px;display:grid;grid-template-columns:1.15fr .85fr;overflow:hidden;border:1px solid rgba(255,255,255,.07);border-radius:24px;background:#0b0c11}.koru-friends-image{position:relative;min-height:400px;overflow:hidden}.koru-friends-image img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.52) contrast(.84) brightness(.7) sepia(.08)}.koru-friends-image:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 55%,#0b0c11),linear-gradient(180deg,rgba(8,9,13,.05),rgba(8,9,13,.45))}.koru-friends-copy{align-self:center;padding:34px 42px 34px 20px}.koru-friends-copy h2{margin:0;font-family:Georgia,serif;font-size:clamp(2.4rem,4.5vw,4.6rem);font-weight:500;line-height:.96;letter-spacing:-.05em}.koru-friends-copy>p:not(.eyebrow){color:#8d878e;font-size:12px;line-height:1.65;margin:18px 0 25px}@media(max-width:850px){.koru-friends-home{grid-template-columns:1fr}.koru-friends-image{min-height:340px}.koru-friends-image:after{background:linear-gradient(180deg,transparent 60%,#0b0c11)}.koru-friends-copy{padding:28px}}
    `}</style>
  </section>;
}
