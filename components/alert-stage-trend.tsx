"use client";

import { useMemo, useState } from "react";
import type { CanonicalTrendPoint } from "@/lib/canonical-alert-trends";

type AlertStageTrendProps = {
  stage: "WHISPER" | "ECHO" | "MANIFESTED" | "VANISHED";
  companion: "ORU" | "FENN" | "KORU" | "NIXON";
  description: string;
  total: number;
  points: CanonicalTrendPoint[];
  artPath?: string | null;
};

function sparkline(points: CanonicalTrendPoint[], width = 260, height = 72) {
  const left = 5;
  const right = width - 5;
  const top = 8;
  const bottom = height - 10;
  const max = Math.max(1, ...points.map((point) => point.count));
  return points.map((point, index) => {
    const x = points.length <= 1 ? width / 2 : left + (index / (points.length - 1)) * (right - left);
    const y = bottom - (point.count / max) * (bottom - top);
    return { x, y, count: point.count };
  });
}

export function AlertStageTrend({
  stage,
  companion,
  description,
  total,
  points,
  artPath,
}: AlertStageTrendProps) {
  const [artFailed, setArtFailed] = useState(false);
  const plotted = useMemo(() => sparkline(points), [points]);
  const polyline = plotted.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const last = plotted.at(-1);
  const firstLabel = points[0]?.label ?? "";
  const lastLabel = points.at(-1)?.label ?? "";

  return <article className={`fd-stage-trend ${stage.toLowerCase()}`}>
    <div className="fd-stage-trend-head">
      <div className="fd-stage-companion">
        <div className="fd-stage-companion-art">
          {artPath && !artFailed ? <img src={artPath} alt={`${companion} alert companion`} onError={() => setArtFailed(true)} /> : null}
          {!artPath || artFailed ? <span>{companion.slice(0, 1)}</span> : null}
        </div>
        <div><small>{companion}</small><strong>{stage}</strong></div>
      </div>
      <div className="fd-stage-trend-total"><b>{total.toLocaleString()}</b><small>7 DAY SIGNALS</small></div>
    </div>

    <p>{description}</p>

    <div className="fd-stage-chart" aria-label={`${companion} ${stage} canonical signal activity over 7 days`}>
      <svg viewBox="0 0 260 72" role="img">
        <line x1="5" y1="18" x2="255" y2="18" className="grid"/>
        <line x1="5" y1="40" x2="255" y2="40" className="grid"/>
        <line x1="5" y1="62" x2="255" y2="62" className="grid"/>
        <polyline points={polyline} className="line"/>
        {last ? <circle cx={last.x} cy={last.y} r="3.2" className="point"/> : null}
      </svg>
      <div className="fd-stage-chart-axis"><span>{firstLabel}</span><span>CANONICAL SIGNAL ACTIVITY</span><span>{lastLabel}</span></div>
    </div>
  </article>;
}
