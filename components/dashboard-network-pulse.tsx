"use client";

import { useEffect, useMemo, useState } from "react";

type DashboardNetworkPulseProps = {
  retailers: number | null | undefined;
  products: number | null | undefined;
  signals: number | null | undefined;
};

type PulseResponse = {
  success: true;
  measuredAt: number | null;
  retailers: number | null;
  products: number | null;
  inStock: number | null;
  healthyMonitors: number | null;
  signals7d: number | null;
};

type PulseState = {
  retailers: number | null;
  products: number | null;
  signals: number | null;
  measuredAt: number | null;
  refreshedAt: number | null;
  healthyMonitors: number | null;
  inStock: number | null;
};

function normalise(value: number | null | undefined) {
  return value === null || value === undefined || !Number.isFinite(value) ? null : value;
}

function metric(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : new Intl.NumberFormat("en-GB").format(value);
}

function updatedLabel(timestamp: number | null) {
  if (!timestamp) return "Awaiting live feed";
  const seconds = Math.max(0, Math.floor(Date.now() / 1000) - timestamp);
  if (seconds < 15) return "Updated just now";
  if (seconds < 60) return `Updated ${seconds}s ago`;
  if (seconds < 3600) return `Updated ${Math.floor(seconds / 60)}m ago`;
  return `Updated ${Math.floor(seconds / 3600)}h ago`;
}

export function DashboardNetworkPulse({ retailers, products, signals }: DashboardNetworkPulseProps) {
  const [pulse, setPulse] = useState<PulseState>({
    retailers: normalise(retailers),
    products: normalise(products),
    signals: normalise(signals),
    measuredAt: null,
    refreshedAt: null,
    healthyMonitors: null,
    inStock: null,
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const response = await fetch("/api/dashboard/network-pulse", {
          credentials: "same-origin",
          cache: "no-store",
          headers: { accept: "application/json" },
        });
        if (!response.ok) throw new Error("network-pulse-unavailable");
        const data = await response.json() as PulseResponse;
        if (cancelled || !data.success) return;
        setPulse({
          retailers: normalise(data.retailers),
          products: normalise(data.products),
          signals: normalise(data.signals7d),
          measuredAt: normalise(data.measuredAt),
          refreshedAt: Math.floor(Date.now() / 1000),
          healthyMonitors: normalise(data.healthyMonitors),
          inStock: normalise(data.inStock),
        });
        setConnected(true);
      } catch {
        if (!cancelled) setConnected(false);
      }
    }

    void refresh();
    const interval = window.setInterval(() => void refresh(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const freshness = useMemo(() => updatedLabel(pulse.measuredAt ?? pulse.refreshedAt), [pulse.measuredAt, pulse.refreshedAt]);

  return (
    <div className="fd-pulse-layout">
      <div className="fd-pulse-art" role="img" aria-label="Illustrated United Kingdom retailer signal network">
        <div className="fd-pulse-art-shade" />
        <div className="fd-pulse-live-badge"><i className={connected ? "live" : "waiting"} />{connected ? "LIVE NETWORK" : "RECONNECTING"}</div>
      </div>

      <div className="fd-pulse-metrics" aria-live="polite">
        <span><b>{metric(pulse.retailers)}</b><small>Retailers<br/>tracked</small></span>
        <span><b>{metric(pulse.products)}</b><small>Products<br/>tracked</small></span>
        <span><b>{metric(pulse.signals)}</b><small>Signals<br/>7D</small></span>
      </div>

      <div className="fd-pulse-status">
        <span>{freshness}</span>
        {pulse.healthyMonitors !== null ? <span>{metric(pulse.healthyMonitors)} healthy monitor{pulse.healthyMonitors === 1 ? "" : "s"}</span> : null}
        {pulse.inStock !== null ? <span>{metric(pulse.inStock)} offers currently available</span> : null}
      </div>

      <div className="fd-pulse-explain">
        <strong>The live heartbeat of FateDrop.</strong>
        <span>The UK map is an illustrative view of the connected retailer network. The figures are not artwork: while this dashboard is open, FateDrop refreshes them from the canonical network feed every 30 seconds.</span>
      </div>

      <style>{`
        .fd-pulse-layout{min-height:300px;display:grid;grid-template-columns:minmax(0,1fr) 142px;align-items:center;gap:12px;position:relative;padding:10px 12px 72px}.fd-pulse-art{position:relative;min-height:220px;border:1px solid rgba(211,171,113,.12);border-radius:10px;overflow:hidden;background:#07101c url('/assets/network-pulse-uk.webp') center/cover no-repeat;box-shadow:inset 0 0 45px rgba(0,0,0,.28)}.fd-pulse-art-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,10,17,.06),rgba(5,10,17,0) 55%,rgba(5,10,17,.22)),linear-gradient(0deg,rgba(5,10,17,.24),transparent 38%)}.fd-pulse-live-badge{position:absolute;top:12px;left:12px;display:flex;align-items:center;gap:7px;padding:6px 9px;border:1px solid rgba(221,203,188,.12);border-radius:999px;background:rgba(5,10,17,.78);backdrop-filter:blur(8px);color:#d8cbc0;font-size:9px;font-weight:900;letter-spacing:.11em}.fd-pulse-live-badge i{width:7px;height:7px;border-radius:50%;background:#82777d;box-shadow:0 0 0 4px rgba(130,119,125,.08)}.fd-pulse-live-badge i.live{background:#73d7ad;box-shadow:0 0 0 4px rgba(115,215,173,.09),0 0 14px rgba(115,215,173,.45)}.fd-pulse-metrics{display:grid;gap:22px}.fd-pulse-metrics span{display:grid;gap:4px}.fd-pulse-metrics b{color:#f1e8e1;font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:500;letter-spacing:-.04em}.fd-pulse-metrics small{color:#a0989c;font-size:11px;line-height:1.45;letter-spacing:.02em}.fd-pulse-status{position:absolute;left:12px;right:12px;bottom:48px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;color:#8f878c;font-size:9px;font-weight:750;letter-spacing:.03em}.fd-pulse-status span+span:before{content:'·';margin-right:12px;color:#5f575c}.fd-pulse-explain{position:absolute;left:12px;right:12px;bottom:4px;padding-top:10px;border-top:1px solid rgba(221,203,188,.06);display:grid;gap:3px}.fd-pulse-explain strong{color:#d0c6c0;font-size:11px}.fd-pulse-explain span{color:#938b90;font-size:10px;line-height:1.5}@media(max-width:720px){.fd-pulse-layout{grid-template-columns:1fr;padding-bottom:104px}.fd-pulse-art{min-height:190px}.fd-pulse-metrics{grid-template-columns:repeat(3,1fr);gap:12px}.fd-pulse-metrics b{font-size:29px}.fd-pulse-status{bottom:72px}.fd-pulse-explain{bottom:4px}}
      `}</style>
    </div>
  );
}
