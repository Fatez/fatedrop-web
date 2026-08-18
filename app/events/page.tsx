import type { Metadata } from "next";
import Link from "next/link";
import { AppScreen } from "@/components/app-screen";
import { EventCalendar } from "@/components/event-calendar";
import { FinalCta, PageHero, SectionHeading, SiteShell } from "@/components/page-shell";
import { demoEvents } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "TCG Events & Card Shows | FateDrop",
  description: "Discover UK TCG events, attending vendors, ticket information and clearly marked event inventory.",
};

export default function EventsPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Events & local commerce" title="Make the whole event discoverable." description="FateDrop brings dates, venues, tickets, attending vendors and clearly marked event inventory into one collector-first journey.">
        <div className="button-row"><Link className="button button-primary" href="/join?type=event">Bring your event to FateDrop <span>↗</span></Link><Link className="text-link" href="#encounters-calendar">Open the calendar <span>↓</span></Link></div>
      </PageHero>
      <section className="content-section section-shell" id="encounters-calendar">
        <SectionHeading eyebrow="Fate Encounters" title="Upcoming card events, in one calendar." body="Browse upcoming card shows, trade events and vendor gatherings, then open the full listing for venue, time, tickets and attending businesses. The calendar below uses clearly labelled demo data until the live event feed is connected." />
        <div style={{ marginTop: 58 }}><EventCalendar /></div>
      </section>
      <section className="content-section section-shell split-section">
        <div className="copy-stack"><p className="eyebrow"><span />From postcode to show floor</p><h2>Online discovery should lead somewhere real.</h2><p>Collectors can explore upcoming events, understand who will be there and plan a visit with more confidence. Organisers gain a clearer way to present the whole show—not just a date on a poster.</p><div className="point-list"><div><span>01</span><p>Venue, town, date, opening hours and ticket information.</p></div><div><span>02</span><p>Attending retailer and vendor profiles.</p></div><div><span>03</span><p>Location and postcode discovery through Local Radar.</p></div></div></div>
        <div className="events-phone-wrap"><div className="phone-frame page-phone"><div className="phone-island" /><AppScreen screen="home" /></div><span>FATE ENCOUNTERS / APP ENTRY POINT</span></div>
      </section>
      <section className="content-section section-shell" id="event-preview">
        <SectionHeading eyebrow="Event card preview" title="The useful details, before the journey." body="The examples below demonstrate the intended event format. They are not real listings." />
        <div className="event-list" style={{ marginTop: 55 }}>
          {demoEvents.map((event, index) => <article className="event-card" id={`demo-event-${index}`} key={event.name}><span className="demo-label">Demonstration entry</span><div><h3>{event.name}</h3><p>{event.date} · {event.hours}</p><small>{event.venue}<br />{event.postcode}<br />{event.organiser}</small><p className="event-description">{event.description}</p></div><div className="event-meta"><span>{event.ticket}</span><span>{event.vendors}</span><span>Participating vendor profiles</span><span>{event.directions}</span></div><span className="stock-flag">{event.stock}</span></article>)}
        </div>
      </section>
      <section className="content-section section-shell">
        <div className="quote-band"><p className="eyebrow"><span />Event Vendor Mode · active expansion</p><blockquote>Temporary stock should look temporary.</blockquote><p>Search event inventory by product, vendor, stall, price and condition. When an event ends, archived inventory must not appear as ordinary retailer availability.</p><Link className="button button-primary" href="/join?type=event" style={{ marginTop: 30 }}>Submit an Event <span>↗</span></Link></div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
