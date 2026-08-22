/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { InteractivePhoneDemo } from "@/components/interactive-phone-demo";
import { siteConfig } from "@/lib/site-data";

const coreFeatures = siteConfig.features.slice(0, 4);
const lifecycle = [
  ["01", "Whisper", "Product or catalogue movement. Something may be coming."],
  ["02", "Echo", "Queue, traffic or security conditions changed. Get ready."],
  ["03", "Manifested", "Confirmed purchasable stock is live."],
  ["04", "Vanished", "Previously confirmed availability is gone."],
] as const;

const retailers = ["Pokémon Center UK", "Titan Cards", "Total Cards", "Zatu Games", "Eterna Collectibles", "Gathering Games", "Caro Collective", "Jet Cards"] as const;

export function FateDropValueSection() {
  return (
    <section className="fd-value section-shell" id="what-fatedrop-does" aria-labelledby="fd-value-title">
      <div className="fd-value-intro">
        <div>
          <p className="fd-kicker">WHAT FATEDROP DOES</p>
          <h2 id="fd-value-title">One network between you and the drop.</h2>
          <p className="fd-value-lede">Stop checking dozens of shops, guessing whether an alert matters or wondering whether the price is actually good. FateDrop watches participating retailers, adds evidence and price context, and helps you decide when — and where — to act.</p>
        </div>
        <aside><small>THE SIMPLE VERSION</small><strong>FateDrop does the work before checkout.</strong><span>You still buy directly from the retailer.</span></aside>
      </div>

      <div className="fd-value-grid">
        {coreFeatures.map((feature, index) => (
          <article className={`fd-value-card fd-value-${index + 1}`} key={feature.number}>
            <div className="fd-value-card-head"><span>{feature.number}</span><small>CORE USP</small></div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>

            {index === 0 ? (
              <div className="fd-lifecycle" aria-label="FateDrop signal lifecycle">
                {lifecycle.map(([number, state, copy], stageIndex) => (
                  <div key={state} data-state={state.toLowerCase()}>
                    <span>{number}</span><i>◇</i><strong>{state}</strong><small>{copy}</small>{stageIndex < lifecycle.length - 1 ? <b aria-hidden="true">→</b> : null}
                  </div>
                ))}
              </div>
            ) : null}

            {index === 1 ? (
              <div className="fd-price-proof" aria-label="True Price explanation">
                <div><small>OFFICIAL RRP</small><strong>Reference</strong></div><i>+</i>
                <div><small>OBSERVED OFFER</small><strong>Retail price</strong></div><i>+</i>
                <div><small>KNOWN DELIVERY</small><strong>Mandatory cost</strong></div><b>→</b>
                <div className="result"><small>TRUE PRICE</small><strong>£ + % context</strong></div>
              </div>
            ) : null}

            {index === 2 ? (
              <div className="fd-find-proof" aria-label="FateFind to FateMatch journey">
                <div><small>YOU CREATE</small><strong>FateFind</strong><span>Product + limits</span></div><i>→</i>
                <div><small>NETWORK</small><strong>Evaluates offers</strong><span>Evidence + criteria</span></div><i>→</i>
                <div className="match"><small>QUALIFIES</small><strong>FateMatch</strong><span>Open the retailer</span></div>
              </div>
            ) : null}

            {index === 3 ? (
              <div className="fd-retailer-proof" aria-label="Participating retailer discovery">
                <div className="fd-retailer-tags">{retailers.map((name) => <span key={name}>{name}</span>)}</div>
                <strong>Discover through FateDrop <i>→</i> buy direct from the store.</strong>
              </div>
            ) : null}

            <footer><span>{feature.meta}</span></footer>
          </article>
        ))}
      </div>

      <div className="fd-value-actions">
        <div><small>WANT TO SEE THE JOURNEY?</small><strong>Search → context → signal → retailer.</strong></div>
        <div className="button-row"><Link className="button button-primary" href="/demo">Try the interactive demo <span>↗</span></Link><Link className="button button-secondary" href="/collectors">Explore collector tools</Link></div>
      </div>
      <HomeStyles />
    </section>
  );
}

export function KoruFriendsMerchSection() {
  return (
    <section className="kf-merch section-shell" aria-labelledby="kf-merch-title">
      <Link className="kf-merch-card" href="/merch" aria-label="Explore Koru and Friends merchandise">
        <img src="/assets/home/koru-home-section.png" alt="Koru and Friends in the FateDrop world" />
        <div className="kf-merch-shade" aria-hidden="true" />
        <div className="kf-merch-copy">
          <p>KORU &amp; FRIENDS · THE WORLD AROUND FATEDROP</p>
          <h2 id="kf-merch-title">The signal has a world of its own.</h2>
          <span>Meet the characters behind FateDrop&apos;s voice, artwork, apparel and supporter culture.</span>
          <b>Explore Koru &amp; Friends <i>→</i></b>
        </div>
      </Link>
    </section>
  );
}

export function IndieBridgeSection() {
  return (
    <section className="fd-bridge section-shell" aria-labelledby="fd-bridge-title">
      <div className="fd-bridge-copy">
        <p className="fd-kicker">THE COLLECTOR ↔ RETAILER BRIDGE</p>
        <h2 id="fd-bridge-title">Collectors need discovery. Indies need visibility.</h2>
        <p>FateDrop sits between those two problems. We help collectors find relevant stock without forcing retailers into a marketplace, and we help independent businesses become visible without asking them to surrender the customer relationship.</p>
        <div className="button-row"><Link className="button button-primary" href="/businesses">For independent retailers <span>↗</span></Link><Link className="button button-secondary" href="/collectors">For collectors</Link></div>
      </div>
      <div className="fd-bridge-visual" aria-label="Collector to FateDrop to independent retailer journey">
        <article><small>01 · COLLECTOR</small><strong>I know what I want.</strong><p>Search, wishlist or create a FateFind.</p></article>
        <i>→</i>
        <article className="network"><small>02 · FATEDROP</small><strong>We find the useful evidence.</strong><p>Signals, FateMatches and True Price context.</p></article>
        <i>→</i>
        <article><small>03 · RETAILER</small><strong>The sale stays theirs.</strong><p>Product page, checkout, fulfilment and service.</p></article>
      </div>
    </section>
  );
}

export function EventsHomeLink() {
  return (
    <section className="fd-events-link section-shell">
      <div><p className="fd-kicker">FATE ENCOUNTERS</p><h2>The network should lead somewhere real.</h2><p>Discover source-backed UK card shows, venues and participating vendors without turning an event listing into an invented stock claim.</p></div>
      <Link href="/events">Explore UK events <span>→</span></Link>
    </section>
  );
}

export function MembershipConversionSection() {
  return (
    <section className="fd-membership section-shell" aria-labelledby="fd-membership-title">
      <div className="fd-membership-copy">
        <p className="fd-kicker">FATEDROP PLUS</p>
        <h2 id="fd-membership-title">Browse the network for free. Unlock the intelligence when you need it.</h2>
        <p>A free FateDrop ID keeps discovery open. FateDrop Plus is where the deeper signal layer lives: lifecycle alert detail, FateFind → FateMatch, True Price context and premium network alerts as each channel is enabled.</p>
        <div className="button-row"><Link className="button button-primary" href="/subscriptions#collectors">See collector membership <span>↗</span></Link><Link className="button button-secondary" href="/demo">Try the demo first</Link></div>
      </div>
      <div className="fd-membership-card">
        <small>THE STARTING PREMIUM TIER</small>
        <div><strong>£4.99</strong><span>/ month</span></div>
        <ul><li>Premium signal detail</li><li>Whisper · Echo · Manifested · Vanished</li><li>FateFind hunts + FateMatch results</li><li>True Price context</li><li>Premium Discord entitlement when enabled</li></ul>
        <Link href="/subscriptions#collectors">See exactly what&apos;s included <span>→</span></Link>
      </div>
    </section>
  );
}

export function FateDropDemoSection() {
  return (
    <section className="fd-demo section-shell" id="interactive-demo" aria-labelledby="fd-demo-title">
      <div className="fd-demo-copy">
        <p className="fd-kicker">INTERACTIVE PRODUCT DEMO</p>
        <h2 id="fd-demo-title">See the journey before you subscribe.</h2>
        <p>Use the phone to move through FateDrop&apos;s current product surfaces. The point is not a fake checkout — it is to show how search, retailer discovery, price context, alerts and account tools fit together before the collector leaves FateDrop to buy.</p>
        <div className="fd-demo-flow"><span><b>01</b> Search the network</span><span><b>02</b> Inspect price context</span><span><b>03</b> Follow signals</span><span><b>04</b> Continue to retailer</span></div>
        <div className="button-row"><Link className="button button-primary" href="/join?type=collector">Join the collector beta <span>↗</span></Link><Link className="button button-secondary" href="/subscriptions#collectors">See membership</Link></div>
      </div>
      <div className="fd-demo-stage"><div className="fd-demo-aura" aria-hidden="true" /><InteractivePhoneDemo /></div>
      <HomeStyles />
    </section>
  );
}

function HomeStyles() {
  return <style>{`
    .fd-value,.kf-merch,.fd-bridge,.fd-events-link,.fd-membership,.fd-demo{width:min(1560px,calc(100% - 32px));margin-inline:auto}
    .fd-kicker{margin:0 0 14px;color:#b795c2;font-size:8px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .fd-value h2,.kf-merch h2,.fd-bridge h2,.fd-events-link h2,.fd-membership h2,.fd-demo h2{margin:0;color:#f3e9e3;font-family:Georgia,'Times New Roman',serif;font-weight:500;line-height:.95;letter-spacing:-.052em}

    .fd-value{margin-top:18px;padding:clamp(28px,4vw,58px);border:1px solid rgba(216,201,216,.13);border-radius:24px;background:radial-gradient(circle at 82% 0%,rgba(130,92,147,.12),transparent 25%),linear-gradient(180deg,#0d1118,#080b10);box-shadow:0 26px 80px rgba(0,0,0,.2)}
    .fd-value-intro{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(290px,.55fr);gap:50px;align-items:end}.fd-value-intro h2{max-width:900px;font-size:clamp(3rem,5.5vw,6rem)}.fd-value-lede{max-width:850px;margin:24px 0 0;color:#a39ba1;font-size:15px;line-height:1.76}.fd-value-intro aside{padding:24px;border:1px solid rgba(204,177,211,.14);border-radius:18px;background:rgba(9,11,16,.7);display:grid;gap:7px}.fd-value-intro aside small{color:#806b84;font-size:7px;font-weight:900;letter-spacing:.15em}.fd-value-intro aside strong{color:#e6dcd7;font-family:Georgia,serif;font-size:24px;font-weight:500;line-height:1.06}.fd-value-intro aside span{color:#827c82;font-size:10px;line-height:1.5}
    .fd-value-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:42px}.fd-value-card{position:relative;min-height:430px;padding:34px;overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:22px;background:radial-gradient(circle at 92% 4%,rgba(126,91,144,.12),transparent 31%),linear-gradient(145deg,#10131a,#090b10)}.fd-value-card:after{content:'';position:absolute;right:-90px;bottom:-100px;width:260px;height:260px;border:1px solid rgba(181,146,190,.08);border-radius:42% 58% 48% 52%;transform:rotate(20deg)}.fd-value-card-head{display:flex;align-items:center;justify-content:space-between}.fd-value-card-head>span{color:#806b84;font-family:Georgia,serif;font-size:28px}.fd-value-card-head small{color:#5f5963;font-size:7px;font-weight:900;letter-spacing:.14em}.fd-value-card h3{margin:36px 0 14px;color:#e8dfd9;font-family:Georgia,serif;font-size:clamp(2rem,3vw,3.7rem);font-weight:500;line-height:.98;letter-spacing:-.04em}.fd-value-card>p{max-width:670px;margin:0;color:#918a91;font-size:12px;line-height:1.72}.fd-value-card footer{position:absolute;left:34px;bottom:25px;color:#5f5963;font-size:7px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}
    .fd-lifecycle{position:relative;z-index:2;display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:28px}.fd-lifecycle>div{position:relative;min-height:132px;padding:14px;border:1px solid rgba(255,255,255,.06);border-radius:14px;background:rgba(255,255,255,.018);display:grid;grid-template-columns:auto 1fr;gap:6px 9px;align-content:start}.fd-lifecycle>div>span{color:#5d5760;font-size:7px;font-weight:900}.fd-lifecycle i{color:#aa83b8;font-style:normal}.fd-lifecycle strong{grid-column:1/-1;color:#ded6d1;font-size:9px;letter-spacing:.06em;text-transform:uppercase}.fd-lifecycle small{grid-column:1/-1;color:#78727a;font-size:8px;line-height:1.5}.fd-lifecycle b{position:absolute;right:-8px;top:50%;z-index:3;color:#65536c;font-weight:400}.fd-lifecycle [data-state='echo'] i{color:#79a4bf}.fd-lifecycle [data-state='manifested'] i{color:#91a97f}.fd-lifecycle [data-state='vanished'] i{color:#b9a98e}
    .fd-price-proof{position:relative;z-index:2;display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1.15fr;gap:9px;align-items:center;margin-top:34px}.fd-price-proof>div{min-height:92px;padding:14px;border:1px solid rgba(255,255,255,.06);border-radius:13px;background:rgba(255,255,255,.018);display:flex;flex-direction:column;justify-content:flex-end}.fd-price-proof small{color:#6d6670;font-size:6px;font-weight:900;letter-spacing:.1em}.fd-price-proof strong{margin-top:6px;color:#cdc4c0;font-size:11px;font-weight:700}.fd-price-proof>i,.fd-price-proof>b{color:#65566b;font-style:normal;font-weight:500}.fd-price-proof .result{border-color:rgba(181,145,193,.2);background:rgba(113,79,126,.08)}.fd-price-proof .result small{color:#a88ab0}.fd-price-proof .result strong{color:#e6dce4}
    .fd-find-proof{position:relative;z-index:2;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:10px;align-items:center;margin-top:34px}.fd-find-proof>div{min-height:112px;padding:16px;border:1px solid rgba(255,255,255,.06);border-radius:14px;background:rgba(255,255,255,.018);display:flex;flex-direction:column;justify-content:flex-end}.fd-find-proof small{color:#6a626c;font-size:6px;font-weight:900;letter-spacing:.1em}.fd-find-proof strong{margin-top:6px;color:#ddd3ce;font-family:Georgia,serif;font-size:20px;font-weight:500}.fd-find-proof span{margin-top:4px;color:#78727a;font-size:8px}.fd-find-proof>i{color:#65566b;font-style:normal}.fd-find-proof .match{border-color:rgba(177,139,190,.2);background:rgba(112,78,126,.09)}.fd-find-proof .match small{color:#aa8ab3}.fd-retailer-proof{position:relative;z-index:2;margin-top:30px}.fd-retailer-tags{display:flex;flex-wrap:wrap;gap:8px}.fd-retailer-tags span{padding:8px 10px;border:1px solid rgba(255,255,255,.06);border-radius:999px;background:rgba(255,255,255,.02);color:#999197;font-size:8px}.fd-retailer-proof>strong{display:block;margin-top:19px;color:#cdbfd0;font-size:10px;font-weight:700;letter-spacing:.04em}.fd-retailer-proof i{color:#9c7ca7;font-style:normal}
    .fd-value-actions{margin-top:14px;padding:20px 22px;display:flex;align-items:center;justify-content:space-between;gap:24px;border:1px solid rgba(255,255,255,.06);border-radius:16px;background:#090c11}.fd-value-actions>div:first-child{display:grid;gap:4px}.fd-value-actions small{color:#756a77;font-size:7px;font-weight:900;letter-spacing:.12em}.fd-value-actions strong{color:#d8cfca;font-family:Georgia,serif;font-size:18px;font-weight:500}

    .kf-merch{margin-top:22px}.kf-merch-card{position:relative;display:block;min-height:clamp(430px,39vw,650px);overflow:hidden;border:1px solid rgba(216,201,216,.14);border-radius:24px;background:#0b0d13;color:inherit;text-decoration:none;box-shadow:0 28px 90px rgba(0,0,0,.2)}.kf-merch-card>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.68) contrast(.92) brightness(.8);transition:transform .7s cubic-bezier(.2,.7,.2,1),filter .7s ease}.kf-merch-card:hover>img{transform:scale(1.018);filter:saturate(.74) contrast(.94) brightness(.84)}.kf-merch-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,9,14,.91) 0%,rgba(7,9,14,.7) 31%,rgba(7,9,14,.24) 56%,rgba(7,9,14,.08) 100%),linear-gradient(180deg,rgba(4,6,10,.04),rgba(4,6,10,.38))}.kf-merch-copy{position:absolute;z-index:2;left:clamp(28px,4.7vw,76px);bottom:clamp(30px,5vw,72px);max-width:620px}.kf-merch-copy p{margin:0 0 14px;color:#b796c3;font-size:8px;font-weight:900;letter-spacing:.18em}.kf-merch-copy h2{max-width:590px;font-size:clamp(3rem,5.4vw,6rem)}.kf-merch-copy>span{display:block;max-width:520px;margin-top:18px;color:rgba(239,229,226,.76);font-size:13px;line-height:1.68}.kf-merch-copy>b{display:inline-flex;gap:10px;align-items:center;margin-top:24px;color:#d0accf;font-size:9px;letter-spacing:.09em;text-transform:uppercase}.kf-merch-copy i{font-style:normal}

    .fd-bridge{margin-top:92px;display:grid;grid-template-columns:.82fr 1.18fr;gap:16px}.fd-bridge-copy,.fd-bridge-visual{border:1px solid rgba(255,255,255,.075);border-radius:24px;background:#0a0c11}.fd-bridge-copy{padding:clamp(34px,4.7vw,68px);display:flex;flex-direction:column;justify-content:center}.fd-bridge-copy h2{font-size:clamp(3rem,4.8vw,5.2rem)}.fd-bridge-copy>p:not(.fd-kicker){margin:24px 0 30px;color:#918a91;font-size:13px;line-height:1.76}.fd-bridge-visual{min-height:470px;padding:30px;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:14px;align-items:center;background:radial-gradient(circle at 50% 50%,rgba(115,86,130,.16),transparent 32%),#090b10}.fd-bridge-visual>i{color:#6d5976;font-style:normal}.fd-bridge-visual article{min-height:230px;padding:22px 18px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid rgba(255,255,255,.065);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.018),rgba(255,255,255,.006))}.fd-bridge-visual article.network{border-color:rgba(170,133,184,.18);background:linear-gradient(180deg,rgba(115,83,133,.11),rgba(255,255,255,.008))}.fd-bridge-visual small{color:#8d728e;font-size:6px;font-weight:900;letter-spacing:.13em}.fd-bridge-visual strong{margin-top:12px;color:#ded5d0;font-family:Georgia,serif;font-size:24px;font-weight:500;line-height:1.05}.fd-bridge-visual p{margin:10px 0 0;color:#79747b;font-size:9px;line-height:1.55}
    .fd-events-link{margin-top:18px;padding:34px 38px;display:flex;align-items:center;justify-content:space-between;gap:30px;border:1px solid rgba(255,255,255,.07);border-radius:20px;background:radial-gradient(circle at 86% 20%,rgba(105,93,131,.12),transparent 24%),#0a0c11}.fd-events-link h2{font-size:clamp(2rem,3vw,3.4rem)}.fd-events-link div>p:not(.fd-kicker){max-width:760px;margin:12px 0 0;color:#817c83;font-size:10px;line-height:1.65}.fd-events-link>a{flex:0 0 auto;color:#b796c3;font-size:9px;font-weight:800;letter-spacing:.08em;text-decoration:none}

    .fd-membership{margin-top:18px;margin-bottom:90px;padding:clamp(32px,4.8vw,70px);display:grid;grid-template-columns:1.22fr .78fr;gap:40px;align-items:center;border:1px solid rgba(198,172,205,.13);border-radius:26px;background:radial-gradient(circle at 84% 18%,rgba(139,93,159,.16),transparent 28%),linear-gradient(145deg,#11131a,#090b10)}.fd-membership-copy h2{max-width:920px;font-size:clamp(3rem,5vw,5.5rem)}.fd-membership-copy>p:not(.fd-kicker){max-width:810px;margin:24px 0 30px;color:#9a9299;font-size:13px;line-height:1.75}.fd-membership-card{padding:30px;border:1px solid rgba(195,157,207,.17);border-radius:20px;background:rgba(10,10,15,.7);box-shadow:0 22px 70px rgba(0,0,0,.18)}.fd-membership-card>small{color:#a185a9;font-size:7px;font-weight:900;letter-spacing:.14em}.fd-membership-card>div{margin:18px 0 20px;display:flex;align-items:flex-end;gap:8px}.fd-membership-card>div strong{color:#f0e6e1;font-family:Georgia,serif;font-size:58px;font-weight:500;letter-spacing:-.05em}.fd-membership-card>div span{padding-bottom:9px;color:#807980;font-size:11px}.fd-membership-card ul{margin:0;padding:0;list-style:none;display:grid;gap:10px}.fd-membership-card li{padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.05);color:#a59ca2;font-size:10px}.fd-membership-card>a{display:inline-flex;margin-top:22px;color:#c4a2ca;font-size:9px;font-weight:800;letter-spacing:.07em;text-decoration:none}

    .fd-demo{margin-top:34px;margin-bottom:90px;padding:clamp(30px,4vw,56px);display:grid;grid-template-columns:minmax(0,.9fr) minmax(430px,1.1fr);gap:40px;align-items:center;overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:26px;background:linear-gradient(145deg,#0d0f15,#080a0f)}.fd-demo-copy h2{font-size:clamp(3rem,5vw,5.5rem)}.fd-demo-copy>p:not(.fd-kicker){margin:24px 0;color:#938c92;font-size:13px;line-height:1.75}.fd-demo-flow{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:26px 0 30px}.fd-demo-flow span{display:flex;gap:10px;padding:12px;border:1px solid rgba(255,255,255,.055);border-radius:11px;background:rgba(255,255,255,.015);color:#b6adb1;font-size:9px}.fd-demo-flow b{color:#816c87;font-size:8px}.fd-demo-stage{position:relative;min-height:650px;display:grid;place-items:center;overflow:hidden}.fd-demo-aura{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(128,95,148,.22),rgba(84,89,113,.08) 40%,transparent 68%);filter:blur(8px)}.fd-demo-stage .phone-frame{position:relative;z-index:2;transform:scale(.9);margin:-28px 0}

    @media(max-width:1080px){.fd-value-intro{grid-template-columns:1fr}.fd-value-intro aside{max-width:620px}.fd-lifecycle{grid-template-columns:1fr 1fr}.fd-lifecycle>div:nth-child(2) b{display:none}.fd-price-proof{grid-template-columns:1fr 1fr}.fd-price-proof>i,.fd-price-proof>b{display:none}.fd-find-proof{grid-template-columns:1fr}.fd-find-proof>i{transform:rotate(90deg);justify-self:center}.fd-bridge,.fd-membership,.fd-demo{grid-template-columns:1fr}.fd-bridge-visual{min-height:380px}.fd-demo-stage{min-height:580px}}
    @media(max-width:720px){.fd-value,.kf-merch,.fd-bridge,.fd-events-link,.fd-membership,.fd-demo{width:calc(100% - 18px)}.fd-value{padding:26px 18px;border-radius:18px}.fd-value-intro h2{font-size:clamp(2.7rem,12vw,4rem)}.fd-value-lede{font-size:12px}.fd-value-grid{grid-template-columns:1fr;margin-top:28px}.fd-value-card{min-height:auto;padding:24px 20px 64px}.fd-value-card h3{margin-top:28px;font-size:2.45rem}.fd-value-card footer{left:20px}.fd-lifecycle{grid-template-columns:1fr}.fd-lifecycle b{display:none}.fd-price-proof{grid-template-columns:1fr 1fr}.fd-find-proof{grid-template-columns:1fr}.fd-value-actions{align-items:flex-start;flex-direction:column}.kf-merch{margin-top:16px}.kf-merch-card{min-height:540px;border-radius:18px}.kf-merch-card>img{object-position:62% center}.kf-merch-shade{background:linear-gradient(180deg,rgba(7,9,14,.08) 0%,rgba(7,9,14,.14) 40%,rgba(7,9,14,.88) 78%,rgba(7,9,14,.96) 100%)}.kf-merch-copy{left:24px;right:24px;bottom:28px}.kf-merch-copy h2{font-size:clamp(2.65rem,11vw,4rem)}.fd-bridge{margin-top:72px}.fd-bridge-copy{padding:30px 22px}.fd-bridge-copy h2{font-size:clamp(2.65rem,11vw,4rem)}.fd-bridge-visual{grid-template-columns:1fr;padding:18px}.fd-bridge-visual>i{transform:rotate(90deg);justify-self:center}.fd-bridge-visual article{min-height:140px}.fd-events-link{padding:26px 22px;align-items:flex-start;flex-direction:column}.fd-membership{padding:28px 22px;margin-bottom:64px}.fd-membership-copy h2{font-size:clamp(2.65rem,11vw,4rem)}.fd-membership-card>div strong{font-size:48px}.fd-demo{padding:26px 18px;border-radius:20px}.fd-demo-copy h2{font-size:clamp(2.65rem,11vw,4rem)}.fd-demo-flow{grid-template-columns:1fr}.fd-demo-stage{min-height:530px}.fd-demo-stage .phone-frame{transform:scale(.72);margin:-74px 0}}
  `}</style>;
}
