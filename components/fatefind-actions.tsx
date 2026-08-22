"use client";

import { useState } from "react";

export function FateFindActions({ id, enabled }: { id: string; enabled: boolean }) {
  const [busy, setBusy] = useState<"toggle" | "delete" | null>(null);
  const [message, setMessage] = useState("");

  async function toggle() {
    setBusy("toggle"); setMessage("");
    try {
      const response = await fetch("/api/fate-matches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: !enabled }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string; message?: string };
      if (!response.ok) { setMessage(payload.error || "FateFind could not be updated."); return; }
      setMessage(payload.message || (!enabled ? "FateFind resumed." : "FateFind paused."));
      window.location.reload();
    } finally { setBusy(null); }
  }

  async function remove() {
    if (!window.confirm("Delete this FateFind? Its saved hunt rules will be removed, but historical FateMatch activity remains evidence.")) return;
    setBusy("delete"); setMessage("");
    try {
      const response = await fetch("/api/fate-matches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string; message?: string };
      if (!response.ok) { setMessage(payload.error || "FateFind could not be deleted."); return; }
      setMessage(payload.message || "FateFind deleted.");
      window.location.reload();
    } finally { setBusy(null); }
  }

  return <div className="fd-fatefind-actions">
    <button type="button" onClick={toggle} disabled={busy !== null}>{busy === "toggle" ? "SAVING…" : enabled ? "PAUSE" : "RESUME"}</button>
    <button className="danger" type="button" onClick={remove} disabled={busy !== null}>{busy === "delete" ? "DELETING…" : "DELETE"}</button>
    {message ? <small>{message}</small> : null}
    <style jsx>{`
      .fd-fatefind-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap}.fd-fatefind-actions button{min-height:28px;padding:0 9px;border:1px solid rgba(171,126,195,.16);border-radius:7px;background:rgba(112,72,140,.05);color:#b895c5;font-size:6px;font-weight:900;letter-spacing:.07em}.fd-fatefind-actions button.danger{border-color:rgba(179,83,91,.16);background:rgba(179,83,91,.035);color:#b9797e}.fd-fatefind-actions button:disabled{opacity:.48}.fd-fatefind-actions small{flex-basis:100%;color:#746d6f;font-size:6px;text-align:right}
    `}</style>
  </div>;
}
