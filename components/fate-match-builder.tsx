"use client";

import { useState } from "react";

export function FateMatchBuilder({ premium }: { premium: boolean }) {
  const [query, setQuery] = useState("");
  const [maxTruePrice, setMaxTruePrice] = useState("");
  const [maxPercent, setMaxPercent] = useState("");
  const [scope, setScope] = useState<"online" | "local" | "either">("either");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!premium) { setMessage("Premium unlocks active FateMatch monitoring."); return; }
    setSaving(true); setMessage("");
    const response = await fetch("/api/fate-matches", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        maxTruePricePence: maxTruePrice ? Math.round(Number(maxTruePrice) * 100) : null,
        maxPercentAboveRrp: maxPercent ? Number(maxPercent) : null,
        scope,
        stockRequirement: "in_stock",
        notificationPreferences: { website: true, discord: true, app: true },
      }),
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };
    setSaving(false);
    if (!response.ok) { setMessage(payload.error || "FateMatch could not be saved."); return; }
    setMessage("FateMatch saved. The network can now evaluate qualifying opportunities.");
    setQuery(""); setMaxTruePrice(""); setMaxPercent("");
    window.location.reload();
  }

  return <form className="fd-fatematch-builder" onSubmit={submit}>
    <div className="fd-fm-field wide"><label>WHAT ARE YOU HUNTING?</label><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="e.g. Destined Rivals ETB" required /></div>
    <div className="fd-fm-field"><label>MAX TRUE PRICE</label><div className="fd-money-input"><span>£</span><input inputMode="decimal" value={maxTruePrice} onChange={(e)=>setMaxTruePrice(e.target.value)} placeholder="55.00" /></div></div>
    <div className="fd-fm-field"><label>MAX ABOVE RRP</label><div className="fd-money-input"><input inputMode="decimal" value={maxPercent} onChange={(e)=>setMaxPercent(e.target.value)} placeholder="5" /><span>%</span></div></div>
    <div className="fd-fm-field"><label>WHERE?</label><select value={scope} onChange={(e)=>setScope(e.target.value as typeof scope)}><option value="either">Online or local</option><option value="online">Online only</option><option value="local">Local only</option></select></div>
    <button type="submit" disabled={saving}>{premium ? saving ? "SAVING…" : "CREATE FATEMATCH →" : "PREMIUM REQUIRED"}</button>
    {scope === "local" ? <p className="fd-fm-note">Local-only matching needs a resolved postcode/location and radius. That is connected through Local Radar rather than guessed here.</p> : null}
    {message ? <p className="fd-fm-message">{message}</p> : null}
    <style jsx>{`.fd-fatematch-builder{display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:10px;align-items:end}.fd-fm-field{display:grid;gap:6px}.fd-fm-field label{font-size:7px;font-weight:900;letter-spacing:.14em;color:#77717e}.fd-fm-field input,.fd-fm-field select{box-sizing:border-box;width:100%;height:44px;padding:0 12px;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:#0c0b11;color:#fff;outline:0}.fd-fm-field input:focus,.fd-fm-field select:focus{border-color:rgba(88,232,255,.42)}.fd-money-input{display:flex;align-items:center;height:44px;padding:0 10px;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:#0c0b11}.fd-money-input input{height:auto;padding:0 5px;border:0;background:transparent}.fd-money-input span{color:#827b89;font-size:12px}.fd-fatematch-builder>button{height:44px;padding:0 16px;border:1px solid rgba(88,232,255,.28);border-radius:11px;background:linear-gradient(135deg,rgba(88,232,255,.11),rgba(157,109,255,.14));color:#fff;font-size:9px;font-weight:900;letter-spacing:.08em}.fd-fatematch-builder>button:disabled{opacity:.55}.fd-fm-note,.fd-fm-message{grid-column:1/-1;margin:2px 0 0;color:#8d8794;font-size:10px;line-height:1.45}.fd-fm-message{color:#9deeff}@media(max-width:1000px){.fd-fatematch-builder{grid-template-columns:1fr 1fr}.fd-fm-field.wide{grid-column:1/-1}.fd-fatematch-builder>button{grid-column:1/-1}}@media(max-width:560px){.fd-fatematch-builder{grid-template-columns:1fr}.fd-fm-field.wide,.fd-fatematch-builder>button{grid-column:auto}}`}</style>
  </form>;
}
