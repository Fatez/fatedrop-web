"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./interactive-phone-demo-v2.module.css";

type Screen = "home" | "alerts" | "network" | "profile" | "search" | "fatefind" | "fatematch";

type Tab = "home" | "alerts" | "tools" | "network" | "profile";

const offers = [
  { retailer: "Cob & Pip", item: 8.99, postage: 2.95, rrp: 4.29, stock: "In stock" },
  { retailer: "Card Collective UK", item: 16.95, postage: 0, rrp: 17.16, stock: "In stock" },
  { retailer: "Northstar Cards", item: 41.0, postage: 3.49, rrp: 42.9, stock: "Low stock" },
];

const money = (value: number) => `£${value.toFixed(2)}`;
const delta = (price: number, rrp: number) => ((price - rrp) / rrp) * 100;

function activeTab(screen: Screen): Exclude<Tab, "tools"> | null {
  if (["home", "alerts", "network", "profile"].includes(screen)) return screen as Exclude<Tab, "tools">;
  return null;
}

export function InteractivePhoneDemo() {
  const [screen, setScreen] = useState<Screen>("home");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [watchActive, setWatchActive] = useState(false);
  const [matchSeen, setMatchSeen] = useState(false);

  const journey = useMemo(() => {
    if (matchSeen) return 6;
    if (watchActive) return 5;
    if (screen === "fatematch") return 4;
    if (screen === "fatefind") return 3;
    if (screen === "search") return 2;
    return 1;
  }, [matchSeen, screen, watchActive]);

  function openTool(next: "search" | "fatefind" | "fatematch") {
    setToolsOpen(false);
    setScreen(next);
  }

  const tab = activeTab(screen);

  return (
    <div className={styles.showcase}>
      <div className={styles.heading}>
        <span>TRY FATEDROP</span>
        <strong>A miniature of the real FateDrop mobile journey.</strong>
        <small>Current app structure · sample data · retailer checkout remains external</small>
      </div>

      <div className={styles.productGrid}>
        <div className={styles.phoneColumn}>
          <div className={styles.phone}>
            <div className={styles.island} />
            <header className={styles.phoneHeader}>
              <span>09:41</span>
              <b>FATEDROP</b>
              <small>SAMPLE</small>
            </header>

            <main className={styles.phoneBody}>
              {screen === "home" ? <HomeScreen onTool={openTool} onAlerts={() => setScreen("alerts")} onNetwork={() => setScreen("network")} /> : null}
              {screen === "alerts" ? <AlertsScreen watchActive={watchActive} matchSeen={matchSeen} onMatchSeen={() => setMatchSeen(true)} onFateFind={() => setScreen("fatefind")} /> : null}
              {screen === "network" ? <NetworkScreen onSearch={() => setScreen("search")} /> : null}
              {screen === "profile" ? <ProfileScreen /> : null}
              {screen === "search" ? <SearchScreen onFateFind={() => setScreen("fatefind")} onFateMatch={() => setScreen("fatematch")} /> : null}
              {screen === "fatefind" ? <FateFindScreen onWatch={() => setScreen("fatematch")} /> : null}
              {screen === "fatematch" ? <FateMatchScreen watchActive={watchActive} setWatchActive={setWatchActive} onAlerts={() => setScreen("alerts")} /> : null}
            </main>

            <nav className={styles.phoneNav} aria-label="Demo app tabs">
              <button type="button" className={tab === "home" ? styles.active : ""} onClick={() => setScreen("home")}><i>⌂</i><span>Home</span></button>
              <button type="button" className={tab === "alerts" ? styles.active : ""} onClick={() => setScreen("alerts")}><i>♧</i><span>Alerts</span>{watchActive ? <b>2</b> : null}</button>
              <button type="button" className={styles.toolButton} onClick={() => setToolsOpen(true)} aria-label="Open FateDrop tools"><i>◇</i></button>
              <button type="button" className={tab === "network" ? styles.active : ""} onClick={() => setScreen("network")}><i>⌁</i><span>Network</span></button>
              <button type="button" className={tab === "profile" ? styles.active : ""} onClick={() => setScreen("profile")}><i>◎</i><span>Profile</span></button>
            </nav>

            {toolsOpen ? <div className={styles.toolBackdrop} onClick={() => setToolsOpen(false)}>
              <div className={styles.toolSheet} onClick={(event) => event.stopPropagation()}>
                <header><span className={styles.toolEmblem}>◇</span><div><small>FATEDROP TOOLS</small><strong>What do you want FateDrop to do?</strong><p>Choose the job. The intelligence stays shared underneath.</p></div><button onClick={() => setToolsOpen(false)}>×</button></header>
                <button onClick={() => openTool("fatefind")}><i>⌕</i><span><strong>FateFind</strong><small>Compare live value and get the strongest-value verdict now.</small></span><b>→</b></button>
                <button onClick={() => openTool("fatematch")}><i>◇</i><span><strong>FateMatch</strong><small>Set the product and buying conditions. FateDrop watches for you.</small></span><b>→</b></button>
                <button onClick={() => openTool("search")}><i>⌕</i><span><strong>Search live database</strong><small>Browse current products and retailer offers without starting a watch.</small></span><b>→</b></button>
              </div>
            </div> : null}
          </div>

          <div className={styles.progress}>
            <span>COLLECTOR FLOW · {journey}/6</span>
            <i><b style={{ width: `${journey / 6 * 100}%` }} /></i>
            <small>{[
              "Start from the live network overview",
              "Search one product across the network",
              "Use FateFind to compare real value",
              "Turn intent into a FateMatch watch",
              "FateDrop Cloud keeps watching",
              "FATEMATCH — LIVE NOW when the rules are met",
            ][journey - 1]}</small>
          </div>
        </div>

        <DashboardShowcase />
      </div>

      <section className={styles.companionStrip} aria-label="Koru and Friends companion preview">
        <div className={styles.companionOrb}><span>K</span><i /></div>
        <div><small>KORU &amp; FRIENDS · PERSONALITY LAYER</small><h3>Choose who carries the signal with you.</h3><p>Koru, Fenn, Aeris, Nyxen and Solix can represent your personal FateDrop experience. The companion changes the presentation; the evidence, RRP logic and lifecycle meaning remain fixed.</p></div>
        <div className={styles.reactions}><span>WHISPER <b>movement noticed</b></span><span>ECHO <b>get ready</b></span><span>MANIFESTED <b>stock live</b></span><span>VANISHED <b>availability gone</b></span></div>
      </section>
    </div>
  );
}

function HomeScreen({ onTool, onAlerts, onNetwork }: { onTool: (tool: "search" | "fatefind" | "fatematch") => void; onAlerts: () => void; onNetwork: () => void }) {
  return <div className={styles.screen}>
    <div className={styles.mobileBrand}><span>FATEDROP</span><small>COLLECTOR FIRST</small><button onClick={onAlerts}>♧<b>3</b></button></div>
    <section className={styles.homeHero}><div className={styles.networkPill}><i/>12 MONITORS HEALTHY</div><small>KORU IS LISTENING</small><h3>Welcome back, Seeker.</h3><p>Live evidence, value context and your personal watches stay together.</p></section>
    <SectionTitle eyebrow="SIGNAL OVERVIEW" title="Your recent network" action="VIEW ALL" onAction={onAlerts}/>
    <div className={styles.metricGrid}><Metric label="ECHO" value="3"/><Metric label="MANIFESTED" value="7"/><Metric label="FATEMATCH" value="2"/><Metric label="NETWORK" value="92%"/></div>
    <SectionTitle eyebrow="QUICK ACCESS" title="Collector tools"/>
    <div className={styles.quickGrid}><Quick label="ECHO" copy="Readiness signals" onClick={onAlerts}/><Quick label="MANIFESTED" copy="Confirmed live drops" onClick={onAlerts}/><Quick label="FATEFIND" copy="Compare live value" onClick={() => onTool("fatefind")}/><Quick label="FATEMATCH" copy="Watch until it fits" onClick={() => onTool("fatematch")}/></div>
    <button className={styles.networkSummary} onClick={onNetwork}><i>⌁</i><span><small>NETWORK HEALTH</small><strong>Evidence is flowing.</strong><em>Inspect retailer monitors and network coverage.</em></span><b>→</b></button>
  </div>;
}

function SearchScreen({ onFateFind, onFateMatch }: { onFateFind: () => void; onFateMatch: () => void }) {
  return <div className={styles.screen}>
    <RouteHeader eyebrow="SEARCH · FIND WHAT EXISTS" title="Destined Rivals" copy="Search shows the current observed catalogue. It does not decide the best value for you."/>
    <div className={styles.searchBox}>⌕ <span>Destined Rivals</span></div>
    <article className={styles.productResult}><small>BOOSTER PACK · 2 OFFERS</small><strong>Pokémon TCG: Destined Rivals — Booster Pack</strong><div><span><b>£8.99</b><small>Cob & Pip</small></span><span><b>£9.49</b><small>Northstar Cards</small></span></div></article>
    <article className={styles.productResult}><small>SEALED · 1 OFFER</small><strong>Destined Rivals — 4 Pack Bundle</strong><div><span><b>£16.95</b><small>Card Collective UK</small></span><span><b>RRP £17.16</b><small>Component reference</small></span></div></article>
    <button className={styles.primary} onClick={onFateFind}>FateFind · compare best value →</button>
    <button className={styles.secondary} onClick={onFateMatch}>FateMatch · watch my conditions</button>
  </div>;
}

function FateFindScreen({ onWatch }: { onWatch: () => void }) {
  const single = offers[0];
  const bundle = offers[1];
  return <div className={styles.screen}>
    <RouteHeader eyebrow="FATEFIND · VALUE INTELLIGENCE" title="Which option is stronger value?" copy="Choose comparable configurations. FateDrop judges item price against the correct RRP/reference before adding known delivery context."/>
    <div className={styles.compareSelect}><label><small>ITEM A</small><span>Destined Rivals · Booster Pack⌄</span></label><b>vs</b><label><small>ITEM B</small><span>Destined Rivals · 4 Pack Bundle⌄</span></label></div>
    <div className={styles.valueCards}>
      <article><small>PACK RRP REFERENCE</small><strong>Booster Pack</strong><div><span>ITEM<b>{money(single.item)}</b></span><span>VS RRP<b className={delta(single.item,single.rrp)>0?styles.negative:styles.positive}>+{delta(single.item,single.rrp).toFixed(1)}%</b></span><span>TRUE PRICE<b>{money(single.item+single.postage)}</b></span></div></article>
      <article className={styles.bestValue}><small>BEST VALUE</small><strong>4 Pack Bundle</strong><div><span>ITEM<b>{money(bundle.item)}</b></span><span>VS RRP<b className={styles.positive}>{delta(bundle.item,bundle.rrp).toFixed(1)}%</b></span><span>TRUE PRICE<b>{money(bundle.item+bundle.postage)}</b></span></div></article>
    </div>
    <article className={styles.verdict}><small>FATEDROP VALUE VERDICT</small><strong>The 4 Pack Bundle is the stronger-value option.</strong><p>It costs more in absolute £, but sits much closer to its verified value reference.</p></article>
    <button className={styles.primary} onClick={onWatch}>FateMatch · watch my conditions →</button>
  </div>;
}

function FateMatchScreen({ watchActive, setWatchActive, onAlerts }: { watchActive: boolean; setWatchActive: (value: boolean) => void; onAlerts: () => void }) {
  return <div className={styles.screen}>
    <RouteHeader eyebrow="FATEMATCH · WATCH MY CONDITIONS" title="Let FateDrop keep watching." copy="Choose the product. Stock-only works immediately; add budget or RRP rules when you need them."/>
    <article className={styles.watchBuilder}><small>PRODUCT</small><strong>Destined Rivals · 4 Pack Bundle</strong><div><span><small>STOCK</small><b>IN STOCK</b></span><span><small>MAX ITEM</small><b>£18.00</b></span><span><small>MAX RRP</small><b>+5%</b></span></div><p>Companion: Koru · online retailers</p></article>
    <button className={styles.primary} onClick={() => setWatchActive(true)}>{watchActive ? "✓ Koru is watching" : "Start FateMatch watch →"}</button>
    {watchActive ? <article className={styles.activeWatch}><i>◇</i><span><small>ACTIVE FATEMATCH</small><strong>Waiting for an observed offer that genuinely fits.</strong><p>FateDrop Cloud continues even when the app is closed.</p></span></article> : null}
    {watchActive ? <button className={styles.secondary} onClick={onAlerts}>See how the alert arrives →</button> : null}
  </div>;
}

function AlertsScreen({ watchActive, matchSeen, onMatchSeen, onFateFind }: { watchActive: boolean; matchSeen: boolean; onMatchSeen: () => void; onFateFind: () => void }) {
  return <div className={styles.screen}>
    <RouteHeader eyebrow="ALERTS · PRECISE SIGNAL HISTORY" title="Know what happened." copy="Lifecycle tells you where the opportunity is. Cause tells you why the record exists."/>
    <div className={styles.stageTabs}><span>WHISPER <b>4</b></span><span>ECHO <b>3</b></span><span className={styles.stageLive}>MANIFESTED <b>7</b></span><span>VANISHED <b>2</b></span></div>
    {watchActive ? <article className={styles.matchCard}><b>FATEMATCH — LIVE NOW</b><strong>4 Pack Bundle · Card Collective UK</strong><span>£16.95 item · £16.95 True Price · −1.2% vs reference</span><small>Your max £18 / +5% conditions are satisfied.</small><button onClick={onMatchSeen}>{matchSeen ? "Viewed ✓" : "Open retailer"}</button></article> : null}
    <article className={styles.alertCard}><b>MANIFESTED · RESTOCK</b><strong>Journey Together ETB</strong><span>Confirmed purchasable availability · 2m ago</span><button onClick={onFateFind}>Compare value</button></article>
    <article className={styles.alertCard}><b>ECHO · QUEUE</b><strong>Pokémon Center UK</strong><span>Access readiness changed · stock is not confirmed</span></article>
    <article className={`${styles.alertCard} ${styles.vanished}`}><b>VANISHED · SOLD OUT</b><strong>Destined Rivals ETB</strong><span>Previously confirmed availability is gone</span><small>Observed live · 6m 24s</small></article>
  </div>;
}

function NetworkScreen({ onSearch }: { onSearch: () => void }) {
  return <div className={styles.screen}>
    <RouteHeader eyebrow="NETWORK · SOURCE HEALTH" title="See where the evidence comes from." copy="Retailer monitoring, independent discovery and physical-location evidence remain transparent instead of being blended together."/>
    <div className={styles.networkMetrics}><Metric label="RETAILERS" value="18"/><Metric label="HEALTHY" value="12"/><Metric label="PRODUCTS" value="6.3K"/></div>
    <article className={styles.networkRow}><i className={styles.good}/><span><strong>Pokémon Center UK</strong><small>National · reference / stock evidence</small></span><b>HEALTHY</b></article>
    <article className={styles.networkRow}><i className={styles.good}/><span><strong>Cob & Pip</strong><small>Independent · connected catalogue</small></span><b>CONNECTED</b></article>
    <article className={styles.networkRow}><i/><span><strong>Local discovery</strong><small>Physical location evidence · stock separate</small></span><b>DISCOVERY</b></article>
    <button className={styles.primary} onClick={onSearch}>Search this network →</button>
  </div>;
}

function ProfileScreen() {
  return <div className={styles.screen}>
    <RouteHeader eyebrow="FATEDROP ID" title="One identity everywhere." copy="Your username, membership, companion and preferences travel with the same FateDrop account."/>
    <article className={styles.profileCard}><div className={styles.avatar}>FD</div><span><small>FATEDROP ID · FD-000247</small><strong>Collector</strong><p>@seeker · member since Aug 2026</p></span></article>
    <div className={styles.profileFacts}><span><small>MEMBERSHIP</small><b>FateDrop Plus</b></span><span><small>COMPANION</small><b>Koru</b></span><span><small>DISCORD</small><b>Linked</b></span><span><small>SYNC</small><b>Web · App</b></span></div>
    <article className={styles.identityNote}><small>ONE ENTITLEMENT</small><strong>Pay once. Use the same Plus access across supported FateDrop surfaces.</strong><p>Discord role access and app membership consume the same authoritative entitlement.</p></article>
  </div>;
}

function RouteHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <header className={styles.routeHeader}><small>{eyebrow}</small><h3>{title}</h3><p>{copy}</p></header>;
}

function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className={styles.sectionTitle}><span><small>{eyebrow}</small><strong>{title}</strong></span>{action && onAction ? <button onClick={onAction}>{action} →</button> : null}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className={styles.metric}><i/><strong>{value}</strong><small>{label}</small></article>;
}

function Quick({ label, copy, onClick }: { label: string; copy: string; onClick: () => void }) {
  return <button className={styles.quick} onClick={onClick}><i>◇</i><strong>{label}</strong><small>{copy}</small></button>;
}

function DashboardShowcase() {
  return <aside className={styles.dashboard}>
    <div className={styles.dashboardTop}><div><small>FATEDROP / COLLECTOR WORKSPACE</small><strong>Know what moved. Know what matters.</strong></div><span>BETA PREVIEW</span></div>
    <div className={styles.dashboardStats}><article><small>ACTIVE FATEMATCH</small><b>04</b></article><article><small>FATEMATCHES TODAY</small><b>02</b></article><article><small>WISHLIST</small><b>17</b></article></div>
    <div className={styles.dashboardColumns}>
      <section><small>NETWORK ACTIVITY</small><article><b>MANIFESTED</b><span>Journey Together ETB</span><em>2m</em></article><article><b>ECHO</b><span>Queue/access readiness</span><em>6m</em></article><article><b>VANISHED</b><span>Observed stock gone</span><em>19m</em></article></section>
      <section><small>VALUE + MONITORING</small><article><b>FATEFIND</b><span>Compare strongest live value</span></article><article><b>FATEMATCH</b><span>Watching Destined Rivals · ≤ £18</span></article></section>
    </div>
    <div className={styles.dashboardFooter}><span>One FateDrop ID</span><span>One Plus entitlement</span><span>Web · App · Discord</span></div>
    <Link href="/dashboard">Open collector dashboard →</Link>
  </aside>;
}
