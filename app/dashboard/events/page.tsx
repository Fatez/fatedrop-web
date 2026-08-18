import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { buildDashboardData } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Events | FateDrop Dashboard", robots: { index: false, follow: false } };

function eventDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/London" }).format(new Date(timestamp * 1000));
}

export default async function DashboardEventsPage() {
  const snapshot = await getCurrentSnapshot();
  const data = snapshot ? await buildDashboardData(snapshot) : null;
  const events = data?.upcomingEvents ?? [];
  return (
    <DashboardPageShell title="Events" eyebrow="CARD SHOWS + VENDORS">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-events-card">
          <div className="fd-dash-card-head"><span>UPCOMING EVENTS</span><Link href="/events">Public calendar ↗</Link></div>
          <div className="fd-event-list">
            {events.length ? events.map((event) => <article key={event.id}><time>{eventDate(event.startsAt)}</time><div><strong>{event.name}</strong><small>{event.venue || event.location || "Venue details pending"}</small>{event.vendorCount !== null ? <span>{event.vendorCount}+ vendors</span> : null}</div>{event.ticketUrl ? <a href={event.ticketUrl} target="_blank" rel="noreferrer" aria-label={`Open ${event.name}`}>↗</a> : null}</article>) : <div className="fd-dashboard-empty"><strong>No verified event feed connected yet.</strong><span>Upcoming card shows and vendor events will appear here as soon as the cloud feed supplies them.</span></div>}
          </div>
        </section>
        <section className="fd-dash-card"><div className="fd-dash-card-head"><span>EVENT MODE</span><small>Prepared for vendor inventory</small></div><div className="fd-network-message"><h1>Know what is happening before you travel.</h1><p>This page will combine dates, venues, ticket links and event-scoped vendor stock without mixing temporary event inventory into the normal live retailer catalogue.</p></div></section>
      </div>
    </DashboardPageShell>
  );
}
