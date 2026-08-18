"use client";

import { useEffect, useRef, useState } from "react";
import { SignalBeam } from "@/components/signal-beam";
import type { NetworkSignal, SignalLifecycle } from "@/lib/dashboard-storage";

const stateMeta: Record<SignalLifecycle, { label: string; glyph: string }> = {
  whisper: { label: "WHISPER", glyph: "W" },
  manifested: { label: "MANIFESTED", glyph: "M" },
  vanished: { label: "VANISHED", glyph: "V" },
  echo: { label: "ECHO", glyph: "E" },
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

export function LiveAlertFeed({ initialSignals, initialNow, initialSource, unlocked }: { initialSignals: NetworkSignal[]; initialNow: number; initialSource: string | null; unlocked: boolean }) {
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
          freshTimer = window.setTimeout(() => setFreshIds(new Set<string>()), 2600);
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

  function testBeam() {
    const id = `local-demo-${Date.now()}`;
    const demo: NetworkSignal = {
      id,
      state: "manifested",
      title: "FateDrop Beam Test · DEMO",
      retailer: "Local visual test",
      detail: "This signal exists only in your browser. It is not stored, sent to Discord or treated as production intelligence.",
      deliveredPricePence: 4999,
      occurredAt: Math.floor(Date.now() / 1000),
    };
    setSignals((current) => [demo, ...current.filter((signal) => !signal.id.startsWith("local-demo-"))]);
    setFreshIds(new Set([id]));
    window.setTimeout(() => setFreshIds(new Set<string>()), 2600);
  }

  return <section className="fd-alerts-feed">
    <div className="fd-alerts-feedhead"><div><span>LIVE SIGNAL CARDS</span><small>{source ? `Source: ${source} · checks every 10s` : "Awaiting FateDrop Cloud"}</small></div><div className="fd-alert-feed-actions"><button type="button" onClick={testBeam}>TEST BEAM</button><b>{signals.length} SIGNAL{signals.length === 1 ? "" : "S"}</b></div></div>
    {signals.length ? <div className="fd-signal-grid">{signals.map((signal) => {
      const meta = stateMeta[signal.state];
      const demo = signal.id.startsWith("local-demo-");
      return <article className={`fd-signal-card state-${signal.state} ${unlocked || demo ? "" : "locked"} ${demo ? "demo" : ""}`} key={signal.id}>
        <div className="fd-signal-card-top"><span><i>{meta.glyph}</i>{meta.label}{demo ? <em>LOCAL DEMO</em> : null}</span><time>{relativeTime(signal.occurredAt, now)}</time></div>
        <div className={unlocked || demo ? "" : "fd-alert-blur"}><h2>{signal.title}</h2><p>{demo ? signal.retailer : unlocked ? (signal.retailer || "Retailer pending") : "Retailer hidden"}</p></div>
        <SignalBeam pulseKey={signal.id} state={signal.state} autoPulse={freshIds.has(signal.id)}/>
        <div className={`fd-signal-detail ${unlocked || demo ? "" : "fd-alert-blur"}`}>{demo ? signal.detail : unlocked ? (signal.detail || "FateDrop lifecycle event detected.") : "Unlock Premium to reveal product, retailer and actionable signal context."}</div>
        <footer><span><small>TRUE PRICE</small><b>{demo ? money(signal.deliveredPricePence) : unlocked ? money(signal.deliveredPricePence) : "£—.——"}</b></span><span><small>DETECTED</small><b>{relativeTime(signal.occurredAt, now)}</b></span><span><small>STATE</small><b>{meta.label}</b></span></footer>
        {!unlocked && !demo ? <div className="fd-alert-lock">♛</div> : null}
      </article>;
    })}</div> : <div className="fd-alerts-empty"><span>◇</span><h2>The network is quiet.</h2><p>When FateDrop Cloud publishes a lifecycle event, its signal card will materialise here automatically.</p><button type="button" onClick={testBeam}>Test the beam locally</button></div>}
    <style jsx>{`.fd-alert-feed-actions{display:flex;align-items:center;gap:10px}.fd-alert-feed-actions button,.fd-alerts-empty button{min-height:32px;padding:0 10px;border:1px solid rgba(88,232,255,.18);border-radius:9px;background:linear-gradient(135deg,rgba(88,232,255,.07),rgba(157,109,255,.08));color:#b9f3ff;font-size:7px;font-weight:900;letter-spacing:.11em;cursor:pointer}.fd-signal-card.demo{box-shadow:inset 0 0 0 1px rgba(88,232,255,.14)}.fd-signal-card-top em{margin-left:4px;padding:3px 5px;border:1px solid rgba(88,232,255,.18);border-radius:999px;color:#75eaff;font-size:5px;font-style:normal;letter-spacing:.1em}`}</style>
  </section>;
}
