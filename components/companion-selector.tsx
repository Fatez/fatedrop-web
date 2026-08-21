"use client";

import { useState } from "react";
import { CompanionRenderer } from "@/components/companion-renderer";
import { ACTIVE_COMPANION_ROSTER, type CompanionId } from "@/lib/companion-contract";

export function CompanionSelector({ initialCompanionId, persistent }: { initialCompanionId: CompanionId; persistent: boolean }) {
  const [selected, setSelected] = useState<CompanionId>(initialCompanionId);
  const [busy, setBusy] = useState<CompanionId | null>(null);
  const [message, setMessage] = useState(persistent ? "Your companion choice is synced to your FateDrop ID." : "Preview mode is ready. Saving needs account storage.");

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
      <div><p className="eyebrow">YOUR KORU &amp; FRIENDS COMPANION</p><h2 id="companion-selector-title">Five characters. One clean companion system.</h2><p>Koru remains FateDrop&apos;s mascot and network voice. Your selection chooses which Koru &amp; Friends character accompanies your account as the richer 3D models arrive.</p></div>
      <span>5 ACTIVE SLOTS</span>
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
      .companion-selector{padding:30px;border:1px solid rgba(205,187,207,.11);border-radius:26px;background:linear-gradient(145deg,#0e1016,#090b10)}.selector-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.selector-head>div{max-width:780px}.selector-head .eyebrow{margin:0 0 8px;color:#a989b5;font-size:7px;font-weight:900;letter-spacing:.16em}.selector-head h2{margin:0;color:#eee5df;font-family:Georgia,serif;font-size:clamp(2rem,3.5vw,3.8rem);font-weight:500;line-height:.96;letter-spacing:-.05em}.selector-head p:not(.eyebrow){max-width:680px;margin:15px 0 0;color:#8e888f;font-size:11px;line-height:1.65}.selector-head>span{padding:8px 10px;border:1px solid rgba(181,144,191,.15);border-radius:999px;color:#806a87;font-size:6px;font-weight:900;letter-spacing:.14em;white-space:nowrap}.companion-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:28px}.companion-grid>button{min-width:0;padding:7px;border:1px solid rgba(255,255,255,.065);border-radius:20px;background:rgba(255,255,255,.012);color:inherit;text-align:left;transition:border-color .2s ease,transform .2s ease,background .2s ease}.companion-grid>button:hover:not(:disabled){transform:translateY(-2px);border-color:rgba(177,139,188,.22)}.companion-grid>button[data-active="true"]{border-color:rgba(194,153,204,.38);background:rgba(126,91,139,.07);box-shadow:0 0 0 1px rgba(194,153,204,.06) inset}.card-copy{display:grid;gap:4px;padding:12px 8px 9px}.card-copy span,.card-copy small{color:#746d77;font-size:6px;font-weight:900;letter-spacing:.11em}.card-copy strong{color:#e7ded9;font-family:Georgia,serif;font-size:20px;font-weight:500}.card-copy b{margin-top:7px;color:#a989b5;font-size:7px;letter-spacing:.1em}.selector-status{margin:14px 2px 0;color:#77717b;font-size:8px}@media(max-width:1100px){.companion-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:700px){.companion-selector{padding:20px;border-radius:20px}.selector-head{display:grid}.companion-grid{grid-template-columns:1fr 1fr}}@media(max-width:460px){.companion-grid{grid-template-columns:1fr}}
    `}</style>
  </section>;
}
