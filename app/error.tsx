"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("FateDrop route error", error.digest ?? error.name);
  }, [error]);

  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#07070b", color: "#fff" }}>
    <section style={{ width: "min(620px,100%)", padding: 28, border: "1px solid rgba(255,255,255,.09)", borderRadius: 20, background: "#0b0a10" }}>
      <small style={{ color: "#76eaff", fontWeight: 800, letterSpacing: ".14em" }}>FATEDROP // RECOVERY</small>
      <h1 style={{ margin: "10px 0", fontSize: "clamp(2rem,6vw,3.8rem)", lineHeight: .95 }}>That view did not resolve.</h1>
      <p style={{ color: "#9993a0", lineHeight: 1.65 }}>Your account or network data has not been replaced with fake fallback content. Retry the view; if the upstream service is still unavailable, FateDrop will keep the last valid persisted state where that feature supports it.</p>
      <button type="button" onClick={reset} style={{ marginTop: 14, minHeight: 42, padding: "0 15px", border: "1px solid rgba(118,234,255,.25)", borderRadius: 11, background: "rgba(118,234,255,.07)", color: "#fff", fontWeight: 800 }}>TRY AGAIN →</button>
      {error.digest ? <p style={{ marginTop: 14, color: "#696370", fontSize: 11 }}>Reference: {error.digest}</p> : null}
    </section>
  </main>;
}
