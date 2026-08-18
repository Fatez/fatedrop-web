import Link from "next/link";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const days = Array.from({ length: 30 }, (_, index) => index + 1);
const eventDays: Record<number, { label: string; href: string; tone: string }> = {
  12: { label: "Card Collective", href: "#demo-event-0", tone: "violet" },
  27: { label: "Trade & Play", href: "#demo-event-1", tone: "cyan" },
};

export function EventCalendar({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "encounter-calendar compact" : "encounter-calendar"}>
      <div className="calendar-head">
        <div>
          <small>FATE ENCOUNTERS</small>
          <h3>September 2026</h3>
        </div>
        <span className="calendar-demo">Demo calendar</span>
      </div>
      <div className="calendar-grid" role="grid" aria-label="Demo event calendar for September 2026">
        {weekdays.map((day) => <span className="weekday" role="columnheader" key={day}>{day}</span>)}
        <span className="calendar-blank" aria-hidden="true" />
        {days.map((day) => {
          const event = eventDays[day];
          return event ? (
            <Link className={`calendar-day has-event ${event.tone}`} href={event.href} role="gridcell" key={day} aria-label={`${day} September: Demo event, ${event.label}`}>
              <b>{day}</b><i /><small>{event.label}</small>
            </Link>
          ) : (
            <span className="calendar-day" role="gridcell" key={day}><b>{day}</b></span>
          );
        })}
      </div>
      <div className="calendar-foot">
        <span><i className="legend-violet" />Card show</span>
        <span><i className="legend-cyan" />Trade & play</span>
        <p>Live event data connection coming next.</p>
      </div>
      <div className="event-data-state" role="status"><b>Demo mode</b><span>No live event feed is connected. All dates and listings shown here are demonstrations.</span></div>
    </div>
  );
}
