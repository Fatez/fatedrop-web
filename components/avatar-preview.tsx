"use client";

import type { CSSProperties } from "react";
import { AvatarAnimeCharacter, type AvatarMood } from "@/components/avatar-anime-character";
import type { AvatarLoadout } from "@/lib/avatar-loadout";

export type { AvatarMood } from "@/components/avatar-anime-character";

const accents: Record<AvatarLoadout["tcgStyle"], { a: string; b: string }> = {
  neutral: { a: "#9d6dff", b: "#68e8fb" },
  pokemon: { a: "#768cff", b: "#ffd86a" },
  "one-piece": { a: "#ff746f", b: "#ffd06a" },
  lorcana: { a: "#77dcff", b: "#b18cff" },
  magic: { a: "#ff955a", b: "#9f76ff" },
  yugioh: { a: "#9675ff", b: "#ff73cb" },
};

function moodLabel(mood: AvatarMood) {
  if (mood === "watching") return "WATCHING";
  if (mood === "whisper") return "WHISPER";
  if (mood === "manifested") return "MANIFESTED";
  if (mood === "match") return "FATEMATCH HIT";
  if (mood === "surge") return "NETWORK SURGE";
  return "FATEDROP AVATAR";
}

export function AvatarPreview({ loadout, mood = "idle", compact = false, label }: { loadout: AvatarLoadout; mood?: AvatarMood; compact?: boolean; label?: string }) {
  const accent = accents[loadout.tcgStyle];
  const style = { "--avatar-a": accent.a, "--avatar-b": accent.b } as CSSProperties;
  return <div className={`fd-avatar-stage bg-${loadout.background} aura-${loadout.aura} mood-${mood} ${compact ? "compact" : ""}`} style={style} aria-label={label || "FateDrop avatar preview"}>
    <div className="fd-avatar-space" aria-hidden="true"><i/><i/><i/><i/><b/><b/><b/></div>
    <div className="fd-avatar-city" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
    <div className="fd-avatar-command-room" aria-hidden="true"><span/><span/><span/><span/><b/><b/></div>
    <div className="fd-avatar-portal" aria-hidden="true"><i/><i/><i/><b/></div>
    <div className="fd-avatar-character-wrap"><AvatarAnimeCharacter loadout={loadout} mood={mood}/></div>
    <div className="fd-avatar-floor" aria-hidden="true"/>
    <div className="fd-avatar-status"><small>{moodLabel(mood)}</small><strong>{label || "Network companion"}</strong></div>
    <style jsx>{`
      .fd-avatar-stage{--avatar-a:#9d6dff;--avatar-b:#68e8fb;position:relative;isolation:isolate;min-height:520px;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:24px;background:radial-gradient(circle at 50% 24%,color-mix(in srgb,var(--avatar-a) 22%,transparent),transparent 27%),linear-gradient(180deg,#0c0917 0%,#080912 50%,#05070b 100%);box-shadow:inset 0 1px rgba(255,255,255,.05),0 28px 80px rgba(0,0,0,.3)}
      .fd-avatar-stage:after{content:"";position:absolute;z-index:10;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 0 42%,rgba(255,255,255,.035) 48%,transparent 54%),radial-gradient(circle at 50% 45%,transparent 42%,rgba(0,0,0,.28) 100%)}
      .fd-avatar-space{position:absolute;inset:0;overflow:hidden;background:radial-gradient(circle at 20% 14%,rgba(104,232,251,.08),transparent 22%),radial-gradient(circle at 78% 8%,rgba(255,77,206,.12),transparent 24%)}.fd-avatar-space i{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;box-shadow:42px 16px #8defff,87px 46px #fff,160px 12px #b17cff,240px 58px #fff,305px 24px #67eaff,380px 84px #d797ff,36px 115px #fff,198px 130px #fff,345px 146px #9d6dff;opacity:.65}.fd-avatar-space i:nth-child(1){left:3%;top:4%}.fd-avatar-space i:nth-child(2){left:15%;top:24%;transform:scale(.7)}.fd-avatar-space i:nth-child(3){left:2%;top:46%;transform:scale(.5)}.fd-avatar-space i:nth-child(4){left:42%;top:2%;transform:scale(.8)}.fd-avatar-space b{position:absolute;width:62%;height:2px;left:-12%;top:22%;background:linear-gradient(90deg,transparent,var(--avatar-a),var(--avatar-b),transparent);opacity:.18;transform:rotate(-10deg);filter:blur(.3px)}.fd-avatar-space b:nth-of-type(2){top:42%;left:27%;transform:rotate(12deg)}.fd-avatar-space b:nth-of-type(3){top:62%;left:2%;transform:rotate(-4deg);opacity:.1}
      .fd-avatar-city{position:absolute;z-index:1;left:0;right:0;bottom:64px;height:145px;opacity:.78}.fd-avatar-city i{position:absolute;bottom:0;width:11%;border:1px solid rgba(104,232,251,.12);border-bottom:0;background:linear-gradient(180deg,rgba(157,109,255,.08),rgba(5,8,14,.85));box-shadow:inset 0 0 20px rgba(157,109,255,.05)}.fd-avatar-city i:after{content:"";position:absolute;inset:9px 6px;background:repeating-linear-gradient(180deg,var(--avatar-b) 0 2px,transparent 2px 13px);opacity:.12}.fd-avatar-city i:nth-child(1){left:0;height:60%}.fd-avatar-city i:nth-child(2){left:11%;height:92%}.fd-avatar-city i:nth-child(3){left:25%;height:54%}.fd-avatar-city i:nth-child(4){right:23%;height:75%}.fd-avatar-city i:nth-child(5){right:10%;height:98%}.fd-avatar-city i:nth-child(6){right:0;height:61%}
      .fd-avatar-command-room{position:absolute;z-index:2;inset:0;pointer-events:none}.fd-avatar-command-room>span{position:absolute;top:19%;width:78px;height:104px;border:1px solid rgba(104,232,251,.13);border-radius:8px;background:linear-gradient(145deg,rgba(4,16,24,.78),rgba(15,8,25,.72));box-shadow:0 0 25px rgba(104,232,251,.04)}.fd-avatar-command-room>span:after{content:"";position:absolute;inset:10px;background:repeating-linear-gradient(180deg,rgba(104,232,251,.35) 0 2px,transparent 2px 13px);opacity:.3}.fd-avatar-command-room>span:nth-child(1){left:3%;transform:rotate(-7deg)}.fd-avatar-command-room>span:nth-child(2){left:18%;top:28%;width:64px;height:80px}.fd-avatar-command-room>span:nth-child(3){right:4%;transform:rotate(7deg)}.fd-avatar-command-room>span:nth-child(4){right:19%;top:30%;width:64px;height:82px}.fd-avatar-command-room>b{position:absolute;bottom:52px;width:38%;height:66px;border-top:1px solid rgba(157,109,255,.16);background:linear-gradient(180deg,rgba(17,14,28,.82),rgba(5,6,10,.96));transform:perspective(180px) rotateX(11deg)}.fd-avatar-command-room>b:nth-of-type(1){left:-5%;transform:perspective(180px) rotateX(11deg) rotate(2deg)}.fd-avatar-command-room>b:nth-of-type(2){right:-5%;transform:perspective(180px) rotateX(11deg) rotate(-2deg)}
      .fd-avatar-portal{position:absolute;z-index:1;left:50%;top:43%;width:300px;height:300px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,transparent 35%,color-mix(in srgb,var(--avatar-a) 11%,transparent) 36% 39%,transparent 40%);filter:drop-shadow(0 0 26px color-mix(in srgb,var(--avatar-a) 16%,transparent));animation:fdPortal 9s linear infinite}.fd-avatar-portal i{position:absolute;inset:21px;border:1px solid color-mix(in srgb,var(--avatar-b) 30%,transparent);border-radius:50%;border-left-color:transparent;border-bottom-color:transparent}.fd-avatar-portal i:nth-child(2){inset:48px;border-color:color-mix(in srgb,var(--avatar-a) 34%,transparent);border-right-color:transparent}.fd-avatar-portal i:nth-child(3){inset:72px;border-style:dashed;opacity:.55}.fd-avatar-portal b{position:absolute;inset:94px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--avatar-b) 9%,transparent),transparent 70%)}
      .fd-avatar-character-wrap{position:absolute;z-index:6;left:50%;bottom:25px;width:min(430px,93%);height:480px;transform:translateX(-50%)}.fd-avatar-floor{position:absolute;z-index:4;left:50%;bottom:42px;width:380px;height:76px;transform:translateX(-50%);border:1px solid color-mix(in srgb,var(--avatar-a) 38%,transparent);border-radius:50%;background:radial-gradient(ellipse,color-mix(in srgb,var(--avatar-a) 18%,transparent),transparent 65%);box-shadow:0 0 50px color-mix(in srgb,var(--avatar-a) 14%,transparent),inset 0 0 35px rgba(104,232,251,.05)}
      .fd-avatar-status{position:absolute;z-index:12;left:18px;bottom:16px;display:grid;gap:3px;padding:8px 10px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:rgba(5,6,10,.58);backdrop-filter:blur(8px)}.fd-avatar-status small{color:var(--avatar-b);font-size:7px;font-weight:900;letter-spacing:.14em}.fd-avatar-status strong{font-size:11px}
      .aura-cyan{--avatar-a:#53b9ff;--avatar-b:#79f6ff}.aura-gold{--avatar-a:#d79b42;--avatar-b:#ffd76b}.aura-spectral .fd-avatar-stage{filter:saturate(1.08)}.mood-whisper .fd-avatar-portal{animation-duration:4.5s}.mood-manifested,.mood-match,.mood-surge{box-shadow:inset 0 1px rgba(255,255,255,.06),0 0 42px color-mix(in srgb,var(--avatar-a) 13%,transparent),0 28px 80px rgba(0,0,0,.3)}.mood-surge .fd-avatar-space b,.mood-manifested .fd-avatar-space b{opacity:.36;animation:fdSignalSweep 1.2s ease-in-out infinite alternate}.bg-collector-desk .fd-avatar-city{opacity:.22}.bg-card-vault .fd-avatar-city{display:none}.bg-card-vault .fd-avatar-command-room>span{width:92px;height:132px}.bg-tournament-floor .fd-avatar-command-room>span{opacity:.4}
      .compact{min-height:210px;border-radius:17px}.compact .fd-avatar-character-wrap{bottom:4px;width:210px;height:225px}.compact .fd-avatar-portal{width:160px;height:160px}.compact .fd-avatar-city{bottom:20px;height:70px}.compact .fd-avatar-command-room{opacity:.45}.compact .fd-avatar-floor{bottom:18px;width:175px;height:35px}.compact .fd-avatar-status{left:9px;bottom:7px;padding:5px 7px}.compact .fd-avatar-status strong{display:none}.compact .fd-avatar-status small{font-size:5px}
      @keyframes fdPortal{to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes fdSignalSweep{from{transform:rotate(-10deg) translateX(-5%)}to{transform:rotate(-8deg) translateX(8%)}}@media(prefers-reduced-motion:reduce){.fd-avatar-portal,.fd-avatar-space b{animation:none!important}}@media(max-width:540px){.fd-avatar-stage{min-height:440px}.fd-avatar-character-wrap{height:410px}.fd-avatar-command-room>span:nth-child(2),.fd-avatar-command-room>span:nth-child(4){display:none}}
    `}</style>
  </div>;
}
