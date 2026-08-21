import type { EncounterEvent } from "@/lib/encounter-types";
import { loadUpcomingEncounters } from "@/lib/encounters";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(date);
}

function tone(event: EncounterEvent) {
  const categories = (event.categories || []).join(" ").toLowerCase();
  return categories.includes("trade") || categories.includes("play") ? "cyan" : "violet";
}

export async function EventCalendar({ events, compact = false }: { events?: EncounterEvent[]; compact?: boolean }) {
  const sourceEvents = events ?? (await loadUpcomingEncounters(100)).events;
  const anchor = sourceEvents[0] ? new Date(sourceEvents[0].startDateTime) : new Date();
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const monthEvents = sourceEvents.filter((event) => {
    const date = new Date(event.startDateTime);
    return date.getFullYear() === year && date.getMonth() === month;
  });
  const byDay = new Map<number, EncounterEvent[]>();
  for (const event of monthEvents) {
    const day = new Date(event.startDateTime).getDate();
    const current = byDay.get(day) || [];
    current.push(event);
    byDay.set(day, current);
  }

  return (
    <div className={compact ? "encounter-calendar compact" : "encounter-calendar"}>
      <div className="calendar-head">
        <div><small>FATE ENCOUNTERS</small><h3>{monthLabel(anchor)}</h3></div>
        <span className="calendar-demo">Live UK feed</span>
      </div>
      <div className="calendar-grid" role="grid" aria-label={`Live Fate Encounters calendar for ${monthLabel(anchor)}`}>
        {weekdays.map((day) => <span className="weekday" role="columnheader" key={day}>{day}</span>)}
        {Array.from({ length: mondayOffset }, (_, index) => <span className="calendar-blank" aria-hidden="true" key={`blank-${index}`} />)}
        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
          const dayEvents = byDay.get(day) || [];
          const event = dayEvents[0];
          if (!event) return <span className="calendar-day" role="gridcell" key={day}><b>{day}</b></span>;
          const label = dayEvents.length > 1 ? `${event.name} +${dayEvents.length - 1}` : event.name;
          const content = <><b>{day}</b><i /><small>{label}</small></>;
          return event.officialEventUrl ? <a className={`calendar-day has-event ${tone(event)}`} href={event.officialEventUrl} target="_blank" rel="noreferrer" role="gridcell" key={day} aria-label={`${day} ${monthLabel(anchor)}: ${label}`}>{content}</a> : <span className={`calendar-day has-event ${tone(event)}`} role="gridcell" key={day} aria-label={`${day} ${monthLabel(anchor)}: ${label}`}>{content}</span>;
        })}
      </div>
      <div className="calendar-foot">
        <span><i className="legend-violet" />Card show / convention</span>
        <span><i className="legend-cyan" />Trade / play event</span>
        <p>{monthEvents.length} source-verified listing{monthEvents.length === 1 ? "" : "s"} in this month.</p>
      </div>
      <div className="event-data-state" role="status"><b>Live feed</b><span>Event details are sourced from FateDrop&apos;s hosted Encounters feed. Check the organiser or ticket source before travelling.</span></div>
    </div>
  );
}
