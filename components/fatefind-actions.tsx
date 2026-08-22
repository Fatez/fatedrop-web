"use client";

import { useEffect, useState } from "react";

type LatestHit = {
  id: string;
  matchId: string;
  offerId: string;
  query: string;
  productTitle: string;
  retailerName: string;
  productUrl: string | null;
  itemPricePence: number | null;
  deliveryKnown: boolean;
  truePricePence: number | null;
  officialRrpPence: number | null;
  stockState: string | null;
  occurredAt: number;
};

function money(value: number | null) {
  return value === null ? null : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value / 100);
}

function matchPrice(hit: LatestHit) {
  const truePrice = money(hit.truePricePence);
  if (truePrice) return `${truePrice} True Price`;
  const item = money(hit.itemPricePence);
  return item ? `${item} item · delivery unknown` : "Price evidence incomplete";
}

function rrpContext(hit: LatestHit) {
  if (hit.truePricePence === null || hit.officialRrpPence === null || hit.officialRrpPence <= 0) return null;
  const percent = ((hit.truePricePence - hit.officialRrpPence) / hit.officialRrpPence) * 100;
  const sign = percent > 0 ? "+" : percent < 0 ? "−" : "";
  return `${sign}${Math.abs(percent).toFixed(1)}% vs RRP`;
}

export function FateFindActions({ id, enabled }: { id: string; enabled: boolean }) {
  const [busy, setBusy] = useState<"toggle" | "delete" | null>(null);
  const [message, setMessage] = useState("");
  const [latestHit, setLatestHit] = useState<LatestHit | null>(null);

  useEffect(() => {
    let active = true;
    void fetch(`/api/fate-matches/${encodeURIComponent(id)}`, { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ latestHit?: LatestHit | null }> : null)
      .then((payload) => { if (active && payload?.latestHit) setLatestHit(payload.latestHit); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [id]);

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

  const context = latestHit ? rrpContext(latestHit) : null;
  const truePriceQuery = latestHit?.query || latestHit?.productTitle || "";

  return <div className="fd-fatefind-actions">
    <div className="fd-fatefind-controls">
      <button type="button" onClick={toggle} disabled={busy !== null}>{busy === "toggle" ? "SAVING…" : enabled ? "PAUSE" : "RESUME"}</button>
      <button className="danger" type="button" onClick={remove} disabled={busy !== null}>{busy === "delete" ? "DELETING…" : "DELETE"}</button>
    </div>
    {latestHit ? <div className="fd-fatefind-hit">
      <b>FATEMATCH · {latestHit.retailerName}</b>
      <span>{matchPrice(latestHit)}{context ? ` · ${context}` : ""}</span>
      <small>{latestHit.stockState ? `Latest observed state: ${latestHit.stockState.replaceAll("_", " ")}` : "Real qualifying offer recorded"}</small>
      <div>
        {latestHit.productUrl ? <a href={latestHit.productUrl} target="_blank" rel="noreferrer" data-fd-retailer={latestHit.retailerName} data-fd-product-title={latestHit.productTitle}>VIEW MATCH ↗</a> : null}
        {truePriceQuery ? <a href={`/dashboard/true-price?q=${encodeURIComponent(truePriceQuery)}`}>TRUE PRICE →</a> : null}
      </div>
    </div> : null}
    {message ? <small className="fd-fatefind-message">{message}</small> : null}
    <style jsx>{`
      .fd-fatefind-actions{min-width:170px;display:grid;gap:7px}.fd-fatefind-controls{display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap}.fd-fatefind-actions button{min-height:28px;padding:0 9px;border:1px solid rgba(171,126,195,.16);border-radius:7px;background:rgba(112,72,140,.05);color:#b895c5;font-size:6px;font-weight:900;letter-spacing:.07em}.fd-fatefind-actions button.danger{border-color:rgba(179,83,91,.16);background:rgba(179,83,91,.035);color:#b9797e}.fd-fatefind-actions button:disabled{opacity:.48}.fd-fatefind-hit{padding:8px;border:1px solid rgba(118,158,103,.16);border-radius:8px;background:rgba(99,137,83,.045);display:grid;gap:3px}.fd-fatefind-hit>b{color:#9eb991;font-size:6px;letter-spacing:.08em}.fd-fatefind-hit>span{color:#d5ccc5;font-size:7px}.fd-fatefind-hit>small{color:#746e6d;font-size:6px;text-transform:capitalize}.fd-fatefind-hit>div{display:flex;gap:8px;flex-wrap:wrap;margin-top:3px}.fd-fatefind-hit a{color:#ba94c9;font-size:6px;font-weight:900;text-decoration:none}.fd-fatefind-message{color:#746d6f;font-size:6px;text-align:right}
    `}</style>
  </div>;
}
