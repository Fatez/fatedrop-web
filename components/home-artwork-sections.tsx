/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { EventCalendar } from "@/components/event-calendar";

const ART_VERSION = "20260822-repair";

function ArtworkFrame({
  className,
  image,
  alt,
  eyebrow,
  title,
  body,
  children,
}: {
  className: string;
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`fd-art-frame ${className}`}>
      <img className="fd-art-image" src={`${image}?v=${ART_VERSION}`} alt={alt} />
      <div className="fd-art-fade" aria-hidden="true" />
      <div className="fd-art-copy">
        <p className="eyebrow"><span />{eyebrow}</p>
        <h2>{title}</h2>
        <p>{body}</p>
        {children}
      </div>
    </div>
  );
}

export function CollectorArtworkSection() {
  return (
    <section className="fd-art-section section-shell" aria-labelledby="collector-art-title">
      <ArtworkFrame
        className="fd-art-collector"
        image="/assets/home/fatedrop-collectors.avif"
        alt="Trading cards and a collector dashboard arranged across a dark wooden desk"
        eyebrow="Built for collectors"
        title="One search. Better context. Less chasing."
        body="Search participating catalogues, compare known costs and RRP context, then follow Whisper, Echo, Manifested and Vanished without living in twenty retailer tabs."
      >
        <div className="fd-art-actions">
          <Link className="button button-primary" href="/collectors">Explore Collector Tools <span>↗</span></Link>
          <Link className="button button-secondary" href="/search">Search the Network</Link>
        </div>
        <div className="fd-art-proof"><span>TRUE PRICE CONTEXT</span><i /><span>FATEFIND DISCOVERY</span><i /><span>EVIDENCE-BACKED SIGNALS</span></div>
      </ArtworkFrame>
      <ArtworkStyles />
    </section>
  );
}

export function RetailerArtworkSection() {
  return (
    <section className="fd-art-section section-shell" aria-labelledby="retailer-art-title">
      <ArtworkFrame
        className="fd-art-retailer"
        image="/assets/home/fatedrop-retailers.avif"
        alt="A dark independent trading card shop with the FateDrop mascot seated at the counter"
        eyebrow="For independent businesses"
        title="Your products. Your prices. Your website. Your checkout."
        body="FateDrop connects participating catalogue stock with collectors already looking for it, then sends them to the retailer to confirm and purchase. Your brand and customer relationship stay yours."
      >
        <ul className="fd-art-list">
          <li>Connect an agreed feed, API, CSV, sitemap or manual route.</li>
          <li>Keep payments, delivery, returns and fulfilment on your own store.</li>
          <li>Become discoverable through collector search, alerts and retailer discovery.</li>
        </ul>
        <div className="fd-art-actions">
          <Link className="button button-primary" href="/join?type=business">Connect Your Catalogue <span>↗</span></Link>
          <Link className="button button-secondary" href="/businesses#partner-demo">Request a Partner Demo</Link>
        </div>
      </ArtworkFrame>
      <ArtworkStyles />
    </section>
  );
}

export function EventArtworkSection() {
  return (
    <section className="fd-art-section section-shell" aria-labelledby="event-art-title">
      <ArtworkFrame
        className="fd-art-events"
        image="/assets/home/fatedrop-events.avif"
        alt="A busy trading card convention hall beneath dark FateDrop banners"
        eyebrow="Fate Encounters · live UK calendar"
        title="Discover the event before the day. Find the floor when you arrive."
        body="Browse source-verified UK card shows, trade events and conventions, use Local Radar for nearby events, and inspect organiser-backed vendor or table locations where they are published."
      >
        <div className="fd-art-actions">
          <Link className="button button-primary" href="/join?type=event">List an Event <span>↗</span></Link>
          <Link className="button button-secondary" href="/events">Explore Live Events</Link>
        </div>
      </ArtworkFrame>
      <div className="fd-event-calendar"><EventCalendar compact /></div>
      <ArtworkStyles />
    </section>
  );
}

function ArtworkStyles() {
  return <style>{`
    .fd-art-section{margin-top:82px}
    .fd-art-frame{position:relative;isolation:isolate;min-height:clamp(500px,45vw,690px);overflow:hidden;border:1px solid rgba(220,205,196,.11);border-radius:24px;background:#090b10;box-shadow:0 28px 88px rgba(0,0,0,.25)}
    .fd-art-image{position:absolute;z-index:0;inset:0;width:100%;height:100%;object-fit:cover;display:block}
    .fd-art-collector .fd-art-image{object-position:center 52%}
    .fd-art-retailer .fd-art-image,.fd-art-events .fd-art-image{object-position:center center}
    .fd-art-fade{position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(6,8,13,.98) 0%,rgba(7,9,14,.90) 22%,rgba(7,9,14,.64) 38%,rgba(7,9,14,.18) 55%,rgba(7,9,14,.02) 72%),linear-gradient(180deg,rgba(5,7,10,.08),rgba(5,7,10,.22))}
    .fd-art-copy{position:relative;z-index:2;width:min(47%,650px);padding:clamp(40px,5vw,76px);display:flex;min-height:inherit;flex-direction:column;justify-content:center;text-shadow:0 2px 26px rgba(0,0,0,.5)}
    .fd-art-copy h2{max-width:650px;margin:0;color:#eee7df;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.45rem,4.45vw,5.25rem);font-weight:500;line-height:.97;letter-spacing:-.045em;text-wrap:balance}
    .fd-art-copy>p:not(.eyebrow){max-width:570px;margin:24px 0 0;color:rgba(225,216,211,.76);font-size:14px;line-height:1.72}
    .fd-art-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
    .fd-art-proof{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin-top:28px;color:rgba(205,194,191,.55);font-size:7px;font-weight:800;letter-spacing:.12em}
    .fd-art-proof i{width:3px;height:3px;border-radius:50%;background:#8e6d91}
    .fd-art-list{max-width:570px;margin:23px 0 0;padding:0;display:grid;gap:9px;list-style:none}
    .fd-art-list li{position:relative;padding-left:20px;color:rgba(218,208,203,.72);font-size:11px;line-height:1.55}
    .fd-art-list li:before{content:'◇';position:absolute;left:0;color:#9b7aa5}
    .fd-event-calendar{margin-top:12px;overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:20px;background:#0a0d12}
    @media(max-width:900px){
      .fd-art-frame{min-height:620px}
      .fd-art-copy{width:min(58%,620px);padding:42px}
      .fd-art-fade{background:linear-gradient(90deg,rgba(6,8,13,.96) 0%,rgba(7,9,14,.78) 42%,rgba(7,9,14,.16) 70%,rgba(7,9,14,.03) 100%)}
    }
    @media(max-width:680px){
      .fd-art-section{margin-top:58px}
      .fd-art-frame{min-height:680px;border-radius:18px}
      .fd-art-collector .fd-art-image{object-position:68% center}
      .fd-art-retailer .fd-art-image{object-position:68% center}
      .fd-art-events .fd-art-image{object-position:67% center}
      .fd-art-fade{background:linear-gradient(180deg,rgba(5,7,11,.03) 0%,rgba(5,7,11,.10) 40%,rgba(5,7,11,.78) 66%,rgba(5,7,11,.98) 100%)}
      .fd-art-copy{position:absolute;left:0;right:0;bottom:0;width:auto;min-height:0;padding:30px 24px 34px;justify-content:flex-end}
      .fd-art-copy h2{font-size:clamp(2.35rem,10.5vw,3.8rem)}
      .fd-art-copy>p:not(.eyebrow){font-size:12px}
      .fd-art-proof{display:none}
      .fd-art-list{gap:7px}
      .fd-art-list li{font-size:10px}
    }
  `}</style>;
}
