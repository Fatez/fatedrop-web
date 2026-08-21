/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/page-shell";
import { KORU_MERCH } from "@/lib/koru-brand";

export const metadata: Metadata = {
  title: "Koru & Friends | FateDrop",
  description: "Preview FateDrop's Koru & Friends supporter merchandise direction.",
};

export default function MerchPage() {
  return <SiteShell>
    <section className="merch-page-hero section-shell">
      <img className="merch-hero-image" src={KORU_MERCH.hero} alt="" width="1448" height="1086" loading="eager" aria-hidden="true"/>
      <div className="merch-hero-copy">
        <p className="eyebrow"><span/>Koru &amp; Friends</p>
        <h1>Wear the signal.<br/>Meet the mascot.</h1>
        <p>Koru is the face and voice of FateDrop. Koru &amp; Friends gives that original character universe somewhere to live beyond the app — apparel, stickers, pins, collectibles and future supporter drops.</p>
        <div className="button-row"><Link className="button button-primary" href="#koru">Explore Koru <span>↓</span></Link><span className="status-chip expansion">Concept range · not on sale</span></div>
      </div>
      <span className="merch-hero-capsule">KORU · K-09 · FATEDROP SIGNAL COMPANION</span>
    </section>

    <section className="merch-lookbook section-shell" id="koru">
      <div className="merch-capsule-intro"><div><p className="eyebrow"><span/>Koru collection</p><h2>A FateDrop character, not a TCG skin.</h2></div><p>The merchandise direction stays centred on FateDrop&apos;s own identity. Koru can appear in subtle technical pieces, louder character artwork and limited Koru &amp; Friends drops without borrowing another game&apos;s branding.</p></div>
      <div className="phase-list">
        <article><div className="phase-image"><img src={KORU_MERCH.hero} alt="Koru K-09 crystal FateDrop jersey concept" width="1448" height="1086" loading="lazy"/></div><div className="phase-card-copy"><span>01 / K-09</span><small>FATEDROP · KORU</small><h2>Koru Crystal Jersey</h2><p>Technical FateDrop jersey concept built around Koru&apos;s crystalline signal identity and the violet/cyan network palette.</p><em>Koru · The Signal Companion</em><b>Concept · sampling not started</b></div></article>
        <article><div className="phase-image"><img src={KORU_MERCH.universe} alt="Koru and Friends FateDrop character universe concept" width="1552" height="1013" loading="lazy"/></div><div className="phase-card-copy"><span>02 / UNIVERSE</span><small>ORIGINAL FATEDROP CHARACTERS</small><h2>Koru &amp; Friends</h2><p>A future character-led range for tees, art cards, stickers, pins, plush and collectibles. Koru remains the lead mascot; friends expand the world rather than replacing him by TCG.</p><em>Same network · different personalities</em><b>Concept universe · names/designs subject to final brand lock</b></div></article>
      </div>
    </section>

    <section className="content-section section-shell"><div className="quote-band"><blockquote>Koru is the brand character. The merch supports FateDrop — it does not turn FateDrop into a clothing shop.</blockquote><p>These are design concepts only. Manufacturing, sizing, pricing, stock, fulfilment and checkout are not live. The first beta remains focused on the collector network; supporter merchandise can follow once quality and fulfilment are ready.</p><Link className="button button-secondary" href="/join" style={{ marginTop: 30 }}>Join FateDrop <span>↗</span></Link></div></section>
  </SiteShell>;
}
