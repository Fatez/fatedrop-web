"use client";

import { useMemo, useState } from "react";
import type { SignalTruePriceGroup, SignalTruePriceOffer } from "@/lib/signal-engine-client";

function money(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value)
    : "—";
}

function bestOffer(group: SignalTruePriceGroup): SignalTruePriceOffer | null {
  const rows = [...group.offers].sort((a, b) => {
    if (a.deliveryKnown !== b.deliveryKnown) return a.deliveryKnown ? -1 : 1;
    return (a.totalDeliveredGbp ?? a.priceGbp ?? Infinity) - (b.totalDeliveredGbp ?? b.priceGbp ?? Infinity);
  });
  return rows[0] ?? null;
}

function comparison(group: SignalTruePriceGroup) {
  const offer = bestOffer(group);
  if (!offer) return null;
  const cost = offer.deliveryKnown ? offer.totalDeliveredGbp : offer.priceGbp;
  const rrpPercent = typeof cost === "number" && typeof group.rrpGbp === "number" && group.rrpGbp > 0
    ? ((cost - group.rrpGbp) / group.rrpGbp) * 100
    : null;
  const unitCost = typeof cost === "number" && typeof group.unitCount === "number" && group.unitCount > 0
    ? cost / group.unitCount
    : null;
  return { group, offer, cost, rrpPercent, unitCost, provisional: !offer.deliveryKnown };
}

function percent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}

function basisLabel(group: SignalTruePriceGroup) {
  if (group.rrpKind === "component_reference") return "COMPONENT RRP REFERENCE";
  if (group.rrpKind === "pack_reference") return "PACK RRP REFERENCE";
  if (typeof group.rrpGbp === "number") return "VERIFIED OFFICIAL RRP";
  return "RRP UNKNOWN";
}

export function ValueCompare({ groups }: { groups: SignalTruePriceGroup[] }) {
  const options = groups.filter((group) => group.offers.length > 0);
  const [leftId, setLeftId] = useState(options[0]?.id ?? "");
  const [rightId, setRightId] = useState(options[1]?.id ?? options[0]?.id ?? "");

  const result = useMemo(() => {
    const left = comparison(options.find((group) => group.id === leftId) ?? options[0]);
    const right = comparison(options.find((group) => group.id === rightId) ?? options[1] ?? options[0]);
    if (!left || !right || left.group.id === right.group.id) return { left, right, winner: null, reason: "Choose two different items." };

    if (left.rrpPercent !== null && right.rrpPercent !== null) {
      const winner = left.rrpPercent <= right.rrpPercent ? left : right;
      const loser = winner === left ? right : left;
      const gap = Math.abs((winner.rrpPercent ?? 0) - (loser.rrpPercent ?? 0));
      return {
        left,
        right,
        winner,
        reason: `${winner.group.title} has the better value position at ${percent(winner.rrpPercent)} vs RRP${gap ? `, ${gap.toFixed(1)} percentage points better` : ""}.`,
      };
    }

    if (left.unitCost !== null && right.unitCost !== null && left.group.unitKind === right.group.unitKind) {
      const winner = left.unitCost <= right.unitCost ? left : right;
      return {
        left,
        right,
        winner,
        reason: `${winner.group.title} has the lower observed cost per ${winner.group.unitKind === "booster_pack" ? "pack" : "unit"}.`,
      };
    }

    return { left, right, winner: null, reason: "FateDrop cannot declare a trustworthy winner until both items have comparable RRP or unit evidence." };
  }, [leftId, rightId, options]);

  if (options.length < 2) return null;

  return <section className="fd-value-compare">
    <div className="fd-value-compare-head">
      <div><small>FATE VALUE COMPARE</small><h2>Compare 2 items for the best deal</h2><p>FateDrop normalises different pack sizes using verified RRP/reference value first, then True Price and per-pack cost where available.</p></div>
      <strong>{result.winner ? "BEST VALUE FOUND" : "COMPARISON READY"}</strong>
    </div>
    <div className="fd-value-selectors">
      <label><span>ITEM A</span><select value={leftId} onChange={(event) => setLeftId(event.target.value)}>{options.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}</select></label>
      <b>VS</b>
      <label><span>ITEM B</span><select value={rightId} onChange={(event) => setRightId(event.target.value)}>{options.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}</select></label>
    </div>
    <div className="fd-value-cards">
      {[result.left, result.right].map((item, index) => item ? <article key={`${item.group.id}-${index}`} className={result.winner?.group.id === item.group.id ? "winner" : ""}>
        <small>{basisLabel(item.group)}</small>
        <h3>{item.group.title}</h3>
        <div><span><small>BEST OBSERVED COST</small><b>{money(item.cost)}</b><em>{item.provisional ? "Item price · delivery unknown" : "True Price · delivery included"}</em></span><span><small>VS RRP / REFERENCE</small><b>{percent(item.rrpPercent)}</b><em>{typeof item.group.rrpGbp === "number" ? `${money(item.group.rrpGbp)} baseline` : "No verified baseline"}</em></span><span><small>PER PACK / UNIT</small><b>{money(item.unitCost ?? undefined)}</b><em>{item.group.unitCount ? `${item.group.unitCount} ${item.group.unitKind === "booster_pack" ? "packs" : "units"}` : "Unit count unavailable"}</em></span></div>
        <p>{item.group.rrpReferenceBasis ?? "No verified RRP/reference basis available."}</p>
      </article> : null)}
    </div>
    <div className={result.winner ? "fd-value-verdict winner" : "fd-value-verdict"}><small>{result.winner ? "FATEDROP VERDICT" : "FATEDROP NEEDS MORE EVIDENCE"}</small><strong>{result.reason}</strong>{result.left?.provisional || result.right?.provisional ? <span>At least one delivery cost is unknown, so the result is provisional until True Price is complete.</span> : null}</div>
    <style jsx>{`
      .fd-value-compare{margin:18px 0 4px;padding:18px;border:1px solid rgba(157,109,255,.18);border-radius:16px;background:radial-gradient(circle at 90% 0%,rgba(157,109,255,.09),transparent 30%),#0b0a10}.fd-value-compare-head{display:flex;justify-content:space-between;gap:20px}.fd-value-compare-head small,.fd-value-selectors span,.fd-value-cards>article>small,.fd-value-verdict small{color:#b797ff;font-size:7px;font-weight:900;letter-spacing:.11em}.fd-value-compare-head h2{margin:5px 0 4px;font-size:20px}.fd-value-compare-head p{margin:0;max-width:720px;color:#817a88;font-size:9px;line-height:1.5}.fd-value-compare-head>strong{align-self:flex-start;color:#71e8ae;font-size:8px;letter-spacing:.1em}.fd-value-selectors{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:end;margin-top:16px}.fd-value-selectors label{display:grid;gap:6px}.fd-value-selectors select{height:44px;padding:0 10px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#08070c;color:#e8e2ec}.fd-value-selectors>b{padding-bottom:13px;color:#716a78;font-size:8px}.fd-value-cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.fd-value-cards article{padding:14px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(0,0,0,.15)}.fd-value-cards article.winner{border-color:rgba(113,232,174,.3);background:rgba(113,232,174,.035)}.fd-value-cards h3{margin:5px 0 10px;font-size:14px}.fd-value-cards article>div{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.fd-value-cards article>div>span{padding:8px;border:1px solid rgba(255,255,255,.05);border-radius:9px}.fd-value-cards article>div small{display:block;color:#655f6c;font-size:6px;font-weight:900;letter-spacing:.07em}.fd-value-cards article>div b{display:block;margin-top:3px;font-size:11px}.fd-value-cards article>div em{display:block;margin-top:3px;color:#716a78;font-size:7px;font-style:normal}.fd-value-cards article>p{margin:10px 0 0;color:#77707d;font-size:8px}.fd-value-verdict{display:grid;gap:4px;margin-top:10px;padding:12px;border:1px solid rgba(255,255,255,.06);border-radius:10px}.fd-value-verdict.winner{border-color:rgba(113,232,174,.22)}.fd-value-verdict strong{font-size:11px}.fd-value-verdict span{color:#8b8491;font-size:8px}@media(max-width:850px){.fd-value-cards{grid-template-columns:1fr}.fd-value-cards article>div{grid-template-columns:1fr}.fd-value-selectors{grid-template-columns:1fr}.fd-value-selectors>b{padding:0}.fd-value-compare-head{flex-direction:column}}
    `}</style>
  </section>;
}
