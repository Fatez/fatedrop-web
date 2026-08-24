"use client";

import { useState } from "react";

const companions = ["koru", "fenn", "aeris", "nyxen", "solix"] as const;

export function FateMatchBuilder({ premium, initialQuery = "", initialProductIdentityId = null }: { premium: boolean; initialQuery?: string; initialProductIdentityId?: string | null }) {
  const [query, setQuery] = useState(initialQuery);
  const [companionId, setCompanionId] = useState<(typeof companions)[number]>("koru");
  const [maxTruePrice, setMaxTruePrice] = useState("");
  const [maxPercent, setMaxPercent] = useState("");
  const [scope, setScope] = useState<"online" | "local" | "either">("either");
  const [radiusKm, setRadiusKm] = useState(25);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState("Local matching is optional until you choose Local only.");
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function resolveLocation() {
    if (!navigator.geolocation) { setLocationStatus("This browser cannot provide a location. Use Online only for this FateFind."); return; }
    setLocating(true);
    setLocationStatus("Resolving your location for this FateFind…");
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      setLocationStatus(`Location ready · local offers can be evaluated within ${radiusKm} km.`);
      setLocating(false);
    }, (error) => {
      setLatitude(null); setLongitude(null); setLocating(false);
      setLocationStatus(error.code === error.PERMISSION_DENIED ? "Location permission was declined. Choose Online only or try again when you want local matching." : "Location could not be resolved. Choose Online only or try again.");
    }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!premium) { setMessage("Premium unlocks active FateMatch monitoring."); return; }
    if (scope === "local" && (latitude === null || longitude === null)) { setMessage("Use your location before saving a Local-only FateFind."); return; }
    setSaving(true); setMessage("");
    const includeLocal = scope === "local" || (scope === "either" && latitude !== null && longitude !== null);
    const response = await fetch("/api/fate-matches", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        productIdentityId: initialProductIdentityId,
        maxTruePricePence: maxTruePrice ? Math.round(Number(maxTruePrice) * 100) : null,
        maxPercentAboveRrp: maxPercent ? Number(maxPercent) : null,
        scope,
        radiusKm: includeLocal ? radiusKm : null,
        latitude: includeLocal ? latitude : null,
        longitude: includeLocal ? longitude : null,
        stockRequirement: "in_stock",
        notificationPreferences: { website: true, discord: true, app: true, companionId },
      }),
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };
    setSaving(false);
    if (!response.ok) { setMessage(payload.error || "FateMatch could not be saved."); return; }
    setMessage(`${companionId.charAt(0).toUpperCase() + companionId.slice(1)} is watching it. FateDrop will alert you with FATEMATCH — LIVE NOW when a qualifying offer goes live.`);
    setMaxTruePrice(""); setMaxPercent("");
    window.location.reload();
  }

  return <form className="fd-fatematch-builder" onSubmit={submit}>
    <div className="fd-fm-field wide"><label>WHAT SHOULD FATEDROP FIND?</label><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="e.g. Destined Rivals ETB" required /></div>
    <div className="fd-fm-field"><label>MAX TRUE PRICE</label><div className="fd-money-input"><span>£</span><input inputMode="decimal" value={maxTruePrice} onChange={(e)=>setMaxTruePrice(e.target.value)} placeholder="65.00" /></div></div>
    <div className="fd-fm-field"><label>MAX ABOVE RRP</label><div className="fd-money-input"><input inputMode="decimal" value={maxPercent} onChange={(e)=>setMaxPercent(e.target.value)} placeholder="10" /><span>%</span></div></div>
    <div className="fd-fm-field"><label>WHO WATCHES?</label><select value={companionId} onChange={(e)=>setCompanionId(e.target.value as typeof companionId)}>{companions.map((id)=><option key={id} value={id}>{id.charAt(0).toUpperCase()+id.slice(1)}</option>)}</select></div>
    <div className="fd-fm-field"><label>WHERE?</label><select value={scope} onChange={(e)=>setScope(e.target.value as typeof scope)}><option value="either">Online or local</option><option value="online">Online only</option><option value="local">Local only</option></select></div>
    <button type="submit" disabled={saving}>{premium ? saving ? "SAVING…" : "START FATEMATCH WATCH →" : "PREMIUM REQUIRED"}</button>

    {scope !== "online" ? <div className="fd-fm-location">
      <div><label>LOCAL RADIUS</label><select value={radiusKm} onChange={(e)=>{ const next = Number(e.target.value); setRadiusKm(next); if (latitude !== null) setLocationStatus(`Location ready · local offers can be evaluated within ${next} km.`); }}><option value={10}>10 km</option><option value={25}>25 km</option><option value={50}>50 km</option><option value={100}>100 km</option></select></div>
      <button type="button" onClick={resolveLocation} disabled={locating}>{locating ? "LOCATING…" : latitude !== null ? "REFRESH LOCATION" : "USE MY LOCATION"}</button>
      <p>{locationStatus}</p>
    </div> : null}

    <p className="fd-fm-note"><b>FateMatch</b> is the watch. With no price rules it simply means “let me know when this is in stock.” When a qualifying observed offer goes live, your companion alerts you and gives you the retailer route.</p>
    {scope === "local" ? <p className="fd-fm-note">Local-only hunts are saved only after a real browser location is resolved. FateDrop does not guess your postcode or radius.</p> : null}
    {message ? <p className="fd-fm-message">{message}</p> : null}
    <style jsx>{`
      .fd-fatematch-builder{display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:10px;align-items:end}.fd-fm-field{display:grid;gap:6px}.fd-fm-field label,.fd-fm-location label{font-size:7px;font-weight:900;letter-spacing:.14em;color:#77717e}.fd-fm-field input,.fd-fm-field select,.fd-fm-location select{box-sizing:border-box;width:100%;height:44px;padding:0 12px;border:1px solid rgba(221,203,188,.1);border-radius:11px;background:#0c0f13;color:#e7ddd6;outline:0}.fd-fm-field input:focus,.fd-fm-field select:focus,.fd-fm-location select:focus{border-color:rgba(171,126,195,.35)}.fd-money-input{display:flex;align-items:center;height:44px;padding:0 10px;border:1px solid rgba(221,203,188,.1);border-radius:11px;background:#0c0f13}.fd-money-input input{height:auto;padding:0 5px;border:0;background:transparent}.fd-money-input span{color:#827b89;font-size:12px}.fd-fatematch-builder>button{height:44px;padding:0 16px;border:1px solid rgba(171,126,195,.22);border-radius:11px;background:linear-gradient(135deg,rgba(112,72,140,.12),rgba(136,105,84,.07));color:#e4d8cf;font-size:9px;font-weight:900;letter-spacing:.08em}.fd-fatematch-builder>button:disabled,.fd-fm-location button:disabled{opacity:.55}.fd-fm-location{grid-column:1/-1;padding:11px;display:grid;grid-template-columns:150px auto minmax(0,1fr);gap:10px;align-items:end;border:1px solid rgba(221,203,188,.065);border-radius:10px;background:rgba(255,255,255,.012)}.fd-fm-location>div{display:grid;gap:5px}.fd-fm-location button{height:44px;padding:0 13px;border:1px solid rgba(171,126,195,.18);border-radius:9px;background:rgba(112,72,140,.06);color:#c9a9d5;font-size:7px;font-weight:900}.fd-fm-location p{margin:0;align-self:center;color:#776f70;font-size:8px;line-height:1.45}.fd-fm-note,.fd-fm-message{grid-column:1/-1;margin:2px 0 0;color:#8d8794;font-size:10px;line-height:1.45}.fd-fm-note b{color:#c9b1c9}.fd-fm-message{color:#b996c7}@media(max-width:1000px){.fd-fatematch-builder{grid-template-columns:1fr 1fr}.fd-fm-field.wide{grid-column:1/-1}.fd-fatematch-builder>button{grid-column:1/-1}.fd-fm-location{grid-template-columns:140px auto 1fr}}@media(max-width:680px){.fd-fm-location{grid-template-columns:1fr}.fd-fatematch-builder{grid-template-columns:1fr}.fd-fm-field.wide,.fd-fatematch-builder>button{grid-column:auto}}`}</style>
  </form>;
}
