"use client";

import Link from "next/link";
import { useState } from "react";
import { LocalRadarSearch } from "@/components/local-radar-search";

type RadarView = "overview" | "stores" | "events";

const evidence = [
  ["NEARBY", "A physical location exists near the chosen area. This is not a stock claim."],
  ["ECHO / PREPARATION", "Meaningful local preparation evidence exists, but confirmed branch stock has not been proven."],
  ["MANIFESTED", "FateDrop has verified physical branch stock evidence for that product and location."],
  ["VANISHED", "Previously verified physical branch stock is no longer evidenced as available."],
] as const;

export function LocalRadarDashboard() {
  const [view, setView] = useState<RadarView>("overview");

  return <div className="fd-local-radar-dashboard">
    <section className="fd-radar-tabs" aria-label="Local Radar sections">
      <button type="button" className={view === "overview" ? "active" : ""} onClick={() => setView("overview")}>Overview</button>
      <button type="button" className={view === "stores" ? "active" : ""} onClick={() => setView("stores")}>Local Stores</button>
      <button type="button" className={view === "events" ? "active" : ""} onClick={() => setView("events")}>Events</button>
    </section>

    {view === "overview" ? <>
      <section className="fd-dash-card fd-network-card">
        <div className="fd-dash-card-head"><span>LOCAL RADAR · OVERVIEW</span><i className="pending">LOCATION ON DEMAND</i></div>
        <div className="fd-network-message">
          <h1>Your physical Fate Network view.<br/>Stores, preparation, verified stock and events — kept separate.</h1>
          <p>Local Radar uses the shared Fate Network retailer, branch and event identities. A store being nearby does <strong>not</strong> mean stock is confirmed, and missing physical evidence does <strong>not</strong> mean a branch is out of stock.</p>
        </div>
        <div className="fd-radar-actions"><button type="button" onClick={() => setView("stores")}>FIND LOCAL STORES →</button><button type="button" onClick={() => setView("events")}>VIEW EVENTS →</button></div>
      </section>

      <section className="fd-radar-evidence" aria-label="Local Radar evidence states">
        {evidence.map(([title, copy]) => <article className="fd-dash-card" key={title}><small>{title}</small><p>{copy}</p></article>)}
      </section>

      <section className="fd-dash-card fd-radar-ready">
        <div className="fd-dash-card-head"><span>READY FOR CLOUD ENRICHMENT</span><small>Evidence fields only when known</small></div>
        <p>The UI is prepared for branch distance, freshness, confidence, price, RRP and percentage-vs-RRP when the shared Cloud contracts provide them. FateDrop will leave those fields unknown rather than inventing values.</p>
      </section>
    </> : null}

    {view === "stores" ? <>
      <section className="fd-dash-card fd-network-card">
        <div className="fd-dash-card-head"><span>LOCAL STORES</span><i className="pending">SAME BRANCH REGISTRY AS STORES</i></div>
        <div className="fd-network-message"><h1>Find physical TCG locations near you.</h1><p>This is the proximity-filtered physical Stores view. Discovery and branch stock remain separate: Local Radar only upgrades a nearby location to Echo, Manifested or Vanished when Cloud supplies evidence for that exact physical scope.</p></div>
      </section>
      <section className="fd-dash-card fd-radar-search"><div className="fd-dash-card-head"><span>DISCOVER NEARBY TCG STORES</span><small>Device location or UK postcode · up to 50 miles</small></div><LocalRadarSearch/></section>
    </> : null}

    {view === "events" ? <>
      <section className="fd-dash-card fd-network-card">
        <div className="fd-dash-card-head"><span>LOCAL EVENTS</span><i className="pending">SHARED EVENT DATA</i></div>
        <div className="fd-network-message"><h1>Events belong beside the places that host them.</h1><p>The existing FateDrop event feed remains intact while Cloud completes location-aware branch/event contracts. Until that local scope is available, this view does not guess that an event is near you.</p></div>
      </section>
      <section className="fd-dash-card fd-radar-event-state">
        <small>CANONICAL EVENT VIEW</small>
        <h2>Browse current Fate Encounters without fabricating local distance.</h2>
        <p>Open the existing events surface for current network event data. Local Radar can consume the same event identities once a verified location scope is available.</p>
        <Link href="/dashboard/events">OPEN EVENTS →</Link>
      </section>
    </> : null}

    <style>{`.fd-local-radar-dashboard{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-radar-tabs{display:flex;gap:8px;flex-wrap:wrap}.fd-radar-tabs button{appearance:none;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:rgba(255,255,255,.025);color:#9d97a4;padding:10px 14px;font:inherit;font-size:9px;font-weight:850;letter-spacing:.05em;cursor:pointer}.fd-radar-tabs button.active{border-color:rgba(103,232,249,.35);background:linear-gradient(135deg,rgba(88,232,255,.1),rgba(157,109,255,.11));color:#fff}.fd-network-card,.fd-radar-ready,.fd-radar-search,.fd-radar-event-state{padding:25px}.fd-radar-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}.fd-radar-actions button,.fd-radar-event-state a{appearance:none;border:1px solid rgba(183,119,233,.2);border-radius:10px;background:rgba(183,119,233,.07);color:#d4b5ed;padding:10px 12px;font:inherit;font-size:8px;font-weight:900;text-decoration:none;cursor:pointer}.fd-radar-evidence{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.fd-radar-evidence article{padding:18px}.fd-radar-evidence small,.fd-radar-event-state>small{color:#b6977d;font-size:8px;font-weight:900;letter-spacing:.1em}.fd-radar-evidence p,.fd-radar-ready p,.fd-radar-event-state p{margin:8px 0 0;color:#918b96;font-size:10px;line-height:1.65}.fd-radar-event-state h2{margin:8px 0 0;color:#e7ddd6;font-size:24px}.fd-radar-event-state a{display:inline-block;margin-top:16px}@media(max-width:1050px){.fd-radar-evidence{grid-template-columns:1fr 1fr}}@media(max-width:650px){.fd-radar-evidence{grid-template-columns:1fr}.fd-network-card,.fd-radar-ready,.fd-radar-search,.fd-radar-event-state{padding:20px}}`}</style>
  </div>;
}
