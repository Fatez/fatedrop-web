"use client";

import { CompanionRenderer } from "@/components/companion-renderer";
import type { AvatarLoadout } from "@/lib/avatar-loadout";
import { companionDefinition, companionReactionFromSignal } from "@/lib/companion-contract";
import type { NetworkSignal, SignalKind } from "@/lib/dashboard-storage";

function kind(signal: NetworkSignal): SignalKind { return signal.kind ?? signal.state; }

function copy(signal: NetworkSignal) {
  const signalKind = kind(signal);
  if (signalKind === "whisper") return { kicker: "WHISPER", headline: "MOVEMENT NOTICED", speech: "Something changed around this product. I’m watching it.", tone: "building" };
  if (signalKind === "manifested") return { kicker: "MANIFESTED", headline: "STOCK CONFIRMED", speech: "Purchasable availability is confirmed live.", tone: "confirmed" };
  if (signalKind === "vanished") return { kicker: "VANISHED", headline: "SIGNAL LOST", speech: "Previously confirmed availability is no longer verified.", tone: "quiet" };
  if (signalKind === "echo" || signalKind === "queue" || signalKind === "security") return { kicker: "ECHO", headline: "GET READY", speech: "Access conditions changed. Stock is not confirmed yet.", tone: "ready" };
  if (signalKind === "drop_pulse") return { kicker: "DROP PULSE", headline: "ACTIVITY BUILDING", speech: "Several observed changes are lining up. I’m keeping watch.", tone: "building" };
  if (signalKind === "price_change") return { kicker: "PRICE CHANGE", headline: "PRICE MOVED", speech: "The observed offer price changed. Check the context before deciding.", tone: "building" };
  if (signalKind === "launch_date_change") return { kicker: "LAUNCH CHANGE", headline: "DATE MOVED", speech: "The observed launch information changed. I’m keeping the evidence attached.", tone: "building" };
  return { kicker: "FATEDROP SIGNAL", headline: "NETWORK MOVEMENT", speech: "I caught a change in the network.", tone: "building" };
}

export function AvatarSignalCinematic({ signal, loadout, pulseKey, autoPulse = false }: { signal: NetworkSignal | null; loadout: AvatarLoadout; pulseKey: string; autoPulse?: boolean }) {
  const companion = companionDefinition(loadout.companion);
  const message = signal ? copy(signal) : { kicker: "FATEDROP NETWORK", headline: "LISTENING", speech: "I’m watching the network for you.", tone: "idle" };
  const retailer = signal?.retailer || "FateDrop Network";
  const confidence = signal?.confidence == null ? null : Math.round(signal.confidence * 100);
  const reaction = signal ? companionReactionFromSignal({ kind: signal.kind, state: signal.state, major: signal.intensity === "major" }) : "watching";
  const active = Boolean(signal && autoPulse);

  return <section className={`fd-companion-cinematic tone-${message.tone} ${active ? "is-fresh" : ""}`} data-pulse-key={pulseKey}>
    <div className="fd-cinematic-space" aria-hidden="true"><i/><i/><span/><span/></div>
    <div className="fd-cinematic-companion">
      <CompanionRenderer request={{ companionId: companion.id, reaction, label: companion.name }}/>
    </div>
    <div className="fd-cinematic-speech"><small>{companion.name.toUpperCase()} · KORU &amp; FRIENDS</small><strong>{message.speech}</strong></div>
    <div className="fd-cinematic-beam" aria-hidden="true"><i/><i/><b/></div>
    <div className="fd-cinematic-alert">
      <span>{message.kicker}</span>
      <h2>{message.headline}</h2>
      <strong>{signal?.title || "FateDrop is listening for meaningful network evidence"}</strong>
      <p>{retailer}</p>
      <div className="fd-cinematic-facts">
        <span><small>SIGNAL</small><b>{signal ? kind(signal).replaceAll("_", " ").toUpperCase() : "LISTENING"}</b></span>
        <span><small>CONFIDENCE</small><b>{confidence === null ? "EVIDENCE BUILDING" : `${confidence}%`}</b></span>
        <span><small>COMPANION</small><b>{companion.name.toUpperCase()}</b></span>
      </div>
    </div>
    <div className="fd-cinematic-footer"><i/><span>{signal?.detail || "FateDrop is listening for catalogue, access, inventory and product-level changes."}</span></div>
    <style jsx>{`
      .fd-companion-cinematic{position:relative;isolation:isolate;min-height:430px;overflow:hidden;border:1px solid rgba(171,139,182,.18);border-radius:22px;background:radial-gradient(circle at 25% 30%,rgba(132,96,147,.16),transparent 28%),radial-gradient(circle at 76% 18%,rgba(104,132,151,.07),transparent 24%),linear-gradient(145deg,#0b0c12,#080a10 58%,#06070b);box-shadow:inset 0 1px rgba(255,255,255,.04),0 24px 70px rgba(0,0,0,.24)}
      .fd-companion-cinematic:after{content:"";position:absolute;z-index:20;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 0 48%,rgba(255,255,255,.025) 51%,transparent 54%),radial-gradient(circle at 50% 50%,transparent 52%,rgba(0,0,0,.26))}
      .fd-cinematic-space{position:absolute;inset:0;overflow:hidden}.fd-cinematic-space i{position:absolute;width:2px;height:2px;border-radius:50%;left:5%;top:8%;background:#e7dce7;box-shadow:42px 24px #8c7794,105px 58px #d8cbd7,194px 12px #796482,330px 67px #c8bdc9,480px 28px #87728d,655px 82px #ddd3dc,850px 31px #75657b;opacity:.4}.fd-cinematic-space i:nth-child(2){left:9%;top:48%;transform:scale(.7)}.fd-cinematic-space span{position:absolute;left:-10%;width:80%;height:1px;background:linear-gradient(90deg,transparent,rgba(177,142,189,.28),rgba(124,144,158,.18),transparent);transform:rotate(-11deg)}.fd-cinematic-space span:nth-of-type(1){top:28%}.fd-cinematic-space span:nth-of-type(2){top:70%;left:28%;transform:rotate(8deg)}
      .fd-cinematic-companion{position:absolute;z-index:7;left:24px;top:35px;bottom:34px;width:min(42%,430px)}.fd-cinematic-companion :global(.fd-koru-mascot),.fd-cinematic-companion :global(.companion-placeholder){height:100%;min-height:0!important}
      .fd-cinematic-speech{position:absolute;z-index:12;left:31%;top:34px;width:min(270px,28%);padding:13px 15px;border:1px solid rgba(183,145,193,.16);border-radius:14px 14px 14px 3px;background:rgba(7,9,14,.84);backdrop-filter:blur(12px);box-shadow:0 16px 40px rgba(0,0,0,.22)}.fd-cinematic-speech small{display:block;color:#aa8cb4;font-size:6px;font-weight:900;letter-spacing:.14em}.fd-cinematic-speech strong{display:block;margin-top:6px;color:#ddd5d3;font-size:12px;line-height:1.45}
      .fd-cinematic-beam{position:absolute;z-index:9;left:34%;top:56%;width:30%;height:74px;transform:rotate(-2deg);transform-origin:left center;pointer-events:none}.fd-cinematic-beam i{position:absolute;left:0;right:0;top:50%;height:8px;transform:translateY(-50%);border-radius:999px;background:linear-gradient(90deg,#eadfeb,#b594c0 18%,rgba(120,109,139,.54) 72%,transparent);box-shadow:0 0 18px rgba(181,148,192,.34);opacity:.64}.fd-cinematic-beam i:nth-child(2){height:2px;opacity:.9}.fd-cinematic-beam b{position:absolute;left:-11px;top:50%;width:38px;height:38px;border:2px solid rgba(190,156,200,.72);border-radius:50%;transform:translateY(-50%);box-shadow:0 0 20px rgba(178,142,190,.28);background:radial-gradient(circle,#eee5e9 0 10%,#ad8db7 12% 20%,transparent 23%)}
      .fd-cinematic-alert{position:absolute;z-index:10;right:4%;top:74px;width:min(45%,570px);padding:25px 26px 22px;border:1px solid rgba(176,142,187,.26);clip-path:polygon(18px 0,100% 0,100% calc(100% - 18px),calc(100% - 18px) 100%,0 100%,0 18px);background:linear-gradient(145deg,rgba(16,15,22,.95),rgba(6,8,13,.96));box-shadow:0 0 50px rgba(122,92,137,.08),0 24px 55px rgba(0,0,0,.32)}.fd-cinematic-alert>span{color:#b293bb;font-size:8px;font-weight:900;letter-spacing:.18em}.fd-cinematic-alert h2{margin:7px 0 9px;color:#eee6e1;font-family:Georgia,serif;font-size:clamp(1.8rem,3.3vw,3.5rem);font-weight:500;line-height:.9;letter-spacing:-.05em}.fd-cinematic-alert>strong{display:block;color:#d5cdca;font-size:14px;line-height:1.35}.fd-cinematic-alert>p{margin:5px 0 18px;color:#858087;font-size:10px}.fd-cinematic-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.fd-cinematic-facts span{padding:9px;border:1px solid rgba(255,255,255,.06);border-radius:9px;background:rgba(0,0,0,.18)}.fd-cinematic-facts small{display:block;color:#625c69;font-size:5px;font-weight:900;letter-spacing:.11em}.fd-cinematic-facts b{display:block;margin-top:3px;color:#d8d3dc;font-size:8px}.tone-confirmed .fd-cinematic-alert{border-color:rgba(113,190,153,.25)}.tone-confirmed .fd-cinematic-alert>span{color:#91c9aa}.tone-ready .fd-cinematic-alert>span{color:#a9a1c5}.tone-quiet .fd-cinematic-alert>span{color:#8c858e}
      .fd-cinematic-footer{position:absolute;z-index:11;left:26px;right:26px;bottom:18px;display:flex;gap:8px;align-items:center;color:#77717e;font-size:8px}.fd-cinematic-footer i{width:7px;height:7px;border-radius:50%;background:#a98ab4;box-shadow:0 0 12px rgba(169,138,180,.3)}
      .is-fresh .fd-cinematic-beam{animation:fdBeamFire .9s cubic-bezier(.2,.8,.25,1) both}.is-fresh .fd-cinematic-alert{animation:fdAlertMaterialise .5s .25s ease-out both}@keyframes fdBeamFire{0%{opacity:0;transform:rotate(-2deg) scaleX(.05)}28%{opacity:1}100%{transform:rotate(-2deg) scaleX(1)}}@keyframes fdAlertMaterialise{from{opacity:0;transform:translateX(28px) scale(.98);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}
      @media(max-width:980px){.fd-companion-cinematic{min-height:520px}.fd-cinematic-companion{left:10px;top:55px;width:40%}.fd-cinematic-speech{left:27%;top:24px;width:260px}.fd-cinematic-alert{right:3%;top:175px;width:54%}}@media(max-width:720px){.fd-companion-cinematic{min-height:700px}.fd-cinematic-companion{left:50%;top:72px;width:300px;height:300px;bottom:auto;transform:translateX(-50%)}.fd-cinematic-speech{left:16px;right:16px;top:18px;width:auto}.fd-cinematic-beam{display:none}.fd-cinematic-alert{left:16px;right:16px;top:auto;bottom:54px;width:auto}.fd-cinematic-facts{grid-template-columns:1fr 1fr 1fr}.fd-cinematic-footer{left:18px;right:18px;bottom:19px}}
      @media(prefers-reduced-motion:reduce){.is-fresh .fd-cinematic-beam,.is-fresh .fd-cinematic-alert{animation:none!important}}
    `}</style>
  </section>;
}
