"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RetailerNetworkRecord } from "@/lib/retailer-network";

type RetailerView = "all" | "major" | "specialist" | "local";
type Presence = "all" | "online" | "physical";

function classLabel(value: string) {
  if (value === "national") return "Major retailer";
  if (value === "specialist") return "TCG specialist";
  if (value === "independent" || value === "regional") return "Independent & local";
  return value.replaceAll("_", " ") || "Retailer";
}

function tcgLabel(value: string) {
  const key = value.trim().toLowerCase().replaceAll("_", " ").replaceAll("-", " ");
  if (key === "pokemon") return "Pokémon";
  if (key === "one piece") return "One Piece";
  if (["mtg", "magic", "magic the gathering"].includes(key)) return "Magic";
  if (key === "lorcana") return "Lorcana";
  if (key === "yu gi oh" || key === "yugioh") return "Yu-Gi-Oh!";
  return key.split(/\s+/).filter(Boolean).map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}

function presenceText(retailer: RetailerNetworkRecord) {
  if (retailer.online && retailer.physicalStores === true) {
    return retailer.physicalLocations && retailer.physicalLocations > 0
      ? `Online + ${retailer.physicalLocations} physical location${retailer.physicalLocations === 1 ? "" : "s"}`
      : "Online + physical stores";
  }
  if (retailer.physicalStores === true) return "Physical stores";
  if (retailer.online && retailer.physicalStores === false) return "Online retailer";
  if (retailer.online) return "Online · physical status unknown";
  return "Retail presence unknown";
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function monitoringLabel(retailer: RetailerNetworkRecord) {
  if (!retailer.monitoring.configured) return "NOT MONITORED";
  if (retailer.monitoring.healthy && !retailer.monitoring.stale) return "MONITOR HEALTHY";
  if (retailer.monitoring.stale) return "MONITOR STALE";
  return "MONITOR ATTENTION";
}

function matchesView(retailer: RetailerNetworkRecord, view: RetailerView) {
  if (view === "all") return true;
  if (view === "major") return retailer.retailerClass === "national";
  if (view === "specialist") return retailer.retailerClass === "specialist";
  return retailer.retailerClass === "independent" || retailer.retailerClass === "regional";
}

function RetailerCard({ retailer }: { retailer: RetailerNetworkRecord }) {
  const logoStyle = retailer.logoUrl ? { backgroundImage: `url("${retailer.logoUrl}")` } : undefined;
  return <article className="fd-retailer-card">
    <div className="fd-retailer-card-top">
      <div className={`fd-retailer-logo ${retailer.logoUrl ? "has-logo" : ""}`} style={logoStyle} aria-label={`${retailer.name} retailer identity`}>
        {!retailer.logoUrl ? initials(retailer.name) : null}
      </div>
      <div className="fd-retailer-card-copy">
        <span>{classLabel(retailer.retailerClass).toUpperCase()}</span>
        <h2>{retailer.name}</h2>
        <p>{presenceText(retailer)}</p>
      </div>
    </div>
    <div className="fd-retailer-tags">
      {retailer.tcgs.length ? retailer.tcgs.slice(0, 5).map((tcg) => <span key={tcg}>{tcgLabel(tcg)}</span>) : <span>TCGs not supplied</span>}
    </div>
    <div className="fd-retailer-facts">
      <span>{String(retailer.verification || "unverified").replaceAll("_", " ").toUpperCase()}</span>
      <span>{monitoringLabel(retailer)}</span>
    </div>
    <Link className="fd-retailer-open" href={`/dashboard/stores/${encodeURIComponent(retailer.id)}`}>VIEW RETAILER →</Link>
  </article>;
}

export function RetailerMarketDirectory({ retailers }: { retailers: RetailerNetworkRecord[] }) {
  const [view, setView] = useState<RetailerView>("all");
  const [presence, setPresence] = useState<Presence>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => ({
    all: retailers.length,
    major: retailers.filter((retailer) => matchesView(retailer, "major")).length,
    specialist: retailers.filter((retailer) => matchesView(retailer, "specialist")).length,
    local: retailers.filter((retailer) => matchesView(retailer, "local")).length,
  }), [retailers]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en-GB");
    return retailers
      .filter((retailer) => matchesView(retailer, view))
      .filter((retailer) => presence === "all" || (presence === "online" ? retailer.online === true : retailer.physicalStores === true))
      .filter((retailer) => !normalized
        || retailer.name.toLocaleLowerCase("en-GB").includes(normalized)
        || classLabel(retailer.retailerClass).toLocaleLowerCase("en-GB").includes(normalized)
        || retailer.tcgs.some((tcg) => tcgLabel(tcg).toLocaleLowerCase("en-GB").includes(normalized)))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [presence, query, retailers, view]);

  return <div className="fd-retailer-directory">
    <section className="fd-retailer-tabs" aria-label="Retailer types">
      <button type="button" className={view === "all" ? "active" : ""} onClick={() => setView("all")}>All <b>{counts.all}</b></button>
      <button type="button" className={view === "major" ? "active" : ""} onClick={() => setView("major")}>Major Retailers <b>{counts.major}</b></button>
      <button type="button" className={view === "specialist" ? "active" : ""} onClick={() => setView("specialist")}>TCG Specialists <b>{counts.specialist}</b></button>
      <button type="button" className={view === "local" ? "active" : ""} onClick={() => setView("local")}>Independent & Local <b>{counts.local}</b></button>
    </section>

    <section className="fd-dash-card fd-retailer-controls">
      <label><span>FIND A RETAILER</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search retailer or TCG" /></label>
      <div className="fd-presence-tabs" aria-label="Retailer presence">
        <button type="button" className={presence === "all" ? "active" : ""} onClick={() => setPresence("all")}>All presence</button>
        <button type="button" className={presence === "online" ? "active" : ""} onClick={() => setPresence("online")}>Online</button>
        <button type="button" className={presence === "physical" ? "active" : ""} onClick={() => setPresence("physical")}>Physical Stores</button>
      </div>
      <Link className="fd-retailer-fatefind" href="/dashboard/fatefind">Looking for a product? Use FateFind →</Link>
    </section>

    <section className="fd-dash-card fd-retailer-list">
      <div className="fd-dash-card-head"><span>RETAILER STOREFRONTS</span><span>A–Z · NO RANKING</span></div>
      <p className="fd-retailer-boundary">Retailers is business-first discovery. Product/value comparison stays in FateFind, where qualifying offers from every connected retailer enter the same comparison pool.</p>
      {visible.length ? <div className="fd-retailer-grid">{visible.map((retailer) => <RetailerCard key={retailer.id} retailer={retailer} />)}</div> : <div className="fd-dashboard-empty"><strong>No retailers match this view.</strong><span>Physical presence is fail-closed and unknown retailer facts are never guessed.</span></div>}
    </section>

    <style>{`.fd-retailer-directory{display:grid;gap:12px}.fd-retailer-tabs,.fd-presence-tabs{display:flex;gap:8px;flex-wrap:wrap}.fd-retailer-tabs button,.fd-presence-tabs button{appearance:none;border:1px solid rgba(221,203,188,.11);border-radius:10px;background:rgba(255,255,255,.02);color:#9b9498;padding:10px 13px;font:inherit;font-size:9px;font-weight:850;cursor:pointer}.fd-retailer-tabs button.active,.fd-presence-tabs button.active{border-color:rgba(203,176,157,.42);background:linear-gradient(135deg,rgba(182,151,125,.12),rgba(126,87,143,.12));color:#eee4dc}.fd-retailer-tabs button b{margin-left:5px;color:#cbb09d}.fd-retailer-controls{display:grid;grid-template-columns:minmax(250px,1fr) auto auto;gap:14px;align-items:end;padding:18px 20px}.fd-retailer-controls label span{display:block;margin-bottom:6px;color:#b6977d;font-size:8px;font-weight:900;letter-spacing:.12em}.fd-retailer-controls input{width:100%;box-sizing:border-box;border:1px solid rgba(221,203,188,.1);border-radius:10px;background:#090d11;color:#eee4dc;padding:11px 12px;font:inherit;font-size:11px}.fd-presence-tabs button{padding:10px 11px;font-size:8px}.fd-retailer-fatefind{align-self:center;color:#cbb09d;font-size:9px;font-weight:850;text-decoration:none;white-space:nowrap}.fd-retailer-list{padding:24px}.fd-retailer-boundary{max-width:900px;margin:16px 0 0;color:#8d858a;font-size:10px;line-height:1.6}.fd-retailer-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:18px}.fd-retailer-card{padding:17px;border:1px solid rgba(221,203,188,.075);border-radius:14px;background:radial-gradient(circle at 100% 0%,rgba(126,87,143,.06),transparent 32%),rgba(255,255,255,.015)}.fd-retailer-card-top{display:flex;gap:13px;align-items:center}.fd-retailer-logo{width:58px;height:58px;flex:0 0 58px;display:grid;place-items:center;border:1px solid rgba(203,176,157,.22);border-radius:13px;background:#e9e0d7;color:#203028;font-family:Georgia,serif;font-size:18px;font-weight:700;background-position:center;background-repeat:no-repeat;background-size:contain}.fd-retailer-logo.has-logo{font-size:0}.fd-retailer-card-copy{min-width:0}.fd-retailer-card-copy>span{color:#b6977d;font-size:7px;font-weight:900;letter-spacing:.09em}.fd-retailer-card h2{margin:5px 0 3px;color:#e9dfd7;font-size:17px;line-height:1.12}.fd-retailer-card-copy p{margin:0;color:#817a7f;font-size:9px}.fd-retailer-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:14px}.fd-retailer-tags span{padding:5px 7px;border:1px solid rgba(221,203,188,.07);border-radius:999px;color:#958d91;font-size:7px}.fd-retailer-facts{display:flex;justify-content:space-between;gap:8px;margin:14px 0 12px;padding-top:11px;border-top:1px solid rgba(221,203,188,.06)}.fd-retailer-facts span{color:#6f696d;font-size:6px;font-weight:900;letter-spacing:.08em}.fd-retailer-open{color:#cbb09d;font-size:8px;font-weight:900;text-decoration:none}.fd-dashboard-empty{margin-top:18px}@media(max-width:1100px){.fd-retailer-grid{grid-template-columns:1fr 1fr}.fd-retailer-controls{grid-template-columns:1fr}}@media(max-width:700px){.fd-retailer-grid{grid-template-columns:1fr}.fd-retailer-list{padding:18px}.fd-retailer-fatefind{white-space:normal}}`}</style>
  </div>;
}
