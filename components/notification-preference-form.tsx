"use client";

import { useState } from "react";
import type { CloudAlertFacetOptionsResponse } from "@/lib/live-signals";
import type { NotificationPreferences } from "@/lib/notification-preferences";

type FacetOptions = Pick<CloudAlertFacetOptionsResponse, "languages" | "sets">;

export function NotificationPreferenceForm({ initial, persistent, facetOptions }: { initial: NotificationPreferences; persistent: boolean; facetOptions: FacetOptions }) {
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
  function toggleSet(setKey: string) {
    setPreferences((current) => ({
      ...current,
      selectedSetKeys: current.selectedSetKeys.includes(setKey)
        ? current.selectedSetKeys.filter((key) => key !== setKey)
        : [...current.selectedSetKeys, setKey].sort(),
    }));
  }
  const signals = [
    ["whisper","Whisper","Product/catalogue movement — something may be coming"],
    ["echo","Echo","Queue, traffic or security changed — get ready"],
    ["manifested","Manifested","Confirmed live/purchasable stock — go now"],
    ["vanished","Vanished","Previously confirmed availability is gone"],
    ["priceChange","Price changes","Observed price movement"],
    ["fateMatch","FateMatch","A result satisfies one of your FateFinds"],
  ] as const;
  const products = [
    ["sealedTcg","Sealed TCG & decks","ETBs, booster products, tins, collections and deck products"],
    ["singleCards","Single & promo cards","Individual card and promo-card alerts"],
    ["accessories","Accessories","Sleeves, binders, playmats, deck boxes and protection"],
    ["merchandise","Merchandise","Pins, plush, figures, clothing and other non-TCG merch"],
    ["unknownProducts","Unknown products","Keep ambiguous new listings visible until FateDrop can classify them confidently"],
  ] as const;
  const languagePreferenceKey = {
    english: "english",
    japanese: "japanese",
    korean: "korean",
    simplified_chinese: "simplifiedChinese",
    traditional_chinese: "traditionalChinese",
    other: "otherLanguages",
    unknown: "unknownLanguage",
  } as const;
  const channels = [["web","Web","Website notification history"],["push","Push","Mobile push when app delivery is connected"],["discord","Discord","Premium Discord delivery when linked and entitled"]] as const;
  return <div className="fd-pref-editor">
    <section><span>SIGNAL TYPES</span>{signals.map(([key,label,description]) => <label key={key}><div><strong>{label}</strong><small>{description}</small></div><input type="checkbox" checked={Boolean(preferences[key])} onChange={()=>toggle(key)}/></label>)}</section>
    <section><span>SMART PRODUCT FILTER</span><div className="fd-pref-intro"><strong>Monitor everything. Interrupt selectively.</strong><small>FateDrop classifies each observed listing before delivery. Accessories and merchandise default off; unknown listings stay on so ambiguous products fail safely.</small></div>{products.map(([key,label,description]) => <label key={key}><div><strong>{label}</strong><small>{description}</small></div><input type="checkbox" checked={Boolean(preferences[key])} onChange={()=>toggle(key)}/></label>)}</section>
    <section><span>COLLECTOR MARKET / LANGUAGE</span><div className="fd-pref-intro"><strong>Choose the card markets you collect.</strong><small>English, Japanese, Korean, Simplified Chinese and Traditional Chinese remain separate. Ambiguous Chinese or missing language evidence stays Unknown rather than being guessed.</small></div>{facetOptions.languages.map((language) => {
      const key = languagePreferenceKey[language.key];
      return <label key={language.key}><div><strong>{language.label}</strong><small>{language.key === "english" ? "UK and explicitly English catalogue products" : language.key === "unknown" ? "Listings whose language cannot yet be verified" : `${language.label} card products`}</small></div><input type="checkbox" checked={preferences[key]} onChange={()=>toggle(key)}/></label>;
    })}</section>
    <section><span>SETS</span><div className="fd-pref-intro"><strong>Follow every set or build a precise set watch.</strong><small>Set matching comes from the Cloud alert evidence. Products without a reliable set match stay Unknown and have their own control.</small></div><label><div><strong>All recognised sets</strong><small>Automatically include current and newly added sets.</small></div><input type="checkbox" checked={preferences.allSets} onChange={()=>toggle("allSets")}/></label>{!preferences.allSets ? <><label><div><strong>Unknown sets</strong><small>Keep products visible when FateDrop cannot safely identify their set.</small></div><input type="checkbox" checked={preferences.unknownSets} onChange={()=>toggle("unknownSets")}/></label><div className="fd-pref-set-summary"><strong>{preferences.selectedSetKeys.length} selected</strong><small>{facetOptions.sets.length ? "Choose any recognised set below." : "The live set registry is temporarily unavailable; saved selections are preserved."}</small></div>{facetOptions.sets.length ? <div className="fd-pref-set-grid">{facetOptions.sets.map((set) => <label key={set.key}><div><strong>{set.name}</strong><small>{set.key}</small></div><input type="checkbox" checked={preferences.selectedSetKeys.includes(set.key)} onChange={()=>toggleSet(set.key)}/></label>)}</div> : null}</> : null}</section>
    <section><span>DELIVERY CHANNELS</span>{channels.map(([key,label,description]) => <label key={key}><div><strong>{label}</strong><small>{description}</small></div><input type="checkbox" checked={Boolean(preferences[key])} onChange={()=>toggle(key)}/></label>)}</section>
    <section><span>QUIET HOURS</span><label><div><strong>Quiet hours</strong><small>Store one shared preference window for web/app/Discord delivery services to honour.</small></div><input type="checkbox" checked={preferences.quietHours} onChange={()=>toggle("quietHours")}/></label>{preferences.quietHours ? <div className="fd-pref-times"><input type="time" value={preferences.quietStart ?? "22:00"} onChange={(event)=>setPreferences((current)=>({...current,quietStart:event.target.value}))}/><span>to</span><input type="time" value={preferences.quietEnd ?? "07:00"} onChange={(event)=>setPreferences((current)=>({...current,quietEnd:event.target.value}))}/><input aria-label="Timezone" value={preferences.timezone} onChange={(event)=>setPreferences((current)=>({...current,timezone:event.target.value}))}/></div> : null}</section>
    <div className="fd-pref-save"><button type="button" onClick={save} disabled={!persistent || status === "saving"}>{!persistent ? "MIGRATION REQUIRED" : status === "saving" ? "SAVING…" : status === "saved" ? "✓ SAVED" : status === "error" ? "TRY AGAIN" : "SAVE PREFERENCES"}</button><small>FateDrop still observes the full network. These preferences decide which classified products and lifecycle stages are allowed to interrupt you.</small></div>
    <style jsx>{`.fd-pref-editor{display:grid;gap:14px}.fd-pref-editor section{overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:16px;background:#0b0a10}.fd-pref-editor section>span{display:block;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.06);color:#73e9fb;font-size:7px;font-weight:900;letter-spacing:.14em}.fd-pref-intro{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.045);background:linear-gradient(90deg,rgba(115,233,251,.04),rgba(157,109,255,.05))}.fd-pref-intro strong{display:block;color:#f5f3f8;font-size:10px}.fd-pref-intro small{display:block;margin-top:4px;color:#77717e;font-size:8px;line-height:1.5}.fd-pref-editor label{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:14px 16px;border-top:1px solid rgba(255,255,255,.045)}.fd-pref-editor label:first-of-type{border-top:0}.fd-pref-editor strong{display:block;font-size:11px}.fd-pref-editor small{display:block;margin-top:3px;color:#77717e;font-size:8px;line-height:1.4}.fd-pref-editor input[type=checkbox]{width:18px;height:18px;flex:0 0 auto;accent-color:#9d6dff}.fd-pref-set-summary{padding:13px 16px;border-top:1px solid rgba(255,255,255,.045);background:rgba(255,255,255,.012)}.fd-pref-set-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));max-height:420px;overflow:auto;border-top:1px solid rgba(255,255,255,.045)}.fd-pref-set-grid label{min-width:0;border-top:0;border-bottom:1px solid rgba(255,255,255,.035)}.fd-pref-set-grid label:nth-child(odd){border-right:1px solid rgba(255,255,255,.035)}.fd-pref-set-grid strong,.fd-pref-set-grid small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fd-pref-times{display:grid;grid-template-columns:110px auto 110px minmax(160px,1fr);gap:8px;align-items:center;padding:0 16px 16px}.fd-pref-times input{height:38px;padding:0 9px;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:#07070b;color:#ddd}.fd-pref-times span{color:#77717e;font-size:9px}.fd-pref-save{display:flex;align-items:center;gap:15px;flex-wrap:wrap}.fd-pref-save button{min-height:42px;padding:0 15px;border:1px solid rgba(104,232,251,.22);border-radius:11px;background:linear-gradient(135deg,rgba(104,232,251,.08),rgba(157,109,255,.1));color:#fff;font-size:8px;font-weight:900;letter-spacing:.08em}.fd-pref-save small{max-width:600px}@media(max-width:600px){.fd-pref-times{grid-template-columns:1fr auto 1fr}.fd-pref-times input:last-child{grid-column:1/-1}.fd-pref-set-grid{grid-template-columns:1fr}.fd-pref-set-grid label:nth-child(odd){border-right:0}}`}</style>
  </div>;
}
