"use client";

import { useEffect, useState } from "react";

type SignalState = "whisper" | "manifested" | "vanished" | "echo";

export function SignalBeam({ pulseKey, state = "manifested", autoPulse = true }: { pulseKey: string; state?: SignalState; autoPulse?: boolean }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!autoPulse) return;
    const frame = window.requestAnimationFrame(() => setPulse(true));
    const timer = window.setTimeout(() => setPulse(false), 1800);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [pulseKey, autoPulse]);

  function replay() {
    setPulse(false);
    window.requestAnimationFrame(() => setPulse(true));
    window.setTimeout(() => setPulse(false), 1800);
  }

  return <button type="button" className={`fd-signal-beam state-${state} ${pulse ? "pulse" : ""}`} onClick={replay} aria-label="Replay FateDrop signal">
    <span className="beam-core"/><i className="beam-one"/><i className="beam-two"/><b>◇</b><small>{pulse ? "SIGNAL RECEIVED" : "REPLAY SIGNAL"}</small>
    <style jsx>{`.fd-signal-beam{position:relative;width:100%;height:74px;overflow:hidden;border:0;border-radius:13px;background:radial-gradient(circle at 82% 50%,rgba(157,109,255,.14),transparent 25%),rgba(255,255,255,.018);cursor:pointer}.fd-signal-beam .beam-core,.fd-signal-beam i{position:absolute;left:-15%;top:50%;height:1px;width:105%;transform-origin:left center;background:linear-gradient(90deg,transparent,rgba(117,232,255,.08),rgba(129,223,255,.9),rgba(188,110,255,.72),transparent);opacity:.35}.fd-signal-beam i{transform:rotate(3deg);opacity:.18}.fd-signal-beam .beam-two{transform:rotate(-3deg)}.fd-signal-beam b{position:absolute;right:11%;top:50%;transform:translateY(-50%) rotate(8deg);width:34px;height:48px;display:grid;place-items:center;border:1px solid rgba(176,145,255,.38);border-radius:5px;color:#c9f7ff;background:rgba(94,58,150,.12);box-shadow:0 0 22px rgba(127,96,255,.14)}.fd-signal-beam small{position:absolute;left:12px;bottom:8px;color:#625c69;font-size:6px;font-weight:900;letter-spacing:.13em}.fd-signal-beam.pulse .beam-core{animation:fdBeam 1.15s ease-out}.fd-signal-beam.pulse i{animation:fdBeamGhost 1.45s ease-out}.fd-signal-beam.pulse b{animation:fdCardPing 1.4s ease-out}.fd-signal-beam.pulse small{color:#8eefff}.fd-signal-beam.state-whisper{filter:saturate(.65)}.fd-signal-beam.state-vanished{filter:hue-rotate(115deg)}.fd-signal-beam.state-echo{filter:hue-rotate(-18deg)}@keyframes fdBeam{0%{transform:translateX(-70%);opacity:0}28%{opacity:1}65%{transform:translateX(13%);opacity:.95}100%{transform:translateX(35%);opacity:0}}@keyframes fdBeamGhost{0%{transform:translateX(-55%) rotate(3deg);opacity:0}45%{opacity:.6}100%{transform:translateX(30%) rotate(3deg);opacity:0}}@keyframes fdCardPing{0%,30%{box-shadow:0 0 0 rgba(127,96,255,0);transform:translateY(-50%) rotate(8deg) scale(.96)}55%{box-shadow:0 0 40px rgba(108,224,255,.45),0 0 70px rgba(158,83,255,.3);transform:translateY(-50%) rotate(8deg) scale(1.06)}100%{box-shadow:0 0 22px rgba(127,96,255,.14);transform:translateY(-50%) rotate(8deg) scale(1)}}@media(prefers-reduced-motion:reduce){.fd-signal-beam.pulse *{animation:none!important}}`}</style>
  </button>;
}
