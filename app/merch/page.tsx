/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/page-shell";
import { KORU_MERCH } from "@/lib/koru-brand";

type MerchProduct = {
  name: string;
  line: string;
  description: string;
  status: string;
  sizes: string;
  price: string;
  image?: string;
  accent: "earth" | "ice" | "crimson" | "gold" | "violet" | "cream";
  checkoutHref?: string;
};

const koruProducts: MerchProduct[] = [
  {
    name: "Koru Jersey Tee",
    line: "KORU · SIGNAL GUIDE",
    description: "Washed black oversized tee with the mature landscape artwork and quiet Koru chest mark.",
    status: "Artwork loaded",
    sizes: "S–XXL planned",
    price: "Price set at drop",
    image: KORU_MERCH.hero,
    accent: "earth",
  },
  {
    name: "Aeris Companion Tee",
    line: "AERIS · CALM GUARDIAN",
    description: "Icy crystalline character artwork with a restrained blue signal palette and washed-black base.",
    status: "Artwork ready to load",
    sizes: "S–XXL planned",
    price: "Price set at drop",
    accent: "ice",
  },
  {
    name: "Nyxen Jersey Tee",
    line: "NYXEN · SIGNAL SHADOW",
    description: "Dark crimson crystal artwork for the quieter edge of the Koru & Friends collection.",
    status: "Artwork ready to load",
    sizes: "S–XXL planned",
    price: "Price set at drop",
    accent: "crimson",
  },
  {
    name: "Solix Jersey Tee",
    line: "SOLIX · SIGNAL GUARDIAN",
    description: "Warm gold crystalline artwork built around loyalty, light and the FateDrop signal language.",
    status: "Artwork ready to load",
    sizes: "S–XXL planned",
    price: "Price set at drop",
    accent: "gold",
  },
  {
    name: "Fenn Wanderer Tee",
    line: "FENN · SIGNAL WANDERER",
    description: "The discovery-led character drop. Final individual shirt artwork will be loaded into this slot.",
    status: "Artwork next",
    sizes: "S–XXL planned",
    price: "Price set at drop",
    accent: "violet",
  },
  {
    name: "Oru Wanderer Tee",
    line: "ORU · THE LITTLE WANDERER",
    description: "The odd little soul of the wider FateDrop world. Oru belongs to the Koru & Friends story and merch layer rather than the five selectable app companions.",
    status: "New character · artwork next",
    sizes: "S–XXL planned",
    price: "Price set at drop",
    accent: "cream",
  },
];

const signalProducts: MerchProduct[] = [
  {
    name: "FateDrop Signal Tee",
    line: "CORE SIGNAL COLLECTION",
    description: "Washed black, minimal chest identity and premium signal geometry for the quieter FateDrop look.",
    status: "Limited collection slot",
    sizes: "S–XXL planned",
    price: "Price set at drop",
    image: "/assets/fatedrop-merch-signal.webp",
    accent: "cream",
  },
  {
    name: "Signal Jersey / Limited Edition",
    line: "NUMBERED DROP",
    description: "The more graphic jersey-led FateDrop piece: stronger back artwork, collector-grade presentation and limited-run positioning.",
    status: "Limited collection slot",
    sizes: "S–XXL planned",
    price: "Price set at drop",
    image: "/assets/fatedrop-merch-manifest.webp",
    accent: "violet",
  },
  {
    name: "Signal Snapback",
    line: "WASHED HEADWEAR",
    description: "Washed cotton snapback with embroidered FateDrop emblem, understated side branding and collector-minded detailing.",
    status: "Artwork ready to load",
    sizes: "Adjustable / one size",
    price: "Price set at drop",
    accent: "gold",
  },
];

export const metadata: Metadata = {
  title: "Koru & Friends Merch | FateDrop",
  description: "Explore Koru & Friends character drops and the premium FateDrop Signal Collection.",
};

function ProductCard({ product }: { product: MerchProduct }) {
  return (
    <article className="merch-product" data-accent={product.accent}>
      <div className="merch-product-art">
        {product.image ? (
          <img src={product.image} alt={`${product.name} concept artwork`} loading="lazy" />
        ) : (
          <div className="merch-product-placeholder" aria-label={`${product.name} artwork slot`}>
            <i />
            <span>{product.name.charAt(0)}</span>
            <small>ARTWORK SLOT</small>
          </div>
        )}
        <span className="merch-product-status">{product.status}</span>
      </div>
      <div className="merch-product-copy">
        <small>{product.line}</small>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="merch-product-meta"><span>{product.sizes}</span><b>{product.price}</b></div>
        {product.checkoutHref ? (
          <a className="merch-buy" href={product.checkoutHref} rel="noreferrer">Buy via Stripe <span>↗</span></a>
        ) : (
          <span className="merch-buy merch-buy-disabled">Price + Stripe checkout to be connected</span>
        )}
      </div>
    </article>
  );
}

export default function MerchPage() {
  return (
    <SiteShell>
      <section className="merch-campaign section-shell" aria-labelledby="merch-title">
        <img className="merch-campaign-image" src={KORU_MERCH.campaign} alt="Koru, Aeris, Nyxen, Solix and Oru wearing FateDrop supporter apparel at twilight" width="1916" height="821" loading="eager" />
        <div className="merch-campaign-shade" aria-hidden="true" />
        <div className="merch-campaign-copy">
          <p>KORU &amp; FRIENDS · FATEDROP SUPPORTER COLLECTION</p>
          <h1 id="merch-title">The culture around the signal.</h1>
          <span>Character-led drops, washed streetwear and quieter FateDrop pieces designed to feel collectible without turning the platform into a clothing shop.</span>
          <div className="button-row"><Link className="button button-primary" href="#drops">Explore the drops <span>↓</span></Link><Link className="button button-secondary" href="/">Back to FateDrop</Link></div>
        </div>
        <div className="merch-campaign-note"><small>THE WORLD AROUND FATEDROP</small><b>Koru · Fenn · Aeris · Nyxen · Solix · Oru</b></div>
      </section>

      <section className="merch-intro section-shell" id="drops">
        <div><p className="eyebrow"><span />The supporter shop</p><h2>Two collections. One FateDrop identity.</h2></div>
        <p>Koru &amp; Friends carries the character world. The Signal Collection carries the mature standalone FateDrop identity. Open a collection to see the planned product slots; finished product artwork, final prices and Stripe checkout links can be loaded directly into each card as the physical range is confirmed.</p>
      </section>

      <section className="merch-drops section-shell" aria-label="FateDrop merchandise collections">
        <details className="merch-drop" open>
          <summary>
            <div><span>01</span><small>CHARACTER COLLECTION</small><h2>Koru &amp; Friends</h2><p>Signature washed-black tees built around each character&apos;s own visual language.</p></div>
            <b>OPEN COLLECTION <i>＋</i></b>
          </summary>
          <div className="merch-drop-body">
            <div className="merch-drop-feature">
              <img src={KORU_MERCH.campaign} alt="Koru and Friends FateDrop merch campaign" width="1916" height="821" loading="lazy" />
              <div><small>CAMPAIGN 001</small><strong>Bound by signal. Driven by fate.</strong><p>The full crew together in their individual FateDrop shirts. Oru joins the wider Koru &amp; Friends world here without changing the five active companion slots inside the product.</p></div>
            </div>
            <div className="merch-product-grid">{koruProducts.map((product) => <ProductCard product={product} key={product.name} />)}</div>
          </div>
        </details>

        <details className="merch-drop">
          <summary>
            <div><span>02</span><small>LIMITED / CORE COLLECTION</small><h2>FateDrop Signal Collection</h2><p>The washed emblem tee, stronger jersey graphics and the signal snapback.</p></div>
            <b>OPEN COLLECTION <i>＋</i></b>
          </summary>
          <div className="merch-drop-body">
            <div className="signal-lookbook">
              <img src="/assets/fatedrop-merch-signal.webp" alt="FateDrop signal apparel artwork" loading="lazy" />
              <img src="/assets/fatedrop-merch-afterglow.webp" alt="FateDrop limited supporter artwork" loading="lazy" />
              <div><small>FATEDROP / LIMITED</small><strong>Premium. Purposeful. Collector-grade.</strong><p>This is where the standalone FateDrop pieces live: less character-forward, more emblem, signal geometry, washed fabric and limited-drop energy.</p></div>
            </div>
            <div className="merch-product-grid signal-grid">{signalProducts.map((product) => <ProductCard product={product} key={product.name} />)}</div>
          </div>
        </details>
      </section>

      <section className="merch-store-note section-shell">
        <div><p className="eyebrow"><span />Checkout plan</p><h2>Artwork first. Real product data next.</h2><p>Each product card already has a dedicated price, variant and checkout slot. When manufacturing and pricing are confirmed, we can replace the holding copy with the actual price and connect the Buy button to its Stripe Payment Link without redesigning the page.</p></div>
        <Link className="button button-secondary" href="/join">Join FateDrop <span>↗</span></Link>
      </section>

      <style>{`
        .merch-campaign,.merch-intro,.merch-drops,.merch-store-note{width:min(1560px,calc(100% - 32px));margin-inline:auto}
        .merch-campaign{position:relative;min-height:clamp(560px,43vw,760px);margin-top:88px;overflow:hidden;border:1px solid rgba(221,203,188,.13);border-radius:24px;background:#080a0d;box-shadow:0 28px 90px rgba(0,0,0,.26)}
        .merch-campaign-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.82) contrast(.98) brightness(.86)}
        .merch-campaign-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,7,10,.8) 0%,rgba(5,7,10,.44) 26%,rgba(5,7,10,.08) 48%,rgba(5,7,10,.08) 100%),linear-gradient(180deg,rgba(4,5,8,.02) 45%,rgba(4,5,8,.55) 100%)}
        .merch-campaign-copy{position:absolute;z-index:2;left:clamp(34px,4.4vw,76px);top:50%;width:min(38%,570px);transform:translateY(-43%);text-shadow:0 3px 26px rgba(0,0,0,.66)}
        .merch-campaign-copy>p{margin:0 0 16px;color:#c1a487;font-size:8px;font-weight:900;letter-spacing:.18em}.merch-campaign-copy h1{margin:0;color:#f2e9df;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3rem,5vw,5.9rem);font-weight:500;line-height:.94;letter-spacing:-.052em}.merch-campaign-copy>span{display:block;max-width:520px;margin-top:22px;color:rgba(238,230,221,.76);font-size:13px;line-height:1.7}.merch-campaign-copy .button-row{margin-top:28px}
        .merch-campaign-note{position:absolute;z-index:2;right:clamp(28px,3.8vw,64px);bottom:34px;display:grid;gap:5px;text-align:right;text-shadow:0 2px 18px #000}.merch-campaign-note small{color:#87766a;font-size:7px;font-weight:900;letter-spacing:.16em}.merch-campaign-note b{color:#d4c6ba;font-size:8px;letter-spacing:.08em}
        .merch-intro{margin-top:86px;display:grid;grid-template-columns:1.05fr .95fr;gap:70px;align-items:end}.merch-intro h2,.merch-drop summary h2,.merch-store-note h2{margin:8px 0 0;color:#eee5dd;font-family:Georgia,'Times New Roman',serif;font-weight:500;line-height:1;letter-spacing:-.045em}.merch-intro h2{max-width:760px;font-size:clamp(2.8rem,4.8vw,5.3rem)}.merch-intro>p{max-width:660px;margin:0;color:#8f8988;font-size:12px;line-height:1.78}
        .merch-drops{margin-top:42px;display:grid;gap:14px}.merch-drop{overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:24px;background:linear-gradient(145deg,#0d0f14,#080a0e)}.merch-drop>summary{list-style:none;cursor:pointer;padding:34px 38px;display:flex;align-items:flex-end;justify-content:space-between;gap:40px}.merch-drop>summary::-webkit-details-marker{display:none}.merch-drop summary>div{display:grid;grid-template-columns:auto 1fr;column-gap:14px;align-items:center;max-width:900px}.merch-drop summary span{grid-row:1/4;color:#5f5856;font-family:Georgia,serif;font-size:31px}.merch-drop summary small{color:#987f71;font-size:7px;font-weight:900;letter-spacing:.16em}.merch-drop summary h2{font-size:clamp(2.1rem,3.6vw,4rem)}.merch-drop summary p{grid-column:2;margin:8px 0 0;color:#817b7a;font-size:10px;line-height:1.55}.merch-drop summary>b{flex:0 0 auto;color:#b59480;font-size:8px;letter-spacing:.12em}.merch-drop summary i{margin-left:10px;font-style:normal;font-size:16px}.merch-drop[open] summary i{display:inline-block;transform:rotate(45deg)}.merch-drop-body{padding:0 20px 24px;border-top:1px solid rgba(255,255,255,.055)}
        .merch-drop-feature{position:relative;min-height:clamp(360px,34vw,560px);margin-top:20px;overflow:hidden;border-radius:18px;background:#080a0d}.merch-drop-feature>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.78) brightness(.74)}.merch-drop-feature:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,7,10,.12),rgba(5,7,10,.12) 50%,rgba(5,7,10,.82) 100%)}.merch-drop-feature>div{position:absolute;z-index:2;right:clamp(28px,4vw,60px);bottom:clamp(28px,4vw,54px);width:min(34%,450px)}.merch-drop-feature small,.signal-lookbook small{color:#ad8d79;font-size:7px;font-weight:900;letter-spacing:.16em}.merch-drop-feature strong,.signal-lookbook strong{display:block;margin-top:10px;color:#efe6dc;font-family:Georgia,serif;font-size:clamp(1.8rem,3vw,3.4rem);font-weight:500;line-height:1}.merch-drop-feature p,.signal-lookbook p{margin:14px 0 0;color:#aaa19b;font-size:11px;line-height:1.7}
        .merch-product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}.merch-product{overflow:hidden;border:1px solid rgba(255,255,255,.07);border-radius:18px;background:#0a0c10}.merch-product-art{position:relative;aspect-ratio:1.08/1;overflow:hidden;background:radial-gradient(circle at 50% 35%,rgba(126,103,92,.12),transparent 46%),#090b0e}.merch-product-art>img{width:100%;height:100%;object-fit:cover;filter:saturate(.76) contrast(.95);transition:transform .45s ease}.merch-product:hover .merch-product-art>img{transform:scale(1.018)}.merch-product-status{position:absolute;left:14px;top:14px;padding:7px 9px;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(5,7,10,.72);backdrop-filter:blur(8px);color:#bdb2ab;font-size:6px;font-weight:850;letter-spacing:.1em;text-transform:uppercase}.merch-product-placeholder{position:absolute;inset:0;display:grid;place-items:center;align-content:center;gap:9px}.merch-product-placeholder i{width:86px;height:86px;border:1px solid rgba(255,255,255,.1);border-radius:28px;transform:rotate(45deg)}.merch-product-placeholder span{position:absolute;color:#81736d;font-family:Georgia,serif;font-size:34px}.merch-product-placeholder small{margin-top:10px;color:#514b49;font-size:6px;letter-spacing:.18em}.merch-product[data-accent='ice'] .merch-product-art{background:radial-gradient(circle at 50% 35%,rgba(81,137,174,.2),transparent 44%),#090b0f}.merch-product[data-accent='crimson'] .merch-product-art{background:radial-gradient(circle at 50% 35%,rgba(157,45,68,.2),transparent 44%),#0b090d}.merch-product[data-accent='gold'] .merch-product-art{background:radial-gradient(circle at 50% 35%,rgba(181,132,46,.2),transparent 44%),#0b0a08}.merch-product[data-accent='earth'] .merch-product-art{background:radial-gradient(circle at 50% 35%,rgba(92,107,67,.2),transparent 44%),#090b09}.merch-product[data-accent='violet'] .merch-product-art{background:radial-gradient(circle at 50% 35%,rgba(113,78,133,.2),transparent 44%),#0a090d}.merch-product-copy{padding:21px 20px 20px}.merch-product-copy>small{color:#8f7568;font-size:6px;font-weight:900;letter-spacing:.14em}.merch-product-copy h3{margin:9px 0;color:#e5ddd6;font-family:Georgia,serif;font-size:24px;font-weight:500;line-height:1.02}.merch-product-copy>p{min-height:54px;margin:0;color:#817b7a;font-size:10px;line-height:1.65}.merch-product-meta{margin-top:18px;padding-top:14px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid rgba(255,255,255,.055);color:#776f6c;font-size:8px}.merch-product-meta b{color:#b6a29a;font-weight:750}.merch-buy{min-height:42px;margin-top:14px;padding:0 14px;display:flex;align-items:center;justify-content:space-between;border:1px solid rgba(186,146,121,.2);border-radius:10px;background:rgba(148,105,83,.08);color:#c5a894;font-size:8px;font-weight:850;letter-spacing:.06em;text-decoration:none}.merch-buy-disabled{color:#6f6764;border-color:rgba(255,255,255,.06);background:rgba(255,255,255,.015)}
        .signal-lookbook{position:relative;margin-top:20px;min-height:430px;display:grid;grid-template-columns:1fr 1fr;gap:10px;overflow:hidden;border-radius:18px;background:#090b0e}.signal-lookbook>img{width:100%;height:430px;object-fit:cover;filter:saturate(.65) brightness(.68)}.signal-lookbook>div{position:absolute;z-index:2;left:50%;bottom:28px;width:min(46%,620px);padding:28px;background:linear-gradient(90deg,rgba(5,7,10,.94),rgba(5,7,10,.68));backdrop-filter:blur(10px)}.signal-lookbook:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(4,6,9,.45))}.signal-lookbook>div{z-index:3}.signal-grid{grid-template-columns:repeat(3,1fr)}
        .merch-store-note{margin-top:18px;margin-bottom:90px;padding:34px 38px;display:flex;align-items:center;justify-content:space-between;gap:48px;border:1px solid rgba(255,255,255,.07);border-radius:20px;background:radial-gradient(circle at 82% 20%,rgba(128,92,117,.1),transparent 25%),#0a0c10}.merch-store-note>div{max-width:860px}.merch-store-note h2{font-size:clamp(2rem,3.4vw,3.8rem)}.merch-store-note p:not(.eyebrow){max-width:760px;margin:13px 0 0;color:#837d7c;font-size:10px;line-height:1.7}
        @media(max-width:1050px){.merch-campaign-copy{width:48%}.merch-intro{grid-template-columns:1fr;gap:24px}.merch-product-grid{grid-template-columns:repeat(2,1fr)}.merch-drop-feature>div{width:46%}.signal-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:720px){.merch-campaign,.merch-intro,.merch-drops,.merch-store-note{width:calc(100% - 18px)}.merch-campaign{min-height:690px;margin-top:78px;border-radius:16px}.merch-campaign-image{object-position:68% center}.merch-campaign-shade{background:linear-gradient(180deg,rgba(5,7,10,.06) 0%,rgba(5,7,10,.1) 42%,rgba(5,7,10,.86) 73%,rgba(5,7,10,.97) 100%)}.merch-campaign-copy{left:22px;right:22px;top:auto;bottom:66px;width:auto;transform:none}.merch-campaign-copy h1{font-size:clamp(2.8rem,12vw,4.2rem)}.merch-campaign-copy>span{font-size:11px}.merch-campaign-note{display:none}.merch-intro{margin-top:68px}.merch-drop>summary{padding:24px 20px;align-items:flex-start;flex-direction:column;gap:16px}.merch-drop summary h2{font-size:2.5rem}.merch-drop-body{padding:0 10px 12px}.merch-drop-feature{min-height:520px}.merch-drop-feature>img{object-position:62% center}.merch-drop-feature:after{background:linear-gradient(180deg,rgba(5,7,10,.05) 20%,rgba(5,7,10,.9) 75%,rgba(5,7,10,.96) 100%)}.merch-drop-feature>div{left:22px;right:22px;bottom:24px;width:auto}.merch-product-grid,.signal-grid{grid-template-columns:1fr}.merch-product-copy>p{min-height:auto}.signal-lookbook{grid-template-columns:1fr;min-height:570px}.signal-lookbook>img{height:280px}.signal-lookbook>img:nth-child(2){display:none}.signal-lookbook>div{left:16px;right:16px;bottom:16px;width:auto}.merch-store-note{padding:28px 22px;align-items:flex-start;flex-direction:column}}
      `}</style>
    </SiteShell>
  );
}
