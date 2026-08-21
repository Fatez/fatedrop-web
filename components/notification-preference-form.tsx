"use client";

import { useState } from "react";
import type { NotificationPreferences } from "@/lib/notification-preferences";

export function NotificationPreferenceForm({ initial, persistent }: { initial: NotificationPreferences; persistent: boolean }) {
  const [preferences, setPreferences] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function toggle(key: keyof NotificationPreferences) {
    setPreferences((current) => {
      if (key === "quietHours" && !current.quietHours && current.updatedAt === 0) {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return { ...current, quietHours: true, timezone: detected || current.timezone };
      }
      return { ...current, [key]: !current[key] };
    });
  }

  async function save() {
    setStatus("saving");
    try {
      const response = await fetch("/api/notification-preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(preferences) });
      if (!response.ok) throw new Error();
      const payload = await response.json() as { preferences: NotificationPreferences };
      setPreferences(payload.preferences);
      setStatus("saved");
    } catch { setStatus("error"); }
  }
  const signals = [
    ["whisper","Whisper","Product/catalogue movement — something may be coming"],
    ["echo","Echo","Queue, traffic or security changed — get ready"],
    ["manifested","Manifested","Confirmed live/purchasable stock — go now"],
    ["vanished","Vanished","Previously confirmed availability is gone"],
    ["priceChange","Price changes","Observed price movement"],
    ["fateMatch","FateMatch","A result satisfies one of your FateFinds"],
  ] as const;
  const channels = [["web","Web","Website notification history"],["push","Push","Mobile push when app delivery is connected"],["discord","Discord","Premium Discord delivery when linked and entitled"]] as const;
  return <div className="fd-pref-editor">
    <section><span>SIGNAL TYPES</span>{signals.map(([key,label,description]) => <label key={key}><div><strong>{label}</strong><small>{description}</small></div><input type="checkbox" checked={Boolean(preferences[key])} onChange={()=>toggle(key)}/></label>)}</section>
    <section><span>DELIVERY CHANNELS</span>{channels.map(([key,label,description]) => <label key={key}><div><strong>{label}</strong><small>{description}</small></div><input type="checkbox" checked={Boolean(preferences[key])} onChange={()=>toggle(key)}/></label>)}</section>
    <section><span>QUIET HOURS</span><label><div><strong>Quiet hours</strong><small>Store one shared preference window for web/app/Discord delivery services to honour.</small></div><input type="checkbox" checked={preferences.quietHours} onChange={()=>toggle("quietHours")}/></label>{preferences.quietHours ? <div className="fd-pref-times"><input type="time" value={preferences.quietStart ?? "22:00"} onChange={(event)=>setPreferences((current)=>({...current,quietStart:event.target.value}))}/><span>to</span><input type="time" value={preferences.quietEnd ?? "07:00"} onChange={(event)=>setPreferences((current)=>({...current,quietEnd:event.target.value}))}/><input aria-label="Timezone" value={preferences.timezone} onChange={(event)=>setPreferences((current)=>({...current,timezone:event.target.value}))}/></div> : null}</section>
    <div className="fd-pref-save"><button type="button" onClick={save} disabled={!persistent || status === "saving"}>{!persistent ? "MIGRATION REQUIRED" : status === "saving" ? "SAVING…" : status === "saved" ? "✓ SAVED" : status === "error" ? "TRY AGAIN" : "SAVE PREFERENCES"}</button><small>Whisper → Echo → Manifested → Vanished is FateDrop&apos;s canonical signal vocabulary. The stages describe evidence, so not every product must pass through every stage.</small></div>
    <style jsx>{`.fd-pref-editor{display:grid;gap:14px}.fd-pref-editor section{overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:16px;background:#0b0a10}.fd-pref-editor section>span{display:block;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.06);color:#73e9fb;font-size:7px;font-weight:900;letter-spacing:.14em}.fd-pref-editor label{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:14px 16px;border-top:1px solid rgba(255,255,255,.045)}.fd-pref-editor label:first-of-type{border-top:0}.fd-pref-editor strong{display:block;font-size:11px}.fd-pref-editor small{display:block;margin-top:3px;color:#77717e;font-size:8px;line-height:1.4}.fd-pref-editor input[type=checkbox]{width:18px;height:18px;accent-color:#9d6dff}.fd-pref-times{display:grid;grid-template-columns:110px auto 110px minmax(160px,1fr);gap:8px;align-items:center;padding:0 16px 16px}.fd-pref-times input{height:38px;padding:0 9px;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:#07070b;color:#ddd}.fd-pref-times span{color:#77717e;font-size:9px}.fd-pref-save{display:flex;align-items:center;gap:15px;flex-wrap:wrap}.fd-pref-save button{min-height:42px;padding:0 15px;border:1px solid rgba(104,232,251,.22);border-radius:11px;background:linear-gradient(135deg,rgba(104,232,251,.08),rgba(157,109,255,.1));color:#fff;font-size:8px;font-weight:900;letter-spacing:.08em}.fd-pref-save small{max-width:600px}@media(max-width:600px){.fd-pref-times{grid-template-columns:1fr auto 1fr}.fd-pref-times input:last-child{grid-column:1/-1}}`}</style>
  </div>;
}
