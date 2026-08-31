"use client";

import type { CSSProperties } from "react";
import { TCG_REGISTRY, type TcgCode } from "@/lib/tcg-registry";

export function TcgSelectionPanel({selected,onChange,compact=false}:{selected:readonly TcgCode[];onChange(codes:TcgCode[]):void;compact?:boolean}) {
  const allSelected=selected.length===TCG_REGISTRY.length;
  function toggle(code:TcgCode){const next=selected.includes(code)?selected.filter((item)=>item!==code):[...selected,code];if(next.length)onChange(next);}
  return <fieldset className={`tcg-selection ${compact?"is-compact":""}`}>
    <legend>Choose your TCGs</legend>
    <p>Pick one, several, or all. This saves your interests—it is not a global app mode.</p>
    <button type="button" className={`tcg-all ${allSelected?"is-selected":""}`} onClick={()=>onChange(allSelected?["pokemon"]:TCG_REGISTRY.map((entry)=>entry.code))}><span>{allSelected?"✓":"+"}</span> All TCGs</button>
    <div className="tcg-grid">{TCG_REGISTRY.map((entry)=>{const active=selected.includes(entry.code);return <button type="button" key={entry.code} aria-pressed={active} className={`tcg-card ${active?"is-selected":""}`} style={{"--tcg-accent":entry.accent} as CSSProperties} onClick={()=>toggle(entry.code)}>
      <span className="tcg-card-image" aria-hidden="true"/><span className="tcg-card-check">{active?"✓":"+"}</span><strong>{entry.shortName}</strong><small>{entry.live?"LIVE NOW":"COMING SOON · INTEREST ONLY"}</small>
    </button>;})}</div>
    <p className="tcg-safety">Only Pokémon is operational today. Future selections cannot activate scanning or alerts.</p>
    <style>{`.tcg-selection{min-width:0;margin:4px 0 10px;padding:14px;border:1px solid rgba(210,182,111,.18);border-radius:16px;background:rgba(4,7,10,.44)}.tcg-selection legend{padding:0 7px;color:#f0e7df;font-size:14px;font-weight:800}.tcg-selection>p{margin:0 0 10px;color:#a9a2a0;font-size:11px;line-height:1.5}.tcg-all{display:flex;width:100%;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;padding:9px;border:1px solid rgba(210,182,111,.2);border-radius:11px;background:#11171d;color:#e6ddd4;font-weight:800}.tcg-all.is-selected{border-color:#d2b66f;background:rgba(210,182,111,.12);color:#f1d98f}.tcg-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-height:310px;overflow:auto;padding:1px}.tcg-card{position:relative;min-height:94px;overflow:hidden;padding:42px 10px 10px;text-align:left;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:#0b1015;color:#eae1da}.tcg-card-image{position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--tcg-accent) 30%,transparent),#090d12 80%),url('/assets/cardwave-bg.webp') center/cover;opacity:.66}.tcg-card>*:not(.tcg-card-image){position:relative;z-index:1}.tcg-card strong,.tcg-card small{display:block}.tcg-card strong{font-size:13px}.tcg-card small{margin-top:4px;color:#aaa2a0;font-size:8px;font-weight:900;letter-spacing:.45px}.tcg-card-check{position:absolute!important;z-index:2!important;top:8px;right:8px;width:23px;height:23px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.2);border-radius:50%;background:rgba(5,8,12,.72);font-weight:900}.tcg-card.is-selected{border-color:var(--tcg-accent);box-shadow:inset 0 0 0 1px var(--tcg-accent),0 0 22px color-mix(in srgb,var(--tcg-accent) 20%,transparent)}.tcg-card.is-selected .tcg-card-check{border-color:var(--tcg-accent);background:var(--tcg-accent);color:#071016}.tcg-safety{margin:9px 0 0!important;color:#c0b7ae!important;font-size:10px!important}.tcg-selection.is-compact .tcg-grid{max-height:230px}@media(max-width:520px){.tcg-grid{grid-template-columns:1fr}.tcg-card{min-height:82px}}`}</style>
  </fieldset>;
}
