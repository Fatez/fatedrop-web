"use client";

import { useState } from "react";
import { TcgSelectionPanel } from "@/components/tcg-selection-panel";
import {
  normalizeSelectedTcgCodes,
  normalizeTcgAlertPreferences,
  TCG_REGISTRY,
  type TcgAlertPreferences,
  type TcgCode,
  type TcgLifecyclePreference,
} from "@/lib/tcg-registry";

const lifecycle = [
  { key: "whisper", label: "Whisper", copy: "Early intelligence. Not stock truth." },
  { key: "echo", label: "Echo", copy: "Preparation or behaviour evidence. Get ready." },
  { key: "manifested", label: "Manifested", copy: "First canonical availability. This is the go alert." },
  { key: "vanished", label: "Vanished", copy: "Prior canonical availability is no longer verified." },
] as const;

const recommended: TcgLifecyclePreference = { mode: "recommended", whisper: true, echo: true, manifested: true, vanished: true };

export function AccountTcgPreferences({ initial, initialAlerts }: { initial: readonly string[]; initialAlerts?: unknown }) {
  const initialCodes = normalizeSelectedTcgCodes(initial);
  const [selected, setSelected] = useState<TcgCode[]>(initialCodes);
  const [alerts, setAlerts] = useState<TcgAlertPreferences>(normalizeTcgAlertPreferences(initialAlerts, initialCodes));
  const [active, setActive] = useState<TcgCode>(initialCodes[0]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const current = alerts[active] ?? recommended;

  function selectTcgs(next: TcgCode[]) {
    setSelected(next);
    setAlerts((value) => ({ ...normalizeTcgAlertPreferences(value, next), ...value }));
    if (!next.includes(active)) setActive(next[0]);
  }

  function useRecommended() {
    setAlerts((value) => ({ ...value, [active]: recommended }));
  }

  function toggle(key: typeof lifecycle[number]["key"]) {
    setAlerts((value) => ({ ...value, [active]: { ...current, mode: "custom", [key]: !current[key] } }));
  }

  async function save() {
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/tcg-preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ selectedTcgCodes: selected, alertPreferences: alerts }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Preferences could not be saved.");
      setStatus("Saved across Web and App.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Preferences could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="account-tcg-preferences">
    <TcgSelectionPanel selected={selected} onChange={selectTcgs}/>
    <section className="tcg-alert-choices">
      <div className="tcg-alert-tabs">{selected.map((code) => {
        const entry = TCG_REGISTRY.find((item) => item.code === code)!;
        return <button type="button" key={code} className={active === code ? "active" : ""} style={{ borderColor: active === code ? entry.accent : undefined }} onClick={() => setActive(code)}>{entry.shortName}</button>;
      })}</div>
      <button type="button" className={current.mode === "recommended" ? "tcg-recommended active" : "tcg-recommended"} onClick={useRecommended}><span><small>RECOMMENDED</small><strong>All useful alerts</strong></span><b>{current.mode === "recommended" ? "✓" : "○"}</b></button>
      <div className="tcg-lifecycle-grid">{lifecycle.map((item) => <button type="button" key={item.key} className={current[item.key] ? `active ${item.key}` : item.key} onClick={() => toggle(item.key)}><span>{current[item.key] ? "✓" : "○"}</span><strong>{item.label}</strong><small>{item.copy}</small></button>)}</div>
      <p>These are delivery preferences per selected game. They do not create stock, activate a coming-soon engine, or change lifecycle meanings.</p>
    </section>
    <div className="button-row"><button type="button" className="button button-primary" disabled={busy} onClick={() => void save()}>{busy ? "Saving…" : "Save my TCGs & alerts"}</button>{status ? <span role="status" style={{ color: "#bdb2aa", fontSize: 11 }}>{status}</span> : null}</div>
    <style>{`.tcg-alert-choices{margin-top:10px;padding:14px;border:1px solid rgba(210,182,111,.14);border-radius:15px;background:rgba(4,7,10,.35)}.tcg-alert-tabs{display:flex;gap:7px;overflow:auto;padding-bottom:10px}.tcg-alert-tabs button{white-space:nowrap;padding:8px 11px;border:1px solid rgba(255,255,255,.08);border-radius:999px;background:#0b1015;color:#aaa2a0;font-size:9px;font-weight:900}.tcg-alert-tabs button.active{color:#eee4dc;background:rgba(210,182,111,.07)}.tcg-recommended{width:100%;display:flex;justify-content:space-between;align-items:center;padding:13px;border:1px solid rgba(210,182,111,.13);border-radius:12px;background:#0b1015;color:#eee4dc;text-align:left}.tcg-recommended.active{border-color:#d2b66f;background:rgba(210,182,111,.08)}.tcg-recommended span>*{display:block}.tcg-recommended small{color:#d2b66f;font-size:7px;letter-spacing:.08em}.tcg-recommended strong{margin-top:3px;font-size:12px}.tcg-lifecycle-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:8px}.tcg-lifecycle-grid button{display:grid;grid-template-columns:22px 1fr;gap:2px 7px;padding:11px;border:1px solid rgba(255,255,255,.07);border-radius:11px;background:#0b1015;color:#8e8787;text-align:left}.tcg-lifecycle-grid button>span{grid-row:1/3}.tcg-lifecycle-grid button>strong{font-size:10px;text-transform:uppercase}.tcg-lifecycle-grid button>small{font-size:8px;line-height:1.35}.tcg-lifecycle-grid button.active{color:#ded4cc}.tcg-lifecycle-grid button.whisper.active{border-color:rgba(210,182,111,.38)}.tcg-lifecycle-grid button.echo.active{border-color:rgba(217,205,187,.38)}.tcg-lifecycle-grid button.manifested.active{border-color:rgba(124,110,255,.4)}.tcg-lifecycle-grid button.vanished.active{border-color:rgba(239,77,90,.4)}.tcg-alert-choices>p{margin:10px 0 0;color:#948c8e;font-size:9px;line-height:1.5}@media(max-width:600px){.tcg-lifecycle-grid{grid-template-columns:1fr}}`}</style>
  </div>;
}
