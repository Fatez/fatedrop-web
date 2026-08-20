"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CompanionModelCanvas } from "@/components/companion-3d-stage";

export function HomeCompanionShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) {
      setModelReady(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setModelReady(true);
        observer.disconnect();
      }
    }, { rootMargin: "320px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return <section ref={sectionRef} className="fd-home-companion section-shell" aria-labelledby="fd-home-companion-title">
    <div className="fd-home-companion-copy">
      <p className="eyebrow"><span />Fate Companion</p>
      <h2 id="fd-home-companion-title">Your signal has a face.</h2>
      <p>FateDrop Companions make the network feel personal. Choose KAEL or NYRA as your collector identity, add VØX as an optional familiar, and preview the same signal states used across Watching, Echo, Manifested and FateMatch.</p>
      <div className="fd-companion-points">
        <span><b>01</b>Choose KAEL or NYRA</span>
        <span><b>02</b>Summon VØX when you want a familiar</span>
        <span><b>03</b>Build toward full reactive animations</span>
      </div>
      <div className="button-row">
        <Link className="button button-primary" href="/account/register">Create FateDrop ID <span>↗</span></Link>
        <Link className="button button-secondary" href="/dashboard/avatar">Open Companion Lab</Link>
      </div>
      <small>NYRA preview · optimised real-time model · reactive rig pipeline</small>
    </div>

    <div className="fd-home-companion-stage" aria-label="NYRA 3D preview">
      <div className="fd-home-companion-grid" aria-hidden="true" />
      <div className="fd-home-companion-aura" aria-hidden="true" />
      <div className="fd-home-companion-platform" aria-hidden="true" />
      {modelReady ? <CompanionModelCanvas variant="female" reaction="watching" showStatus={false} /> : <div className="fd-home-companion-pending">COMPANION SIGNAL STANDBY</div>}
      <div className="fd-home-companion-chip"><span>NYRA / N-02</span><b>3D READY</b></div>
      <div className="fd-home-companion-readout"><span>STATE</span><b>WATCHING</b><span>ROLE</span><b>COLLECTOR</b></div>
    </div>

    <style jsx>{`
      .fd-home-companion{position:relative;display:grid;grid-template-columns:minmax(0,.82fr) minmax(420px,1.18fr);gap:clamp(28px,5vw,76px);align-items:center;padding-top:clamp(72px,9vw,126px);padding-bottom:clamp(72px,9vw,126px)}
      .fd-home-companion-copy{position:relative;z-index:2}.fd-home-companion-copy h2{max-width:690px;margin:10px 0 18px;font-size:clamp(2.3rem,5vw,5.4rem);line-height:.92;letter-spacing:-.065em}.fd-home-companion-copy>p:not(.eyebrow){max-width:630px;color:#918b98;font-size:clamp(.92rem,1.35vw,1.08rem);line-height:1.75}.fd-home-companion-copy>small{display:block;margin-top:16px;color:#66606d;font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
      .fd-companion-points{display:grid;gap:8px;margin:25px 0}.fd-companion-points span{display:flex;align-items:center;gap:12px;padding:11px 13px;border:1px solid rgba(255,255,255,.065);border-radius:12px;background:rgba(255,255,255,.018);color:#a49dab;font-size:11px}.fd-companion-points b{display:grid;place-items:center;width:28px;height:28px;border:1px solid rgba(117,234,255,.16);border-radius:50%;color:#75eaff;font-size:7px;letter-spacing:.08em}
      .fd-home-companion-stage{position:relative;min-height:590px;overflow:hidden;border:1px solid rgba(157,109,255,.18);border-radius:30px;background:radial-gradient(circle at 50% 78%,rgba(105,65,255,.20),transparent 35%),linear-gradient(155deg,#0d0b16,#07080d 68%);box-shadow:0 45px 110px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.025)}.fd-home-companion-grid{position:absolute;inset:0;opacity:.09;background-image:linear-gradient(rgba(117,234,255,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(157,109,255,.10) 1px,transparent 1px);background-size:46px 46px}.fd-home-companion-aura{position:absolute;left:22%;right:22%;top:13%;bottom:14%;border:1px solid rgba(157,109,255,.12);border-radius:50%;box-shadow:0 0 90px rgba(116,72,255,.14),inset 0 0 90px rgba(83,228,255,.025)}.fd-home-companion-platform{position:absolute;z-index:1;left:19%;right:19%;bottom:8%;height:65px;border:1px solid rgba(117,234,255,.24);border-radius:50%;box-shadow:0 0 0 18px rgba(157,109,255,.025),0 0 55px rgba(124,78,255,.17),inset 0 0 35px rgba(117,234,255,.05);transform:perspective(240px) rotateX(68deg)}
      .fd-home-companion-pending{position:absolute;z-index:3;inset:0;display:grid;place-items:center;color:#6e6875;font-size:8px;font-weight:900;letter-spacing:.16em}.fd-home-companion-chip{position:absolute;z-index:6;top:18px;right:18px;display:flex;gap:8px;padding:7px 10px;border:1px solid rgba(255,255,255,.07);border-radius:999px;background:rgba(4,5,9,.66);font-size:6px;font-weight:900;letter-spacing:.12em}.fd-home-companion-chip span{color:#77717d}.fd-home-companion-chip b{color:#72eaff}.fd-home-companion-readout{position:absolute;z-index:6;left:20px;bottom:20px;display:grid;grid-template-columns:auto auto;gap:5px 12px;padding:10px 12px;border:1px solid rgba(255,255,255,.055);border-radius:12px;background:rgba(4,5,9,.58);font-size:6px;letter-spacing:.1em}.fd-home-companion-readout span{color:#625c69}.fd-home-companion-readout b{color:#bdb6c4}
      @media(max-width:980px){.fd-home-companion{grid-template-columns:1fr}.fd-home-companion-stage{min-height:520px}.fd-home-companion-copy h2{max-width:760px}}@media(max-width:560px){.fd-home-companion-stage{min-height:430px;border-radius:22px}.fd-home-companion-copy h2{font-size:clamp(2.5rem,15vw,4.2rem)}.fd-companion-points span{font-size:10px}.fd-home-companion-readout{display:none}}
    `}</style>
  </section>;
}
