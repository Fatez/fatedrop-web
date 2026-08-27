"use client";

import { useEffect, useState } from "react";
import type { SignalFatePairVerdict, SignalFateVerdictPosition } from "@/lib/fatefind-verdict";
import type { SignalTruePriceGroup } from "@/lib/signal-engine-client";

function money(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value)
    : "—";
}

function percent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}

function basisLabel(position: SignalFateVerdictPosition) {
  if (position.reference?.kind === "component_reference") return "COMPONENT RRP REFERENCE";
  if (position.reference?.kind === "pack_reference") return "PACK RRP REFERENCE";
  if (position.rrpGbp !== null) return "VERIFIED OFFICIAL RRP";
  return "RRP UNKNOWN";
}

type PairResponse = {
  success: boolean;
  source?: string;
  rulesVersion?: string;
  pairVerdict?: SignalFatePairVerdict | null;
};

export function ValueCompare({ query, groups }: { query: string; groups: SignalTruePriceGroup[] }) {
  const options = groups.filter((group) => group.offers.length > 0);
  const [leftId, setLeftId] = useState(options[0]?.id ?? "");
  const [rightId, setRightId] = useState(options[1]?.id ?? options[0]?.id ?? "");
  const [pairVerdict, setPairVerdict] = useState<SignalFatePairVerdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!query || !leftId || !rightId || leftId === rightId) {
      setPairVerdict(null);
      setUnavailable(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setUnavailable(false);
    fetch("/api/fatefind/verdict", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, leftId, rightId }),
      signal: controller.signal,
    })
      .then(async (response) => response.ok ? await response.json() as PairResponse : null)
      .then((response) => {
        if (controller.signal.aborted) return;
        if (!response?.success || response.source !== "FATEDROP_CLOUD" || !response.pairVerdict) {
          setPairVerdict(null);
          setUnavailable(true);
          return;
        }
        setPairVerdict(response.pairVerdict);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPairVerdict(null);
          setUnavailable(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query, leftId, rightId]);

  if (options.length < 2) return null;

  const positions = [pairVerdict?.left ?? null, pairVerdict?.right ?? null];
  const hasWinner = Boolean(pairVerdict?.winnerId);
  const provisional = positions.some((position) => position?.provisional === true);
  const reason = leftId === rightId
    ? "Choose two different items."
    : loading
      ? "Asking FateDrop Cloud for the canonical value verdict…"
      : unavailable
        ? "The canonical Cloud verdict is unavailable, so FateDrop will not calculate a replacement in the browser."
        : pairVerdict?.reason ?? "Choose two items to compare.";

  return <section className="fd-value-compare">
    <div className="fd-value-compare-head">
      <div><small>FATE VALUE COMPARE · CLOUD VERDICT</small><h2>Compare 2 items for the best deal</h2><p>FateDrop Cloud decides the comparison from verified RRP/reference value first. This browser only displays that verdict; it does not recalculate the winner.</p></div>
      <strong>{hasWinner ? "BEST VALUE FOUND" : loading ? "CHECKING CLOUD" : "COMPARISON READY"}</strong>
    </div>
    <div className="fd-value-selectors">
      <label><span>ITEM A</span><select value={leftId} onChange={(event) => setLeftId(event.target.value)}>{options.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}</select></label>
      <b>VS</b>
      <label><span>ITEM B</span><select value={rightId} onChange={(event) => setRightId(event.target.value)}>{options.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}</select></label>
    </div>
    <div className="fd-value-cards">
      {positions.map((position, index) => position ? <article key={`${position.groupId}-${index}`} className={pairVerdict?.winnerId === position.groupId ? "winner" : ""}>
        <small>{basisLabel(position)}</small>
        <h3>{position.title}</h3>
        <div><span><small>ITEM PRICE</small><b>{money(position.itemPrice)}</b><em>{position.deliveryKnown ? "Before delivery" : "Delivery still unknown"}</em></span><span><small>VS RRP / REFERENCE</small><b>{percent(position.rrpPercent)}</b><em>{position.rrpGbp !== null ? `${money(position.rrpGbp)} baseline` : "No verified baseline"}</em></span><span><small>TRUE PRICE / UNIT</small><b>{money(position.unitCost)}</b><em>{position.unitCount ? `${position.unitCount} ${position.unitKind === "booster_pack" ? "packs" : "units"} · ${position.provisional ? "delivery pending" : "delivered"}` : "Unit count unavailable"}</em></span></div>
        <p>{position.reference?.basis ?? "No verified RRP/reference basis available."}</p>
      </article> : <article key={`pending-${index}`}><small>FATEDROP CLOUD</small><h3>{loading ? "Checking canonical evidence…" : "Verdict evidence unavailable"}</h3></article>)}
    </div>
    <div className={hasWinner ? "fd-value-verdict winner" : "fd-value-verdict"}><small>{hasWinner ? "FATEDROP CLOUD VALUE VERDICT" : "FATEDROP NEEDS MORE EVIDENCE"}</small><strong>{reason}</strong>{pairVerdict ? provisional ? <span>The RRP value comparison remains based on item price, but at least one delivery cost is unknown, so delivered-cost evidence stays provisional.</span> : <span>Both selected canonical positions include known delivery evidence, so True Price is available alongside the RRP value verdict.</span> : null}</div>
    <style jsx>{`
      .fd-value-compare{margin:18px 0 4px;padding:18px;border:1px solid rgba(157,109,255,.18);border-radius:16px;background:radial-gradient(circle at 90% 0%,rgba(157,109,255,.09),transparent 30%),#0b0a10}.fd-value-compare-head{display:flex;justify-content:space-between;gap:20px}.fd-value-compare-head small,.fd-value-selectors span,.fd-value-cards>article>small,.fd-value-verdict small{color:#b797ff;font-size:7px;font-weight:900;letter-spacing:.11em}.fd-value-compare-head h2{margin:5px 0 4px;font-size:20px}.fd-value-compare-head p{margin:0;max-width:720px;color:#817a88;font-size:9px;line-height:1.5}.fd-value-compare-head>strong{align-self:flex-start;color:#71e8ae;font-size:8px;letter-spacing:.1em}.fd-value-selectors{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:end;margin-top:16px}.fd-value-selectors label{display:grid;gap:6px}.fd-value-selectors select{height:44px;padding:0 10px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#08070c;color:#e8e2ec}.fd-value-selectors>b{padding-bottom:13px;color:#716a78;font-size:8px}.fd-value-cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.fd-value-cards article{padding:14px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(0,0,0,.15)}.fd-value-cards article.winner{border-color:rgba(113,232,174,.3);background:rgba(113,232,174,.035)}.fd-value-cards h3{margin:5px 0 10px;font-size:14px}.fd-value-cards article>div{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.fd-value-cards article>div>span{padding:8px;border:1px solid rgba(255,255,255,.05);border-radius:9px}.fd-value-cards article>div small{display:block;color:#655f6c;font-size:6px;font-weight:900;letter-spacing:.07em}.fd-value-cards article>div b{display:block;margin-top:3px;font-size:11px}.fd-value-cards article>div em{display:block;margin-top:3px;color:#716a78;font-size:7px;font-style:normal}.fd-value-cards article>p{margin:10px 0 0;color:#77707d;font-size:8px}.fd-value-verdict{display:grid;gap:4px;margin-top:10px;padding:12px;border:1px solid rgba(255,255,255,.06);border-radius:10px}.fd-value-verdict.winner{border-color:rgba(113,232,174,.22)}.fd-value-verdict strong{font-size:11px}.fd-value-verdict span{color:#8b8491;font-size:8px}@media(max-width:850px){.fd-value-cards{grid-template-columns:1fr}.fd-value-cards article>div{grid-template-columns:1fr}.fd-value-selectors{grid-template-columns:1fr}.fd-value-selectors>b{padding:0}.fd-value-compare-head{flex-direction:column}}
    `}</style>
  </section>;
}
