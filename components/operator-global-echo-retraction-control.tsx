"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OperatorGlobalEchoRetractionControl({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function retract() {
    const cleanReason = reason.trim();
    if (cleanReason.length < 3) {
      setError("Add a short reason so the audit record explains why this Echo was retracted.");
      return;
    }
    if (!window.confirm("Retract this Global Echo? It will disappear from active Alerts and queued push will be cancelled. The original audit evidence will be retained.")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/operator/global-echo/retraction", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ eventId, reason: cleanReason }),
      });
      const data = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(data?.error || `Retraction failed (${response.status}).`);
      setOpen(false);
      setReason("");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Global Echo could not be retracted.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} style={{border:"1px solid rgba(239,77,90,.34)",background:"rgba(239,77,90,.08)",color:"#ef8a92",borderRadius:8,padding:"9px 11px",fontSize:10,fontWeight:900,cursor:"pointer"}}>RETRACT ECHO</button>;
  }

  return <div style={{display:"grid",gap:8,minWidth:260}}>
    <label style={{display:"grid",gap:5,color:"#a69b96",fontSize:9,fontWeight:800}}>RETRACTION REASON
      <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={300} placeholder="e.g. Incorrect link / message sent in error" style={{minHeight:72,resize:"vertical",border:"1px solid rgba(221,203,188,.12)",background:"#090d11",color:"#ddd2ca",borderRadius:8,padding:9}} />
    </label>
    {error ? <small style={{color:"#ef8a92"}}>{error}</small> : null}
    <div style={{display:"flex",gap:7}}>
      <button type="button" disabled={busy} onClick={() => void retract()} style={{border:0,background:"#8d3941",color:"#fff",borderRadius:8,padding:"9px 11px",fontSize:9,fontWeight:900,cursor:"pointer"}}>{busy ? "RETRACTING…" : "CONFIRM RETRACTION"}</button>
      <button type="button" disabled={busy} onClick={() => { setOpen(false); setError(""); }} style={{border:"1px solid rgba(221,203,188,.12)",background:"transparent",color:"#9b918c",borderRadius:8,padding:"9px 11px",fontSize:9,fontWeight:800,cursor:"pointer"}}>CANCEL</button>
    </div>
  </div>;
}
