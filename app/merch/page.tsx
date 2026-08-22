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
  { name: "Koru Jersey Tee", line: "KORU · SIGNAL GUIDE", description: "Washed black oversized tee with mature landscape artwork and a quiet Koru chest mark.", status: "Artwork loaded", sizes: "S–XXL planned", price: "Price set at drop", image: KORU_MERCH.hero, accent: "earth" },
  { name: "Aeris Companion Tee", line: "AERIS · CALM GUARDIAN", description: "Icy crystalline character artwork with a restrained blue signal palette and washed-black base.", status: "Artwork ready to load", sizes: "S–XXL planned", price: "Price set at drop", accent: "ice" },
  { name: "Nyxen Jersey Tee", line: "NYXEN · SIGNAL SHADOW", description: "Dark crimson crystal artwork for the quieter edge of the Koru & Friends collection.", status: "Artwork ready to load", sizes: "S–XXL planned", price: "Price set at drop", accent: "crimson" },
  { name: "Solix Jersey Tee", line: "SOLIX · SIGNAL GUARDIAN", description: "Warm gold crystalline artwork built around loyalty, light and the FateDrop signal language.", status: "Artwork ready to load", sizes: "S–XXL planned", price: "Price set at drop", accent: "gold" },
  { name: "Fenn Wanderer Tee", line: "FENN · SIGNAL WANDERER", description: "The discovery-led character drop. Final individual shirt artwork will be loaded into this slot.", status: "Artwork next", sizes: "S–XXL planned", price: "Price set at drop", accent: "violet" },
  { name: "Oru Wanderer Tee", line: "ORU · LITTLE WANDERER", description: "Oru belongs to the wider Koru & Friends story and merch world without changing the five selectable app companions.", status: "New character · artwork next", sizes: "S–XXL planned", price: "Price set at drop", accent: "cream" },
];

const signalProducts: MerchProduct[] = [
  { name: "FateDrop Signal Tee", line: "CORE SIGNAL COLLECTION", description: "Washed black, minimal chest identity and premium signal geometry for the quieter FateDrop look.", status: "Limited collection slot", sizes: "S–XXL planned", price: "Price set at drop", image: "/assets/fatedrop-merch-signal.webp", accent: "cream" },
  { name: "Signal Jersey / Limited Edition", line: "NUMBERED DROP", description: "Stronger back artwork, collector-grade presentation and limited-run positioning.", status: "Limited collection slot", sizes: "S–XXL planned", price: "Price set at drop", image: "/assets/fatedrop-merch-manifest.webp", accent: "violet" },
  { name: "Signal Snapback", line: "WASHED HEADWEAR", description: "Washed cotton snapback with embroidered FateDrop emblem, understated side branding and collector-minded detailing.", status: "Artwork ready to load", sizes: "Adjustable / one size", price: "Price set at drop", accent: "gold" },
];

export const metadata: Metadata = {
  title: "Koru & Friends Merch | FateDrop",
  description: "Explore Koru & Friends character drops and the premium FateDrop Signal Collection.",
};

function ProductCard({ product }: { product: MerchProduct }) {
  return (
    <article className="merch-product" data-accent={product.accent}>
      <div className="merch-product-art">
        {product.image ? <img src={product.image} alt={`${product.name} concept artwork`} loading="lazy" /> : (
          <div className="merch-product-placeholder" aria-label={`${product.name} artwork slot`}><i /><span>{product.name.charAt(0)}</span><small>ARTWORK SLOT</small></div>
        )}
        <span className="merch-product-status">{product.status}</span>
      </div>
      <div className="merch-product-copy">
        <small>{product.line}</small>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="merch-product-meta"><span>{product.sizes}</span><b>{product.price}</b></div>
        {product.checkoutHref ? <a className="merch-buy" href={product.checkoutHref} rel="noreferrer">Buy via Stripe <span>↗</span></a> : <span className="merch-buy merch-buy-disabled">Price + Stripe checkout to be connected</span>}
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
          <div className="button-row"><Link className="button button-primary" href="#drops">Shop the drops <span>↓</span></Link><Link className="button button-secondary" href="/">Back to FateDrop</Link></div>
        </div>
        <div className="merch-campaign-note"><small>THE WORLD AROUND FATEDROP</small><b>Koru · Fenn · Aeris · Nyxen · Solix · Oru</b></div>
      </section>

      <section className="merch-intro section-shell" id="drops">
        <div><p className="eyebrow"><span />Shop the drops</p><h2>Choose the collection.</h2></div>
        <p>The campaign artwork lives once at the top. From here the page behaves like a shop: open a drop and go straight to the individual products, pricing slots and future Stripe checkout.</p>
      </section>

      <section className="merch-drops section-shell" aria-label="FateDrop merchandise collections">
        <details className="merch-drop" id="koru-friends">
          <summary>
            <div className="drop-number">01</div>
            <div className="drop-summary-copy"><small>CHARACTER COLLECTION · 6 PIECES</small><h2>Koru &amp; Friends</h2><p>Koru · Aeris · Nyxen · Solix · Fenn · Oru</p></div>
            <div className="drop-action"><span>VIEW DROP</span><i>＋</i></div>
          </summary>
          <div className="merch-drop-body">
            <div className="drop-meta"><span>6 PIECES</span><span>WASHED BLACK</span><span>CHARACTER SERIES</span><span>LIMITED RUN</span><b>Bound by signal. Driven by fate.</b></div>
            <div className="merch-product-grid">{koruProducts.map((product) => <ProductCard product={product} key={product.name} />)}</div>
          </div>
        </details>

        <details className="merch-drop" id="signal-collection">
          <summary>
            <div className="drop-number">02</div>
            <div className="drop-summary-copy"><small>LIMITED / CORE COLLECTION · 3 PIECES</small><h2>FateDrop Signal</h2><p>Signal Tee · Limited Jersey · Signal Snapback</p></div>
            <div className="drop-action"><span>VIEW DROP</span><i>＋</i></div>
          </summary>
          <div className="merch-drop-body">
            <div className="drop-meta"><span>CORE SIGNAL</span><span>WASHED FABRIC</span><span>LIMITED GRAPHICS</span><span>HEADWEAR</span><b>Premium. Purposeful. Collector-grade.</b></div>
            <div className="merch-product-grid signal-grid">{signalProducts.map((product) => <ProductCard product={product} key={product.name} />)}</div>
          </div>
        </details>
      </section>

      <section className="merch-store-note section-shell">
        <div><p className="eyebrow"><span />Checkout plan</p><h2>Real products when the drop is ready.</h2><p>Each card already has a place for final price, size or variant information and its public Stripe Payment Link. We can load the actual product artwork and checkout only when manufacturing and pricing are confirmed.</p></div>
        <Link className="button button-secondary" href="/join">Join FateDrop <span>↗</span></Link>
      </section>

      <style>{`
        .merch-campaign,.merch-intro,.merch-drops,.merch-store-note{width:min(1560px,calc(100% - 32px));margin-inline:auto}
        .merch-campaign{position:relative;aspect-ratio:2.55/1;max-height:610px;margin-top:88px;overflow:hidden;border:1px solid rgba(221,203,188,.13);border-radius:24px;background:#080a0d;box-shadow:0 28px 90px rgba(0,0,0,.26)}
        .merch-campaign-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.82) contrast(.98) brightness(.86)}
        .merch-campaign-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,7,10,.82) 0%,rgba(5,7,10,.45) 26%,rgba(5,7,10,.06) 53%,rgba(5,7,10,.08) 100%),linear-gradient(180deg,rgba(4,5,8,.01) 46%,rgba(4,5,8,.48) 100%)}
        .merch-campaign-copy{position:absolute;z-index:2;left:clamp(34px,4.4vw,76px);top:50%;width:min(38%,570px);transform:translateY(-47%);text-shadow:0 3px 26px rgba(0,0,0,.66)}
        .merch-campaign-copy>p{margin:0 0 14px;color:#c1a487;font-size:8px;font-weight:900;letter-spacing:.18em}.merch-campaign-copy h1{margin:0;color:#f2e9df;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.8rem,4.5vw,5.2rem);font-weight:500;line-height:.94;letter-spacing:-.052em}.merch-campaign-copy>span{display:block;max-width:500px;margin-top:18px;color:rgba(238,230,221,.76);font-size:12px;line-height:1.65}.merch-campaign-copy .button-row{margin-top:24px}
        .merch-campaign-note{position:absolute;z-index:2;right:clamp(28px,3.8vw,64px);bottom:28px;display:grid;gap:5px;text-align:right;text-shadow:0 2px 18px #000}.merch-campaign-note small{color:#87766a;font-size:7px;font-weight:900;letter-spacing:.16em}.merch-campaign-note b{color:#d4c6ba;font-size:8px;letter-spacing:.08em}
        .merch-intro{margin-top:70px;display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:end}.merch-intro h2,.merch-drop h2,.merch-store-note h2{margin:8px 0 0;color:#eee5dd;font-family:Georgia,'Times New Roman',serif;font-weight:500;line-height:1;letter-spacing:-.045em}.merch-intro h2{font-size:clamp(2.7rem,4.6vw,5rem)}.merch-intro>p{max-width:650px;margin:0;color:#8f8988;font-size:12px;line-height:1.75}
        .merch-drops{margin-top:34px;display:grid;gap:14px}.merch-drop{scroll-margin-top:100px;overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:22px;background:linear-gradient(145deg,#0d0f14,#080a0e)}.merch-drop>summary{list-style:none;cursor:pointer;min-height:154px;padding:28px 34px;display:grid;grid-template-columns:72px 1fr auto;gap:24px;align-items:center}.merch-drop>summary::-webkit-details-marker{display:none}.drop-number{color:#5f5856;font-family:Georgia,serif;font-size:38px}.drop-summary-copy small{color:#9c806e;font-size:7px;font-weight:900;letter-spacing:.16em}.drop-summary-copy h2{font-size:clamp(2rem,3.2vw,3.5rem)}.drop-summary-copy p{margin:8px 0 0;color:#817b7a;font-size:10px;letter-spacing:.025em}.drop-action{display:flex;align-items:center;gap:14px;color:#b59480;font-size:8px;font-weight:850;letter-spacing:.13em}.drop-action i{width:38px;height:38px;display:grid;place-items:center;border:1px solid rgba(192,164,135,.17);border-radius:12px;background:rgba(192,164,135,.045);font-size:18px;font-style:normal;transition:transform .2s ease}.merch-drop[open] .drop-action i{transform:rotate(45deg)}
        .merch-drop-body{padding:0 18px 20px;border-top:1px solid rgba(255,255,255,.055)}.drop-meta{min-height:64px;padding:14px 10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;color:#776f6c}.drop-meta span{padding:7px 9px;border:1px solid rgba(255,255,255,.06);border-radius:999px;font-size:7px;font-weight:800;letter-spacing:.09em}.drop-meta b{margin-left:auto;color:#aa978b;font-family:Georgia,serif;font-size:14px;font-weight:500}
        .merch-product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.merch-product{overflow:hidden;border:1px solid rgba(255,255,255,.07);border-radius:18px;background:#0a0c10}.merch-product-art{position:relative;aspect-ratio:1.08/1;overflow:hidden;background:radial-gradient(circle at 50% 35%,rgba(126,103,92,.12),transparent 46%),#090b0e}.merch-product-art>img{width:100%;height:100%;object-fit:cover;filter:saturate(.76) contrast(.95);transition:transform .45s ease}.merch-product:hover .merch-product-art>img{transform:scale(1.018)}.merch-product-status{position:absolute;left:14px;top:14px;padding:7px 9px;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(5,7,10,.72);backdrop-filter:blur(8px);color:#bdb2ab;font-size:6px;font-weight:850;letter-spacing:.1em;text-transform:uppercase}.merch-product-placeholder{position:absolute;inset:0;display:grid;place-items:center;align-content:center;gap:9px}.merch-product-placeholder i{width:86px;height:86px;border:1px solid rgba(255,255,255,.1);border-radius:28px;transform:rotate(45deg)}.merch-product-placeholder span{position:absolute;color:#81736d;font-family:Georgia,serif;font-size:34px}.merch-product-placeholder small{margin-top:10px;color:#514b49;font-size:6px;letter-spacing:.18em}.merch-product[data-accent='ice'] .merch-product-art{background:radial-gradient(circle at 50% 35%,rgba(81,137,174,.2),transparent 44%),#090b0f}.merch-product[data-accent='crimson'] .merch-product-art{background:radial-gradient(circle at 50% 35%,rgba(157,45,68,.2),transparent 44%),#0b090d}.merch-product[data-accent='gold'] .merch-product-art{background:radial-gradient(circle at 50% 35%,rgba(181,132,46,.2),transparent 44%),#0b0a08}.merch-product[data-accent='earth'] .merch-product-art{background:radial-gradient(circle at 50% 35%,rgba(92,107,67,.2),transparent 44%),#090b09}.merch-product[data-accent='violet'] .merch-product-art{background:radial-gradient(circle at 50% 35%,rgba(113,78,133,.2),transparent 44%),#0a090d}.merch-product-copy{padding:21px 20px 20px}.merch-product-copy>small{color:#8f7568;font-size:6px;font-weight:900;letter-spacing:.14em}.merch-product-copy h3{margin:9px 0;color:#e5ddd6;font-family:Georgia,serif;font-size:24px;font-weight:500;line-height:1.02}.merch-product-copy>p{min-height:54px;margin:0;color:#817b7a;font-size:10px;line-height:1.65}.merch-product-meta{margin-top:18px;padding-top:14px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid rgba(255,255,255,.055);color:#776f6c;font-size:8px}.merch-product-meta b{color:#b6a29a;font-weight:750}.merch-buy{min-height:42px;margin-top:14px;padding:0 14px;display:flex;align-items:center;justify-content:space-between;border:1px solid rgba(186,146,121,.2);border-radius:10px;background:rgba(148,105,83,.08);color:#c5a894;font-size:8px;font-weight:850;letter-spacing:.06em;text-decoration:none}.merch-buy-disabled{color:#6f6764;border-color:rgba(255,255,255,.06);background:rgba(255,255,255,.015)}
        .merch-store-note{margin-top:18px;margin-bottom:90px;padding:34px 38px;display:flex;align-items:center;justify-content:space-between;gap:48px;border:1px solid rgba(255,255,255,.07);border-radius:20px;background:radial-gradient(circle at 82% 20%,rgba(128,92,117,.1),transparent 25%),#0a0c10}.merch-store-note>div{max-width:860px}.merch-store-note h2{font-size:clamp(2rem,3.4vw,3.8rem)}.merch-store-note p:not(.eyebrow){max-width:760px;margin:13px 0 0;color:#837d7c;font-size:10px;line-height:1.7}
        @media(max-width:1050px){.merch-intro{grid-template-columns:1fr;gap:24px}.merch-product-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:900px){.merch-campaign{aspect-ratio:auto;min-height:620px}.merch-campaign-image{object-position:66% center}.merch-campaign-copy{width:50%}.merch-drop>summary{grid-template-columns:54px 1fr auto}}
        @media(max-width:720px){.merch-campaign,.merch-intro,.merch-drops,.merch-store-note{width:calc(100% - 18px)}.merch-campaign{min-height:690px;margin-top:78px;border-radius:16px}.merch-campaign-image{object-position:68% center}.merch-campaign-shade{background:linear-gradient(180deg,rgba(5,7,10,.06) 0%,rgba(5,7,10,.1) 42%,rgba(5,7,10,.86) 73%,rgba(5,7,10,.97) 100%)}.merch-campaign-copy{left:22px;right:22px;top:auto;bottom:66px;width:auto;transform:none}.merch-campaign-copy h1{font-size:clamp(2.8rem,12vw,4.2rem)}.merch-campaign-copy>span{font-size:11px}.merch-campaign-note{display:none}.merch-intro{margin-top:60px}.merch-drop>summary{min-height:0;padding:23px 20px;grid-template-columns:42px 1fr;gap:14px}.drop-number{font-size:29px}.drop-action{grid-column:2;justify-content:space-between}.drop-summary-copy h2{font-size:2.35rem}.merch-drop-body{padding:0 10px 12px}.drop-meta{padding:14px 6px}.drop-meta b{width:100%;margin:4px 0 0}.merch-product-grid,.signal-grid{grid-template-columns:1fr}.merch-product-copy>p{min-height:auto}.merch-store-note{padding:28px 22px;align-items:flex-start;flex-direction:column}}
      `}</style>
    </SiteShell>
  );
}
