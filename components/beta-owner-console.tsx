"use client";

import { useMemo, useState } from "react";
import type { BetaRequestRow } from "@/lib/owner-access";

type Props = { initialRequests: BetaRequestRow[] };
type BusyState = { userId: string; action: "approve" | "revoke" } | null;

export function BetaOwnerConsole({ initialRequests }: Props) {
  const [requests, setRequests] = useState(initialRequests);
  const [busy, setBusy] = useState<BusyState>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const totals = useMemo(() => ({
    pending: requests.filter((item) => item.status === "pending").length,
    approved: requests.filter((item) => item.status === "approved").length,
    revoked: requests.filter((item) => item.status === "revoked").length,
  }), [requests]);

  async function change(userId: string, action: "approve" | "revoke") {
    setBusy({ userId, action });
    setNotice(null);
    try {
      const response = await fetch("/api/admin/beta", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const payload = await response.json() as { error?: string; betaAccess?: { userId: string; status: "pending" | "approved" | "revoked"; approvedAt: number | null; approvedBy: string | null; updatedAt: number } };
      if (!response.ok || !payload.betaAccess) throw new Error(payload.error || "Access could not be updated.");
      setRequests((current) => current.map((item) => item.userId === userId ? {
        ...item,
        status: payload.betaAccess!.status,
        approvedAt: payload.betaAccess!.approvedAt,
        approvedBy: payload.betaAccess!.approvedBy,
        updatedAt: payload.betaAccess!.updatedAt,
      } : item));
      setNotice(action === "approve" ? "Beta access approved." : "Beta access revoked.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Access could not be updated.");
    } finally {
      setBusy(null);
    }
  }

  return <div className="fd-owner-console">
    <div className="fd-owner-stats">
      <span><small>PENDING</small><b>{totals.pending}</b></span>
      <span><small>APPROVED</small><b>{totals.approved}</b></span>
      <span><small>REVOKED</small><b>{totals.revoked}</b></span>
    </div>
    {notice ? <p className="fd-owner-notice" role="status">{notice}</p> : null}
    <div className="fd-owner-list">
      {requests.map((item) => {
        const itemBusy = busy?.userId === item.userId;
        return <article key={item.userId} className="fd-owner-row">
          <div className="fd-owner-identity">
            <small>{item.fateId}</small>
            <strong>{item.displayName}</strong>
            <span>{item.email}</span>
            <i>@{item.username}</i>
          </div>
          <div className="fd-owner-meta">
            <span className={`state-${item.status}`}>{item.status.toUpperCase()}</span>
            <small>Requested {formatDate(item.requestedAt)}</small>
            {item.approvedAt ? <small>Approved {formatDate(item.approvedAt)}</small> : null}
          </div>
          <div className="fd-owner-actions">
            <button disabled={itemBusy || item.status === "approved"} onClick={() => change(item.userId, "approve")}>{itemBusy && busy?.action === "approve" ? "Approving…" : "Approve"}</button>
            <button className="danger" disabled={itemBusy || item.status === "revoked"} onClick={() => change(item.userId, "revoke")}>{itemBusy && busy?.action === "revoke" ? "Revoking…" : "Revoke"}</button>
          </div>
        </article>;
      })}
      {!requests.length ? <p className="fd-owner-empty">No beta accounts are currently recorded.</p> : null}
    </div>
    <style jsx>{`
      .fd-owner-console{display:grid;gap:14px}.fd-owner-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.fd-owner-stats span{padding:18px;border:1px solid rgba(221,203,188,.08);border-radius:12px;background:rgba(255,255,255,.018)}.fd-owner-stats small{display:block;color:#82787e;font-size:9px;font-weight:900;letter-spacing:.14em}.fd-owner-stats b{display:block;margin-top:6px;color:#eee4de;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:500}.fd-owner-notice,.fd-owner-empty{margin:0;padding:12px 14px;border:1px solid rgba(210,182,111,.12);border-radius:10px;background:rgba(210,182,111,.03);color:#b8adb1;font-size:12px}.fd-owner-list{display:grid;gap:8px}.fd-owner-row{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(180px,.65fr) auto;gap:18px;align-items:center;padding:18px;border:1px solid rgba(221,203,188,.075);border-radius:12px;background:linear-gradient(145deg,#101419,#0a0d11)}.fd-owner-identity{display:grid;gap:3px;min-width:0}.fd-owner-identity small{color:#9d7f68;font-size:9px;font-weight:900;letter-spacing:.11em}.fd-owner-identity strong{color:#e9dfd8;font-size:15px}.fd-owner-identity span,.fd-owner-identity i{overflow:hidden;text-overflow:ellipsis;color:#948c91;font-size:11px;font-style:normal;white-space:nowrap}.fd-owner-meta{display:grid;gap:5px}.fd-owner-meta span{width:max-content;padding:4px 8px;border-radius:999px;font-size:8px;font-weight:900;letter-spacing:.1em}.state-pending{border:1px solid rgba(210,182,111,.18);color:#d2b66f}.state-approved{border:1px solid rgba(130,166,139,.2);color:#9cc0a5}.state-revoked{border:1px solid rgba(218,88,98,.22);color:#df7f87}.fd-owner-meta small{color:#7f777c;font-size:9px}.fd-owner-actions{display:flex;gap:7px}.fd-owner-actions button{min-width:86px;padding:10px 12px;border:1px solid rgba(124,110,255,.2);border-radius:9px;background:rgba(124,110,255,.08);color:#c8c2ff;font:inherit;font-size:10px;font-weight:900;cursor:pointer}.fd-owner-actions button.danger{border-color:rgba(218,88,98,.16);background:rgba(218,88,98,.045);color:#d98a90}.fd-owner-actions button:disabled{cursor:not-allowed;opacity:.35}@media(max-width:800px){.fd-owner-stats{grid-template-columns:1fr}.fd-owner-row{grid-template-columns:1fr}.fd-owner-actions{flex-wrap:wrap}.fd-owner-actions button{flex:1}}
    `}</style>
  </div>;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }).format(new Date(timestamp * 1000));
}
