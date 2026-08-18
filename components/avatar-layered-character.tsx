"use client";

import type { CSSProperties } from "react";
import { avatarLayerHref, AVATAR_RIG_VIEWBOX } from "@/lib/avatar-assets";
import type { AvatarLoadout } from "@/lib/avatar-loadout";

export type AvatarMood = "idle" | "watching" | "whisper" | "alert" | "major" | "manifested" | "match" | "surge";

const accents: Record<AvatarLoadout["tcgStyle"], { a: string; b: string }> = {
  neutral: { a: "#9d6dff", b: "#68e8fb" },
  pokemon: { a: "#7d8cff", b: "#ffd66e" },
  "one-piece": { a: "#ff7d76", b: "#f6d56f" },
  lorcana: { a: "#70dfff", b: "#b58cff" },
  magic: { a: "#ff9e60", b: "#a67aff" },
  yugioh: { a: "#9b7aff", b: "#ff7acc" },
};

function Layer({ href, className = "" }: { href: string; className?: string }) {
  return <use href={href} width="640" height="960" className={className}/>;
}

export function AvatarLayeredCharacter({ loadout, mood = "idle", className = "" }: { loadout: AvatarLoadout; mood?: AvatarMood; className?: string }) {
  const accent = accents[loadout.tcgStyle];
  const style = { "--avatar-a": accent.a, "--avatar-b": accent.b } as CSSProperties;

  return <div className={`fd-layered-avatar mood-${mood} ${className}`} style={style}>
    <svg viewBox={AVATAR_RIG_VIEWBOX} role="img" aria-label="FateDrop illustrated collector companion" preserveAspectRatio="xMidYMid meet">
      <Layer href={avatarLayerHref("background", loadout)} className="fd-layer-bg"/>
      <g className="fd-layer-atmosphere"><Layer href={avatarLayerHref("aura", loadout)}/></g>
      <g className="fd-layer-person">
        <Layer href={avatarLayerHref("base", loadout)}/>
        <Layer href={avatarLayerHref("hairBack", loadout)}/>
        <Layer href={avatarLayerHref("skin", loadout)}/>
        <Layer href={avatarLayerHref("face", loadout)}/>
        <Layer href={avatarLayerHref("eyes", loadout)}/>
        <Layer href={avatarLayerHref("outfit", loadout)}/>
        <Layer href={avatarLayerHref("accessory", loadout)}/>
        <Layer href={avatarLayerHref("gear", loadout)} className="fd-layer-gear"/>
        <Layer href={avatarLayerHref("hairFront", loadout)}/>
        <Layer href={avatarLayerHref("headwear", loadout)}/>
      </g>
      <g className="fd-layer-companion"><Layer href={avatarLayerHref("companion", loadout)}/></g>
      <g className="fd-layer-lighting" aria-hidden="true"><ellipse cx="320" cy="520" rx="190" ry="320" fill="var(--avatar-a)" opacity=".028"/><path d="M85 800C235 710 401 716 556 797" fill="none" stroke="var(--avatar-b)" strokeOpacity=".16" strokeWidth="2"/></g>
    </svg>
    <div className="fd-avatar-rim" aria-hidden="true"/>
    <div className="fd-avatar-particles" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
    <style jsx>{`
      .fd-layered-avatar{position:relative;width:100%;height:100%;min-height:0;isolation:isolate;filter:drop-shadow(0 26px 34px rgba(0,0,0,.3))}.fd-layered-avatar>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.fd-layer-person{transform-origin:320px 810px;animation:fdAvatarBreathe 4.4s ease-in-out infinite}.fd-layer-companion{transform-origin:445px 310px;animation:fdCompanionFloat 3.2s ease-in-out infinite}.fd-layer-atmosphere{transform-origin:320px 600px;animation:fdAuraPulse 4s ease-in-out infinite}.fd-layer-gear{filter:drop-shadow(0 0 8px color-mix(in srgb,var(--avatar-b) 45%,transparent))}.fd-avatar-rim{position:absolute;z-index:4;left:28%;top:18%;width:46%;height:61%;border-radius:48%;pointer-events:none;background:linear-gradient(105deg,color-mix(in srgb,var(--avatar-b) 10%,transparent),transparent 28% 68%,color-mix(in srgb,var(--avatar-a) 11%,transparent));filter:blur(20px);mix-blend-mode:screen}.fd-avatar-particles{position:absolute;inset:0;pointer-events:none}.fd-avatar-particles i{position:absolute;width:4px;height:4px;border-radius:50%;background:var(--avatar-b);box-shadow:0 0 13px var(--avatar-b);opacity:.35;animation:fdParticle 4.5s ease-in-out infinite}.fd-avatar-particles i:nth-child(1){left:18%;top:26%}.fd-avatar-particles i:nth-child(2){left:76%;top:18%;animation-delay:-1s}.fd-avatar-particles i:nth-child(3){left:13%;top:57%;animation-delay:-2.4s}.fd-avatar-particles i:nth-child(4){left:83%;top:49%;animation-delay:-3.1s}.fd-avatar-particles i:nth-child(5){left:27%;top:72%;animation-delay:-1.7s}.fd-avatar-particles i:nth-child(6){left:70%;top:70%;animation-delay:-.5s}
      .mood-watching .fd-layer-person{animation-duration:3s;transform:translateY(-4px) rotate(-.5deg)}.mood-watching .fd-layer-companion{animation-duration:2.2s;filter:drop-shadow(0 0 12px color-mix(in srgb,var(--avatar-b) 38%,transparent))}
      .mood-whisper .fd-layer-person{animation:fdAvatarNotice 1.9s ease-in-out infinite}.mood-whisper .fd-layer-companion{animation-duration:1.6s;filter:drop-shadow(0 0 16px color-mix(in srgb,var(--avatar-b) 52%,transparent))}.mood-whisper .fd-avatar-particles i{opacity:.6}
      .mood-alert .fd-layer-person,.mood-major .fd-layer-person,.mood-surge .fd-layer-person{animation:fdAvatarAlert 1.35s ease-in-out infinite alternate}.mood-alert .fd-layer-companion,.mood-major .fd-layer-companion,.mood-surge .fd-layer-companion{animation:fdCompanionAlert .9s ease-in-out infinite alternate;filter:drop-shadow(0 0 22px var(--avatar-b))}.mood-major .fd-layer-atmosphere,.mood-surge .fd-layer-atmosphere{animation:fdAuraMajor 1.1s ease-in-out infinite alternate}.mood-major .fd-avatar-rim,.mood-surge .fd-avatar-rim{filter:blur(14px);opacity:1}.mood-major .fd-avatar-particles i,.mood-surge .fd-avatar-particles i{opacity:.85;animation-duration:1.6s}
      .mood-manifested .fd-layer-person{animation:fdAvatarConfirm 1.8s ease-in-out infinite}.mood-manifested .fd-layer-companion{filter:drop-shadow(0 0 22px color-mix(in srgb,var(--avatar-b) 75%,transparent))}.mood-match .fd-layer-person{animation:fdAvatarCelebrate 1.7s ease-in-out infinite}.mood-match .fd-layer-companion{animation:fdCompanionCelebrate 1.1s ease-in-out infinite;filter:drop-shadow(0 0 25px var(--avatar-b))}
      @keyframes fdAvatarBreathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-4px) scale(1.006)}}@keyframes fdAvatarNotice{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-5px) rotate(-.8deg)}}@keyframes fdAvatarAlert{from{transform:translateY(0) rotate(-.2deg) scale(1)}to{transform:translateY(-7px) rotate(-1.2deg) scale(1.012)}}@keyframes fdAvatarConfirm{0%,100%{transform:translateY(0) scale(1)}42%{transform:translateY(-8px) scale(1.015)}58%{transform:translateY(-5px) scale(1.01)}}@keyframes fdAvatarCelebrate{0%,100%{transform:translateY(0) rotate(0)}35%{transform:translateY(-12px) rotate(-1.4deg)}70%{transform:translateY(-4px) rotate(.8deg)}}@keyframes fdCompanionFloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-12px) rotate(3deg)}}@keyframes fdCompanionAlert{from{transform:translateY(-4px) scale(1)}to{transform:translateY(-14px) scale(1.05)}}@keyframes fdCompanionCelebrate{0%,100%{transform:translateY(0) rotate(0)}33%{transform:translateY(-18px) rotate(-5deg)}66%{transform:translateY(-7px) rotate(5deg)}}@keyframes fdAuraPulse{0%,100%{opacity:.72;transform:scale(.98)}50%{opacity:1;transform:scale(1.025)}}@keyframes fdAuraMajor{from{opacity:.72;transform:scale(.98)}to{opacity:1;transform:scale(1.06)}}@keyframes fdParticle{0%,100%{transform:translateY(0) scale(.7);opacity:.18}50%{transform:translateY(-18px) scale(1.2);opacity:.65}}
      @media(prefers-reduced-motion:reduce){.fd-layer-person,.fd-layer-companion,.fd-layer-atmosphere,.fd-avatar-particles i{animation:none!important}}
    `}</style>
  </div>;
}
