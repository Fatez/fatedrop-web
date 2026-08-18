/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "FateDrop Supporter Merch",
  description: "Preview the phased FateDrop supporter clothing concept: Signal, Manifest and Afterglow.",
};

const phases = [
  { number: "01", code: "FD-001", name: "Signal", tone: "260GSM · Washed black", artwork: "Signal Frequency", image: "/assets/fatedrop-merch-signal.webp", copy: "The first supporter layer: an oversized washed-black silhouette, quiet chest mark and ultraviolet signal graphic." },
  { number: "02", code: "FD-002", name: "Manifest", tone: "260GSM · Washed charcoal", artwork: "Portal Manifest", image: "/assets/fatedrop-merch-manifest.webp", copy: "A bolder portal graphic inspired by the moment a wanted product surfaces across the FateDrop network." },
  { number: "03", code: "FD-003", name: "Afterglow", tone: "260GSM · Washed midnight plum", artwork: "Afterglow Arc", image: "/assets/fatedrop-merch-afterglow.webp", copy: "A restrained midnight-plum piece carrying the ultraviolet and cyan energy trail of the search after dark." },
] as const;

export default function MerchPage() {
  return (
    <SiteShell>
      <section className="merch-page-hero section-shell">
        <img className="merch-hero-image" src="/assets/fatedrop-three-phase-capsule.webp" alt="" width="1672" height="941" loading="eager" aria-hidden="true" />
        <div className="merch-hero-copy">
          <p className="eyebrow"><span />FateDrop supporter capsule</p>
          <h1>Wear the signal.<br />Back the network.</h1>
          <p>Three oversized tee concepts built from the same ultraviolet signals, card paths and late-night energy as FateDrop itself.</p>
          <div className="button-row"><Link className="button button-primary" href="#collection">Explore the capsule <span>↓</span></Link><span className="status-chip expansion">Concept capsule · not on sale</span></div>
        </div>
        <span className="merch-hero-capsule">Capsule 001—003 · Signal / Manifest / Afterglow</span>
      </section>
      <section className="merch-lookbook section-shell" id="collection">
        <div className="merch-capsule-intro"><div><p className="eyebrow"><span />Capsule 001—003</p><h2>Signal. Manifest. Afterglow.</h2></div><p>One three-phase visual story, moving from the first trace of a card signal through discovery and into the energy left behind. The current images are design mockups; final production details remain subject to sampling.</p></div>
        <div className="phase-list">
          {phases.map((phase) => <article key={phase.name}>
            <div className="phase-image"><img src={phase.image} alt={`${phase.name} oversized FateDrop tee concept, front and back`} width="558" height="760" loading="lazy" /></div>
            <div className="phase-card-copy"><span>{phase.number} / {phase.code}</span><small>{phase.tone}</small><h2>Phase {phase.number} — {phase.name}</h2><p>{phase.copy}</p><em>{phase.artwork}</em><b>Concept · coming soon</b></div>
          </article>)}
        </div>
      </section>
      <section className="content-section section-shell"><div className="quote-band"><blockquote>This is support merchandise, not a second shopfront.</blockquote><p>FateDrop remains focused on collectors, retailers and events. Production samples, final sizing, prices and checkout are not live yet; the capsule will only move forward when quality and fulfilment can match the design.</p><Link className="button button-secondary" href="/join" style={{ marginTop: 30 }}>Join FateDrop and hear what comes next <span>↗</span></Link></div></section>
    </SiteShell>
  );
}
