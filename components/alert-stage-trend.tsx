"use client";

import { useEffect, useMemo, useState } from "react";
import type { CanonicalTrendPoint } from "@/lib/canonical-alert-trends";

type AlertStageTrendProps = {
  stage: "WHISPER" | "ECHO" | "MANIFESTED" | "VANISHED";
  companion: "ORU" | "FENN" | "KORU" | "NYXEN";
  description: string;
  total: number;
  points: CanonicalTrendPoint[];
};

type StageKey = "whisper" | "echo" | "manifested" | "vanished";
type MarketGroup = "english" | "japanese" | "korean" | "simplified_chinese" | "traditional_chinese";
type MarketSelection = "all" | MarketGroup[];

type PreferencePayload = {
  preferences?: {
    lifecycleMarkets?: Partial<Record<StageKey, MarketSelection>>;
  };
};

const marketOptions: ReadonlyArray<{ key: "all" | MarketGroup; label: string }> = [
  { key: "all", label: "ALL" },
  { key: "english", label: "ENG" },
  { key: "japanese", label: "JP" },
  { key: "korean", label: "KR" },
  { key: "simplified_chinese", label: "CN" },
  { key: "traditional_chinese", label: "TW/HK" },
];

let preferenceRequest: Promise<PreferencePayload> | null = null;

function stageKey(stage: AlertStageTrendProps["stage"]): StageKey {
  return stage.toLowerCase() as StageKey;
}

function validSelection(value: unknown): MarketSelection {
  if (value === "all") return "all";
  if (!Array.isArray(value)) return "all";
  const allowed = new Set<MarketGroup>(["english", "japanese", "korean", "simplified_chinese", "traditional_chinese"]);
  const groups = [...new Set(value.filter((item): item is MarketGroup => typeof item === "string" && allowed.has(item as MarketGroup)))];
  return groups.length ? groups : "all";
}

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
}: AlertStageTrendProps) {
  const plotted = useMemo(() => sparkline(points), [points]);
  const polyline = plotted.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const last = plotted.at(-1);
  const firstLabel = points[0]?.label ?? "";
  const lastLabel = points.at(-1)?.label ?? "";
  const key = stageKey(stage);
  const [selection, setSelection] = useState<MarketSelection>("all");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let active = true;
    preferenceRequest ||= fetch("/api/notification-preferences", { cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as PreferencePayload : {})
      .catch(() => ({}));
    void preferenceRequest.then((payload) => {
      if (!active) return;
      setSelection(validSelection(payload.preferences?.lifecycleMarkets?.[key]));
    });
    return () => { active = false; };
  }, [key]);

  async function updateMarket(option: "all" | MarketGroup) {
    if (saving) return;
    const previous = selection;
    let next: MarketSelection;
    if (option === "all") {
      next = "all";
    } else {
      const current = selection === "all" ? [] : selection;
      const enabled = current.includes(option);
      const groups = enabled ? current.filter((item) => item !== option) : [...current, option];
      next = groups.length ? groups : "all";
    }
    setSelection(next);
    setSaving(true);
    setSaveError(false);
    try {
      const response = await fetch("/api/notification-preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lifecycleMarkets: { [key]: next } }),
      });
      if (!response.ok) throw new Error("Preference update failed");
      preferenceRequest = null;
    } catch {
      setSelection(previous);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return <article className={`fd-stage-trend ${stage.toLowerCase()}`}>
    <div className="fd-stage-trend-head">
      <div className="fd-stage-companion">
        <div><small>{companion}</small><strong>{stage}</strong></div>
      </div>
      <div className="fd-stage-trend-total"><b>{total.toLocaleString()}</b><small>7 DAY SIGNALS</small></div>
    </div>

    <p>{description}</p>

    <div className="fd-stage-market" aria-label={`${stage} collector market preferences`}>
      <div className="fd-stage-market-head"><span>MARKETS</span><small>{saveError ? "SAVE FAILED" : saving ? "SAVING…" : "SYNCED"}</small></div>
      <div className="fd-stage-market-options">
        {marketOptions.map((option) => {
          const active = option.key === "all" ? selection === "all" : selection !== "all" && selection.includes(option.key);
          return <button type="button" key={option.key} aria-pressed={active} disabled={saving} onClick={() => void updateMarket(option.key)} className={active ? "active" : ""}>{option.label}</button>;
        })}
      </div>
    </div>

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

    <style jsx>{`
      .fd-stage-market{margin:8px 0 9px;padding-top:8px;border-top:1px solid rgba(255,255,255,.055)}
      .fd-stage-market-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px}
      .fd-stage-market-head span{color:currentColor;font-size:6px;font-weight:900;letter-spacing:.1em}
      .fd-stage-market-head small{color:#625c5e;font-size:5px;font-weight:800;letter-spacing:.06em}
      .fd-stage-market-options{display:flex;flex-wrap:wrap;gap:4px}
      .fd-stage-market-options button{min-width:34px;height:24px;padding:0 7px;border:1px solid rgba(255,255,255,.07);border-radius:7px;background:#0a0d11;color:#716a6b;font-size:6px;font-weight:900;letter-spacing:.04em;cursor:pointer}
      .fd-stage-market-options button.active{border-color:currentColor;background:color-mix(in srgb,currentColor 12%,#0a0d11);color:currentColor}
      .fd-stage-market-options button:disabled{cursor:wait;opacity:.7}
    `}</style>
  </article>;
}
