"use client";

import { useState } from "react";

type RadarShop = {
  id: string;
  name: string;
  address?: string | null;
  websiteUrl?: string | null;
  distanceMiles?: number | null;
  networkStatus?: string | null;
  onlineCatalogue?: { availableOffers?: number | null } | null;
};

type RadarEvent = {
  id: string;
  name: string;
  venueName?: string | null;
  townCity?: string | null;
  postcode?: string | null;
  startDateTime?: string | null;
  officialEventUrl?: string | null;
  officialTicketUrl?: string | null;
  distanceMiles?: number | null;
  verificationStatus?: string | null;
};

type RadarResponse = {
  error?: string;
  locationResolution?: { status?: string | null; postcode?: string | null; reason?: string | null } | null;
  providers?: { shops?: { status?: string | null }; events?: { status?: string | null } };
  shops?: RadarShop[];
  events?: RadarEvent[];
  counts?: { shops?: number; events?: number };
};

function distance(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(value < 10 ? 1 : 0) + " mi"
    : null;
}

function eventDate(value: string | null | undefined) {
  if (!value) return "Date pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function LocalRadarSearch() {
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [postcode, setPostcode] = useState("");
  const [result, setResult] = useState<RadarResponse | null>(null);
  const [status, setStatus] = useState("Use device location or a UK postcode only when you want nearby discovery.");
  const [loading, setLoading] = useState<"device" | "postcode" | null>(null);

  async function runSearch(params: URLSearchParams, mode: "device" | "postcode") {
    setLoading(mode);
    setStatus(mode === "device"
      ? "Finding nearby shops and events from your current area…"
      : "Resolving postcode and searching the FateDrop network…");
    try {
      params.set("radiusMiles", String(radiusMiles));
      params.set("types", "shops,events");
      const response = await fetch("/api/local-radar?" + params.toString(), { cache: "no-store" });
      const payload = await response.json() as RadarResponse;
      if (!response.ok) {
        setResult(null);
        setStatus(payload.error || "Local Radar could not search.");
        return;
      }
      setResult(payload);
      if (payload.locationResolution?.status === "invalid" || payload.locationResolution?.status === "not_found") {
        setStatus(payload.locationResolution.reason || "That location could not be resolved.");
        return;
      }
      const shops = payload.counts?.shops ?? payload.shops?.length ?? 0;
      const events = payload.counts?.events ?? payload.events?.length ?? 0;
      setStatus(
        String(shops) + " nearby shop" + (shops === 1 ? "" : "s") +
        " · " + String(events) + " event" + (events === 1 ? "" : "s") +
        " found. External discovery never implies FateDrop verification or branch stock.",
      );
    } catch {
      setResult(null);
      setStatus("Local Radar could not reach the FateDrop discovery network.");
    } finally {
      setLoading(null);
    }
  }

  function locate() {
    if (!navigator.geolocation) {
      setStatus("This browser does not expose device location. Use the postcode search instead.");
      return;
    }
    setLoading("device");
    setStatus("Requesting your location once for this Radar search…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void runSearch(new URLSearchParams({
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
        }), "device");
      },
      (error) => {
        setLoading(null);
        setStatus(error.code === error.PERMISSION_DENIED
          ? "Location permission was declined. FateDrop will not keep requesting it — use a postcode instead."
          : "Device location could not be resolved. Use a postcode instead.");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  function searchPostcode() {
    const clean = postcode.trim();
    if (clean.length < 5) {
      setStatus("Enter a valid UK postcode, for example ME14 1XX.");
      return;
    }
    void runSearch(new URLSearchParams({ postcode: clean.toUpperCase() }), "postcode");
  }

  const shops = result?.shops ?? [];
  const events = result?.events ?? [];

  return <div className="fd-radar-tool">
    <div className="fd-radar-controls">
      <label><small>RADIUS</small><select value={radiusMiles} onChange={(event)=>setRadiusMiles(Number(event.target.value))}><option value={5}>5 miles</option><option value={10}>10 miles</option><option value={25}>25 miles</option><option value={50}>50 miles</option></select></label>
      <button type="button" onClick={locate} disabled={Boolean(loading)}>{loading === "device" ? "LOCATING…" : "USE MY LOCATION →"}</button>
      <span className="fd-radar-or">OR</span>
      <label><small>UK POSTCODE</small><input value={postcode} onChange={(event)=>setPostcode(event.target.value)} onKeyDown={(event)=>{if(event.key==="Enter"){event.preventDefault();searchPostcode();}}} placeholder="e.g. ME14 1XX" autoComplete="postal-code" /></label>
      <button type="button" className="secondary" onClick={searchPostcode} disabled={Boolean(loading)}>{loading === "postcode" ? "SEARCHING…" : "SEARCH POSTCODE →"}</button>
    </div>

    <div className="fd-radar-status-row">
      <p className="fd-radar-status">{status}</p>
      {result ? <div className="fd-radar-summary"><span><b>{shops.length}</b><small>SHOPS</small></span><span><b>{events.length}</b><small>EVENTS</small></span></div> : null}
    </div>

    {result ? <div className="fd-radar-provider-state">
      <span>SHOP SOURCE · {String(result.providers?.shops?.status || "unknown").replaceAll("_"," ").toUpperCase()}</span>
      <span>EVENT SOURCE · {String(result.providers?.events?.status || "unknown").replaceAll("_"," ").toUpperCase()}</span>
      {result.locationResolution?.postcode ? <span>ORIGIN · {result.locationResolution.postcode}</span> : null}
    </div> : null}

    {shops.length ? <section className="fd-radar-section">
      <div className="fd-radar-section-head"><div><small>NEARBY SHOPS</small><h3>Places to buy and play.</h3></div><span>Branch stock is never inferred.</span></div>
      <div className="fd-radar-results">{shops.map((shop)=>{
        const connected = shop.networkStatus === "live_connected";
        const availableOffers = shop.onlineCatalogue?.availableOffers;
        const shopDistance = distance(shop.distanceMiles);
        return <article key={shop.id}>
          <div>
            <span className={connected ? "status-network" : "status-external"}>{connected ? "LIVE CONNECTED" : "LOCAL DISCOVERY"}</span>
            <strong>{shop.name}</strong>
            <small>{shop.address || "Address unavailable"}{shopDistance ? " · " + shopDistance : ""}</small>
            <p>{connected
              ? "FateDrop has a connected online catalogue" + (typeof availableOffers === "number" ? " with " + availableOffers + " currently available offer" + (availableOffers === 1 ? "" : "s") : "") + ". This does not prove stock at this physical branch."
              : "External discovery only. No FateDrop partnership or live stock is claimed."}</p>
          </div>
          <aside>{shop.websiteUrl ? <a href={shop.websiteUrl} target="_blank" rel="noreferrer">WEBSITE ↗</a> : null}<small>{shopDistance || "Distance unavailable"}</small></aside>
        </article>;
      })}</div>
    </section> : null}

    {events.length ? <section className="fd-radar-section">
      <div className="fd-radar-section-head"><div><small>NEARBY FATE ENCOUNTERS</small><h3>Events inside your Radar.</h3></div><span>Verify organiser details before travel.</span></div>
      <div className="fd-radar-events">{events.map((event)=>{
        const eventDistance = distance(event.distanceMiles);
        return <article key={event.id}>
          <div><span>{String(event.verificationStatus || "listed").replaceAll("_"," ").toUpperCase()}</span><strong>{event.name}</strong><small>{eventDate(event.startDateTime)} · {event.venueName || event.townCity || event.postcode || "Venue pending"}{eventDistance ? " · " + eventDistance : ""}</small></div>
          <aside>{event.officialTicketUrl ? <a href={event.officialTicketUrl} target="_blank" rel="noreferrer">TICKETS ↗</a> : event.officialEventUrl ? <a href={event.officialEventUrl} target="_blank" rel="noreferrer">EVENT ↗</a> : null}</aside>
        </article>;
      })}</div>
    </section> : null}

    {result && !shops.length && !events.length ? <div className="fd-radar-empty"><strong>No nearby FateDrop results in this radius.</strong><span>Try a wider radius. FateDrop does not invent local shops, stock or events to fill an empty result.</span></div> : null}

    <p className="fd-radar-privacy">Location is used on demand for this search. FateDrop does not silently turn Local Radar into continuous background tracking.</p>

    <style jsx>{".fd-radar-tool{display:grid;gap:18px}.fd-radar-controls{display:grid;grid-template-columns:120px auto 34px minmax(180px,1fr) auto;gap:10px;align-items:end}.fd-radar-controls label{display:grid;gap:7px}.fd-radar-controls label>small{font-size:10px;font-weight:900;letter-spacing:.12em;color:#918a96}.fd-radar-controls select,.fd-radar-controls input,.fd-radar-controls button{height:46px;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:#0c0b11;color:#fff;padding:0 13px;font-size:12px}.fd-radar-controls button{border-color:rgba(88,232,255,.24);background:linear-gradient(135deg,rgba(88,232,255,.08),rgba(157,109,255,.12));font-size:10px;font-weight:900;letter-spacing:.04em;cursor:pointer}.fd-radar-controls button.secondary{border-color:rgba(157,109,255,.24)}.fd-radar-controls button:disabled{opacity:.55;cursor:wait}.fd-radar-or{height:46px;display:grid;place-items:center;color:#696370;font-size:9px;font-weight:900}.fd-radar-status-row{display:flex;align-items:center;justify-content:space-between;gap:16px}.fd-radar-status{margin:0;color:#aaa2ad;font-size:12px;line-height:1.55}.fd-radar-summary{display:flex;gap:8px}.fd-radar-summary span{min-width:66px;padding:8px 10px;display:grid;gap:2px;text-align:center;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:rgba(255,255,255,.02)}.fd-radar-summary b{font-size:16px}.fd-radar-summary small{color:#837c88;font-size:8px;font-weight:900;letter-spacing:.1em}.fd-radar-provider-state{display:flex;flex-wrap:wrap;gap:7px}.fd-radar-provider-state span{padding:5px 7px;border:1px solid rgba(255,255,255,.06);border-radius:999px;color:#817a86;background:rgba(255,255,255,.018);font-size:8px;font-weight:800;letter-spacing:.06em}.fd-radar-section{display:grid;gap:10px;padding-top:4px}.fd-radar-section-head{display:flex;justify-content:space-between;gap:16px;align-items:end}.fd-radar-section-head small{color:#74eaff;font-size:9px;font-weight:900;letter-spacing:.12em}.fd-radar-section-head h3{margin:4px 0 0;font-size:17px}.fd-radar-section-head>span{color:#7f7884;font-size:9px}.fd-radar-results,.fd-radar-events{display:grid;gap:8px}.fd-radar-results article,.fd-radar-events article{display:flex;justify-content:space-between;gap:18px;padding:16px;border:1px solid rgba(255,255,255,.075);border-radius:13px;background:rgba(255,255,255,.02)}.fd-radar-results article>div,.fd-radar-events article>div{display:flex;flex-direction:column;gap:5px;min-width:0}.fd-radar-results span,.fd-radar-events span{font-size:8px;font-weight:900;letter-spacing:.11em;color:#9a929e}.fd-radar-results .status-network{color:#71e8ae}.fd-radar-results .status-external{color:#c19ce0}.fd-radar-results strong,.fd-radar-events strong{font-size:14px}.fd-radar-results small,.fd-radar-events small{color:#918a96;font-size:10px}.fd-radar-results p{max-width:720px;margin:3px 0 0;color:#77717c;font-size:9px;line-height:1.5}.fd-radar-results aside,.fd-radar-events aside{display:flex;flex-direction:column;align-items:flex-end;gap:7px;white-space:nowrap}.fd-radar-results a,.fd-radar-events a{font-size:10px;font-weight:900;color:#9eeeff}.fd-radar-results aside small{font-size:9px}.fd-radar-empty{padding:22px;border:1px dashed rgba(255,255,255,.08);border-radius:13px;display:grid;gap:7px}.fd-radar-empty strong{font-size:13px}.fd-radar-empty span{color:#87808b;font-size:11px;line-height:1.5}.fd-radar-privacy{margin:0;padding-top:12px;border-top:1px solid rgba(255,255,255,.055);color:#756f7a;font-size:9px;line-height:1.5}@media(max-width:980px){.fd-radar-controls{grid-template-columns:120px 1fr}.fd-radar-or{display:none}}@media(max-width:650px){.fd-radar-controls{grid-template-columns:1fr}.fd-radar-status-row,.fd-radar-section-head{align-items:flex-start;flex-direction:column}.fd-radar-results article,.fd-radar-events article{flex-direction:column}.fd-radar-results aside,.fd-radar-events aside{align-items:flex-start}}"}</style>
  </div>;
}
