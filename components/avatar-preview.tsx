"use client";

import type { CSSProperties } from "react";
import type { AvatarLoadout } from "@/lib/avatar-loadout";

export type AvatarMood = "idle" | "watching" | "whisper" | "manifested" | "match";

const accents: Record<AvatarLoadout["tcgStyle"], { a: string; b: string }> = {
  neutral: { a: "#9d6dff", b: "#68e8fb" },
  pokemon: { a: "#7f8cff", b: "#ffd86a" },
  "one-piece": { a: "#ff7d73", b: "#f8d56b" },
  lorcana: { a: "#7fe2ff", b: "#b58cff" },
  magic: { a: "#ff9f5f", b: "#a477ff" },
  yugioh: { a: "#9c7bff", b: "#ff79ca" },
};

export function AvatarPreview({ loadout, mood = "idle", compact = false, label }: { loadout: AvatarLoadout; mood?: AvatarMood; compact?: boolean; label?: string }) {
  const accent = accents[loadout.tcgStyle];
  const style = { "--avatar-a": accent.a, "--avatar-b": accent.b } as CSSProperties;
  return <div className={`fd-avatar-stage bg-${loadout.background} aura-${loadout.aura} mood-${mood} ${compact ? "compact" : ""}`} style={style} aria-label={label || "FateDrop avatar preview"}>
    <div className="fd-avatar-grid" aria-hidden="true"><i/><i/><i/><i/></div>
    <div className="fd-avatar-aura" aria-hidden="true"/>
    <div className={`fd-avatar-person base-${loadout.base} outfit-${loadout.outfit}`}>
      <div className="fd-avatar-head">
        <span className="fd-avatar-hair"/>
        <span className="fd-avatar-face"><i/><i/><b/></span>
        <span className={`fd-avatar-headwear head-${loadout.headwear}`}><i/><b/></span>
      </div>
      <div className="fd-avatar-neck"/>
      <div className="fd-avatar-body"><span className="fd-avatar-chest">FD</span><i className="arm left"/><i className="arm right"/></div>
      <div className="fd-avatar-legs"><i/><i/></div>
      <div className={`fd-avatar-gear gear-${loadout.gear}`}>{loadout.gear === "scanner" ? "◇" : loadout.gear === "binder" ? "▤" : loadout.gear === "slab-case" ? "▣" : ""}</div>
    </div>
    {loadout.companion !== "none" ? <div className={`fd-avatar-companion companion-${loadout.companion}`} aria-hidden="true"><span>{loadout.companion === "radar-drone" ? "◉" : loadout.companion === "signal-orb" ? "◇" : "·"}</span><i/><i/></div> : null}
    <div className="fd-avatar-floor" aria-hidden="true"/>
    <div className="fd-avatar-status"><small>{mood === "watching" ? "WATCHING" : mood === "whisper" ? "WHISPER" : mood === "manifested" ? "MANIFESTED" : mood === "match" ? "FATEMATCH HIT" : "FATEDROP AVATAR"}</small><strong>{label || "Network companion"}</strong></div>
    <style jsx>{`
      .fd-avatar-stage{--avatar-a:#9d6dff;--avatar-b:#68e8fb;position:relative;isolation:isolate;min-height:420px;overflow:hidden;border:1px solid rgba(255,255,255,.09);border-radius:24px;background:radial-gradient(circle at 50% 20%,color-mix(in srgb,var(--avatar-a) 18%,transparent),transparent 34%),linear-gradient(145deg,#0d0b17,#08090e 68%);box-shadow:inset 0 1px rgba(255,255,255,.04),0 26px 70px rgba(0,0,0,.25)}
      .fd-avatar-stage.bg-collector-desk{background:radial-gradient(circle at 70% 18%,color-mix(in srgb,var(--avatar-b) 12%,transparent),transparent 30%),linear-gradient(160deg,#11101b,#09090e 62%,#0d0b10)}
      .fd-avatar-stage.bg-card-vault{background:repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 1px,transparent 1px 72px),radial-gradient(circle at 50% 20%,color-mix(in srgb,var(--avatar-a) 18%,transparent),transparent 34%),#08090e}
      .fd-avatar-stage.bg-tournament-floor{background:linear-gradient(180deg,#0c0c14,#07080c 60%),repeating-linear-gradient(45deg,rgba(255,255,255,.015) 0 1px,transparent 1px 24px)}
      .fd-avatar-grid{position:absolute;inset:0;opacity:.7}.fd-avatar-grid i{position:absolute;height:1px;width:70%;left:15%;top:28%;background:linear-gradient(90deg,transparent,var(--avatar-b),transparent);opacity:.12;transform:rotate(-14deg)}.fd-avatar-grid i:nth-child(2){top:48%;transform:rotate(10deg)}.fd-avatar-grid i:nth-child(3){top:68%;transform:rotate(-5deg);opacity:.08}.fd-avatar-grid i:nth-child(4){left:50%;top:10%;height:75%;width:1px;background:linear-gradient(transparent,var(--avatar-a),transparent);transform:none}
      .fd-avatar-aura{position:absolute;left:50%;top:46%;width:260px;height:300px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--avatar-a) 22%,transparent),transparent 62%);filter:blur(6px);animation:avatarAura 3.4s ease-in-out infinite}.aura-cyan .fd-avatar-aura{background:radial-gradient(circle,rgba(104,232,251,.24),transparent 62%)}.aura-spectral .fd-avatar-aura{background:conic-gradient(from 30deg,rgba(104,232,251,.18),rgba(157,109,255,.24),rgba(255,110,224,.16),rgba(104,232,251,.18));filter:blur(22px)}.aura-gold .fd-avatar-aura{background:radial-gradient(circle,rgba(255,205,93,.22),transparent 62%)}
      .fd-avatar-person{position:absolute;z-index:4;left:50%;bottom:68px;width:150px;height:286px;transform:translateX(-50%);animation:avatarIdle 3.6s ease-in-out infinite}.fd-avatar-head{position:absolute;left:42px;top:8px;width:68px;height:76px}.fd-avatar-face{position:absolute;left:6px;top:14px;width:56px;height:58px;border-radius:44% 44% 48% 48%;background:linear-gradient(145deg,#d7a27e,#bd7e62);box-shadow:inset 0 -8px 12px rgba(72,34,29,.18)}.base-runner .fd-avatar-face{background:linear-gradient(145deg,#c58d70,#9f6754)}.base-warden .fd-avatar-face{background:linear-gradient(145deg,#9b6b58,#764b43)}
      .fd-avatar-face i{position:absolute;top:24px;width:7px;height:5px;border-radius:50%;background:#111}.fd-avatar-face i:first-child{left:13px}.fd-avatar-face i:nth-child(2){right:13px}.fd-avatar-face b{position:absolute;left:50%;bottom:10px;width:14px;height:5px;border-bottom:2px solid rgba(68,27,30,.65);border-radius:50%;transform:translateX(-50%)}
      .fd-avatar-hair{position:absolute;z-index:2;left:5px;top:4px;width:58px;height:30px;border-radius:50% 50% 34% 34%;background:#16131a;transform:rotate(-4deg)}
      .fd-avatar-headwear{position:absolute;z-index:4;left:0;top:0;width:68px;height:34px}.head-signal-cap{border-radius:40px 40px 10px 10px;background:linear-gradient(135deg,#15131c,#24202f);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--avatar-a) 55%,transparent)}.head-signal-cap:after{content:"";position:absolute;right:-14px;bottom:2px;width:34px;height:8px;border-radius:0 12px 12px 0;background:#191621;transform:rotate(4deg)}.head-signal-cap b{position:absolute;left:27px;top:9px;width:11px;height:11px;border:2px solid var(--avatar-b);transform:rotate(45deg)}
      .head-headphones:before,.head-headphones:after{content:"";position:absolute;top:13px;width:13px;height:25px;border-radius:8px;background:#1c1825;border:1px solid var(--avatar-a)}.head-headphones:before{left:-2px}.head-headphones:after{right:-2px}.head-headphones i{position:absolute;left:8px;top:1px;width:50px;height:35px;border:5px solid #1c1825;border-bottom:0;border-radius:40px 40px 0 0}
      .head-visor{top:28px;height:15px;border:1px solid var(--avatar-b);border-radius:8px;background:linear-gradient(90deg,rgba(104,232,251,.22),rgba(157,109,255,.28));box-shadow:0 0 18px color-mix(in srgb,var(--avatar-b) 34%,transparent)}.head-beanie{height:30px;border-radius:50% 50% 12px 12px;background:#20202a;box-shadow:inset 0 -5px rgba(255,255,255,.03)}
      .fd-avatar-neck{position:absolute;left:68px;top:72px;width:17px;height:16px;background:#b87860}.fd-avatar-body{position:absolute;left:25px;top:84px;width:100px;height:118px;border-radius:32px 32px 22px 22px;background:linear-gradient(145deg,#18151f,#0d0d12);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--avatar-a) 35%,transparent)}.outfit-collector-jacket .fd-avatar-body{background:linear-gradient(135deg,#26242d,#121216)}.outfit-tournament-shell .fd-avatar-body{background:linear-gradient(135deg,#131a22,#0b0f14);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--avatar-b) 38%,transparent)}
      .fd-avatar-chest{position:absolute;left:39px;top:37px;width:22px;height:22px;display:grid;place-items:center;border:1px solid var(--avatar-a);border-radius:7px;color:#fff;font-size:7px;font-weight:900;box-shadow:0 0 15px color-mix(in srgb,var(--avatar-a) 28%,transparent)}.arm{position:absolute;top:16px;width:25px;height:98px;border-radius:18px;background:#15131b}.arm.left{left:-17px;transform:rotate(8deg)}.arm.right{right:-17px;transform:rotate(-18deg);transform-origin:top}
      .fd-avatar-legs{position:absolute;left:42px;top:194px;width:68px;height:89px}.fd-avatar-legs i{position:absolute;width:27px;height:88px;border-radius:13px;background:#101116}.fd-avatar-legs i:first-child{left:2px}.fd-avatar-legs i:last-child{right:2px}.fd-avatar-legs i:after{content:"";position:absolute;left:-4px;bottom:-2px;width:36px;height:13px;border-radius:9px 14px 6px 6px;background:#25232c;border-bottom:2px solid var(--avatar-a)}
      .fd-avatar-gear{position:absolute;z-index:6;left:105px;top:132px;width:32px;height:44px;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--avatar-b) 45%,transparent);border-radius:8px;background:#12121a;color:var(--avatar-b);font-size:16px;box-shadow:0 0 22px color-mix(in srgb,var(--avatar-b) 18%,transparent)}.gear-none{display:none}.gear-binder{width:39px;height:50px}.gear-slab-case{border-radius:4px}
      .fd-avatar-companion{position:absolute;z-index:5;right:17%;top:29%;width:60px;height:60px;border:1px solid color-mix(in srgb,var(--avatar-b) 40%,transparent);border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#1a1930,#0c0c13 70%);box-shadow:0 0 28px color-mix(in srgb,var(--avatar-b) 18%,transparent);animation:companionFloat 3s ease-in-out infinite}.fd-avatar-companion span{color:var(--avatar-b);font-size:18px}.fd-avatar-companion i{position:absolute;width:18px;height:8px;border:1px solid color-mix(in srgb,var(--avatar-a) 45%,transparent);border-radius:50%;top:25px}.fd-avatar-companion i:first-of-type{left:-13px}.fd-avatar-companion i:last-of-type{right:-13px}.companion-signal-orb{width:42px;height:42px}.companion-mini-beacon{border-radius:12px;width:42px;height:52px}
      .fd-avatar-floor{position:absolute;z-index:1;left:50%;bottom:50px;width:280px;height:58px;transform:translateX(-50%);border:1px solid color-mix(in srgb,var(--avatar-a) 34%,transparent);border-radius:50%;background:radial-gradient(ellipse,color-mix(in srgb,var(--avatar-a) 14%,transparent),transparent 66%);box-shadow:0 0 35px color-mix(in srgb,var(--avatar-a) 12%,transparent)}
      .fd-avatar-status{position:absolute;z-index:8;left:18px;bottom:16px;display:grid;gap:3px}.fd-avatar-status small{color:var(--avatar-b);font-size:7px;font-weight:900;letter-spacing:.14em}.fd-avatar-status strong{font-size:11px}
      .mood-whisper .fd-avatar-aura{animation-duration:1.6s}.mood-manifested .fd-avatar-stage,.mood-match .fd-avatar-stage{filter:saturate(1.08)}.mood-manifested .fd-avatar-companion,.mood-match .fd-avatar-companion{animation-duration:1.1s;box-shadow:0 0 45px color-mix(in srgb,var(--avatar-b) 40%,transparent)}.mood-watching .fd-avatar-person{animation-duration:2.4s}
      .compact{min-height:170px;border-radius:16px}.compact .fd-avatar-person{bottom:22px;transform:translateX(-50%) scale(.48);transform-origin:bottom center}.compact .fd-avatar-aura{width:130px;height:145px}.compact .fd-avatar-companion{right:12%;top:22%;transform:scale(.6)}.compact .fd-avatar-floor{bottom:16px;width:145px;height:30px}.compact .fd-avatar-status{left:10px;bottom:8px}.compact .fd-avatar-status strong{display:none}.compact .fd-avatar-status small{font-size:5px}
      @keyframes avatarIdle{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-4px)}}@keyframes companionFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-10px) rotate(4deg)}}@keyframes avatarAura{0%,100%{opacity:.55;transform:translate(-50%,-50%) scale(.96)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}}@media(prefers-reduced-motion:reduce){.fd-avatar-person,.fd-avatar-companion,.fd-avatar-aura{animation:none!important}}
    `}</style>
  </div>;
}
