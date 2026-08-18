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
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const knownIds = useRef(new Set(initialSignals.map((signal) => signal.id)));

  useEffect(() => {
    const clock = window.setInterval(() => setNow((value) => value + 30), 30_000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    let disposed = false;
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
          window.setTimeout(() => setFreshIds(new Set()), 2600);
        }
      } catch {
        // Keep the last good persisted snapshot visible if a poll fails.
      }
    }
    const timer = window.setInterval(poll, 10_000);
    return () => { disposed = true; window.clearInterval(timer); };
  }, []);

  return <section className="fd-alerts-feed">
    <div className="fd-alerts-feedhead"><div><span>LIVE SIGNAL CARDS</span><small>{source ? `Source: ${source} · checks every 10s` : "Awaiting FateDrop Cloud"}</small></div><b>{signals.length} SIGNAL{signals.length === 1 ? "" : "S"}</b></div>
    {signals.length ? <div className="fd-signal-grid">{signals.map((signal) => {
      const meta = stateMeta[signal.state];
      return <article className={`fd-signal-card state-${signal.state} ${unlocked ? "" : "locked"}`} key={signal.id}>
        <div className="fd-signal-card-top"><span><i>{meta.glyph}</i>{meta.label}</span><time>{relativeTime(signal.occurredAt, now)}</time></div>
        <div className={unlocked ? "" : "fd-alert-blur"}><h2>{signal.title}</h2><p>{unlocked ? (signal.retailer || "Retailer pending") : "Retailer hidden"}</p></div>
        <SignalBeam pulseKey={signal.id} state={signal.state} autoPulse={freshIds.has(signal.id)}/>
        <div className={`fd-signal-detail ${unlocked ? "" : "fd-alert-blur"}`}>{unlocked ? (signal.detail || "FateDrop lifecycle event detected.") : "Unlock Premium to reveal product, retailer and actionable signal context."}</div>
        <footer><span><small>TRUE PRICE</small><b>{unlocked ? money(signal.deliveredPricePence) : "£—.——"}</b></span><span><small>DETECTED</small><b>{relativeTime(signal.occurredAt, now)}</b></span><span><small>STATE</small><b>{meta.label}</b></span></footer>
        {!unlocked ? <div className="fd-alert-lock">♛</div> : null}
      </article>;
    })}</div> : <div className="fd-alerts-empty"><span>◇</span><h2>The network is quiet.</h2><p>When FateDrop Cloud publishes a lifecycle event, its signal card will materialise here automatically.</p></div>}
  </section>;
}
