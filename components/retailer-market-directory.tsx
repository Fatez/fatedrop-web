"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type RetailerDirectoryCard = {
  id: string;
  name: string;
  website: string | null;
  category: string;
  retailerClass: string;
  source: "cloud" | "registry";
  online: boolean | null;
  physicalStores: boolean | null;
  physicalLocations: number | null;
  runtime: {
    healthy: boolean | null;
    baselineCompleted: boolean | null;
    lastSuccessAt: number | null;
    productsSeen: number | null;
  };
};

export type LabStorefrontCard = {
  id: string;
  name: string;
  location: string;
  online: boolean;
  physicalStores: boolean;
  href: string;
  indexed: number;
  available: number;
};

type Market = "all" | "major" | "indies";
type Presence = "all" | "online" | "physical" | "near";

function relative(epoch: number | null) {
  if (!epoch) return "No successful scan recorded";
  const minutes = Math.max(0, Math.floor(Date.now() / 1000 - epoch) / 60);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 48 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

function isMajor(retailer: RetailerDirectoryCard) {
  return retailer.retailerClass === "national" || retailer.category === "major-retail";
}

function isIndie(retailer: RetailerDirectoryCard) {
  return ["independent", "specialist", "regional"].includes(retailer.retailerClass)
    || ["indie", "tcg-specialist"].includes(retailer.category);
}

function presenceText(retailer: RetailerDirectoryCard) {
  if (retailer.online && retailer.physicalStores === true) {
    return retailer.physicalLocations && retailer.physicalLocations > 0
      ? `Online + ${retailer.physicalLocations} physical location${retailer.physicalLocations === 1 ? "" : "s"}`
      : "Online + physical store";
  }
  if (retailer.physicalStores === true) return "Physical store";
  if (retailer.online && retailer.physicalStores === false) return "Online";
  if (retailer.online) return "Online · physical presence unverified";
  return "Presence unverified";
}

function RetailerCard({ retailer }: { retailer: RetailerDirectoryCard }) {
  const health = retailer.runtime.healthy === true ? "HEALTHY" : retailer.runtime.healthy === false ? "DEGRADED" : "NOT MONITORED";
  return <article className="fd-market-retailer-card">
    <div className="fd-market-card-top">
      <span className={retailer.runtime.healthy === true ? "healthy" : retailer.runtime.healthy === false ? "warning" : "neutral"}>● {health}</span>
      <span>{retailer.source === "cloud" ? "CLOUD" : "DIRECTORY"}</span>
    </div>
    <h2>{retailer.name}</h2>
    <p className="fd-market-class">{retailer.retailerClass.replaceAll("_", " ")} · {presenceText(retailer)}</p>
    {isMajor(retailer) ? <p className="fd-market-rrp-note"><strong>RRP/reference comparison lane.</strong> This does not mean the retailer always sells at RRP.</p> : null}
    <dl>
      <div><dt>PRODUCTS SEEN</dt><dd>{retailer.runtime.productsSeen ?? "—"}</dd></div>
      <div><dt>LAST SUCCESS</dt><dd>{relative(retailer.runtime.lastSuccessAt)}</dd></div>
    </dl>
    <div className="fd-market-actions">
      {retailer.website ? <a href={retailer.website} target="_blank" rel="noreferrer">RETAILER SITE ↗</a> : null}
      {retailer.source === "cloud" ? <Link href={`/dashboard/search?q=${encodeURIComponent(retailer.name)}`}>SEARCH NETWORK →</Link> : null}
    </div>
  </article>;
}

export function RetailerMarketDirectory({ retailers, labStorefronts }: { retailers: RetailerDirectoryCard[]; labStorefronts: LabStorefrontCard[] }) {
  const [market, setMarket] = useState<Market>("all");
  const [presence, setPresence] = useState<Presence>("all");
  const labIds = useMemo(() => new Set(labStorefronts.map((store) => store.id)), [labStorefronts]);
  const canonical = useMemo(() => retailers.filter((retailer) => !labIds.has(retailer.id)), [labIds, retailers]);
  const major = useMemo(() => canonical.filter(isMajor), [canonical]);
  const indies = useMemo(() => canonical.filter(isIndie), [canonical]);

  const segmented = useMemo(() => {
    if (market === "major") return major;
    if (market === "indies") return indies;
    return canonical;
  }, [canonical, indies, major, market]);

  const visible = useMemo(() => {
    if (presence === "online") return segmented.filter((retailer) => retailer.online === true);
    if (presence === "physical") return segmented.filter((retailer) => retailer.physicalStores === true);
    if (presence === "near") return [];
    return segmented;
  }, [presence, segmented]);

  const visibleLabs = useMemo(() => {
    if (market === "major" || presence === "near") return [];
    if (presence === "online") return labStorefronts.filter((store) => store.online);
    if (presence === "physical") return labStorefronts.filter((store) => store.physicalStores);
    return labStorefronts;
  }, [labStorefronts, market, presence]);

  const contextLabel = market === "major"
    ? "MAJOR / NATIONAL"
    : market === "indies"
      ? "INDEPENDENT / SPECIALIST"
      : "ALL RETAILERS";
  const presenceLabel = presence === "physical" ? "PHYSICAL" : presence === "online" ? "ONLINE" : "ALL CHANNELS";

  return <>
    <section className="fd-presence-tabs" aria-label="Store presence">
      <button type="button" className={presence === "all" ? "active" : ""} onClick={() => setPresence("all")}>All</button>
      <button type="button" className={presence === "online" ? "active" : ""} onClick={() => setPresence("online")}>Online</button>
      <button type="button" className={presence === "physical" ? "active" : ""} onClick={() => setPresence("physical")}>Physical</button>
      <button type="button" disabled title="Near Me will activate when the shared branch registry exposes a resolved location scope.">Near Me <small>SOON</small></button>
    </section>

    <section className="fd-market-tabs" aria-label="Retailer type">
      <button type="button" className={market === "all" ? "active" : ""} onClick={() => setMarket("all")}>All Retailers <b>{canonical.length + labStorefronts.length}</b></button>
      <button type="button" className={market === "major" ? "active" : ""} onClick={() => setMarket("major")}>Major <b>{major.length}</b></button>
      <button type="button" className={market === "indies" ? "active" : ""} onClick={() => setMarket("indies")}>Independent / Specialist <b>{indies.length + labStorefronts.length}</b></button>
    </section>

    <section className="fd-dash-card fd-market-context">
      <div>
        <span>{contextLabel} · {presenceLabel}</span>
        <h2>{market === "major" ? "Compare major retailers without turning Stores into FateFind." : market === "indies" ? "Discover specialist and independent retailers beyond cheapest-price ranking." : "Browse the retailer network by verified channel and retailer identity."}</h2>
      </div>
      <p>{presence === "physical"
        ? "Physical presence is fail-closed: FateDrop only includes a retailer when a physical store is explicitly known. This does not confirm branch stock."
        : market === "major"
          ? "RRP is FateDrop's verified/reference comparison baseline. Retailer prices can still be above or below that figure; the label describes the comparison lane, not a promise of RRP pricing."
          : "Online and physical presence remain separate facts. The same canonical retailer can be hybrid without being duplicated as two businesses."}</p>
    </section>

    <section className="fd-dash-card fd-runtime-retailers">
      <div className="fd-dash-card-head"><span>{contextLabel} · {presenceLabel}</span><Link href="/dashboard/search">Search observed offers →</Link></div>
      {visible.length ? <div className="fd-market-grid">{visible.map((retailer) => <RetailerCard key={retailer.id} retailer={retailer} />)}</div> : <div className="fd-dashboard-empty"><strong>No retailers currently match this verified view.</strong><span>{presence === "physical" ? "Unknown physical presence is not guessed into this filter." : "The retailer directory will populate as Cloud evidence becomes available."}</span></div>}
    </section>

    {visibleLabs.length ? <section className="fd-dash-card fd-lab-retailers">
      <div className="fd-dash-card-head"><span>EXPERIMENTAL STOREFRONT LAB</span><span>LAB · NOT CANONICAL MONITOR TRUTH</span></div>
      <p>These direct storefront feeds remain explicitly experimental. They demonstrate retailer presentation and do not imply a formal partner, Verified status, or canonical Cloud monitoring.</p>
      <div className="fd-lab-grid">{visibleLabs.map((store) => <article key={store.id}><span>EXPERIMENTAL STOREFRONT</span><h3>{store.name}</h3><p>{store.location}</p><dl><div><dt>LAB INDEXED</dt><dd>{store.indexed}</dd></div><div><dt>OBSERVED AVAILABLE</dt><dd>{store.available}</dd></div></dl><Link href={store.href}>Explore lab storefront →</Link></article>)}</div>
    </section> : null}

    <section className="fd-store-filter-roadmap" aria-label="Future retailer capability filters">
      <span>Capability filters:</span>
      <button type="button" disabled title="Awaiting canonical retailer capability fields from Cloud.">Singles</button>
      <button type="button" disabled title="Awaiting canonical retailer capability fields from Cloud.">Sealed</button>
      <button type="button" disabled title="Awaiting canonical retailer capability fields from Cloud.">Events</button>
      <small>Disabled until Cloud supplies canonical capability fields — no hard-coded classifications.</small>
    </section>

    <style>{`.fd-market-tabs,.fd-presence-tabs,.fd-store-filter-roadmap{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.fd-market-tabs button,.fd-presence-tabs button,.fd-store-filter-roadmap button{appearance:none;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:rgba(255,255,255,.025);color:#9d97a4;padding:11px 14px;font:inherit;font-size:10px;font-weight:850;letter-spacing:.04em;cursor:pointer}.fd-market-tabs button.active,.fd-presence-tabs button.active{border-color:rgba(103,232,249,.35);background:linear-gradient(135deg,rgba(88,232,255,.1),rgba(157,109,255,.11));color:#fff}.fd-market-tabs button b{margin-left:7px;color:#68e8fb}.fd-presence-tabs button small{margin-left:5px;color:#6f6874;font-size:6px}.fd-market-tabs{margin-top:-2px}.fd-market-tabs button{padding:8px 11px;font-size:8px}.fd-market-tabs button b{font-size:7px}.fd-market-tabs button:disabled,.fd-presence-tabs button:disabled,.fd-store-filter-roadmap button:disabled{cursor:not-allowed;opacity:.5}.fd-market-context{padding:22px 26px;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.8fr);gap:28px;align-items:center}.fd-market-context span{color:#68e8fb;font-size:8px;font-weight:900;letter-spacing:.14em}.fd-market-context h2{margin:7px 0 0;font-size:22px}.fd-market-context p{margin:0;color:#928c98;font-size:11px;line-height:1.65}.fd-runtime-retailers,.fd-lab-retailers{padding:26px}.fd-market-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:20px}.fd-market-retailer-card{padding:18px;border:1px solid rgba(255,255,255,.075);border-radius:16px;background:radial-gradient(circle at 100% 0%,rgba(88,232,255,.045),transparent 30%),rgba(255,255,255,.018)}.fd-market-card-top{display:flex;justify-content:space-between;gap:10px}.fd-market-card-top span{color:#77717f;font-size:7px;font-weight:900;letter-spacing:.1em}.fd-market-card-top .healthy{color:#71e8ae}.fd-market-card-top .warning{color:#f4b76f}.fd-market-card-top .neutral{color:#77717f}.fd-market-retailer-card h2{margin:9px 0 4px;font-size:18px}.fd-market-class{margin:0;color:#85808c;font-size:9px;text-transform:capitalize}.fd-market-rrp-note{margin:12px 0 0;padding:9px;border:1px solid rgba(103,232,249,.1);border-radius:9px;color:#8f8995;font-size:8px;line-height:1.5}.fd-market-rrp-note strong{color:#b7f5ff}.fd-market-retailer-card dl,.fd-lab-grid dl{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:16px 0}.fd-market-retailer-card dl div,.fd-lab-grid dl div{padding:9px;border:1px solid rgba(255,255,255,.055);border-radius:9px;background:rgba(0,0,0,.14)}.fd-market-retailer-card dt,.fd-lab-grid dt{color:#605a67;font-size:6px;font-weight:900;letter-spacing:.08em}.fd-market-retailer-card dd,.fd-lab-grid dd{margin:3px 0 0;font-size:9px}.fd-market-actions{display:flex;gap:10px;flex-wrap:wrap}.fd-market-actions a,.fd-lab-grid a{color:#9eefff;font-size:7px;font-weight:900;text-decoration:none}.fd-lab-retailers>p{max-width:880px;color:#85808c;font-size:10px;line-height:1.6}.fd-lab-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}.fd-lab-grid article{padding:18px;border:1px solid rgba(157,109,255,.15);border-radius:15px;background:rgba(157,109,255,.025)}.fd-lab-grid article>span{color:#a78bfa;font-size:7px;font-weight:900;letter-spacing:.1em}.fd-lab-grid h3{margin:8px 0 4px;font-size:18px}.fd-lab-grid article>p{margin:0;color:#8a8490;font-size:9px}.fd-store-filter-roadmap{padding:2px 4px;color:#77717f}.fd-store-filter-roadmap>span{font-size:8px;font-weight:900;letter-spacing:.08em}.fd-store-filter-roadmap button{padding:7px 9px;font-size:7px}.fd-store-filter-roadmap small{font-size:7px;color:#6f6874}@media(max-width:1050px){.fd-market-grid{grid-template-columns:1fr 1fr}}@media(max-width:850px){.fd-market-context,.fd-market-grid,.fd-lab-grid{grid-template-columns:1fr}.fd-runtime-retailers,.fd-lab-retailers{padding:20px}}`}</style>
  </>;
}
