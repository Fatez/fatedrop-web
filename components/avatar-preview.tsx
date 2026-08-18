"use client";

import { AvatarLayeredCharacter, type AvatarMood } from "@/components/avatar-layered-character";
import type { AvatarLoadout } from "@/lib/avatar-loadout";

export type { AvatarMood } from "@/components/avatar-layered-character";

function moodLabel(mood: AvatarMood) {
  if (mood === "watching") return "WATCHING";
  if (mood === "whisper") return "WHISPER";
  if (mood === "alert") return "ALERT";
  if (mood === "major" || mood === "surge") return "NETWORK SURGE";
  if (mood === "manifested") return "MANIFESTED";
  if (mood === "match") return "FATEMATCH FOUND";
  return "FATEDROP AVATAR";
}

export function AvatarPreview({ loadout, mood = "idle", compact = false, label }: { loadout: AvatarLoadout; mood?: AvatarMood; compact?: boolean; label?: string }) {
  return <div className={`fd-avatar-stage ${compact ? "compact" : ""}`} aria-label={label || "FateDrop avatar preview"}>
    <div className="fd-avatar-art"><AvatarLayeredCharacter loadout={loadout} mood={mood}/></div>
    <div className="fd-avatar-glass" aria-hidden="true"><i/><i/><span/></div>
    <div className="fd-avatar-status"><small>{moodLabel(mood)}</small><strong>{label || "Network companion"}</strong></div>
    <style jsx>{`
      .fd-avatar-stage{position:relative;isolation:isolate;min-height:600px;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:26px;background:#06070c;box-shadow:inset 0 1px rgba(255,255,255,.05),0 30px 85px rgba(0,0,0,.34)}.fd-avatar-art{position:absolute;inset:0}.fd-avatar-glass{position:absolute;z-index:8;inset:0;pointer-events:none;background:linear-gradient(118deg,transparent 0 46%,rgba(255,255,255,.035) 50%,transparent 54%),radial-gradient(circle at 50% 44%,transparent 48%,rgba(0,0,0,.24) 100%)}.fd-avatar-glass i{position:absolute;top:12%;bottom:12%;width:1px;background:linear-gradient(transparent,rgba(104,232,251,.16),transparent)}.fd-avatar-glass i:first-child{left:8%}.fd-avatar-glass i:nth-child(2){right:8%}.fd-avatar-glass span{position:absolute;left:16%;right:16%;bottom:12%;height:1px;background:linear-gradient(90deg,transparent,rgba(157,109,255,.28),rgba(104,232,251,.28),transparent)}.fd-avatar-status{position:absolute;z-index:12;left:18px;bottom:16px;display:grid;gap:3px;padding:9px 11px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:rgba(5,6,10,.66);backdrop-filter:blur(10px)}.fd-avatar-status small{color:#7befff;font-size:7px;font-weight:900;letter-spacing:.15em}.fd-avatar-status strong{font-size:11px}.compact{min-height:230px;border-radius:18px}.compact .fd-avatar-status{left:9px;bottom:8px;padding:5px 7px}.compact .fd-avatar-status strong{display:none}.compact .fd-avatar-status small{font-size:5px}@media(max-width:540px){.fd-avatar-stage{min-height:500px}}
    `}</style>
  </div>;
}
