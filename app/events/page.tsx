import type { Metadata } from "next";
import Link from "next/link";
import { AppScreen } from "@/components/app-screen";
import { EventCalendar } from "@/components/event-calendar";
import { FateEncountersLive } from "@/components/fate-encounters-live";
import { MarketStoryHero } from "@/components/market-story-hero";
import { FinalCta, SectionHeading, SiteShell } from "@/components/page-shell";
import { FateSignalField } from "@/components/fate-signal-field";
import { loadUpcomingEncounters } from "@/lib/encounters";

export const metadata: Metadata = {
  title: "TCG Events & Card Shows | FateDrop",
  description: "Discover source-verified UK TCG events, nearby card shows, attending vendors, ticket information and clearly evidenced event inventory.",
};

export default async function EventsPage() {
  const feed = await loadUpcomingEncounters(1000);
  const eventCount = feed.events.length;

  return (
    <SiteShell>
      <MarketStoryHero
        eyebrow="Fate Encounters · live UK TCG network"
        title="Find the events. Find your people."
        description="Browse source-backed card shows, conventions, trade events and participating vendors, then use Local Radar to turn the wider TCG scene into somewhere you can actually go."
        image="/assets/fatedrop-header.png?v=20260822-events"
        alt="FateDrop signal artwork representing the connected TCG event network"
        proof={["UK card shows", "Source-backed listings", "Vendor evidence", "Local Radar"]}
        focal="right"
      >
        <div className="button-row"><Link className="button button-primary" href="#live-encounters">Explore live events <span>↓</span></Link><Link className="text-link" href="/join?type=event">Bring your event to FateDrop <span>↗</span></Link></div>
      </MarketStoryHero>

      <section className="content-section section-shell" id="encounters-calendar">
        <SectionHeading eyebrow="UK event calendar" title="Real upcoming card events, in one calendar." body={feed.live ? `${eventCount} upcoming source-backed listings are currently available through the hosted Fate Encounters feed. Dates and venues remain linked to organiser or ticket-source evidence.` : "The hosted Fate Encounters feed is temporarily unavailable. FateDrop does not substitute demo events when the live feed cannot be reached."} />
        <div style={{ marginTop: 58 }}><EventCalendar events={feed.events} /></div>
      </section>

      <section className="content-section section-shell split-section">
        <div className="copy-stack"><p className="eyebrow"><span />From postcode to show floor</p><h2>Online discovery should lead somewhere real.</h2><p>Collectors can explore upcoming events, see who is confirmed to attend and plan the journey with clearer evidence. A vendor listing can identify a table or stall without pretending that vendor has published physical stock.</p><div className="point-list"><div><span>01</span><p>Venue, postcode, dates, opening hours and ticket-source links.</p></div><div><span>02</span><p>Source-verified participating vendors and table locations where organisers publish them.</p></div><div><span>03</span><p>Postcode or device-location discovery through hosted Local Radar.</p></div></div></div>
        <div className="events-phone-wrap"><FateSignalField variant="events" className="events-signal-field" /><div className="phone-frame page-phone"><div className="phone-island" /><AppScreen screen="home" /></div><span>FATE ENCOUNTERS / APP ENTRY POINT</span></div>
      </section>

      <section className="content-section section-shell" id="live-encounters">
        <SectionHeading eyebrow="Live event explorer" title="Calendar, nearby discovery and vendor evidence." body="Filter the live UK feed, inspect organiser-backed vendor locations and search a postcode or your device location. Online catalogue stock and physical branch stock remain deliberately separate." />
        <div style={{ marginTop: 48 }}><FateEncountersLive initialEvents={feed.events} live={feed.live} /></div>
      </section>

      <section className="content-section section-shell">
        <div className="quote-band event-vendor-band"><FateSignalField variant="events" className="event-vendor-signal-field" /><div className="event-floor-fragment" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><p className="eyebrow"><span />Event Vendor Mode · evidence first</p><blockquote>A table number is not a stock claim.</blockquote><p>Confirmed vendors can be shown from organiser evidence even when they publish no inventory. Event stock appears only from explicit vendor or FateDrop event-inventory evidence and expires rather than becoming ordinary retailer availability.</p><Link className="button button-primary" href="/join?type=event" style={{ marginTop: 30 }}>Submit an Event <span>↗</span></Link></div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
