"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  FateTraderCard,
  FateTraderEnvelope,
  FateTraderSeries,
  FateTraderSet,
  fateTraderCardLabel,
} from "@/lib/fate-trader-web";

type Mode = "have" | "want" | "find";
type CopyState = "raw" | "graded";
type WantCopyState = "any" | "raw" | "graded";

type BinderSnapshot = {
  binder?: { visibility?: string; status?: string } | null;
  items?: Array<{ id: string; fateCardId: string; status: string; effectiveAvailable?: boolean }>;
};
type WantsSnapshot = {
  wants?: Array<{ fateCardId: string; quantity: number; constraints?: unknown }>;
  count?: number;
};

async function traderRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`/api/trader/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });
  let payload: FateTraderEnvelope<T>;
  try {
    payload = await response.json() as FateTraderEnvelope<T>;
  } catch {
    payload = { ok: false, error: { code: "INVALID_RESPONSE", message: "Fate Trader returned an invalid response." } };
  }
  return { response, payload };
}

function normaliseError(payload: FateTraderEnvelope<unknown>, fallback: string) {
  return payload.error?.message || fallback;
}

function titleCase(value: string | null | undefined) {
  if (!value) return "—";
  return value.replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function FateTraderAudit() {
  const [mode, setMode] = useState<Mode>("have");
  const [series, setSeries] = useState<FateTraderSeries[]>([]);
  const [sets, setSets] = useState<FateTraderSet[]>([]);
  const [cards, setCards] = useState<FateTraderCard[]>([]);
  const [seriesId, setSeriesId] = useState("");
  const [setId, setSetId] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FateTraderCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [binderCount, setBinderCount] = useState(0);
  const [wantCount, setWantCount] = useState(0);

  const [copyState, setCopyState] = useState<CopyState>("raw");
  const [conditionCode, setConditionCode] = useState("near_mint");
  const [gradingCompany, setGradingCompany] = useState("PSA");
  const [gradeLabel, setGradeLabel] = useState("10");
  const [tradeMode, setTradeMode] = useState("negotiable");
  const [haveLocal, setHaveLocal] = useState(true);
  const [havePostal, setHavePostal] = useState(true);
  const [haveNotes, setHaveNotes] = useState("");

  const [wantCopyState, setWantCopyState] = useState<WantCopyState>("any");
  const [minimumCondition, setMinimumCondition] = useState("near_mint");
  const [minimumGrade, setMinimumGrade] = useState("");
  const [maximumGrade, setMaximumGrade] = useState("");
  const [gradingCompanies, setGradingCompanies] = useState("");
  const [wantLocal, setWantLocal] = useState(true);
  const [wantPostal, setWantPostal] = useState(true);
  const [wantNotes, setWantNotes] = useState("");

  const selectedSeries = useMemo(() => series.find((item) => item.id === seriesId) || null, [series, seriesId]);
  const selectedSet = useMemo(() => sets.find((item) => item.id === setId) || null, [sets, setId]);

  const markBackend = useCallback((status: number, payload: FateTraderEnvelope<unknown>) => {
    if (status === 404 && payload.error?.code === "NOT_FOUND") setBackendAvailable(false);
    else if (status < 500) setBackendAvailable(true);
  }, []);

  const loadMine = useCallback(async () => {
    const [binderResult, wantsResult] = await Promise.all([
      traderRequest<BinderSnapshot>("binder?tcg=pokemon"),
      traderRequest<WantsSnapshot>("structured-wants"),
    ]);
    if (binderResult.payload.ok) setBinderCount(binderResult.payload.data?.items?.length || 0);
    if (wantsResult.payload.ok) setWantCount(wantsResult.payload.data?.count || wantsResult.payload.data?.wants?.length || 0);
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError("");
    const [seriesResult, cardsResult] = await Promise.all([
      traderRequest<{ series: FateTraderSeries[]; count: number }>("card-series?tcg=pokemon"),
      traderRequest<{ cards: FateTraderCard[]; count: number }>("cards?limit=60"),
    ]);
    markBackend(seriesResult.response.status, seriesResult.payload);
    if (!seriesResult.payload.ok || !cardsResult.payload.ok) {
      setError(normaliseError(seriesResult.payload, "The verified Fate Trader catalogue is not available yet."));
      setLoading(false);
      return;
    }
    setSeries(seriesResult.payload.data?.series || []);
    setCards(cardsResult.payload.data?.cards || []);
    setBackendAvailable(true);
    setLoading(false);
    await loadMine();
  }, [loadMine, markBackend]);

  useEffect(() => { void loadInitial(); }, [loadInitial]);

  async function chooseSeries(nextSeriesId: string) {
    setSeriesId(nextSeriesId);
    setSetId("");
    setSelected(null);
    setSets([]);
    if (!nextSeriesId) return;
    setLoading(true);
    const result = await traderRequest<{ sets: FateTraderSet[]; count: number }>(`card-sets?seriesId=${encodeURIComponent(nextSeriesId)}`);
    if (result.payload.ok) setSets(result.payload.data?.sets || []);
    else setError(normaliseError(result.payload, "Could not load sets."));
    setLoading(false);
  }

  async function chooseSet(nextSetId: string) {
    setSetId(nextSetId);
    setSelected(null);
    if (!nextSetId) return;
    setLoading(true);
    setError("");
    const result = await traderRequest<{ cards: FateTraderCard[]; count: number }>(`card-sets/${encodeURIComponent(nextSetId)}/cards?limit=500`);
    if (result.payload.ok) setCards(result.payload.data?.cards || []);
    else setError(normaliseError(result.payload, "Could not load cards for this set."));
    setLoading(false);
  }

  async function searchCards(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    setSelected(null);
    const params = new URLSearchParams({ limit: "100" });
    if (query.trim()) params.set("q", query.trim());
    if (setId) params.set("setId", setId);
    const result = await traderRequest<{ cards: FateTraderCard[]; count: number }>(`cards?${params.toString()}`);
    if (result.payload.ok) setCards(result.payload.data?.cards || []);
    else setError(normaliseError(result.payload, "Could not search the verified card catalogue."));
    setLoading(false);
  }

  async function submitHave() {
    if (!selected || saving) return;
    if (!haveLocal && !havePostal) {
      setError("Choose at least one trade method: local or postal.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");

    const itemBody: Record<string, unknown> = {
      fateCardId: selected.fateCardId,
      quantity: 1,
      tradeQuantity: 1,
      copyState,
      notes: haveNotes || undefined,
    };
    if (copyState === "raw") itemBody.conditionCode = conditionCode;
    else itemBody.grading = {
      gradingCompany,
      gradeLabel,
      gradeValue: gradeLabel.trim() === "" ? null : Number(gradeLabel),
    };

    const created = await traderRequest<{ item: { id: string; revision: number } }>("collection/items", {
      method: "POST",
      body: JSON.stringify(itemBody),
    });
    if (!created.payload.ok || !created.payload.data?.item) {
      setError(normaliseError(created.payload, "Could not stage this card for trade."));
      setSaving(false);
      return;
    }

    const collectionItem = created.payload.data.item;
    const binder = await traderRequest<{ item: { id: string } }>("binder/items", {
      method: "POST",
      body: JSON.stringify({
        collectionItemId: collectionItem.id,
        tradeMode,
        visibility: "private",
        localTradeAllowed: haveLocal,
        postalTradeAllowed: havePostal,
        notes: haveNotes || undefined,
      }),
    });

    if (!binder.payload.ok) {
      await traderRequest(`collection/items/${encodeURIComponent(collectionItem.id)}?expectedRevision=${collectionItem.revision}`, { method: "DELETE" });
      setError(normaliseError(binder.payload, "Could not add this card to your Trade Binder."));
      setSaving(false);
      return;
    }

    setNotice(`${fateTraderCardLabel(selected)} is staged in your private Trade Binder. It is not a public listing yet.`);
    setSaving(false);
    await loadMine();
  }

  async function submitWant() {
    if (!selected || saving) return;
    if (!wantLocal && !wantPostal) {
      setError("Choose at least one trade method: local or postal.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");

    const exact = await traderRequest<{ want: unknown }>(`wants/${encodeURIComponent(selected.fateCardId)}`, {
      method: "PUT",
      body: JSON.stringify({ quantity: 1, active: true }),
    });
    if (!exact.payload.ok) {
      setError(normaliseError(exact.payload, "Could not save this wanted card."));
      setSaving(false);
      return;
    }

    const constraints: Record<string, unknown> = {
      copyState: wantCopyState,
      localTradeAllowed: wantLocal,
      postalTradeAllowed: wantPostal,
      notes: wantNotes || undefined,
    };
    if (wantCopyState === "raw") constraints.minimumConditionCode = minimumCondition;
    if (wantCopyState === "graded") {
      constraints.minimumGrade = minimumGrade.trim() ? Number(minimumGrade) : null;
      constraints.maximumGrade = maximumGrade.trim() ? Number(maximumGrade) : null;
      constraints.acceptedGradingCompanies = gradingCompanies.split(",").map((value) => value.trim()).filter(Boolean);
    }

    const structured = await traderRequest<{ constraints: unknown }>(`structured-wants/${encodeURIComponent(selected.fateCardId)}`, {
      method: "PUT",
      body: JSON.stringify(constraints),
    });
    if (!structured.payload.ok) {
      setError(`The exact Want was saved, but its trade conditions need attention: ${normaliseError(structured.payload, "could not save conditions")}`);
      setSaving(false);
      await loadMine();
      return;
    }

    setNotice(`${fateTraderCardLabel(selected)} is now in your Wants with the conditions you chose.`);
    setSaving(false);
    await loadMine();
  }

  return <div className="fd-trader-audit">
    <section className="fd-trader-hero">
      <div>
        <small>FATE NETWORK · COLLECTOR TRADING</small>
        <h1>What have you got? What do you want?</h1>
        <p>Find the exact card, set your trade conditions, and let FateDrop do the complicated matching underneath.</p>
      </div>
      <div className="fd-trader-pulse"><span>HAVE</span><i>→</i><span>WANT</span><i>→</i><span>FIND</span><i>→</i><span>TRADE</span></div>
    </section>

    {backendAvailable === false && <div className="fd-trader-warning"><b>Audit surface ready · Cloud Trader still dark</b><span>The website is wired to real verified FateDrop data only. Enable the shared Cloud Trader flags for live interaction; no demo cards are being fabricated.</span></div>}
    {error && <div className="fd-trader-error">{error}</div>}
    {notice && <div className="fd-trader-success">{notice}</div>}

    <section className="fd-trader-actions" aria-label="Fate Trader actions">
      <button className={mode === "have" ? "active" : ""} onClick={() => setMode("have")}><b>I HAVE A CARD</b><span>Put one card or slab forward for trade.</span></button>
      <button className={mode === "want" ? "active" : ""} onClick={() => setMode("want")}><b>I WANT A CARD</b><span>Tell FateDrop the exact card you are looking for.</span></button>
      <button className={mode === "find" ? "active" : ""} onClick={() => setMode("find")}><b>FIND A TRADE</b><span>See verified opportunities when Finder goes live.</span></button>
    </section>

    <section className="fd-trader-status">
      <div><small>MY TRADE ITEMS</small><strong>{binderCount}</strong><span>cards currently staged</span></div>
      <div><small>MY WANTS</small><strong>{wantCount}</strong><span>exact cards wanted</span></div>
      <div><small>FINDER</small><strong>—</strong><span>next backend phase</span></div>
    </section>

    {mode !== "find" ? <div className="fd-trader-grid">
      <section className="fd-trader-panel">
        <div className="fd-trader-panel-head"><small>STEP 1</small><h2>Find the exact card</h2><p>Search directly, or browse Pokémon → Era/Series → Set → Card.</p></div>
        <div className="fd-trader-browse">
          <label><span>Era / Series</span><select value={seriesId} onChange={(event) => void chooseSeries(event.target.value)}><option value="">All verified eras</option>{series.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span>Set / Expansion</span><select value={setId} disabled={!seriesId} onChange={(event) => void chooseSet(event.target.value)}><option value="">{seriesId ? "Choose a set" : "Choose an era first"}</option>{sets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        <form className="fd-trader-search" onSubmit={searchCards}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search e.g. Furret, Charizard, 136…" aria-label="Search verified cards"/><button type="submit">SEARCH</button></form>
        <div className="fd-trader-context">{selectedSeries ? <span>{selectedSeries.name}</span> : <span>Pokémon TCG</span>}{selectedSet && <><i>›</i><span>{selectedSet.name}</span></>}</div>
        <div className="fd-trader-results" aria-live="polite">
          {loading ? <p className="fd-trader-empty">Loading verified cards…</p> : cards.length === 0 ? <p className="fd-trader-empty">No verified cards match this view yet.</p> : cards.map((card) => <button type="button" key={card.fateCardId} className={selected?.fateCardId === card.fateCardId ? "selected" : ""} onClick={() => setSelected(card)}>
            <div><b>{card.name || "Unknown card"}</b><span>{card.setName || "Unknown set"} · #{card.collectorNumber}</span></div>
            <div><small>{titleCase(card.variantCode)}</small><small>{card.languageCode.toUpperCase()}</small></div>
          </button>)}
        </div>
      </section>

      <section className="fd-trader-panel fd-trader-terms">
        <div className="fd-trader-panel-head"><small>STEP 2</small><h2>{mode === "have" ? "Tell us what you have" : "Tell us what you want"}</h2><p>Only the details needed for this trade. No full collection upload.</p></div>
        {!selected ? <div className="fd-trader-select-prompt"><span>⇠</span><b>Select a verified card first</b><p>FateDrop will attach the terms to that exact printing, variant and language.</p></div> : <>
          <div className="fd-trader-selected"><small>SELECTED</small><strong>{fateTraderCardLabel(selected)}</strong><span>{selected.seriesName} · {selected.setName} · {selected.languageCode.toUpperCase()}</span></div>

          {mode === "have" ? <div className="fd-trader-form">
            <label><span>Card type</span><select value={copyState} onChange={(event) => setCopyState(event.target.value as CopyState)}><option value="raw">Raw card</option><option value="graded">Graded slab</option></select></label>
            {copyState === "raw" ? <label><span>Condition</span><select value={conditionCode} onChange={(event) => setConditionCode(event.target.value)}><option value="mint">Mint</option><option value="near_mint">Near Mint</option><option value="lightly_played">Lightly Played</option><option value="moderately_played">Moderately Played</option><option value="heavily_played">Heavily Played</option><option value="damaged">Damaged</option><option value="unknown">Not sure</option></select></label> : <div className="fd-trader-two"><label><span>Grading company</span><input value={gradingCompany} onChange={(event) => setGradingCompany(event.target.value)} placeholder="PSA"/></label><label><span>Grade</span><input value={gradeLabel} onChange={(event) => setGradeLabel(event.target.value)} placeholder="10"/></label></div>}
            <label><span>What are you open to?</span><select value={tradeMode} onChange={(event) => setTradeMode(event.target.value)}><option value="negotiable">Negotiable</option><option value="open">Open to offers</option><option value="exact_wants_only">Only my exact Wants</option><option value="one_for_one">One for one</option><option value="bundle_ok">Bundles considered</option></select></label>
            <TradeMethods local={haveLocal} postal={havePostal} onLocal={setHaveLocal} onPostal={setHavePostal}/>
            <label><span>Optional note</span><textarea value={haveNotes} onChange={(event) => setHaveNotes(event.target.value)} placeholder="Anything another collector should know…"/></label>
            <button className="fd-trader-primary" type="button" disabled={saving} onClick={() => void submitHave()}>{saving ? "SAVING…" : "ADD TO MY TRADE ITEMS"}</button>
            <p className="fd-trader-footnote">For this audit build the card stays private in your Trade Binder. Public Trade Network listings arrive with the next Cloud phase.</p>
          </div> : <div className="fd-trader-form">
            <label><span>What copy would you accept?</span><select value={wantCopyState} onChange={(event) => setWantCopyState(event.target.value as WantCopyState)}><option value="any">Raw or graded</option><option value="raw">Raw only</option><option value="graded">Graded only</option></select></label>
            {wantCopyState === "raw" && <label><span>Minimum condition</span><select value={minimumCondition} onChange={(event) => setMinimumCondition(event.target.value)}><option value="mint">Mint</option><option value="near_mint">Near Mint</option><option value="lightly_played">Lightly Played</option><option value="moderately_played">Moderately Played</option><option value="heavily_played">Heavily Played</option><option value="damaged">Damaged</option></select></label>}
            {wantCopyState === "graded" && <><div className="fd-trader-two"><label><span>Minimum grade</span><input inputMode="decimal" value={minimumGrade} onChange={(event) => setMinimumGrade(event.target.value)} placeholder="8"/></label><label><span>Maximum grade</span><input inputMode="decimal" value={maximumGrade} onChange={(event) => setMaximumGrade(event.target.value)} placeholder="10"/></label></div><label><span>Grading companies (optional)</span><input value={gradingCompanies} onChange={(event) => setGradingCompanies(event.target.value)} placeholder="PSA, CGC, BGS"/></label></>}
            <TradeMethods local={wantLocal} postal={wantPostal} onLocal={setWantLocal} onPostal={setWantPostal}/>
            <label><span>Optional note</span><textarea value={wantNotes} onChange={(event) => setWantNotes(event.target.value)} placeholder="Specific preference or trade note…"/></label>
            <button className="fd-trader-primary" type="button" disabled={saving} onClick={() => void submitWant()}>{saving ? "SAVING…" : "ADD TO MY WANTS"}</button>
          </div>}
        </>}
      </section>
    </div> : <section className="fd-trader-finder">
      <small>FATE TRADE FINDER</small><h2>Finder stays honest until matching is live.</h2><p>The interface is deliberately not manufacturing demo matches. Phase 4 will expose real collector listings; Phase 5 will revalidate both sides and return exact or compatible opportunities.</p>
      <div><span>1</span><b>You list what you have.</b></div><div><span>2</span><b>You tell FateDrop what you want.</b></div><div><span>3</span><b>FateDrop searches verified live trade intentions.</b></div><div><span>4</span><b>Only then can a verified FATE TRADE FOUND event exist.</b></div>
    </section>}

    <style jsx>{`
      .fd-trader-audit{display:grid;gap:16px;color:#e9e1db}.fd-trader-hero{min-height:180px;padding:26px 28px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;border:1px solid rgba(185,132,224,.16);border-radius:18px;background:radial-gradient(circle at 82% 18%,rgba(108,60,150,.2),transparent 25rem),linear-gradient(135deg,rgba(38,22,50,.78),rgba(12,15,20,.92) 48%,#0a0d11)}.fd-trader-hero>div:first-child{max-width:720px}.fd-trader-hero small,.fd-trader-panel-head small,.fd-trader-finder>small,.fd-trader-selected>small,.fd-trader-status small{color:#b58bd2;font-size:10px;font-weight:900;letter-spacing:.16em}.fd-trader-hero h1{margin:8px 0 9px;font-family:Georgia,serif;font-size:clamp(30px,4vw,49px);font-weight:500;letter-spacing:-.035em}.fd-trader-hero p{max-width:650px;margin:0;color:#b9b0b5}.fd-trader-pulse{padding:14px 16px;display:flex;align-items:center;gap:9px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(4,6,9,.5);white-space:nowrap}.fd-trader-pulse span{font-size:10px;font-weight:900;letter-spacing:.12em}.fd-trader-pulse i{color:#75588d;font-style:normal}.fd-trader-warning,.fd-trader-error,.fd-trader-success{padding:14px 16px;display:grid;gap:3px;border-radius:10px;font-size:12px}.fd-trader-warning{border:1px solid rgba(200,158,89,.24);background:rgba(108,75,20,.12);color:#d9c294}.fd-trader-warning span{color:#a99d88}.fd-trader-error{border:1px solid rgba(212,95,95,.25);background:rgba(124,40,40,.13);color:#e0adad}.fd-trader-success{border:1px solid rgba(86,190,145,.22);background:rgba(37,111,79,.12);color:#a9dac5}.fd-trader-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.fd-trader-actions button{min-height:82px;padding:15px 17px;display:grid;gap:4px;text-align:left;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:#0d1116;color:#b6aeb3;cursor:pointer}.fd-trader-actions button b{color:#e5dce0;font-size:12px;letter-spacing:.08em}.fd-trader-actions button span{font-size:11px;line-height:1.45}.fd-trader-actions button.active{border-color:rgba(181,114,232,.34);background:linear-gradient(135deg,rgba(99,48,139,.28),rgba(18,17,24,.88));box-shadow:inset 0 0 0 1px rgba(181,114,232,.06)}.fd-trader-status{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.fd-trader-status>div{padding:14px 16px;display:grid;grid-template-columns:1fr auto;gap:3px 10px;align-items:end;border:1px solid rgba(255,255,255,.055);border-radius:11px;background:rgba(255,255,255,.015)}.fd-trader-status small{grid-column:1}.fd-trader-status strong{grid-column:2;grid-row:1/3;font-family:Georgia,serif;font-size:25px;font-weight:500}.fd-trader-status span{color:#807980;font-size:10px}.fd-trader-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(340px,.92fr);gap:14px}.fd-trader-panel,.fd-trader-finder{min-width:0;padding:20px;border:1px solid rgba(255,255,255,.065);border-radius:15px;background:#0b0f13}.fd-trader-panel-head{margin-bottom:17px}.fd-trader-panel-head h2,.fd-trader-finder h2{margin:5px 0 6px;font-family:Georgia,serif;font-size:24px;font-weight:500}.fd-trader-panel-head p,.fd-trader-finder p{margin:0;color:#8f878d;font-size:12px}.fd-trader-browse,.fd-trader-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fd-trader-panel label{display:grid;gap:6px}.fd-trader-panel label>span{color:#968d93;font-size:10px;font-weight:800;letter-spacing:.08em}.fd-trader-panel input,.fd-trader-panel select,.fd-trader-panel textarea{width:100%;border:1px solid rgba(255,255,255,.085);border-radius:9px;outline:0;background:#080b0f;color:#e9e1db}.fd-trader-panel input,.fd-trader-panel select{height:42px;padding:0 11px}.fd-trader-panel textarea{min-height:74px;padding:10px 11px;resize:vertical}.fd-trader-panel input:focus,.fd-trader-panel select:focus,.fd-trader-panel textarea:focus{border-color:rgba(179,116,228,.42)}.fd-trader-search{margin-top:10px;display:grid;grid-template-columns:1fr auto;gap:8px}.fd-trader-search button,.fd-trader-primary{border:1px solid rgba(182,117,232,.35);border-radius:9px;background:linear-gradient(135deg,#6d3894,#492567);color:white;font-weight:900;letter-spacing:.08em;cursor:pointer}.fd-trader-search button{padding:0 17px}.fd-trader-context{min-height:34px;padding:11px 2px 7px;display:flex;gap:7px;align-items:center;color:#8f878e;font-size:10px}.fd-trader-context i{color:#5f5760;font-style:normal}.fd-trader-results{max-height:410px;display:grid;gap:6px;overflow:auto}.fd-trader-results>button{padding:11px 12px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;border:1px solid rgba(255,255,255,.055);border-radius:9px;background:#090c10;color:#cfc6cb;text-align:left;cursor:pointer}.fd-trader-results>button:hover,.fd-trader-results>button.selected{border-color:rgba(181,113,232,.3);background:rgba(98,48,133,.15)}.fd-trader-results>button div{display:grid;gap:3px}.fd-trader-results>button div:last-child{justify-items:end}.fd-trader-results b{font-size:12px}.fd-trader-results span,.fd-trader-results small{color:#80787e;font-size:10px}.fd-trader-empty{padding:30px 8px;color:#827b80;text-align:center}.fd-trader-select-prompt{min-height:320px;display:grid;place-items:center;align-content:center;gap:7px;text-align:center;color:#817980}.fd-trader-select-prompt>span{font-size:31px;color:#704d88}.fd-trader-select-prompt b{color:#c6bbc2}.fd-trader-select-prompt p{max-width:300px;margin:0;font-size:11px}.fd-trader-selected{margin-bottom:15px;padding:14px;display:grid;gap:4px;border:1px solid rgba(175,115,220,.18);border-radius:10px;background:rgba(87,42,118,.1)}.fd-trader-selected strong{font-size:14px}.fd-trader-selected span{color:#8c838a;font-size:10px}.fd-trader-form{display:grid;gap:12px}.fd-trader-methods{display:grid;gap:7px}.fd-trader-methods>span{color:#968d93;font-size:10px;font-weight:800;letter-spacing:.08em}.fd-trader-methods>div{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fd-trader-methods label{min-height:40px;padding:0 10px;display:flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:#090c10}.fd-trader-methods input{width:auto;height:auto}.fd-trader-primary{min-height:45px;margin-top:3px}.fd-trader-primary:disabled{opacity:.55;cursor:wait}.fd-trader-footnote{margin:0;color:#766f74;font-size:10px!important}.fd-trader-finder{padding:30px;min-height:350px}.fd-trader-finder>p{max-width:720px;margin-bottom:22px}.fd-trader-finder>div{padding:12px 0;display:flex;gap:12px;align-items:center;border-top:1px solid rgba(255,255,255,.055)}.fd-trader-finder>div span{width:27px;height:27px;display:grid;place-items:center;border:1px solid rgba(182,117,232,.23);border-radius:50%;color:#c092e0;font-size:10px}.fd-trader-finder>div b{font-size:12px;font-weight:650}
      @media(max-width:980px){.fd-trader-hero{align-items:flex-start;flex-direction:column}.fd-trader-grid{grid-template-columns:1fr}.fd-trader-pulse{white-space:normal}.fd-trader-results{max-height:300px}}
      @media(max-width:650px){.fd-trader-hero{padding:20px}.fd-trader-pulse{width:100%;justify-content:space-between}.fd-trader-actions,.fd-trader-status{grid-template-columns:1fr}.fd-trader-browse,.fd-trader-two{grid-template-columns:1fr}.fd-trader-panel{padding:15px}.fd-trader-results>button{grid-template-columns:1fr}.fd-trader-results>button div:last-child{justify-items:start;display:flex;gap:8px}}
    `}</style>
  </div>;
}

function TradeMethods({ local, postal, onLocal, onPostal }: { local: boolean; postal: boolean; onLocal: (value: boolean) => void; onPostal: (value: boolean) => void }) {
  return <div className="fd-trader-methods">
    <span>TRADE METHOD</span>
    <div>
      <label><input type="checkbox" checked={local} onChange={(event) => onLocal(event.target.checked)}/> Local trade</label>
      <label><input type="checkbox" checked={postal} onChange={(event) => onPostal(event.target.checked)}/> Postal trade</label>
    </div>
  </div>;
}
