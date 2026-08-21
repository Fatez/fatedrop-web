/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/page-shell";
import { KORU_MERCH } from "@/lib/koru-brand";

export const metadata: Metadata = {
  title: "Koru & Friends Merch | FateDrop",
  description: "Explore the Koru & Friends visual world and FateDrop supporter merchandise direction.",
};

export default function MerchPage() {
  return (
    <SiteShell>
      <section className="merch-page-hero section-shell koru-merch-hero">
        <img className="merch-hero-image" src={KORU_MERCH.universe} alt="Koru and Friends in the FateDrop world" width="1600" height="900" loading="eager" />
        <div className="merch-hero-copy">
          <p className="eyebrow"><span />Koru &amp; Friends</p>
          <h1>The culture around the signal.</h1>
          <p>Koru is the voice of FateDrop. Koru &amp; Friends is the original character world around it—artwork, apparel and supporter pieces with the same mature dusk-toned identity as the platform.</p>
          <div className="button-row"><Link className="button button-primary" href="#collection">Explore the collection <span>↓</span></Link><Link className="button button-secondary" href="/">Back to FateDrop</Link></div>
        </div>
        <span className="merch-hero-capsule">ORIGINAL FATEDROP CHARACTERS · KORU &amp; FRIENDS</span>
      </section>

      <section className="merch-lookbook section-shell" id="collection">
        <div className="merch-capsule-intro"><div><p className="eyebrow"><span />Supporter collection</p><h2>Subtle when it should be. Character-led when it earns it.</h2></div><p>The merch can carry Koru quietly through technical graphics or go fully illustrated through Koru &amp; Friends. The product stays FateDrop first; the character world gives the community something ownable around it.</p></div>
        <div className="phase-list">
          <article><div className="phase-image"><img src={KORU_MERCH.hero} alt="Koru FateDrop jersey concept" width="1448" height="1086" loading="lazy" /></div><div className="phase-card-copy"><span>01 / KORU</span><small>FATEDROP SUPPORTER APPAREL</small><h2>Koru collection</h2><p>Technical, mature character pieces designed around FateDrop&apos;s signal identity rather than another TCG&apos;s branding.</p><em>Koru · the voice of the network</em><b>More finished apparel artwork can be added as the range is loaded.</b></div></article>
          <article><div className="phase-image"><img src={KORU_MERCH.universe} alt="Koru and Friends FateDrop character universe" width="1600" height="900" loading="lazy" /></div><div className="phase-card-copy"><span>02 / KORU &amp; FRIENDS</span><small>ORIGINAL FATEDROP WORLD</small><h2>Koru &amp; Friends</h2><p>The broader artwork and character layer for tees, prints, stickers, pins and future collectibles without changing the serious product underneath FateDrop.</p><em>One network · a world of its own</em><b>Character-led supporter range</b></div></article>
        </div>
      </section>

      <section className="content-section section-shell"><div className="quote-band"><blockquote>The merch should strengthen FateDrop&apos;s identity—not turn FateDrop into a clothing shop.</blockquote><p>The platform remains focused on signals, True Price, FateFind hunts, FateMatch results and the collector-to-indie network. Koru &amp; Friends gives the brand a culture around that utility.</p><Link className="button button-secondary" href="/join" style={{ marginTop: 30 }}>Join FateDrop <span>↗</span></Link></div></section>

      <style>{`
        .koru-merch-hero{border-color:rgba(211,192,211,.14)!important;background:#090b10!important}.koru-merch-hero .merch-hero-image{filter:saturate(.68) contrast(.92) brightness(.72)!important}.koru-merch-hero:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,8,13,.89) 0%,rgba(7,8,13,.64) 34%,rgba(7,8,13,.18) 62%,rgba(7,8,13,.15) 100%),linear-gradient(180deg,transparent 50%,rgba(4,6,10,.42));pointer-events:none}.koru-merch-hero .merch-hero-copy,.koru-merch-hero .merch-hero-capsule{z-index:2}.koru-merch-hero .merch-hero-copy h1{font-family:Georgia,'Times New Roman',serif!important;font-weight:500!important;letter-spacing:-.05em!important}
      `}</style>
    </SiteShell>
  );
}
