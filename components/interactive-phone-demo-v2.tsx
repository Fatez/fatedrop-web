"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./interactive-phone-demo-v2.module.css";

type Screen = "home" | "search" | "indies" | "alerts" | "more";
type MoreView = "wishlist" | "radar" | "events";

const nav: { id: Screen; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "search", label: "Search" },
  { id: "indies", label: "Indies" },
  { id: "alerts", label: "Alerts" },
  { id: "more", label: "More" },
];

const offers = [
  { retailer: "Northstar Cards", item: 49.99, postage: 3.49, rrp: 49.99, stock: "In stock" },
  { retailer: "Card Corner UK", item: 54.99, postage: 0, rrp: 49.99, stock: "In stock" },
  { retailer: "The Indie Deck", item: 51.5, postage: 2.99, rrp: 49.99, stock: "Low stock" },
];

const money = (value: number) => `£${value.toFixed(2)}`;
const markup = (price: number, rrp: number) => Math.round(((price - rrp) / rrp) * 100);

export function InteractivePhoneDemo() {
  const [screen, setScreen] = useState<Screen>("home");
  const [moreView, setMoreView] = useState<MoreView>("wishlist");
  const [truePrice, setTruePrice] = useState(true);
  const [saved, setSaved] = useState(false);
  const [huntActive, setHuntActive] = useState(false);
  const [matchSeen, setMatchSeen] = useState(false);

  const journey = useMemo(() => {
    if (matchSeen) return 6;
    if (huntActive) return 5;
    if (saved) return 4;
    if (screen === "search" && truePrice) return 3;
    if (screen === "search") return 2;
    return 1;
  }, [huntActive, matchSeen, saved, screen, truePrice]);

  function openFateFind() {
    setScreen("alerts");
  }

  return (
    <div className={styles.showcase}>
      <div className={styles.heading}>
        <span>TRY FATEDROP</span>
        <strong>A working miniature of the collector journey.</strong>
        <small>Interactive preview · sample data · retailer checkout remains external</small>
      </div>

      <div className={styles.productGrid}>
        <div className={styles.phoneColumn}>
          <div className={styles.phone}>
            <div className={styles.island} />
            <header className={styles.phoneHeader}><span>09:41</span><b>Fate<em>Drop</em></b><small>SAMPLE</small></header>
            <main className={styles.phoneBody}>
              {screen === "home" && <HomeScreen onSearch={() => setScreen("search")} onAlerts={() => setScreen("alerts")} onMore={(view) => { setMoreView(view); setScreen("more"); }} />}
              {screen === "search" && <SearchScreen truePrice={truePrice} setTruePrice={setTruePrice} saved={saved} setSaved={setSaved} openFateFind={openFateFind} />}
              {screen === "indies" && <IndiesScreen />}
              {screen === "alerts" && <AlertsScreen huntActive={huntActive} setHuntActive={setHuntActive} matchSeen={matchSeen} setMatchSeen={setMatchSeen} />}
              {screen === "more" && <MoreScreen view={moreView} setView={setMoreView} saved={saved} />}
            </main>
            <nav className={styles.phoneNav}>{nav.map((item) => <button key={item.id} type="button" className={screen === item.id ? styles.active : ""} onClick={() => setScreen(item.id)}>{item.label}</button>)}</nav>
          </div>
          <div className={styles.progress}><span>COLLECTOR FLOW · {journey}/6</span><i><b style={{ width: `${journey / 6 * 100}%` }} /></i><small>{["Start with live network context", "Find one product", "Compare RRP + True Price", "Save it or define a hunt", "FateFind watches in Cloud", "FateMatch arrives when conditions are met"][journey - 1]}</small></div>
        </div>

        <DashboardShowcase />
      </div>

      <section className={styles.companionStrip} aria-label="FateDrop Companion preview">
        <div className={styles.companionOrb}><span>FD</span><i /></div>
        <div><small>COMPANION · 3D ASSET SLOT READY</small><h3>Your signal has a face.</h3><p>The production 3D Companion will react to Echo, Manifested, Vanished and FateMatch across mobile and dashboard. This slot uses the renderer contract now and will accept the final GLB character + signal droid without rebuilding the account system.</p></div>
        <div className={styles.reactions}><span>ECHO <b>scanner wakes</b></span><span>MANIFESTED <b>strong confirm</b></span><span>FATEMATCH <b>hunt complete</b></span></div>
      </section>
    </div>
  );
}

function HomeScreen({ onSearch, onAlerts, onMore }: { onSearch: () => void; onAlerts: () => void; onMore: (view: MoreView) => void }) {
  return <div className={styles.screen}><small>NETWORK ACTIVITY · SAMPLE</small><h3>Know what moved.</h3><div className={styles.signalCard}><b>MANIFESTED</b><strong>Journey Together ETB</strong><span>Confirmed example availability · 2m ago</span></div><div className={`${styles.signalCard} ${styles.echo}`}><b>ECHO</b><strong>Prismatic Evolutions Bundle</strong><span>Meaningful early catalogue movement · not confirmed stock</span></div><div className={styles.quickGrid}><button onClick={onSearch}>Search market</button><button onClick={onAlerts}>My alerts</button><button onClick={() => onMore("radar")}>Local Radar</button><button onClick={() => onMore("events")}>Events</button></div></div>;
}

function SearchScreen({ truePrice, setTruePrice, saved, setSaved, openFateFind }: { truePrice: boolean; setTruePrice: (v: boolean) => void; saved: boolean; setSaved: (v: boolean) => void; openFateFind: () => void }) {
  return <div className={styles.screen}><small>SEARCH · PRODUCT FIRST</small><h3>Journey Together ETB</h3><p className={styles.rrp}>Official RRP <b>£49.99</b></p>{offers.map((offer) => { const delivered = offer.item + offer.postage; return <article className={styles.offer} key={offer.retailer}><div><strong>{offer.retailer}</strong><span>{offer.stock}</span></div><div><b>{money(offer.item)}</b><small>{markup(offer.item, offer.rrp) === 0 ? "At RRP" : `+${markup(offer.item, offer.rrp)}% above RRP`}</small></div>{truePrice && <p>True Price <b>{money(delivered)}</b> delivered</p>}</article>; })}<button className={styles.primary} onClick={() => setTruePrice(!truePrice)}>{truePrice ? "Hide True Price" : "Compare True Price"}</button><button className={styles.secondary} onClick={() => setSaved(!saved)}>{saved ? "✓ Saved to Wishlist" : "+ Save to Wishlist"}</button><button className={styles.hunt} onClick={openFateFind}>Create FateFind →</button></div>;
}

function IndiesScreen() {
  return <div className={styles.screen}><small>INDIES · DISCOVERY</small><h3>Independent stores, connected.</h3><article className={styles.store}><span>VERIFIED BUSINESS · SAMPLE</span><strong>Northstar Cards</strong><p>1.8 mi · supplied delivery from £3.49</p><button>View storefront</button></article><article className={styles.store}><span>NETWORK RETAILER · SAMPLE</span><strong>The Indie Deck</strong><p>Online catalogue · direct retailer checkout</p><button>Compare offers</button></article></div>;
}

function AlertsScreen({ huntActive, setHuntActive, matchSeen, setMatchSeen }: { huntActive: boolean; setHuntActive: (v: boolean) => void; matchSeen: boolean; setMatchSeen: (v: boolean) => void }) {
  return <div className={styles.screen}><small>ALERTS · YOUR ACTIVITY</small><h3>FateFind + notification history.</h3><article className={styles.huntCard}><b>FATEFIND</b><strong>Journey Together ETB</strong><span>Max £55 delivered · UK · sealed</span><button onClick={() => setHuntActive(true)}>{huntActive ? "Watching in Cloud ✓" : "Activate sample hunt"}</button></article>{huntActive && <article className={styles.matchCard}><b>FATEMATCH</b><strong>Northstar Cards · £53.48 delivered</strong><span>Conditions satisfied · sample event</span><button onClick={() => setMatchSeen(true)}>{matchSeen ? "Viewed ✓" : "Open match"}</button></article>}<p className={styles.note}>Global Echo / Manifested / Vanished activity belongs on Home. Alerts is personal delivery and history.</p></div>;
}

function MoreScreen({ view, setView, saved }: { view: MoreView; setView: (v: MoreView) => void; saved: boolean }) {
  return <div className={styles.screen}><small>MORE · SECONDARY TOOLS</small><div className={styles.tabs}><button onClick={() => setView("wishlist")}>Wishlist</button><button onClick={() => setView("radar")}>Radar</button><button onClick={() => setView("events")}>Events</button></div>{view === "wishlist" && <><h3>Universal Wishlist</h3><p>{saved ? "Journey Together ETB is saved regardless of retailer or stock state." : "Save products you want without creating a monitored price rule."}</p></>}{view === "radar" && <><h3>Local Radar</h3><div className={styles.radar}><i /><span>Northstar Cards · 1.8 mi</span><span>Example card show · 2.4 mi</span></div></>}{view === "events" && <><h3>Fate Encounters</h3><article className={styles.event}><b>12 SEP</b><strong>Demo Card Show · Birmingham</strong><span>Sample event · vendors + schedule</span></article></>}</div>;
}

function DashboardShowcase() {
  return <aside className={styles.dashboard}><div className={styles.dashboardTop}><div><small>FATEDROP / COMMAND CENTRE</small><strong>Good afternoon, Collector.</strong></div><span>PREVIEW</span></div><div className={styles.dashboardStats}><article><small>ACTIVE FATEFINDS</small><b>04</b></article><article><small>FATEMATCHES TODAY</small><b>02</b></article><article><small>WISHLIST</small><b>17</b></article></div><div className={styles.dashboardColumns}><section><small>NETWORK ACTIVITY</small><article><b>MANIFESTED</b><span>Journey Together ETB</span><em>2m</em></article><article><b>ECHO</b><span>Catalogue movement detected</span><em>6m</em></article><article><b>VANISHED</b><span>Example stock no longer observed</span><em>19m</em></article></section><section><small>YOUR HUNTS</small><article><b>FATEFIND</b><span>Destined Rivals ETB · ≤ £65 delivered</span></article><article><b>FATEMATCH</b><span>Matched · £61.49 delivered</span></article></section></div><div className={styles.dashboardFooter}><span>One FateDrop ID</span><span>One entitlement</span><span>Web · App · Discord</span></div><Link href="/dashboard">Open dashboard preview →</Link></aside>;
}
