"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarSignalCinematic } from "@/components/avatar-signal-cinematic";
import { SignalBeam } from "@/components/signal-beam";
import type { AvatarLoadout } from "@/lib/avatar-loadout";
import type { NetworkSignal, SignalIntensity, SignalKind } from "@/lib/dashboard-storage";

const kindMeta: Record<SignalKind, { label: string; glyph: string; context?: string }> = {
  whisper: { label: "WHISPER", glyph: "W", context: "product / catalogue movement" },
  manifested: { label: "MANIFESTED", glyph: "M", context: "confirmed availability" },
  vanished: { label: "VANISHED", glyph: "V", context: "confirmed availability lost" },
  echo: { label: "ECHO", glyph: "E", context: "access readiness changed" },
  price_change: { label: "PRICE CHANGE", glyph: "£" },
  launch_date_change: { label: "LAUNCH CHANGE", glyph: "D" },
  queue: { label: "ECHO", glyph: "E", context: "queue condition observed" },
  security: { label: "ECHO", glyph: "E", context: "security / traffic condition observed" },
  drop_pulse: { label: "DROP PULSE", glyph: "P", context: "evidence-backed activity context" },
};

function money(pence: number | null | undefined) {
  if (pence === null || pence === undefined) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

function relativeTime(timestamp: number, now: number) {
  const seconds = Math.max(0, now - timestamp);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86_400)}d ago`;
}

function signalKind(signal: NetworkSignal): SignalKind { return signal.kind ?? signal.state; }
function signalIntensity(signal: NetworkSignal): SignalIntensity {
  if (signal.intensity) return signal.intensity;
  const kind = signalKind(signal);
  if (kind === "security" || kind === "queue") return "major";
  if (kind === "manifested" || kind === "echo" || kind === "drop_pulse") return "standard";
  return "subtle";
}

export function LiveAlertFeed({ initialSignals, initialNow, initialSource, unlocked, avatarLoadout }: { initialSignals: NetworkSignal[]; initialNow: number; initialSource: string | null; unlocked: boolean; avatarLoadout: AvatarLoadout }) {
  const [signals, setSignals] = useState(initialSignals);
  const [now, setNow] = useState(initialNow);
  const [source, setSource] = useState(initialSource);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set<string>());
  const knownIds = useRef(new Set(initialSignals.map((signal) => signal.id)));

  useEffect(() => {
    const clock = window.setInterval(() => setNow((value) => value + 30), 30_000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    let disposed = false;
    let freshTimer: number | null = null;

    async function poll() {
      try {
        const response = await fetch("/api/dashboard/signals", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json() as { signals?: NetworkSignal[]; source?: string | null };
        if (disposed || !Array.isArray(payload.signals)) return;
        const incoming = payload.signals;
        const nextFresh = incoming.filter((signal) => !knownIds.current.has(signal.id)).map((signal) => signal.id);
        incoming.forEach((signal) => knownIds.current.add(signal.id));
        setSignals(incoming);
        setSource(payload.source ?? null);
        if (nextFresh.length) {
          setFreshIds(new Set(nextFresh));
          if (freshTimer) window.clearTimeout(freshTimer);
          freshTimer = window.setTimeout(() => setFreshIds(new Set<string>()), 5200);
        }
      } catch {
        // Keep the last good persisted snapshot visible if a poll fails.
      }
    }

    void poll();
    const timer = window.setInterval(poll, 10_000);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      if (freshTimer) window.clearTimeout(freshTimer);
    };
  }, []);

  function addDemo(demo: NetworkSignal) {
    setSignals((current) => [demo, ...current.filter((signal) => !signal.id.startsWith("local-demo-"))]);
    setFreshIds(new Set([demo.id]));
    window.setTimeout(() => setFreshIds(new Set<string>()), 5200);
  }

  function testProductSignal() {
    const occurredAt = Math.floor(Date.now() / 1000);
    addDemo({
      id: `local-demo-product-${Date.now()}`,
      state: "manifested",
      kind: "manifested",
      intensity: "standard",
      confidence: 0.99,
      title: "Destined Rivals Elite Trainer Box · DEMO",
      retailer: "Pokémon Center UK · LOCAL DEMO",
      detail: "A confirmed product-level Manifested event. The focused Signal Card remains distinct from earlier Whisper product movement or Echo access-readiness evidence.",
      deliveredPricePence: 4999,
      occurredAt,
    });
  }

  function testMajorSignal() {
    const occurredAt = Math.floor(Date.now() / 1000);
    addDemo({
      id: `local-demo-major-${Date.now()}`,
      state: "echo",
      kind: "security",
      intensity: "major",
      confidence: 0.86,
      title: "Pokémon Center UK · network conditions changed",
      retailer: "Pokémon Center UK · LOCAL DEMO",
      detail: "Echo detected: security or traffic behaviour changed. FateDrop is watching for corroborating queue, catalogue and inventory movement; this does not claim stock is imminent.",
      deliveredPricePence: null,
      occurredAt,
    });
  }

  const majorSignal = signals.find((signal) => signalIntensity(signal) === "major" && now - signal.occurredAt <= 1800) ?? null;
  const majorDemo = Boolean(majorSignal?.id.startsWith("local-demo-"));
  const stageSignal = majorSignal && (unlocked || majorDemo) ? majorSignal : majorSignal ? { ...majorSignal, title: "Major network movement detected", retailer: null, detail: "FateDrop detected a significant upstream access-readiness condition change. This is Echo-level context, not confirmed stock; actionable detail is Premium.", confidence: null } : null;
  const majorFresh = Boolean(majorSignal && freshIds.has(majorSignal.id));

  return <section className="fd-alerts-feed">
    <div className="fd-alerts-feedhead"><div><span>NETWORK SIGNAL CARDS</span><small>{source ? `Source: ${source} · checks every 10s` : "Awaiting FateDrop Cloud"}</small></div><div className="fd-alert-feed-actions"><button type="button" onClick={testMajorSignal}>TEST COMPANION SURGE</button><button type="button" onClick={testProductSignal}>TEST PRODUCT SIGNAL</button><b>{signals.length} SIGNAL{signals.length === 1 ? "" : "S"}</b></div></div>
    <div className="fd-alert-stage"><AvatarSignalCinematic signal={stageSignal} loadout={avatarLoadout} pulseKey={majorSignal?.id ?? "network-listening"} autoPulse={majorFresh}/></div>
    {signals.length ? <div className="fd-signal-grid">{signals.map((signal) => {
      const kind = signalKind(signal);
      const intensity = signalIntensity(signal);
      const meta = kindMeta[kind];
      const demo = signal.id.startsWith("local-demo-");
      const confidence = signal.confidence == null ? null : Math.round(signal.confidence * 100);
      return <article className={`fd-signal-card state-${signal.state} intensity-${intensity} ${unlocked || demo ? "" : "locked"} ${demo ? "demo" : ""}`} key={signal.id}>
        <div className="fd-signal-card-top"><span><i>{meta.glyph}</i>{meta.label}{meta.context ? <em>{meta.context}</em> : null}{intensity === "major" ? <em>MAJOR ACTIVITY</em> : null}{demo ? <em>LOCAL DEMO</em> : null}</span><time>{relativeTime(signal.occurredAt, now)}</time></div>
        <div className={unlocked || demo ? "" : "fd-alert-blur"}><h2>{signal.title}</h2><p>{demo ? signal.retailer : unlocked ? (signal.retailer || "Retailer pending") : "Retailer hidden"}</p></div>
        <SignalBeam pulseKey={signal.id} state={signal.state} intensity={intensity === "major" ? "standard" : intensity} autoPulse={freshIds.has(signal.id)}/>
        <div className={`fd-signal-detail ${unlocked || demo ? "" : "fd-alert-blur"}`}>{demo ? signal.detail : unlocked ? (signal.detail || "FateDrop signal event detected.") : "Unlock Premium to reveal product, retailer and actionable signal context."}</div>
        <footer><span><small>TRUE PRICE</small><b>{demo ? money(signal.deliveredPricePence) : unlocked ? money(signal.deliveredPricePence) : "£—.——"}</b></span><span><small>DETECTED</small><b>{relativeTime(signal.occurredAt, now)}</b></span><span><small>{confidence !== null ? "CONFIDENCE" : "SIGNAL"}</small><b>{confidence !== null ? `${confidence}%` : meta.label}</b></span></footer>
        {!unlocked && !demo ? <div className="fd-alert-lock">♛</div> : null}
      </article>;
    })}</div> : <div className="fd-alerts-empty"><span>◇</span><h2>The network is quiet.</h2><p>Your selected Koru &amp; Friends companion remains on watch. Product/catalogue movement can surface as Whisper; queue, traffic or security readiness can surface as Echo; confirmed availability materialises separately as Manifested.</p><button type="button" onClick={testMajorSignal}>Test the companion surge locally</button><button type="button" onClick={testProductSignal}>Test a product signal locally</button></div>}
    <style jsx>{`.fd-alert-stage{padding:14px;border-bottom:1px solid #19161e;background:#08070c}.fd-alert-feed-actions{display:flex;align-items:center;justify-content:flex-end;gap:7px;flex-wrap:wrap}.fd-alert-feed-actions button,.fd-alerts-empty button{min-height:32px;padding:0 10px;border:1px solid rgba(88,232,255,.18);border-radius:9px;background:linear-gradient(135deg,rgba(88,232,255,.07),rgba(157,109,255,.08));color:#b9f3ff;font-size:7px;font-weight:900;letter-spacing:.09em;cursor:pointer}.fd-alerts-empty button+button{margin-left:7px}.fd-signal-card.demo{box-shadow:inset 0 0 0 1px rgba(88,232,255,.14)}.fd-signal-card.intensity-major{background:radial-gradient(circle at 100% 0%,rgba(88,232,255,.08),transparent 25%),radial-gradient(circle at 85% 15%,rgba(157,109,255,.1),transparent 36%),#0b0a10}.fd-signal-card-top em{margin-left:4px;padding:3px 5px;border:1px solid rgba(88,232,255,.18);border-radius:999px;color:#75eaff;font-size:5px;font-style:normal;letter-spacing:.08em}.fd-signal-card.intensity-major .fd-signal-card-top em{border-color:rgba(190,123,255,.28);color:#caa8ff}@media(max-width:760px){.fd-alerts-feedhead{align-items:flex-start;gap:10px;flex-direction:column}.fd-alert-feed-actions{justify-content:flex-start}}`}</style>
  </section>;
}
