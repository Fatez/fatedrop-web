"use client";

import { useEffect, useState } from "react";
import type { SignalTruePriceGroup } from "@/lib/signal-engine-client";
import type { FatePairVerdict, FateRankVerdict, FateVerdictPosition } from "@/lib/fatefind-verdict-client";

function money(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value)
    : "—";
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

function PositionCard({ group, position, winnerId }: { group: SignalTruePriceGroup; position: FateVerdictPosition | null; winnerId: string | null }) {
  if (!position) return null;
  return <article className={winnerId === group.id ? "winner" : ""}>
    <small>{basisLabel(group)}</small>
    <h3>{group.title}</h3>
    <div>
      <span><small>ITEM PRICE</small><b>{money(position.itemPrice)}</b><em>{position.provisional ? "Delivery still unknown" : "Before delivery"}</em></span>
      <span><small>VS RRP / REFERENCE</small><b>{percent(position.rrpPercent)}</b><em>{typeof position.rrpGbp === "number" ? `${money(position.rrpGbp)} baseline` : "No verified baseline"}</em></span>
      <span><small>TRUE PRICE / UNIT</small><b>{money(position.unitCost)}</b><em>{group.unitCount ? `${group.unitCount} ${group.unitKind === "booster_pack" ? "packs" : "units"} · ${position.provisional ? "delivery pending" : "delivered"}` : "Unit count unavailable"}</em></span>
    </div>
    <p>{group.rrpReferenceBasis ?? "No verified RRP/reference basis available."}</p>
  </article>;
}

export function ValueCompare({ groups, query, verdict }: { groups: SignalTruePriceGroup[]; query: string; verdict: FateRankVerdict }) {
  const options = groups.filter((group) => group.offers.length > 0);
  const [leftId, setLeftId] = useState(options[0]?.id ?? "");
  const [rightId, setRightId] = useState(options[1]?.id ?? options[0]?.id ?? "");
  const [pairVerdict, setPairVerdict] = useState<FatePairVerdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!options.length) return;
    setLeftId((current) => options.some((group) => group.id === current) ? current : options[0].id);
    setRightId((current) => {
      if (options.some((group) => group.id === current) && current !== options[0].id) return current;
      return options[1]?.id ?? options[0].id;
    });
  }, [groups]);

  useEffect(() => {
    if (!leftId || !rightId || leftId === rightId || query.trim().length < 2) {
      setPairVerdict(null);
      setError("");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void fetch("/api/fatefind/verdict", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ query, leftId, rightId }),
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error("cloud-verdict-unavailable");
      const data = await response.json() as { pairVerdict?: FatePairVerdict | null };
      setPairVerdict(data.pairVerdict ?? null);
    }).catch((requestError: unknown) => {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setPairVerdict(null);
      setError("FateDrop Cloud could not return this head-to-head verdict.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [leftId, rightId, query]);

  if (options.length < 2) return null;
  const leftGroup = options.find((group) => group.id === leftId) ?? options[0];
  const rightGroup = options.find((group) => group.id === rightId) ?? options[1];
  const globalWinner = verdict.winnerId ? options.find((group) => group.id === verdict.winnerId) : undefined;
  const pairWinner = pairVerdict?.winnerId ? options.find((group) => group.id === pairVerdict.winnerId) : undefined;

  return <section className="fd-value-compare">
    <div className="fd-value-compare-head">
      <div><small>FATEFIND · FATEDROP CLOUD</small><h2>One Fate Verdict across the network</h2><p>FateDrop Cloud normalises different pack sizes using verified RRP/reference value first. RRP % compares item price with the verified baseline; True Price separately adds known mandatory delivery. The website does not calculate a second winner.</p></div>
      <strong>{globalWinner ? "CLOUD VERDICT READY" : "MORE EVIDENCE NEEDED"}</strong>
    </div>
    <div className={globalWinner ? "fd-value-verdict winner" : "fd-value-verdict"}><small>{globalWinner ? "FATE VERDICT · BEST ACROSS THIS SEARCH" : "FATEDROP NEEDS MORE EVIDENCE"}</small><strong>{verdict.reason}</strong><span>{globalWinner ? `${globalWinner.title} is the Cloud-ranked leader${verdict.provisional ? "; at least one delivered-cost input remains provisional." : "."}` : "FateDrop will not manufacture a winner without comparable verified evidence."}</span></div>
    <div className="fd-value-selectors">
      <label><span>ITEM A</span><select value={leftId} onChange={(event) => setLeftId(event.target.value)}>{options.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}</select></label>
      <b>VS</b>
      <label><span>ITEM B</span><select value={rightId} onChange={(event) => setRightId(event.target.value)}>{options.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}</select></label>
    </div>
    {loading ? <div className="fd-value-loading">ASKING FATEDROP CLOUD FOR THE HEAD-TO-HEAD VERDICT…</div> : pairVerdict ? <>
      <div className="fd-value-cards">
        <PositionCard group={leftGroup} position={pairVerdict.left} winnerId={pairVerdict.winnerId} />
        <PositionCard group={rightGroup} position={pairVerdict.right} winnerId={pairVerdict.winnerId} />
      </div>
      <div className={pairWinner ? "fd-value-verdict winner" : "fd-value-verdict"}><small>{pairWinner ? "FATEDROP HEAD-TO-HEAD VERDICT" : "FATEDROP NEEDS MORE EVIDENCE"}</small><strong>{pairVerdict.reason}</strong>{pairVerdict.left?.provisional || pairVerdict.right?.provisional ? <span>The RRP value comparison remains valid from item price, but at least one delivery cost is unknown, so delivered-cost evidence remains provisional.</span> : <span>Both selected offers have known delivery, so True Price can be shown alongside the canonical RRP value verdict.</span>}</div>
    </> : <div className="fd-value-loading">{error || "Waiting for the canonical FateDrop Cloud verdict."}</div>}
    <style jsx>{`
      .fd-value-compare{margin:18px 0 4px;padding:18px;border:1px solid rgba(157,109,255,.18);border-radius:16px;background:radial-gradient(circle at 90% 0%,rgba(157,109,255,.09),transparent 30%),#0b0a10}.fd-value-compare-head{display:flex;justify-content:space-between;gap:20px}.fd-value-compare-head small,.fd-value-selectors span,.fd-value-cards>article>small,.fd-value-verdict small{color:#b797ff;font-size:7px;font-weight:900;letter-spacing:.11em}.fd-value-compare-head h2{margin:5px 0 4px;font-size:20px}.fd-value-compare-head p{margin:0;max-width:720px;color:#817a88;font-size:9px;line-height:1.5}.fd-value-compare-head>strong{align-self:flex-start;color:#71e8ae;font-size:8px;letter-spacing:.1em}.fd-value-selectors{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:end;margin-top:16px}.fd-value-selectors label{display:grid;gap:6px}.fd-value-selectors select{height:44px;padding:0 10px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#08070c;color:#e8e2ec}.fd-value-selectors>b{padding-bottom:13px;color:#716a78;font-size:8px}.fd-value-cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.fd-value-cards article{padding:14px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(0,0,0,.15)}.fd-value-cards article.winner{border-color:rgba(113,232,174,.3);background:rgba(113,232,174,.035)}.fd-value-cards h3{margin:5px 0 10px;font-size:14px}.fd-value-cards article>div{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.fd-value-cards article>div>span{padding:8px;border:1px solid rgba(255,255,255,.05);border-radius:9px}.fd-value-cards article>div small{display:block;color:#655f6c;font-size:6px;font-weight:900;letter-spacing:.07em}.fd-value-cards article>div b{display:block;margin-top:3px;font-size:11px}.fd-value-cards article>div em{display:block;margin-top:3px;color:#716a78;font-size:7px;font-style:normal}.fd-value-cards article>p{margin:10px 0 0;color:#77707d;font-size:8px}.fd-value-verdict{display:grid;gap:4px;margin-top:10px;padding:12px;border:1px solid rgba(255,255,255,.06);border-radius:10px}.fd-value-verdict.winner{border-color:rgba(113,232,174,.22)}.fd-value-verdict strong{font-size:11px}.fd-value-verdict span{color:#8b8491;font-size:8px}.fd-value-loading{margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,.06);border-radius:10px;color:#8b8491;font-size:8px;font-weight:800;letter-spacing:.05em}@media(max-width:850px){.fd-value-cards{grid-template-columns:1fr}.fd-value-cards article>div{grid-template-columns:1fr}.fd-value-selectors{grid-template-columns:1fr}.fd-value-selectors>b{padding:0}.fd-value-compare-head{flex-direction:column}}
    `}</style>
  </section>;
}
