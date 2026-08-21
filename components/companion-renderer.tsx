"use client";

import { KoruMascot } from "@/components/koru-mascot";
import { companionDefinition, companionRendererMode, type CompanionRenderRequest } from "@/lib/companion-contract";

function CompanionPlaceholder({ name, slot, compact = false, registered = false }: { name: string; slot: number; compact?: boolean; registered?: boolean }) {
  return <div className={`companion-placeholder${compact ? " compact" : ""}`} aria-label={`${name} companion preview`}>
    <div className="companion-orbit" aria-hidden="true"><i/><i/><i/></div>
    <div className="companion-monogram" aria-hidden="true">{name.slice(0, 1)}</div>
    <div className="companion-status"><small>SLOT {String(slot).padStart(2, "0")} · KORU &amp; FRIENDS</small><strong>{name}</strong><span>{registered ? "3D model registered · renderer validation pending" : "3D model slot ready"}</span></div>
    <style jsx>{`
      .companion-placeholder{position:relative;isolation:isolate;min-height:440px;overflow:hidden;border:1px solid rgba(205,187,207,.12);border-radius:24px;background:radial-gradient(circle at 50% 38%,rgba(132,96,147,.18),transparent 30%),linear-gradient(145deg,#11131a,#080a0f);display:grid;place-items:center}.companion-placeholder.compact{min-height:230px;border-radius:18px}.companion-orbit{position:absolute;width:58%;aspect-ratio:1;border:1px solid rgba(184,146,194,.13);border-radius:46% 54% 42% 58%;transform:rotate(28deg)}.companion-orbit i{position:absolute;inset:10%;border:1px solid rgba(184,146,194,.08);border-radius:58% 42% 51% 49%;transform:rotate(24deg)}.companion-orbit i:nth-child(2){inset:25%;transform:rotate(54deg)}.companion-orbit i:nth-child(3){inset:42%;border-color:rgba(207,172,215,.2);background:rgba(133,96,149,.06)}.companion-monogram{position:relative;z-index:2;color:#ded1d7;font-family:Georgia,serif;font-size:clamp(5rem,9vw,8rem);font-weight:500;opacity:.75;text-shadow:0 0 48px rgba(168,124,184,.18)}.companion-status{position:absolute;z-index:3;left:20px;right:20px;bottom:18px;display:grid;gap:4px;padding:12px 14px;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:rgba(7,8,12,.72);backdrop-filter:blur(12px)}.companion-status small{color:#9c7da5;font-size:6px;font-weight:900;letter-spacing:.14em}.companion-status strong{color:#eee5df;font-family:Georgia,serif;font-size:19px;font-weight:500}.companion-status span{color:#746f78;font-size:8px}.compact .companion-status{left:10px;right:10px;bottom:9px;padding:8px 9px}.compact .companion-status strong{font-size:14px}.compact .companion-status span{font-size:7px}
    `}</style>
  </div>;
}

export function CompanionRenderer({ request }: { request: CompanionRenderRequest }) {
  const definition = companionDefinition(request.companionId);
  const mode = companionRendererMode(definition);

  if (definition.id === "koru" && mode === "fallback-2d") {
    return <KoruMascot reaction={request.reaction} compact={request.compact} label={request.label ?? "Koru"}/>;
  }

  return <CompanionPlaceholder name={definition.name} slot={definition.slot} compact={request.compact} registered={mode === "webgl-3d"}/>;
}
