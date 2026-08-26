"use client";

import { useCallback, useEffect, useState } from "react";
import { FateTraderAudit } from "@/components/fate-trader-audit";

type Availability = "checking" | "ready" | "unavailable";

async function checkTraderAvailability() {
  try {
    const response = await fetch("/api/trader/card-series?tcg=pokemon", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return false;
    const payload = await response.json() as { ok?: boolean };
    return payload.ok === true;
  } catch {
    return false;
  }
}

export function FateTraderSurface() {
  const [availability, setAvailability] = useState<Availability>("checking");

  const check = useCallback(async () => {
    setAvailability("checking");
    setAvailability(await checkTraderAvailability() ? "ready" : "unavailable");
  }, []);

  useEffect(() => { void check(); }, [check]);

  if (availability === "checking") {
    return <section className="fd-dash-card fd-trader-product-state" aria-live="polite">
      <small>FATE TRADER</small>
      <h1>Connecting to the verified card catalogue…</h1>
      <p>FateDrop is checking the shared Cloud Trader service before showing trade actions.</p>
      <style>{styles}</style>
    </section>;
  }

  if (availability === "unavailable") {
    return <section className="fd-dash-card fd-trader-product-state" aria-live="polite">
      <small>FATE TRADER · PREPARING</small>
      <h1>Verified trading data is not available right now.</h1>
      <p>Fate Trader only opens when the shared card catalogue and trade service are responding correctly. No demo cards, fake matches or raw backend errors are shown while that verified data is unavailable.</p>
      <button type="button" onClick={() => void check()}>TRY AGAIN</button>
      <style>{styles}</style>
    </section>;
  }

  return <FateTraderAudit />;
}

const styles = `.fd-trader-product-state{max-width:980px;padding:34px;background:radial-gradient(circle at 90% 8%,rgba(126,87,143,.12),transparent 30%),linear-gradient(145deg,#101419,#090d11 72%)}.fd-trader-product-state small{color:#b6977d;font-size:9px;font-weight:900;letter-spacing:.14em}.fd-trader-product-state h1{max-width:760px;margin:10px 0 8px;color:#e9dfd8;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2rem,4vw,3.4rem);font-weight:500;line-height:1}.fd-trader-product-state p{max-width:760px;margin:0;color:#958e97;font-size:11px;line-height:1.7}.fd-trader-product-state button{margin-top:18px;appearance:none;border:1px solid rgba(183,119,233,.22);border-radius:10px;background:rgba(183,119,233,.08);color:#d6b7ed;padding:10px 13px;font:inherit;font-size:8px;font-weight:900;cursor:pointer}`;
