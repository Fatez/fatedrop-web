"use client";

/* eslint-disable @next/next/no-img-element */
import { KORU_BRAND } from "@/lib/koru-brand";

type KoruVariant = "portrait" | "full" | "friends";
type KoruReaction = "idle" | "watching" | "echo" | "manifested" | "vanished" | "fatematch" | "major";

const reactionLabels: Record<KoruReaction, string> = {
  idle: "NETWORK IDLE",
  watching: "WHISPER · WATCHING",
  echo: "ECHO · GET READY",
  manifested: "MANIFESTED · LIVE",
  vanished: "VANISHED · SIGNAL LOST",
  fatematch: "FATEMATCH FOUND",
  major: "MAJOR NETWORK SIGNAL",
};

export function KoruMascot({
  variant = "portrait",
  reaction = "watching",
  compact = false,
  label,
}: {
  variant?: KoruVariant;
  reaction?: KoruReaction;
  compact?: boolean;
  label?: string;
}) {
  const src = variant === "full" ? KORU_BRAND.fullArtwork : variant === "friends" ? KORU_BRAND.friendsArtwork : KORU_BRAND.portrait;
  return <figure className={`koru-mascot ${compact ? "compact" : ""}`} data-reaction={reaction}>
    <div className="koru-frame">
      <img src={src} alt={variant === "friends" ? "Koru and Friends FateDrop character concept artwork" : "Koru, the FateDrop Signal Companion"} />
      <div className="koru-scan" aria-hidden="true"/>
      <figcaption>
        <small>{reactionLabels[reaction]}</small>
        <strong>{label || `${KORU_BRAND.name} · ${KORU_BRAND.code}`}</strong>
        <span>{KORU_BRAND.role}</span>
      </figcaption>
    </div>
    <style jsx>{`
      .koru-mascot{margin:0}.koru-frame{position:relative;isolation:isolate;overflow:hidden;min-height:540px;border:1px solid rgba(255,255,255,.09);border-radius:24px;background:radial-gradient(circle at 50% 80%,rgba(112,74,255,.18),transparent 35%),#07080d;box-shadow:0 30px 80px rgba(0,0,0,.28)}.koru-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}.koru-frame:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(5,6,10,.84) 100%);pointer-events:none}.koru-scan{position:absolute;z-index:2;left:10%;right:10%;top:16%;height:1px;background:linear-gradient(90deg,transparent,rgba(108,233,255,.8),transparent);box-shadow:0 0 22px rgba(108,233,255,.42)}figcaption{position:absolute;z-index:3;left:18px;right:18px;bottom:17px;display:grid;gap:3px;padding:12px 14px;border:1px solid rgba(255,255,255,.09);border-radius:13px;background:rgba(5,6,10,.66);backdrop-filter:blur(12px)}figcaption small{color:#79edff;font-size:7px;font-weight:900;letter-spacing:.15em}figcaption strong{font-size:15px;letter-spacing:-.02em}figcaption span{color:#928b99;font-size:8px}.compact .koru-frame{min-height:260px;border-radius:18px}.compact figcaption{left:9px;right:9px;bottom:9px;padding:8px 9px}.compact figcaption span{display:none}@media(max-width:560px){.koru-frame{min-height:430px}}
    `}</style>
  </figure>;
}
