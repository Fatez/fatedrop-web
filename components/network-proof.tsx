"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site-data";

type PublicNetworkStatus = {
  available: boolean;
  measuredAt: number | null;
  source: string | null;
  metrics: {
    productsTracked: number | null;
    inStock: number | null;
    catalogueRetailers: number | null;
    healthyMonitors: number | null;
  } | null;
};

const EMPTY_STATUS: PublicNetworkStatus = { available: false, measuredAt: null, source: null, metrics: null };

function formatMetric(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : new Intl.NumberFormat("en-GB").format(value);
}

function measuredLabel(timestamp: number | null) {
  if (!timestamp) return "Awaiting live network snapshot";
  return `Measured ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp * 1000))}`;
}

export function NetworkProof({ foundingInvite = true }: { foundingInvite?: boolean }) {
  const [status, setStatus] = useState<PublicNetworkStatus>(EMPTY_STATUS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/network-status", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (cancelled || !payload || typeof payload !== "object") return;
        setStatus(payload as PublicNetworkStatus);
      })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const metrics = useMemo(() => [
    { value: formatMetric(status.metrics?.productsTracked), label: "products tracked" },
    { value: formatMetric(status.metrics?.inStock), label: "currently available" },
    { value: formatMetric(status.metrics?.catalogueRetailers), label: "catalogue retailers" },
    { value: formatMetric(status.metrics?.healthyMonitors), label: "healthy monitors" },
  ], [status]);

  return (
    <section className="network-proof section-shell" aria-labelledby="network-proof-title">
      <div className="network-proof-copy">
        <p className="eyebrow"><span />Network proof</p>
        <h2 id="network-proof-title">Measured progress. No borrowed credibility.</h2>
        <p>These figures come from the latest persisted FateDrop Cloud network snapshot. They are not customer, revenue, conversion or sales numbers.</p>
        <div className="status-legend" aria-label="Evidence status">
          <span className={`status-chip ${status.available ? "validated" : "expansion"}`}>{loaded ? measuredLabel(status.measuredAt) : "Loading measured network state"}</span>
          <span className="status-chip expansion">Catalogue totals change as sources update</span>
        </div>
        {status.available && status.source ? <small>Source: {status.source}</small> : null}
      </div>
      <div className="network-proof-grid">
        {metrics.map((item) => <article key={item.label}><strong>{item.value}</strong><span>{item.label}</span><small>{status.available ? "Latest measured snapshot" : "No measured value available"}</small></article>)}
      </div>
      <div className="network-targets"><div><span>TARGET SCALE</span><p>Ambition—not current achievement.</p></div>{siteConfig.networkTargets.map((item) => <span key={item.label}><strong>{item.value}</strong>{item.label}<small>Target scale</small></span>)}</div>
      {foundingInvite ? <div className="founding-proof-invite"><div><span>FOUNDING RETAILER INVITATION</span><strong>Help turn catalogue evidence into genuine FateDrop case studies.</strong><p>No invented logos, testimonials or results. Founding partners will be shown only with permission and verifiable evidence.</p></div><Link className="button button-secondary" href="/join?type=business">Request a Partner Demo <b>↗</b></Link></div> : null}
    </section>
  );
}
