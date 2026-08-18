"use client";

import type { CSSProperties } from "react";
import type { AvatarLoadout } from "@/lib/avatar-loadout";

export type AvatarMood = "idle" | "watching" | "whisper" | "manifested" | "match" | "surge";

const accents: Record<AvatarLoadout["tcgStyle"], { a: string; b: string }> = {
  neutral: { a: "#9d6dff", b: "#68e8fb" },
  pokemon: { a: "#768cff", b: "#ffd86a" },
  "one-piece": { a: "#ff746f", b: "#ffd06a" },
  lorcana: { a: "#77dcff", b: "#b18cff" },
  magic: { a: "#ff955a", b: "#9f76ff" },
  yugioh: { a: "#9675ff", b: "#ff73cb" },
};

const skins: Record<AvatarLoadout["base"], { light: string; mid: string; shade: string }> = {
  scout: { light: "#f3c1a0", mid: "#d69473", shade: "#9b5d4f" },
  runner: { light: "#ddb08e", mid: "#bb7d63", shade: "#7f4c43" },
  warden: { light: "#ba856d", mid: "#8f5c4d", shade: "#603b39" },
};

const hairColours: Record<AvatarLoadout["hair"], { a: string; b: string; glow: string }> = {
  "midnight-spikes": { a: "#171420", b: "#332648", glow: "#8d6cff" },
  "violet-wave": { a: "#27152e", b: "#71377f", glow: "#ff76e7" },
  "silver-fade": { a: "#f0eff8", b: "#85859b", glow: "#b8f4ff" },
  "cyan-crop": { a: "#10272c", b: "#207f94", glow: "#68e8fb" },
};

function Headwear({ value }: { value: AvatarLoadout["headwear"] }) {
  if (value === "signal-cap") return <g className="fd-anime-headwear"><path d="M132 95c14-28 78-35 107 1l-6 30c-33-15-73-14-106 3z" fill="#15131d" stroke="var(--avatar-a)" strokeWidth="3"/><path d="M224 118c27 0 46 6 57 15-24 0-43 2-61 8z" fill="#1e1a29"/><path d="m184 100 10 10-10 10-10-10z" fill="none" stroke="var(--avatar-b)" strokeWidth="4"/></g>;
  if (value === "headphones") return <g className="fd-anime-headwear"><path d="M138 112c2-46 89-56 102-2" fill="none" stroke="#24202f" strokeWidth="12" strokeLinecap="round"/><rect x="126" y="122" width="22" height="43" rx="10" fill="#1b1825" stroke="var(--avatar-a)" strokeWidth="3"/><rect x="231" y="121" width="22" height="43" rx="10" fill="#1b1825" stroke="var(--avatar-a)" strokeWidth="3"/></g>;
  if (value === "visor") return <g className="fd-anime-headwear"><path d="M137 143c31-13 70-13 100 0l-7 27c-28-10-57-10-86 0z" fill="url(#fdAnimeVisor)" stroke="var(--avatar-b)" strokeWidth="3"/><path d="M148 151h74" stroke="#dfffff" strokeOpacity=".55" strokeWidth="2"/></g>;
  return <g className="fd-anime-headwear"><path d="M137 102c12-30 80-34 98 2l-1 34c-31-13-63-13-96 0z" fill="#20202b"/><path d="M138 126h96" stroke="var(--avatar-a)" strokeOpacity=".6" strokeWidth="3"/></g>;
}

function Hair({ value }: { value: AvatarLoadout["hair"] }) {
  const c = hairColours[value];
  if (value === "violet-wave") return <g className="fd-anime-hair" style={{ "--hair-a": c.a, "--hair-b": c.b, "--hair-glow": c.glow } as CSSProperties}><path d="M137 126c4-55 88-68 111-18 14 31-4 64-8 85-6-11-9-22-7-35-9 13-18 18-27 22 2-14 0-27-6-39-14 24-36 37-64 39 15-18 22-36 20-54-7 8-15 14-24 18 1-8 2-13 5-18z" fill="url(#fdAnimeHair)"/><path d="M151 105c19-15 49-18 70-6" stroke="var(--hair-glow)" strokeOpacity=".4" strokeWidth="5" strokeLinecap="round"/></g>;
  if (value === "silver-fade") return <g className="fd-anime-hair" style={{ "--hair-a": c.a, "--hair-b": c.b, "--hair-glow": c.glow } as CSSProperties}><path d="M136 126c10-56 89-59 111-13l-15 45-9-28-13 38-15-41-18 39-9-37-23 24z" fill="url(#fdAnimeHair)" stroke="#fff" strokeOpacity=".16" strokeWidth="2"/></g>;
  if (value === "cyan-crop") return <g className="fd-anime-hair" style={{ "--hair-a": c.a, "--hair-b": c.b, "--hair-glow": c.glow } as CSSProperties}><path d="M139 130c7-49 87-55 105-14l-6 25-20-20-8 20-18-23-17 22-16-20-16 18z" fill="url(#fdAnimeHair)"/><path d="M160 111c20-9 41-10 60-4" stroke="var(--hair-glow)" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round"/></g>;
  return <g className="fd-anime-hair" style={{ "--hair-a": c.a, "--hair-b": c.b, "--hair-glow": c.glow } as CSSProperties}><path d="M132 132c3-59 92-70 117-21l-13 34-15-25-10 29-18-31-18 31-12-27-19 23-3-20-16 12z" fill="url(#fdAnimeHair)"/><path d="M148 109c27-20 59-20 83-1" stroke="var(--hair-glow)" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round"/></g>;
}

function Gear({ value }: { value: AvatarLoadout["gear"] }) {
  if (value === "none") return null;
  if (value === "binder") return <g className="fd-anime-gear"><rect x="262" y="285" width="58" height="76" rx="8" fill="#171522" stroke="var(--avatar-a)" strokeWidth="3"/><path d="M273 300h34v46h-34z" fill="#0d1320" stroke="var(--avatar-b)" strokeOpacity=".5"/><path d="M284 316h13m-13 10h13" stroke="var(--avatar-b)" strokeWidth="3" strokeLinecap="round"/></g>;
  if (value === "slab-case") return <g className="fd-anime-gear"><rect x="271" y="288" width="46" height="70" rx="4" fill="#151722" stroke="var(--avatar-b)" strokeWidth="3"/><rect x="278" y="298" width="32" height="40" rx="2" fill="url(#fdAnimeCard)"/><path d="M280 346h29" stroke="var(--avatar-a)" strokeWidth="3"/></g>;
  return <g className="fd-anime-gear fd-scanner"><rect x="267" y="287" width="48" height="72" rx="10" fill="#11121b" stroke="var(--avatar-b)" strokeWidth="3"/><rect x="275" y="296" width="32" height="43" rx="6" fill="#07161e"/><circle cx="291" cy="317" r="10" fill="none" stroke="var(--avatar-b)" strokeWidth="2"/><circle cx="291" cy="317" r="3" fill="var(--avatar-b)"/><path d="M280 347h22" stroke="var(--avatar-a)" strokeWidth="3" strokeLinecap="round"/></g>;
}

function Companion({ value, mood }: { value: AvatarLoadout["companion"]; mood: AvatarMood }) {
  if (value === "none") return null;
  if (value === "signal-orb") return <g className={`fd-anime-companion mood-${mood}`}><circle cx="331" cy="185" r="31" fill="url(#fdAnimeOrb)" stroke="var(--avatar-b)" strokeWidth="3"/><circle cx="331" cy="185" r="10" fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="2"/><circle cx="331" cy="185" r="4" fill="var(--avatar-b)"/></g>;
  if (value === "mini-beacon") return <g className={`fd-anime-companion mood-${mood}`}><rect x="305" y="151" width="51" height="67" rx="17" fill="#151522" stroke="var(--avatar-a)" strokeWidth="3"/><rect x="314" y="161" width="33" height="22" rx="9" fill="#07161d"/><circle cx="324" cy="172" r="3" fill="var(--avatar-b)"/><circle cx="337" cy="172" r="3" fill="var(--avatar-b)"/><path d="M320 199h21" stroke="var(--avatar-b)" strokeWidth="3" strokeLinecap="round"/></g>;
  return <g className={`fd-anime-companion mood-${mood}`}><path d="M298 174c0-31 23-52 53-52s53 21 53 52-23 48-53 48-53-17-53-48z" fill="url(#fdAnimeDrone)" stroke="var(--avatar-a)" strokeWidth="3"/><path d="M309 142 297 126m86 16 13-16" stroke="var(--avatar-b)" strokeWidth="5" strokeLinecap="round"/><path d="M293 166 270 153m136 13 23-13" stroke="var(--avatar-a)" strokeWidth="5" strokeLinecap="round"/><rect x="315" y="151" width="72" height="45" rx="20" fill="#07141b" stroke="#36304d" strokeWidth="2"/><ellipse cx="337" cy="173" rx="7" ry="10" fill="var(--avatar-b)"/><ellipse cx="366" cy="173" rx="7" ry="10" fill="var(--avatar-b)"/><path d="M344 190c6 4 12 4 18 0" fill="none" stroke="#83f2ff" strokeWidth="2" strokeLinecap="round"/><path d="M309 202c-16 14-18 30-3 41m86-41c15 14 17 30 3 41" fill="none" stroke="var(--avatar-a)" strokeOpacity=".65" strokeWidth="4"/></g>;
}

export function AvatarAnimeCharacter({ loadout, mood = "idle", className = "" }: { loadout: AvatarLoadout; mood?: AvatarMood; className?: string }) {
  const accent = accents[loadout.tcgStyle];
  const skin = skins[loadout.base];
  const hair = hairColours[loadout.hair];
  const outfitA = loadout.outfit === "collector-jacket" ? "#272433" : loadout.outfit === "tournament-shell" ? "#11212a" : "#17151f";
  const outfitB = loadout.outfit === "collector-jacket" ? "#111117" : loadout.outfit === "tournament-shell" ? "#090e13" : "#090a0f";
  const style = { "--avatar-a": accent.a, "--avatar-b": accent.b, "--skin-light": skin.light, "--skin-mid": skin.mid, "--skin-shade": skin.shade, "--hair-a": hair.a, "--hair-b": hair.b, "--hair-glow": hair.glow, "--outfit-a": outfitA, "--outfit-b": outfitB } as CSSProperties;

  return <div className={`fd-anime-character mood-${mood} ${className}`} style={style}>
    <svg viewBox="0 0 440 520" role="img" aria-label="FateDrop anime collector companion">
      <defs>
        <linearGradient id="fdAnimeSkin" x1="0" x2="1" y1="0" y2="1"><stop stopColor="var(--skin-light)"/><stop offset=".65" stopColor="var(--skin-mid)"/><stop offset="1" stopColor="var(--skin-shade)"/></linearGradient>
        <linearGradient id="fdAnimeHair" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--hair-a)"/><stop offset="1" stopColor="var(--hair-b)"/></linearGradient>
        <linearGradient id="fdAnimeOutfit" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--outfit-a)"/><stop offset="1" stopColor="var(--outfit-b)"/></linearGradient>
        <linearGradient id="fdAnimeVisor" x1="0" x2="1"><stop stopColor="var(--avatar-b)" stopOpacity=".16"/><stop offset=".5" stopColor="var(--avatar-a)" stopOpacity=".5"/><stop offset="1" stopColor="var(--avatar-b)" stopOpacity=".2"/></linearGradient>
        <linearGradient id="fdAnimeCard" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--avatar-a)" stopOpacity=".65"/><stop offset="1" stopColor="var(--avatar-b)" stopOpacity=".35"/></linearGradient>
        <radialGradient id="fdAnimeDrone"><stop stopColor="#27233a"/><stop offset="1" stopColor="#0c0d15"/></radialGradient>
        <radialGradient id="fdAnimeOrb"><stop stopColor="var(--avatar-b)" stopOpacity=".5"/><stop offset=".35" stopColor="var(--avatar-a)" stopOpacity=".25"/><stop offset="1" stopColor="#0b0c12"/></radialGradient>
        <filter id="fdAnimeGlow"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      <g className="fd-character-shadow"><ellipse cx="194" cy="482" rx="113" ry="20" fill="var(--avatar-a)" opacity=".16" filter="url(#fdAnimeGlow)"/></g>
      <g className="fd-character-body">
        <path d="M132 285c7-60 113-65 132 0l-3 119H130z" fill="url(#fdAnimeOutfit)" stroke="var(--avatar-a)" strokeOpacity=".38" strokeWidth="3"/>
        <path d="M148 290c22 19 77 18 98 0" fill="none" stroke="var(--avatar-b)" strokeOpacity=".35" strokeWidth="3"/>
        <path d="M181 300h34l9 32-26 20-26-20z" fill="#11131a" stroke="var(--avatar-a)" strokeWidth="3"/>
        <path d="m198 309 10 10-10 10-10-10z" fill="none" stroke="var(--avatar-b)" strokeWidth="3"/>
        <text x="198" y="349" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="900">FATEDROP</text>
        <path d="M135 304c-30 9-49 45-48 79 0 23 17 28 30 10l32-56" fill="url(#fdAnimeOutfit)" stroke="#0d0c12" strokeWidth="7" strokeLinecap="round"/>
        <path className="fd-alert-arm" d={mood === "surge" || mood === "manifested" || mood === "match" ? "M259 306c35 8 49 22 58 49l-8 19c-20-9-42-25-57-40" : "M259 306c33 12 48 42 43 77-4 23-24 25-34 4l-24-54"} fill="url(#fdAnimeOutfit)" stroke="#0d0c12" strokeWidth="7" strokeLinecap="round"/>
        <circle cx={mood === "surge" || mood === "manifested" || mood === "match" ? 319 : 301} cy={mood === "surge" || mood === "manifested" || mood === "match" ? 371 : 389} r="18" fill="url(#fdAnimeSkin)"/>
        <circle cx="102" cy="397" r="18" fill="url(#fdAnimeSkin)"/>
        <path d="M151 402h44l-8 74h-51z" fill="#101117"/><path d="M201 402h43l16 74h-51z" fill="#0d0f15"/>
        <path d="M131 471h65v19h-78c-5-10 0-17 13-19zm75 0h58c15 2 22 8 21 18h-79z" fill="#272530" stroke="var(--avatar-a)" strokeOpacity=".5" strokeWidth="3"/>
      </g>

      <g className="fd-character-head">
        <path d="M153 151c7-45 84-57 102-10 12 32-3 88-55 99-50 10-73-47-47-89z" fill="url(#fdAnimeSkin)" stroke="var(--skin-shade)" strokeOpacity=".35" strokeWidth="3"/>
        <Hair value={loadout.hair}/>
        <ellipse cx="174" cy="180" rx="15" ry="20" fill="#fff"/><ellipse cx="224" cy="180" rx="15" ry="20" fill="#fff"/>
        <ellipse cx="177" cy="183" rx="8" ry="12" fill="var(--avatar-a)"/><ellipse cx="221" cy="183" rx="8" ry="12" fill="var(--avatar-a)"/>
        <circle cx="179" cy="179" r="4" fill="#16131d"/><circle cx="219" cy="179" r="4" fill="#16131d"/><circle cx="181" cy="176" r="2" fill="#fff"/><circle cx="217" cy="176" r="2" fill="#fff"/>
        <path d="M162 157c11-8 24-9 34-3m10 0c11-5 24-4 33 3" fill="none" stroke="#3c2730" strokeWidth="5" strokeLinecap="round"/>
        <path d="M188 205c9 8 20 8 29 0" fill="none" stroke="#824c59" strokeWidth="3" strokeLinecap="round"/>
        <path d="M197 185c-3 8-3 14 2 18" fill="none" stroke="var(--skin-shade)" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round"/>
        <path d="M151 179c-17-7-21 18-6 28m104-28c17-7 21 18 6 28" fill="url(#fdAnimeSkin)" stroke="var(--skin-shade)" strokeOpacity=".35" strokeWidth="2"/>
        <Headwear value={loadout.headwear}/>
      </g>

      <Gear value={loadout.gear}/>
      <Companion value={loadout.companion} mood={mood}/>

      {(mood === "surge" || mood === "manifested" || mood === "match") ? <g className="fd-anime-energy" filter="url(#fdAnimeGlow)"><circle cx="335" cy="365" r="13" fill="#fff"/><circle cx="335" cy="365" r="27" fill="none" stroke="var(--avatar-b)" strokeWidth="4"/><circle cx="335" cy="365" r="42" fill="none" stroke="var(--avatar-a)" strokeOpacity=".5" strokeWidth="3"/><path d="M364 365h64" stroke="var(--avatar-b)" strokeWidth="8" strokeLinecap="round"/><path d="M365 365h63" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></g> : null}
    </svg>
    <style jsx>{`
      .fd-anime-character{width:100%;height:100%;min-height:0;display:grid;place-items:center;filter:drop-shadow(0 20px 26px rgba(0,0,0,.28))}.fd-anime-character svg{width:100%;height:100%;overflow:visible}.fd-character-body,.fd-character-head{transform-origin:center;animation:fdAnimeIdle 3.4s ease-in-out infinite}.fd-anime-companion{transform-origin:350px 180px;animation:fdAnimeFloat 2.7s ease-in-out infinite}.fd-anime-energy{transform-origin:335px 365px;animation:fdAnimeCharge .85s ease-in-out infinite alternate}.mood-watching .fd-character-head{animation-duration:2.1s}.mood-whisper .fd-anime-companion{animation-duration:1.45s}.mood-surged .fd-anime-energy,.mood-manifested .fd-anime-energy,.mood-match .fd-anime-energy{animation-duration:.55s}@keyframes fdAnimeIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}@keyframes fdAnimeFloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-12px) rotate(3deg)}}@keyframes fdAnimeCharge{from{opacity:.55;transform:scale(.9)}to{opacity:1;transform:scale(1.08)}}@media(prefers-reduced-motion:reduce){.fd-character-body,.fd-character-head,.fd-anime-companion,.fd-anime-energy{animation:none!important}}
    `}</style>
  </div>;
}
