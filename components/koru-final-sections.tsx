/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { InteractivePhoneDemo } from "@/components/interactive-phone-demo";
import { siteConfig } from "@/lib/site-data";

const coreFeatures = siteConfig.features.slice(0, 4);

export function KoruFriendsMerchSection() {
  return (
    <section className="kf-merch section-shell" aria-labelledby="kf-merch-title">
      <Link className="kf-merch-card" href="/merch" aria-label="Explore Koru and Friends merchandise">
        <img src="/assets/home/koru-home-section.png" alt="Koru and Friends in the FateDrop world" />
        <div className="kf-merch-shade" aria-hidden="true" />
        <div className="kf-merch-copy">
          <p>KORU &amp; FRIENDS · THE WORLD AROUND FATEDROP</p>
          <h2 id="kf-merch-title">The signal has a world of its own.</h2>
          <span>Original artwork, apparel and supporter pieces built around FateDrop&apos;s own characters.</span>
          <b>Explore Koru &amp; Friends <i>→</i></b>
        </div>
      </Link>
      <HomeStyles />
    </section>
  );
}

export function FateDropPillars() {
  return (
    <section className="fd-pillars section-shell" aria-labelledby="fd-pillars-title">
      <div className="fd-section-head">
        <p className="eyebrow"><span />What FateDrop brings to the table</p>
        <h2 id="fd-pillars-title">Less noise. Better context. A clearer route to the card.</h2>
        <p>FateDrop is the intelligence and discovery layer between collector demand and the businesses already holding the stock—not another shop trying to own the checkout.</p>
      </div>
      <div className="fd-pillar-grid">
        {coreFeatures.map((feature) => (
          <article key={feature.number}>
            <div className="fd-pillar-top"><span>{feature.number}</span><small>{feature.title.toUpperCase()}</small></div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <b>{feature.meta}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FateDropPhoneSection() {
  return (
    <section className="fd-phone section-shell" aria-labelledby="fd-phone-title">
      <div className="fd-phone-copy">
        <p className="eyebrow"><span />Try the product</p>
        <h2 id="fd-phone-title">The useful part stays simple.</h2>
        <p>Search the network, inspect retailer options, understand True Price and follow the same signal language across alerts. The website, app and Discord are different surfaces for the same intelligence—not three different products.</p>
        <div className="fd-phone-points">
          <span><b>01</b> Search participating catalogues</span>
          <span><b>02</b> Compare price and RRP context</span>
          <span><b>03</b> Create a FateFind and act when it becomes a FateMatch</span>
          <span><b>04</b> Continue directly to the retailer</span>
        </div>
        <Link className="button button-primary" href="/collectors">Explore collector tools <span>↗</span></Link>
      </div>
      <div className="fd-phone-stage"><div className="fd-phone-aura" aria-hidden="true" /><InteractivePhoneDemo /></div>
    </section>
  );
}

export function IndieBridgeSection() {
  return (
    <section className="fd-bridge section-shell" aria-labelledby="fd-bridge-title">
      <div className="fd-bridge-visual" aria-label="Collector to FateDrop to independent retailer journey">
        <article><small>COLLECTOR</small><strong>I know what I want.</strong><p>Search, wishlist or FateFind intent.</p></article>
        <i>→</i>
        <article className="network"><small>FATEDROP</small><strong>We find the useful evidence.</strong><p>Signals, qualifying FateMatches and True Price context.</p></article>
        <i>→</i>
        <article><small>INDEPENDENT RETAILER</small><strong>The sale stays yours.</strong><p>Brand, product page, checkout and service.</p></article>
      </div>
      <div className="fd-bridge-copy">
        <p className="eyebrow"><span />The bridge we are building</p>
        <h2 id="fd-bridge-title">Collectors need discovery. Indies need visibility.</h2>
        <p>FateDrop sits between those two problems. We help collectors find relevant stock without forcing retailers into a marketplace, and we help independent businesses become visible without asking them to surrender the customer relationship.</p>
        <div className="button-row"><Link className="button button-primary" href="/businesses">For independent retailers <span>↗</span></Link><Link className="button button-secondary" href="/collectors">For collectors</Link></div>
      </div>
    </section>
  );
}

export function EventsHomeLink() {
  return (
    <section className="fd-events-link section-shell">
      <div><p className="eyebrow"><span />Fate Encounters</p><h2>The network should lead somewhere real.</h2><p>Discover source-backed UK card shows, venues and participating vendors without turning an event listing into an invented stock claim.</p></div>
      <Link href="/events">Explore UK events <span>→</span></Link>
    </section>
  );
}

function HomeStyles() {
  return <style>{`
    .kf-merch{margin-top:18px}.kf-merch-card{position:relative;display:block;min-height:clamp(360px,38vw,610px);overflow:hidden;border:1px solid rgba(216,201,216,.14);border-radius:24px;background:#0b0d13;color:inherit;text-decoration:none;box-shadow:0 28px 90px rgba(0,0,0,.2)}.kf-merch-card>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.68) contrast(.92) brightness(.8);transition:transform .7s cubic-bezier(.2,.7,.2,1),filter .7s ease}.kf-merch-card:hover>img{transform:scale(1.018);filter:saturate(.74) contrast(.94) brightness(.84)}.kf-merch-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,9,14,.91) 0%,rgba(7,9,14,.7) 31%,rgba(7,9,14,.24) 56%,rgba(7,9,14,.08) 100%),linear-gradient(180deg,rgba(4,6,10,.04),rgba(4,6,10,.38))}.kf-merch-copy{position:absolute;z-index:2;left:clamp(28px,4.7vw,76px);bottom:clamp(30px,5vw,72px);max-width:590px}.kf-merch-copy p{margin:0 0 14px;color:#b796c3;font-size:8px;font-weight:900;letter-spacing:.18em}.kf-merch-copy h2,.fd-section-head h2,.fd-phone-copy h2,.fd-bridge-copy h2,.fd-events-link h2{margin:0;color:#f1e8e2;font-family:Georgia,'Times New Roman',serif;font-weight:500;line-height:.95;letter-spacing:-.052em}.kf-merch-copy h2{max-width:560px;font-size:clamp(2.7rem,5vw,5.6rem)}.kf-merch-copy>span{display:block;max-width:500px;margin-top:18px;color:rgba(239,229,226,.76);font-size:13px;line-height:1.68}.kf-merch-copy>b{display:inline-flex;gap:10px;align-items:center;margin-top:24px;color:#d0accf;font-size:9px;letter-spacing:.09em;text-transform:uppercase}.kf-merch-copy i{font-style:normal}
    .fd-pillars{margin-top:96px}.fd-section-head{max-width:920px}.fd-section-head h2{max-width:900px;font-size:clamp(2.7rem,5vw,5.4rem)}.fd-section-head>p:not(.eyebrow){max-width:760px;margin:22px 0 0;color:#918a91;font-size:13px;line-height:1.75}.fd-pillar-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:38px}.fd-pillar-grid article{position:relative;min-height:290px;padding:30px;overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:20px;background:radial-gradient(circle at 90% 5%,rgba(137,104,152,.1),transparent 34%),linear-gradient(145deg,#0e1016,#090b10)}.fd-pillar-grid article:after{content:'';position:absolute;right:-58px;bottom:-70px;width:180px;height:180px;border:1px solid rgba(179,143,190,.1);border-radius:42% 58% 50% 50%;transform:rotate(22deg)}.fd-pillar-top{display:flex;align-items:center;gap:14px}.fd-pillar-top>span{color:#5e5963;font-family:Georgia,serif;font-size:23px}.fd-pillar-top small{color:#a989b5;font-size:7px;font-weight:900;letter-spacing:.14em}.fd-pillar-grid h3{max-width:560px;margin:52px 0 12px;color:#ded7d2;font-family:Georgia,serif;font-size:clamp(1.65rem,2.4vw,2.55rem);font-weight:500;line-height:1.05;letter-spacing:-.035em}.fd-pillar-grid p{max-width:560px;margin:0;color:#8f8990;font-size:11px;line-height:1.7}.fd-pillar-grid b{position:absolute;left:30px;bottom:24px;color:#5f5964;font-size:6px;font-weight:850;letter-spacing:.12em}
    .fd-phone{margin-top:96px;padding:clamp(28px,4vw,54px);display:grid;grid-template-columns:minmax(0,.9fr) minmax(430px,1.1fr);gap:34px;align-items:center;overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:26px;background:linear-gradient(145deg,#0d0f15,#080a0f)}.fd-phone-copy{max-width:660px}.fd-phone-copy h2{font-size:clamp(2.8rem,5vw,5.4rem)}.fd-phone-copy>p:not(.eyebrow){margin:22px 0;color:#938c92;font-size:13px;line-height:1.75}.fd-phone-points{display:grid;gap:9px;margin:26px 0 30px}.fd-phone-points span{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.055);color:#b6adb1;font-size:10px}.fd-phone-points b{color:#816c87;font-size:8px}.fd-phone-stage{position:relative;min-height:610px;display:grid;place-items:center;overflow:hidden}.fd-phone-aura{position:absolute;width:440px;height:440px;border-radius:50%;background:radial-gradient(circle,rgba(128,95,148,.2),rgba(84,89,113,.08) 40%,transparent 68%);filter:blur(8px)}.fd-phone-stage .phone-frame{position:relative;z-index:2;transform:scale(.84);margin:-42px 0}
    .fd-bridge{margin-top:96px;display:grid;grid-template-columns:1.12fr .88fr;gap:16px}.fd-bridge-visual,.fd-bridge-copy{border:1px solid rgba(255,255,255,.075);border-radius:24px;background:#0a0c11}.fd-bridge-visual{min-height:470px;padding:28px;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:14px;align-items:center;background:radial-gradient(circle at 50% 50%,rgba(115,86,130,.16),transparent 32%),#090b10}.fd-bridge-visual>i{color:#6d5976;font-style:normal}.fd-bridge-visual article{min-height:190px;padding:22px 18px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid rgba(255,255,255,.065);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.018),rgba(255,255,255,.006))}.fd-bridge-visual article.network{border-color:rgba(170,133,184,.18);background:linear-gradient(180deg,rgba(115,83,133,.11),rgba(255,255,255,.008))}.fd-bridge-visual small{color:#8d728e;font-size:6px;font-weight:900;letter-spacing:.13em}.fd-bridge-visual strong{margin-top:10px;color:#ded5d0;font-family:Georgia,serif;font-size:21px;font-weight:500;line-height:1.05}.fd-bridge-visual p{margin:9px 0 0;color:#79747b;font-size:9px;line-height:1.55}.fd-bridge-copy{padding:clamp(30px,4.5vw,58px);display:flex;flex-direction:column;justify-content:center}.fd-bridge-copy h2{font-size:clamp(2.6rem,4.6vw,4.8rem)}.fd-bridge-copy>p:not(.eyebrow){margin:22px 0 28px;color:#928b91;font-size:12px;line-height:1.75}
    .fd-events-link{margin-top:18px;padding:32px 36px;display:flex;align-items:center;justify-content:space-between;gap:30px;border:1px solid rgba(255,255,255,.07);border-radius:20px;background:radial-gradient(circle at 86% 20%,rgba(105,93,131,.12),transparent 24%),#0a0c11}.fd-events-link h2{font-size:clamp(1.9rem,3vw,3.2rem)}.fd-events-link div>p:not(.eyebrow){max-width:720px;margin:12px 0 0;color:#817c83;font-size:10px;line-height:1.65}.fd-events-link>a{flex:0 0 auto;color:#b796c3;font-size:9px;font-weight:800;letter-spacing:.08em;text-decoration:none}
    @media(max-width:980px){.fd-phone,.fd-bridge{grid-template-columns:1fr}.fd-phone-stage{min-height:570px}.fd-bridge-visual{min-height:360px}}
    @media(max-width:720px){.kf-merch,.fd-pillars,.fd-phone,.fd-bridge,.fd-events-link{width:calc(100% - 24px)}.kf-merch-card{min-height:510px;border-radius:18px}.kf-merch-card>img{object-position:62% center}.kf-merch-shade{background:linear-gradient(180deg,rgba(7,9,14,.08) 0%,rgba(7,9,14,.14) 40%,rgba(7,9,14,.88) 78%,rgba(7,9,14,.96) 100%)}.kf-merch-copy{left:24px;right:24px;bottom:28px}.kf-merch-copy h2{font-size:clamp(2.45rem,11vw,4rem)}.fd-pillars,.fd-phone,.fd-bridge{margin-top:72px}.fd-pillar-grid{grid-template-columns:1fr}.fd-pillar-grid article{min-height:270px;padding:24px}.fd-pillar-grid h3{margin-top:42px}.fd-pillar-grid b{left:24px}.fd-phone{padding:24px 18px;border-radius:20px}.fd-phone-stage{min-height:520px}.fd-phone-stage .phone-frame{transform:scale(.72);margin:-76px 0}.fd-phone-copy h2{font-size:clamp(2.55rem,12vw,4rem)}.fd-bridge-visual{grid-template-columns:1fr;padding:18px}.fd-bridge-visual>i{transform:rotate(90deg);justify-self:center}.fd-bridge-visual article{min-height:130px}.fd-bridge-copy{padding:28px 22px}.fd-bridge-copy h2{font-size:clamp(2.5rem,11vw,3.9rem)}.fd-events-link{padding:26px 22px;align-items:flex-start;flex-direction:column}}
  `}</style>;
}
