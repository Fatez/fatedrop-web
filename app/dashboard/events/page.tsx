import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";

export const metadata: Metadata = { title: "UK Card Events | FateDrop Dashboard", robots: { index: false, follow: false } };

type Event = {
  name: string;
  date: string;
  endDate?: string;
  city: string;
  region: string;
  venue?: string;
  price: string;
  type: "Major" | "Regional" | "Community" | "Pokémon";
  source: string;
  booking?: string;
};

const events: Event[] = [
  { name:"Worcester Card Show", date:"2026-08-22", endDate:"2026-08-23", city:"Worcester", region:"West Midlands", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/tcg-trade-events-uk/" },
  { name:"Spalding Card Show", date:"2026-08-23", city:"Spalding", region:"East Midlands", price:"£2.99–£13.99", type:"Regional", source:"https://www.ukcardshows.co.uk/copy-of-home" },
  { name:"The Elite Card Show", date:"2026-08-30", city:"Belfast", region:"Northern Ireland", venue:"Waterfront Hall", price:"See tickets", type:"Major", source:"https://cardshowfinder.uk/events/K07ZkNkSjJlMvjYRkiQD/" },
  { name:"Glasgow Card Show", date:"2026-09-05", endDate:"2026-09-06", city:"Glasgow", region:"Scotland", venue:"Hampden Park", price:"See tickets", type:"Major", source:"https://cardshowfinder.uk/events/ugbqgog20eE4rZrYw1yJ/" },
  { name:"CARD CON IV", date:"2026-09-05", endDate:"2026-09-06", city:"Farnborough", region:"South East", venue:"Farnborough International", price:"Free–£63.50", type:"Major", source:"https://cardshowfinder.uk/events/2A9Jtlqv3seM4kruN0te/" },
  { name:"Ipswich Card Show #6", date:"2026-09-06", city:"Ipswich", region:"East of England", venue:"Inspire: Sports Dome", price:"£2–£12", type:"Regional", source:"https://www.ukcardshows.co.uk/" },
  { name:"Midlands Card Expo #3", date:"2026-09-12", city:"Solihull", region:"West Midlands", venue:"National Conference Centre", price:"See tickets", type:"Major", source:"https://cardshowfinder.uk/events/uINwZk1nGYrOURWb7Bys/" },
  { name:"London Card Show: TCG Fest", date:"2026-09-13", city:"Esher", region:"South East", venue:"Sandown Park Racecourse", price:"See tickets", type:"Major", source:"https://cardshowfinder.uk/events/bK5vr0Dzij6mU3hTuFhg/" },
  { name:"Derby Card Show #4", date:"2026-09-19", city:"Derby", region:"East Midlands", venue:"Reach Conference Centre", price:"£2–£12", type:"Regional", source:"https://www.ukcardshows.co.uk/" },
  { name:"Birmingham Card Show", date:"2026-09-19", endDate:"2026-09-20", city:"Birmingham", region:"West Midlands", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/tcg-trade-events-uk/" },
  { name:"Sheffield Card Show #2", date:"2026-09-20", city:"Sheffield", region:"Yorkshire", venue:"Sheffield United Stadium", price:"£2–£10", type:"Regional", source:"https://www.ukcardshows.co.uk/" },
  { name:"Cards Convention London", date:"2026-09-20", city:"Wembley", region:"London", venue:"BOXPARK Wembley", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/events/BGUfhCG47IPpBUyTxV18/" },
  { name:"Lee Valley Card Show", date:"2026-09-20", city:"London", region:"London", venue:"Lee Valley Athletics Centre", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/events/zyzZc2QAFFUTTZ4aVOJ1/" },
  { name:"Card Co Manchester", date:"2026-09-27", city:"Manchester", region:"North West", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/card-co-events/" },
  { name:"Cardmania Worthing", date:"2026-09-27", city:"Worthing", region:"South East", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/cardmania-events/" },
  { name:"Swindon Card Show", date:"2026-10-03", endDate:"2026-10-04", city:"Swindon", region:"South West", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/tcg-trade-events-uk/" },
  { name:"Cardmania Stoke", date:"2026-10-03", city:"Stoke-on-Trent", region:"West Midlands", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/cardmania-events/" },
  { name:"South Coast Card Show", date:"2026-10-04", city:"Plymouth", region:"South West", price:"See tickets", type:"Community", source:"https://cardshowfinder.uk/updates/" },
  { name:"Milton Keynes Card Show", date:"2026-10-11", city:"Milton Keynes", region:"South East", venue:"Unity Place", price:"£2.50–£10", type:"Regional", source:"https://www.ukcardshows.co.uk/" },
  { name:"Cardmania Glasgow", date:"2026-10-11", city:"Glasgow", region:"Scotland", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/cardmania-events/" },
  { name:"The Card Show UK – Luton", date:"2026-10-11", city:"Luton", region:"East of England", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/the-card-show-uk/" },
  { name:"Card Co Birmingham", date:"2026-10-11", city:"Birmingham", region:"West Midlands", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/card-co-events/" },
  { name:"NCS Brighton Card Show", date:"2026-10-17", city:"Brighton", region:"South East", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/northern-card-shows/" },
  { name:"CollectorCon Manchester", date:"2026-10-18", city:"Manchester", region:"North West", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/updates/" },
  { name:"NCS Southampton Card Show", date:"2026-10-18", city:"Southampton", region:"South East", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/northern-card-shows/" },
  { name:"Card Market London", date:"2026-10-18", city:"London", region:"London", venue:"Royal National Hotel", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/events/8rvvjkqv0rqrXjjwbY2Y/" },
  { name:"Preston Card Fest – Halloween Special", date:"2026-10-24", city:"Preston", region:"North West", price:"See tickets", type:"Community", source:"https://cardshowfinder.uk/updates/" },
  { name:"Game of Binders Aberdeen Card Show", date:"2026-10-24", city:"Aberdeen", region:"Scotland", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/updates/" },
  { name:"Newmarket Card Show #3", date:"2026-10-25", city:"Newmarket", region:"East of England", venue:"Newmarket Racecourse", price:"£5–£15", type:"Regional", source:"https://www.ukcardshows.co.uk/" },
  { name:"Card Co Bristol 2", date:"2026-10-25", city:"Bristol", region:"South West", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/card-co-events/" },
  { name:"NCS Stoke Card Show 2", date:"2026-10-25", city:"Stoke-on-Trent", region:"West Midlands", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/northern-card-shows/" },
  { name:"London Card Show", date:"2026-10-30", endDate:"2026-11-01", city:"Esher", region:"South East", venue:"Sandown Park Racecourse", price:"See tickets", type:"Major", source:"https://cardshowfinder.uk/events/rEVuRpKHCrkNCmMD8LS2/" },
  { name:"Perth Scotland Pokémon Card Show/Market", date:"2026-10-31", city:"Perth", region:"Scotland", venue:"West Carse Hall", price:"See tickets", type:"Pokémon", source:"https://cardshowfinder.uk/events/Ly5oVy2emEnpnE3No4eJ/" },
  { name:"Birmingham Card Show #7", date:"2026-11-07", city:"Birmingham", region:"West Midlands", venue:"The New Bingley Hall", price:"See tickets", type:"Major", source:"https://www.ukcardshows.co.uk/" },
  { name:"Cardmania XL Coventry", date:"2026-11-07", city:"Coventry", region:"West Midlands", price:"See tickets", type:"Major", source:"https://cardshowfinder.uk/organisers/cardmania-events/" },
  { name:"Newark Card Show", date:"2026-11-07", city:"Newark", region:"East Midlands", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/updates/" },
  { name:"Cheltenham Card Show", date:"2026-11-14", endDate:"2026-11-15", city:"Cheltenham", region:"South West", venue:"Leonardo Hotel Cheltenham", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/events/ORV3fyCNY3ylw0YQr4wh/" },
  { name:"The Scotland Card Show – Edinburgh", date:"2026-11-14", city:"Edinburgh", region:"Scotland", price:"See tickets", type:"Major", source:"https://www.cardpulse.club/card-shows/united-kingdom" },
  { name:"London Card Fest", date:"2026-11-15", city:"London", region:"London", venue:"Canons Leisure Centre", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/events/xL65MrZod6SdnAVfg7Bn/" },
  { name:"NCS Carlisle Card Show", date:"2026-11-15", city:"Carlisle", region:"North West", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/northern-card-shows/" },
  { name:"Collectors Showcase", date:"2026-11-21", endDate:"2026-11-22", city:"London", region:"London", venue:"Olympia", price:"£5–£30", type:"Major", source:"https://www.ukcardshows.co.uk/" },
  { name:"Cotswold Card Show", date:"2026-11-21", city:"Evesham", region:"West Midlands", price:"See tickets", type:"Community", source:"https://cardshowfinder.uk/updates/" },
  { name:"Chepstow 2 – TCG Cymru", date:"2026-11-28", city:"Chepstow", region:"Wales", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/updates/" },
  { name:"The Card Market Camden", date:"2026-11-29", city:"London", region:"London", venue:"Haverstock School", price:"See tickets", type:"Community", source:"https://cardshowfinder.uk/events/gLMQl5ovKACmiJEPZ0St/" },
  { name:"Cards Convention North East", date:"2026-11-29", city:"Houghton-le-Spring", region:"North East", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/updates/" },
  { name:"Cambridge Card Show #12", date:"2026-12-05", city:"Cambridge", region:"East of England", venue:"Cambridge Regional College", price:"£2–£12", type:"Regional", source:"https://www.ukcardshows.co.uk/" },
  { name:"The Card Show UK – London", date:"2026-12-05", city:"London", region:"London", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/the-card-show-uk/" },
  { name:"Twickenham Card Show", date:"2026-12-05", endDate:"2026-12-06", city:"Twickenham", region:"London", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/tcg-trade-events-uk/" },
  { name:"Livingston Pokémon Card Show & Market", date:"2026-12-05", city:"Livingston", region:"Scotland", price:"See tickets", type:"Pokémon", source:"https://cardshowfinder.uk/organisers/top-deck-organisers/" },
  { name:"The Vault Kon UK", date:"2026-12-12", city:"Fleet", region:"South East", price:"See tickets", type:"Community", source:"https://cardshowfinder.uk/updates/" },
  { name:"NCS Manchester Card Show 3", date:"2026-12-13", city:"Manchester", region:"North West", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/northern-card-shows/" },
  { name:"Birmingham Card Show", date:"2026-12-19", endDate:"2026-12-20", city:"Birmingham", region:"West Midlands", price:"See tickets", type:"Regional", source:"https://cardshowfinder.uk/organisers/tcg-trade-events-uk/" },
];

const months = ["August", "September", "October", "November", "December"];
const monthNumber: Record<string, number> = { August:8, September:9, October:10, November:11, December:12 };

function dayLabel(date: string, endDate?: string) {
  const start = new Date(`${date}T12:00:00Z`);
  const first = new Intl.DateTimeFormat("en-GB", { day:"numeric", month:"short" }).format(start);
  if (!endDate) return first;
  const end = new Date(`${endDate}T12:00:00Z`);
  return `${first}–${new Intl.DateTimeFormat("en-GB", { day:"numeric", month:"short" }).format(end)}`;
}

export default function DashboardEventsPage() {
  return (
    <DashboardPageShell title="Events" eyebrow="UK CARD SHOW INTELLIGENCE">
      <div className="fd-events-wrap">
        <section className="fd-dash-card fd-events-hero">
          <div><span>FATEDROP / UK EVENT RADAR</span><h1>Find the next card show.<br/>Before the weekend finds you.</h1><p>A UK-wide working calendar of TCG, Pokémon and collector events. Prices shown where organisers publish them; every listing links back to a reference source so details can be checked before travelling.</p></div>
          <div className="fd-events-stats"><div><strong>{events.length}</strong><small>VERIFIED / SOURCED</small></div><div><strong>12</strong><small>UK REGIONS</small></div><div><strong>5</strong><small>MONTHS MAPPED</small></div></div>
        </section>

        <section className="fd-events-sources">
          <div><b>PRIMARY DISCOVERY</b><span>CardShow Finder UK currently lists hundreds of upcoming UK events, including community-scale shows.</span><a href="https://cardshowfinder.uk/events/" target="_blank" rel="noreferrer">Open full directory ↗</a></div>
          <div><b>PRICE CROSS-CHECK</b><span>UK Card Shows publishes ticket ranges for many established shows.</span><a href="https://www.ukcardshows.co.uk/" target="_blank" rel="noreferrer">Check ticket listings ↗</a></div>
          <div><b>POKÉMON CROSS-CHECK</b><span>PokePrices maintains a Pokémon-focused UK show calendar.</span><a href="https://www.pokeprices.io/card-shows/uk" target="_blank" rel="noreferrer">Check Pokémon shows ↗</a></div>
        </section>

        {months.map((month) => {
          const monthEvents = events.filter((event) => Number(event.date.slice(5,7)) === monthNumber[month]);
          return <section className="fd-dash-card fd-event-month" key={month}>
            <div className="fd-dash-card-head"><span>{month.toUpperCase()} 2026</span><small>{monthEvents.length} tracked events</small></div>
            <div className="fd-event-calendar">
              {monthEvents.map((event) => <article key={`${event.date}-${event.name}`}>
                <time><strong>{new Date(`${event.date}T12:00:00Z`).getUTCDate()}</strong><small>{new Intl.DateTimeFormat("en-GB",{weekday:"short"}).format(new Date(`${event.date}T12:00:00Z`)).toUpperCase()}</small></time>
                <div className="fd-event-info"><div className="fd-event-tags"><span>{event.type}</span><i>{event.region}</i></div><h2>{event.name}</h2><p>{event.venue ? `${event.venue} · ` : ""}{event.city}</p><small>{dayLabel(event.date,event.endDate)}</small></div>
                <div className="fd-event-price"><small>ENTRY</small><strong>{event.price}</strong><a href={event.source} target="_blank" rel="noreferrer">Details / tickets ↗</a></div>
              </article>)}
            </div>
          </section>;
        })}

        <section className="fd-event-note"><strong>Coverage note</strong><p>This is FateDrop’s sourced launch dataset, not a claim that every village/community event in Britain has been captured forever. The source directory currently contains far more listings than we should hard-code by hand. The next engineering step is an event-ingestion job so new shows, date changes and ticket updates flow into FateDrop automatically.</p></section>
      </div>
      <style>{`
        .fd-events-wrap{display:grid;gap:18px}.fd-events-hero{padding:32px;display:flex;justify-content:space-between;gap:30px;align-items:end;background:radial-gradient(circle at 82% 20%,rgba(112,66,190,.18),transparent 30%),#0a090e}.fd-events-hero>div:first-child{max-width:720px}.fd-events-hero span{font-size:10px;letter-spacing:.16em;color:#9e72e8;font-weight:800}.fd-events-hero h1{font-size:34px;line-height:1.04;margin:10px 0}.fd-events-hero p{color:#96909d;font-size:13px;line-height:1.65}.fd-events-stats{display:flex;gap:12px}.fd-events-stats div{min-width:105px;padding:15px;border:1px solid #25212c;border-radius:14px;background:#0d0b11}.fd-events-stats strong{display:block;font-size:22px}.fd-events-stats small{font-size:7px;letter-spacing:.11em;color:#716b79}.fd-events-sources{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.fd-events-sources>div{border:1px solid #211d27;background:#0a090e;border-radius:16px;padding:17px}.fd-events-sources b{display:block;font-size:9px;letter-spacing:.13em;color:#a879f1}.fd-events-sources span{display:block;color:#8c8593;font-size:11px;line-height:1.5;margin:8px 0}.fd-events-sources a,.fd-event-price a{color:#c7a9ff;font-size:10px}.fd-event-month{overflow:hidden}.fd-event-calendar article{display:grid;grid-template-columns:72px 1fr 150px;align-items:center;min-height:116px;border-top:1px solid #19161e;padding:0 20px}.fd-event-calendar article:first-child{border-top:0}.fd-event-calendar time{display:flex;flex-direction:column;align-items:center;border-right:1px solid #1d1922;padding-right:20px}.fd-event-calendar time strong{font-size:26px}.fd-event-calendar time small{font-size:8px;color:#8c6cc3;letter-spacing:.1em}.fd-event-info{padding:18px 22px}.fd-event-tags{display:flex;gap:7px;margin-bottom:7px}.fd-event-tags span,.fd-event-tags i{font-size:7px;text-transform:uppercase;letter-spacing:.1em;border:1px solid #2c2437;padding:4px 6px;border-radius:999px;color:#a37adf;font-style:normal}.fd-event-tags i{color:#77717e}.fd-event-info h2{font-size:15px;margin:0 0 5px}.fd-event-info p,.fd-event-info>small{font-size:10px;color:#817a88;margin:0}.fd-event-price{text-align:right}.fd-event-price>small{display:block;font-size:7px;letter-spacing:.12em;color:#625c69}.fd-event-price strong{display:block;font-size:13px;margin:4px 0 7px}.fd-event-note{border:1px solid rgba(159,111,234,.22);border-radius:16px;padding:18px 20px;background:rgba(100,55,150,.06)}.fd-event-note strong{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#a77be8}.fd-event-note p{font-size:11px;color:#85808b;line-height:1.6;margin:7px 0 0}@media(max-width:900px){.fd-events-hero{display:block}.fd-events-stats{margin-top:20px;flex-wrap:wrap}.fd-events-sources{grid-template-columns:1fr}.fd-event-calendar article{grid-template-columns:58px 1fr}.fd-event-price{grid-column:2;text-align:left;padding:0 22px 18px}.fd-event-calendar time{padding-right:12px}.fd-event-info{padding-right:4px}}
      `}</style>
    </DashboardPageShell>
  );
}
