import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { EventCalendar } from "@/components/event-calendar";
import { FateEncountersLive } from "@/components/fate-encounters-live";
import { loadUpcomingEncounters } from "@/lib/encounters";

export const metadata: Metadata = { title: "Events | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardEventsPage() {
  const feed = await loadUpcomingEncounters(1000);
  const events = feed.events;
  const upcoming = events;
  const locations = new Set(upcoming.map((event) => event.venueName || event.townCity || event.postcode).filter(Boolean));
  const organisers = new Set(upcoming.map((event) => event.organiserName).filter(Boolean));

  return <DashboardPageShell title="Events" eyebrow="FATE ENCOUNTERS · UK TCG EVENTS">
    <div className="fd-events-live-page">
      <section className="fd-dash-card fd-events-live-hero">
        <div className="fd-events-live-copy">
          <span>FATE ENCOUNTERS</span>
          <h1>Find events.<br/>Find your people.</h1>
          <p>FateDrop brings card shows, TCG events and participating vendors into one clearer place. Think of it like a calendar for the hobby: find what is happening, check the source, then plan where you want to go.</p>
          <div className="fd-events-live-actions"><a href="#event-calendar">See the calendar ↓</a><Link href="/events">Open public Events page ↗</Link></div>
        </div>
        <div className="fd-events-live-stats">
          <div><strong>{feed.live ? upcoming.length : "—"}</strong><span>UPCOMING EVENTS</span><small>Source-backed listings</small></div>
          <div><strong>{feed.live ? locations.size : "—"}</strong><span>LOCATIONS</span><small>Venue, town or postcode evidence</small></div>
          <div><strong>{feed.live ? organisers.size : "—"}</strong><span>ORGANISERS NAMED</span><small>Only where the source provides one</small></div>
        </div>
      </section>

      <section className="fd-dash-card fd-events-how">
        <div><b>1</b><strong>FIND AN EVENT</strong><span>See upcoming shows and dates.</span></div>
        <i>→</i>
        <div><b>2</b><strong>CHECK THE SOURCE</strong><span>Confirm venue, ticket and organiser details.</span></div>
        <i>→</i>
        <div><b>3</b><strong>SEE WHO IS THERE</strong><span>Vendor information appears only when it is actually published.</span></div>
      </section>

      <section className="fd-dash-card fd-events-calendar-card" id="event-calendar">
        <header><div><span>EVENT CALENDAR</span><h2>What is coming up?</h2></div><small>{feed.live ? `${upcoming.length} live listing${upcoming.length === 1 ? "" : "s"}` : "Live feed unavailable"}</small></header>
        {feed.live ? <EventCalendar events={upcoming} /> : <div className="fd-events-empty"><strong>The live Fate Encounters feed is unavailable.</strong><span>FateDrop does not replace it with made-up events or stale demo listings.</span></div>}
      </section>

      <section className="fd-dash-card fd-events-explorer-card">
        <header><div><span>LIVE EXPLORER</span><h2>Search the event network.</h2><p>Filter real listings, inspect organiser-backed vendor information and use postcode or device location where available. A vendor being present does not automatically mean we know what is on their table.</p></div></header>
        <FateEncountersLive initialEvents={events} live={feed.live} />
      </section>

      <section className="fd-dash-card fd-events-truth">
        <div><span>ONE SIMPLE RULE</span><h2>An event listing tells you where the hobby is. It does not invent stock.</h2></div>
        <p>FateDrop keeps event evidence separate from ordinary retailer stock. If an organiser confirms a vendor, we can show the vendor. If a vendor explicitly publishes event inventory, we can show that too. If neither exists, we say we do not know.</p>
      </section>
    </div>
    <style>{`
      .fd-events-live-page{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-events-live-page .fd-dash-card{border-color:rgba(221,203,188,.085);background:linear-gradient(145deg,#0e1216,#090d11 74%);border-radius:12px}.fd-events-live-hero{padding:28px;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(360px,.7fr);gap:30px;overflow:hidden;background:radial-gradient(circle at 92% 12%,rgba(133,89,164,.16),transparent 29%),linear-gradient(145deg,#101318,#090c10 70%)!important}.fd-events-live-copy>span,.fd-events-calendar-card header span,.fd-events-explorer-card header span,.fd-events-truth span{color:#aa886d;font-size:7px;font-weight:900;letter-spacing:.16em}.fd-events-live-copy h1{margin:10px 0 14px;color:#eee4da;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.5rem,4.3vw,4.9rem);font-weight:500;line-height:.92;letter-spacing:-.05em}.fd-events-live-copy p{max-width:790px;margin:0;color:#948b87;font-size:12px;line-height:1.75}.fd-events-live-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.fd-events-live-actions a{padding:10px 13px;border:1px solid rgba(172,129,193,.2);border-radius:9px;background:rgba(120,76,151,.08);color:#d3b8de;font-size:8px;font-weight:850;text-decoration:none}.fd-events-live-stats{display:grid;grid-template-columns:1fr;gap:8px;align-content:center}.fd-events-live-stats div{padding:16px;border:1px solid rgba(221,203,188,.07);border-radius:10px;background:rgba(255,255,255,.018)}.fd-events-live-stats strong{display:block;color:#e9dfd5;font-family:Georgia,serif;font-size:29px;font-weight:500}.fd-events-live-stats span{display:block;margin-top:3px;color:#a98972;font-size:7px;font-weight:900;letter-spacing:.12em}.fd-events-live-stats small{color:#6f6867;font-size:7px}.fd-events-how{padding:16px 18px;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:12px;align-items:center}.fd-events-how>div{display:grid;grid-template-columns:28px 1fr;gap:2px 8px;align-items:center}.fd-events-how b{grid-row:1 / 3;width:28px;height:28px;display:grid;place-items:center;border:1px solid rgba(172,129,193,.2);border-radius:8px;color:#b68cc7;font-size:8px}.fd-events-how strong{font-size:8px;letter-spacing:.08em;color:#cfc4bd}.fd-events-how span{font-size:7px;color:#71696b}.fd-events-how>i{color:#51484f;font-style:normal}.fd-events-calendar-card,.fd-events-explorer-card{padding:22px}.fd-events-calendar-card>header,.fd-events-explorer-card>header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:20px}.fd-events-calendar-card h2,.fd-events-explorer-card h2,.fd-events-truth h2{margin:6px 0 0;color:#e6dcd2;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:500}.fd-events-calendar-card header small{color:#756e6d;font-size:8px}.fd-events-explorer-card header p{max-width:780px;margin:7px 0 0;color:#7d7575;font-size:9px;line-height:1.6}.fd-events-empty{min-height:180px;display:grid;place-content:center;gap:6px;text-align:center;color:#756e6d}.fd-events-empty strong{color:#c6bbb4;font-size:11px}.fd-events-empty span{font-size:8px}.fd-events-truth{padding:24px 26px;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:30px;align-items:center}.fd-events-truth p{margin:0;color:#89807e;font-size:10px;line-height:1.7}@media(max-width:980px){.fd-events-live-hero,.fd-events-truth{grid-template-columns:1fr}.fd-events-live-stats{grid-template-columns:repeat(3,1fr)}.fd-events-how{grid-template-columns:1fr}.fd-events-how>i{display:none}}@media(max-width:650px){.fd-events-live-hero,.fd-events-calendar-card,.fd-events-explorer-card{padding:18px}.fd-events-live-stats{grid-template-columns:1fr}.fd-events-how{padding:12px}.fd-events-live-copy h1{font-size:2.7rem}}
    `}</style>
  </DashboardPageShell>;
}
