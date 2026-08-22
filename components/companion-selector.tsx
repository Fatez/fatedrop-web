"use client";

import { useState } from "react";
import { CompanionRenderer } from "@/components/companion-renderer";
import { ACTIVE_COMPANION_ROSTER, type CompanionId, type CompanionReaction } from "@/lib/companion-contract";

const REACTION_PREVIEWS: { id: CompanionReaction; label: string; helper: string }[] = [
  { id: "idle", label: "Idle", helper: "Default companion presence" },
  { id: "watching", label: "Whisper", helper: "Early product or catalogue movement" },
  { id: "echo", label: "Echo", helper: "Queue, traffic or access readiness" },
  { id: "manifested", label: "Manifested", helper: "Confirmed live stock" },
  { id: "vanished", label: "Vanished", helper: "Confirmed availability is gone" },
  { id: "fatematch", label: "FateMatch", helper: "A saved hunt found a qualifying offer" },
];

export function CompanionSelector({ initialCompanionId, persistent }: { initialCompanionId: CompanionId; persistent: boolean }) {
  const [selected, setSelected] = useState<CompanionId>(initialCompanionId);
  const [reaction, setReaction] = useState<CompanionReaction>("idle");
  const [busy, setBusy] = useState<CompanionId | null>(null);
  const [message, setMessage] = useState(persistent ? "Your companion choice is synced to your FateDrop ID." : "Preview mode is ready. Saving needs account storage.");
  const selectedCompanion = ACTIVE_COMPANION_ROSTER.find((item) => item.id === selected) ?? ACTIVE_COMPANION_ROSTER[0];

  async function choose(companionId: CompanionId) {
    if (busy || companionId === selected) return;
    const previous = selected;
    setSelected(companionId);
    setBusy(companionId);
    setMessage("Saving companion…");
    try {
      const response = await fetch("/api/account/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companionId }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setSelected(previous);
        setMessage(payload.error || "Companion choice could not be saved.");
        return;
      }
      const name = ACTIVE_COMPANION_ROSTER.find((item) => item.id === companionId)?.name ?? companionId;
      setMessage(`${name} is now your FateDrop companion.`);
    } catch {
      setSelected(previous);
      setMessage("FateDrop could not reach the companion service.");
    } finally {
      setBusy(null);
    }
  }

  return <section className="companion-selector" aria-labelledby="companion-selector-title">
    <div className="selector-head">
      <div><p className="eyebrow">YOUR KORU &amp; FRIENDS COMPANION</p><h2 id="companion-selector-title">Five characters. One clean companion system.</h2><p>Koru remains FateDrop&apos;s mascot and network voice. Registered character packs render as live 3D previews; any unavailable model falls back honestly without blocking your account.</p></div>
      <span>5 ACTIVE SLOTS</span>
    </div>

    <div className="live-preview">
      <div className="live-stage">
        <CompanionRenderer request={{ companionId: selectedCompanion.id, reaction, label: selectedCompanion.name }}/>
      </div>
      <aside className="preview-controls" aria-label={`${selectedCompanion.name} reaction preview controls`}>
        <small>LIVE REACTION PREVIEW</small>
        <h3>{selectedCompanion.name}</h3>
        <p>Preview the companion personality without changing what the underlying FateDrop signal means.</p>
        <div className="reaction-list">
          {REACTION_PREVIEWS.map((item) => <button type="button" key={item.id} data-active={reaction === item.id} onClick={() => setReaction(item.id)}>
            <span>{item.label}</span><small>{item.helper}</small>
          </button>)}
        </div>
      </aside>
    </div>

    <div className="companion-grid">
      {ACTIVE_COMPANION_ROSTER.map((companion) => {
        const active = selected === companion.id;
        return <button type="button" key={companion.id} data-active={active} disabled={Boolean(busy)} onClick={() => choose(companion.id)} aria-pressed={active}>
          <CompanionRenderer request={{ companionId: companion.id, reaction: "watching", compact: true, label: companion.name }}/>
          <div className="card-copy"><span>SLOT {String(companion.slot).padStart(2, "0")}</span><strong>{companion.name}</strong><small>{companion.isMascot ? "FATEDROP MASCOT · SIGNAL VOICE" : "KORU & FRIENDS COMPANION"}</small><b>{active ? "SELECTED" : busy === companion.id ? "SAVING…" : "SELECT →"}</b></div>
        </button>;
      })}
    </div>
    <p className="selector-status" role="status">{message}</p>
    <style jsx>{`
      .companion-selector{padding:30px;border:1px solid rgba(205,187,207,.11);border-radius:26px;background:linear-gradient(145deg,#0e1016,#090b10)}.selector-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.selector-head>div{max-width:780px}.selector-head .eyebrow{margin:0 0 8px;color:#a989b5;font-size:7px;font-weight:900;letter-spacing:.16em}.selector-head h2{margin:0;color:#eee5df;font-family:Georgia,serif;font-size:clamp(2rem,3.5vw,3.8rem);font-weight:500;line-height:.96;letter-spacing:-.05em}.selector-head p:not(.eyebrow){max-width:680px;margin:15px 0 0;color:#8e888f;font-size:11px;line-height:1.65}.selector-head>span{padding:8px 10px;border:1px solid rgba(181,144,191,.15);border-radius:999px;color:#806a87;font-size:6px;font-weight:900;letter-spacing:.14em;white-space:nowrap}.live-preview{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);gap:14px;margin-top:28px;padding:10px;border:1px solid rgba(255,255,255,.065);border-radius:22px;background:rgba(255,255,255,.012)}.live-stage{min-width:0}.preview-controls{padding:22px 18px;align-self:center}.preview-controls>small{color:#a989b5;font-size:6px;font-weight:900;letter-spacing:.15em}.preview-controls h3{margin:8px 0 7px;color:#e8dfda;font-family:Georgia,serif;font-size:30px;font-weight:500}.preview-controls>p{margin:0;color:#817a84;font-size:9px;line-height:1.6}.reaction-list{display:grid;gap:6px;margin-top:18px}.reaction-list button{display:grid;gap:3px;padding:10px 11px;border:1px solid rgba(255,255,255,.06);border-radius:11px;background:rgba(255,255,255,.012);color:inherit;text-align:left;cursor:pointer;transition:border-color .18s ease,background .18s ease}.reaction-list button:hover,.reaction-list button[data-active="true"]{border-color:rgba(190,151,201,.28);background:rgba(126,91,139,.08)}.reaction-list span{color:#cfc5ca;font-size:9px;font-weight:800}.reaction-list small{color:#69636d;font-size:7px;line-height:1.4}.companion-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:18px}.companion-grid>button{min-width:0;padding:7px;border:1px solid rgba(255,255,255,.065);border-radius:20px;background:rgba(255,255,255,.012);color:inherit;text-align:left;transition:border-color .2s ease,transform .2s ease,background .2s ease}.companion-grid>button:hover:not(:disabled){transform:translateY(-2px);border-color:rgba(177,139,188,.22)}.companion-grid>button[data-active="true"]{border-color:rgba(194,153,204,.38);background:rgba(126,91,139,.07);box-shadow:0 0 0 1px rgba(194,153,204,.06) inset}.card-copy{display:grid;gap:4px;padding:12px 8px 9px}.card-copy span,.card-copy small{color:#746d77;font-size:6px;font-weight:900;letter-spacing:.11em}.card-copy strong{color:#e7ded9;font-family:Georgia,serif;font-size:20px;font-weight:500}.card-copy b{margin-top:7px;color:#a989b5;font-size:7px;letter-spacing:.1em}.selector-status{margin:14px 2px 0;color:#77717b;font-size:8px}@media(max-width:1100px){.companion-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:820px){.live-preview{grid-template-columns:1fr}.preview-controls{padding:16px 10px}.reaction-list{grid-template-columns:1fr 1fr}}@media(max-width:700px){.companion-selector{padding:20px;border-radius:20px}.selector-head{display:grid}.companion-grid{grid-template-columns:1fr 1fr}}@media(max-width:460px){.companion-grid,.reaction-list{grid-template-columns:1fr}}
    `}</style>
  </section>;
}
