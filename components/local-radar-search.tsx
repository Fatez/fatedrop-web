"use client";

import { useState } from "react";
import type { NetworkLocation } from "@/lib/network-domain";

export function LocalRadarSearch() {
  const [radius, setRadius] = useState(25);
  const [locations, setLocations] = useState<NetworkLocation[]>([]);
  const [status, setStatus] = useState("Use your location only when you want nearby discovery.");
  const [loading, setLoading] = useState(false);

  function locate() {
    if (!navigator.geolocation) { setStatus("This browser does not expose location. A postcode/geocoding fallback can be connected through the same provider adapter."); return; }
    setLoading(true); setStatus("Locating nearby TCG retailers…");
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await fetch(`/api/local-radar?lat=${encodeURIComponent(position.coords.latitude)}&lon=${encodeURIComponent(position.coords.longitude)}&radius=${radius}`, { cache: "no-store" });
        const payload = await response.json() as { locations?: NetworkLocation[]; providerConfigured?: boolean; error?: string };
        if (!response.ok) { setStatus(payload.error || "Local Radar could not search."); return; }
        if (!payload.providerConfigured) { setLocations([]); setStatus("Google Places API is not configured yet. Add GOOGLE_PLACES_API_KEY to enable legitimate nearby discovery."); return; }
        setLocations(payload.locations ?? []);
        setStatus(`${payload.locations?.length ?? 0} nearby store${payload.locations?.length === 1 ? "" : "s"} discovered. External discovery never implies a FateDrop partnership.`);
      } catch { setStatus("Local Radar could not reach the discovery service."); }
      finally { setLoading(false); }
    }, (error) => { setLoading(false); setStatus(error.code === error.PERMISSION_DENIED ? "Location permission was declined. FateDrop will not keep requesting it." : "Location could not be resolved."); }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 });
  }

  return <div className="fd-radar-tool">
    <div className="fd-radar-controls"><label><small>RADIUS</small><select value={radius} onChange={(e)=>setRadius(Number(e.target.value))}><option value={10}>10 km</option><option value={25}>25 km</option><option value={50}>50 km</option></select></label><button type="button" onClick={locate} disabled={loading}>{loading ? "SEARCHING…" : "USE MY LOCATION →"}</button></div>
    <p className="fd-radar-status">{status}</p>
    {locations.length ? <div className="fd-radar-results">{locations.map((location)=><article key={location.id}><div><span className={`status-${location.verification}`}>{location.verification === "verified" ? "FATEDROP VERIFIED" : location.verification === "network" ? "FATEDROP NETWORK" : "EXTERNAL DISCOVERY"}</span><strong>{location.name}</strong><small>{location.address || location.postcode || "Address unavailable"}</small></div><aside>{location.website ? <a href={location.website} target="_blank" rel="noreferrer">WEBSITE ↗</a> : null}<small>{location.verification === "external" ? "No live stock claimed" : "Network identity resolved"}</small></aside></article>)}</div> : null}
    <style jsx>{`.fd-radar-tool{display:grid;gap:16px}.fd-radar-controls{display:flex;gap:10px;align-items:end}.fd-radar-controls label{display:grid;gap:5px}.fd-radar-controls small{font-size:7px;font-weight:900;letter-spacing:.14em;color:#77717f}.fd-radar-controls select,.fd-radar-controls button{height:44px;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:#0c0b11;color:#fff;padding:0 13px}.fd-radar-controls button{border-color:rgba(88,232,255,.24);background:linear-gradient(135deg,rgba(88,232,255,.08),rgba(157,109,255,.12));font-size:9px;font-weight:900}.fd-radar-status{margin:0;color:#8f8996;font-size:11px}.fd-radar-results{display:grid;gap:8px}.fd-radar-results article{display:flex;justify-content:space-between;gap:16px;padding:15px;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:rgba(255,255,255,.02)}.fd-radar-results article>div{display:flex;flex-direction:column;gap:4px}.fd-radar-results span{font-size:6px;font-weight:900;letter-spacing:.12em;color:#8e8794}.fd-radar-results .status-verified{color:#71e8ae}.fd-radar-results .status-network{color:#74eaff}.fd-radar-results strong{font-size:14px}.fd-radar-results small{color:#79727f;font-size:9px}.fd-radar-results aside{display:flex;flex-direction:column;align-items:flex-end;gap:6px}.fd-radar-results a{font-size:8px;font-weight:900;color:#9eeeff}@media(max-width:650px){.fd-radar-controls{align-items:stretch;flex-direction:column}.fd-radar-results article{flex-direction:column}.fd-radar-results aside{align-items:flex-start}}`}</style>
  </div>;
}
