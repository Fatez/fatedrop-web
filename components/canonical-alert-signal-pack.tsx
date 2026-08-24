import Link from "next/link";
import type { CSSProperties } from "react";
import type { CanonicalAlert, CanonicalOfferLink, CanonicalSignalStage, CanonicalSignalThreadEntry } from "@/lib/canonical-alerts";
import { moneyFromPence, relativeTime } from "@/lib/dashboard";

const panel: CSSProperties = {
  gridColumn: "1 / -1",
  borderTop: "1px solid rgba(255,255,255,.07)",
  paddingTop: 12,
  marginTop: 2,
};

const action: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "9px 11px",
  border: "1px solid rgba(116,225,244,.16)",
  borderRadius: 9,
  color: "#a8f1ff",
  fontSize: 7,
  fontWeight: 900,
  textDecoration: "none",
  letterSpacing: ".05em",
};

function companionForStage(stage: CanonicalSignalStage) {
  if (stage === "WHISPER") return "ORU";
  if (stage === "ECHO") return "FENN";
  if (stage === "MANIFESTED") return "KORU";
  if (stage === "VANISHED") return "NYXEN";
  return "FATEDROP";
}

function offerPrice(offer: CanonicalOfferLink) {
  if (offer.deliveredPricePence != null) return `${moneyFromPence(offer.deliveredPricePence)} delivered`;
  if (offer.itemPricePence != null) return `${moneyFromPence(offer.itemPricePence)} item · delivery unknown`;
  return "Price unavailable";
}

function threadColor(entry: CanonicalSignalThreadEntry) {
  if (entry.fateStage === "WHISPER") return "#73e9fb";
  if (entry.fateStage === "ECHO") return "#b397ff";
  if (entry.fateStage === "MANIFESTED") return "#62e9b1";
  if (entry.fateStage === "VANISHED") return "#ff7582";
  return "#8b8591";
}

function packSummary(alert: CanonicalAlert) {
  const alternatives = alert.preparedLinks.alternatives.length;
  const companion = companionForStage(alert.fateStage);
  if (alert.fateStage === "WHISPER") return `${companion} · WHISPER · PRODUCT MOVEMENT · ${alert.signalThread.length} UPDATE${alert.signalThread.length === 1 ? "" : "S"}`;
  if (alert.fateStage === "ECHO") return `${companion} · ECHO · GET READY · ${alert.signalThread.length} UPDATE${alert.signalThread.length === 1 ? "" : "S"}`;
  if (alert.fateStage === "VANISHED") return `${companion} · VANISHED · ${alternatives} LIVE ALTERNATIVE${alternatives === 1 ? "" : "S"}`;
  return `${companion} · MANIFESTED · CONFIRMED · ${alternatives + 1} READY LINK${alternatives ? "S" : ""}`;
}

function explainer(alert: CanonicalAlert) {
  if (alert.fateStage === "WHISPER") return "Oru spotted it: Catalogue or product movement has been detected. FateDrop has prepared the product and comparison routes, but stock is not confirmed.";
  if (alert.fateStage === "ECHO") return "Fenn picked it up: Queue, traffic, security or access readiness has changed. Get ready; stock is still not confirmed.";
  if (alert.fateStage === "VANISHED") return "Nyxen saw this previously verified availability disappear. Use the live alternatives below when FateDrop still sees the same canonical product elsewhere.";
  return "Koru found confirmed purchasable availability. Open the retailer, compare the network, or inspect another live offer.";
}

export function CanonicalAlertSignalPack({ alert, now }: { alert: CanonicalAlert; now: number }) {
  const pack = alert.preparedLinks;
  const lowest = pack.lowestKnown?.offerId !== pack.primary.offerId ? pack.lowestKnown : null;
  const official = pack.officialReference?.url !== pack.primary.url ? pack.officialReference : null;
  const compareHref = `/dashboard/search?q=${encodeURIComponent(pack.compareQuery)}&stock=in&sort=price`;
  const fateFindHref = `/dashboard/watchlist?q=${encodeURIComponent(pack.fateFindQuery)}`;
  const primaryEarly = alert.fateStage === "WHISPER" || alert.fateStage === "ECHO";

  return <details style={panel}>
    <summary style={{ cursor: "pointer", color: "#9beeff", fontSize: 8, fontWeight: 900, letterSpacing: ".08em", listStylePosition: "inside" }}>{packSummary(alert)}</summary>
    <div style={{ display: "grid", gap: 12, paddingTop: 12 }}>
      <p style={{ margin: 0, color: "#837c89", fontSize: 9, lineHeight: 1.55 }}>{explainer(alert)}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        <a href={pack.primary.url} target="_blank" rel="noreferrer" style={{ ...action, borderColor: alert.fateStage === "MANIFESTED" ? "rgba(98,233,177,.28)" : primaryEarly ? "rgba(179,151,255,.28)" : "rgba(116,225,244,.16)", color: alert.fateStage === "MANIFESTED" ? "#8ff2ca" : primaryEarly ? "#cbb8ff" : "#a8f1ff" }}>{pack.primary.label} ↗</a>
        <Link href={compareHref} style={action}>COMPARE ALL OFFERS →</Link>
        <Link href={fateFindHref} style={action}>CREATE FATEFIND →</Link>
        {official ? <a href={official.url} target="_blank" rel="noreferrer" style={action}>OFFICIAL / RRP REFERENCE ↗</a> : null}
      </div>

      {lowest ? <a href={lowest.url} target="_blank" rel="noreferrer" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: 11, border: "1px solid rgba(98,233,177,.23)", borderRadius: 11, background: "rgba(98,233,177,.035)", textDecoration: "none" }}><span><b style={{ display: "block", color: "#62e9b1", fontSize: 7, letterSpacing: ".09em" }}>LOWEST KNOWN LINK READY</b><strong style={{ display: "block", color: "#f4f1f7", fontSize: 10, marginTop: 3 }}>{lowest.retailer}</strong><small style={{ color: "#77717e", fontSize: 8 }}>{offerPrice(lowest)}</small></span><span style={{ color: "#62e9b1", fontSize: 11 }}>↗</span></a> : null}

      {alert.signalThread.length ? <section style={{ display: "grid", gap: 6 }}><b style={{ color: "#6f6875", fontSize: 7, letterSpacing: ".1em" }}>SIGNAL TRAIL</b>{alert.signalThread.map((entry) => <div key={entry.id} style={{ display: "grid", gridTemplateColumns: "9px 110px minmax(0,1fr)", gap: 8, padding: "7px 8px", borderRadius: 9, background: entry.id === alert.id ? "rgba(115,233,251,.035)" : "transparent" }}><i style={{ width: 6, height: 6, marginTop: 3, borderRadius: "50%", background: threadColor(entry), boxShadow: `0 0 10px ${threadColor(entry)}` }}/><span style={{ color: threadColor(entry), fontSize: 7, fontWeight: 900, letterSpacing: ".06em" }}>{companionForStage(entry.fateStage)} · {entry.fateStage}<small style={{ display: "block", color: "#68616e", fontSize: 6, fontWeight: 500, marginTop: 2 }}>{relativeTime(Math.floor(new Date(entry.occurredAt).getTime() / 1000), now)}</small></span><span><strong style={{ display: "block", color: "#d8d3dd", fontSize: 8 }}>{entry.reason || "Network state changed"}</strong><small style={{ color: "#716a77", fontSize: 7 }}>{entry.retailer}{entry.pricePence == null ? "" : ` · ${moneyFromPence(entry.pricePence)}`}{entry.id === alert.id ? " · CURRENT ALERT" : ""}</small></span></div>)}</section> : null}

      {pack.alternatives.length ? <section style={{ display: "grid", gap: 6 }}><b style={{ color: "#6f6875", fontSize: 7, letterSpacing: ".1em" }}>{alert.fateStage === "VANISHED" ? "STILL LIVE ELSEWHERE" : "OTHER LIVE OFFERS"}</b><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 6 }}>{pack.alternatives.slice(0, 8).map((alternative) => <a key={alternative.offerId} href={alternative.url} target="_blank" rel="noreferrer" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, padding: 10, border: "1px solid rgba(255,255,255,.065)", borderRadius: 10, background: "rgba(255,255,255,.015)", textDecoration: "none" }}><span><strong style={{ display: "block", color: "#eeeaf2", fontSize: 9 }}>{alternative.retailer}</strong><small style={{ color: "#756e7b", fontSize: 7 }}>{offerPrice(alternative)} · {alternative.stockStatus || "observed"}</small></span><span style={{ color: "#b397ff" }}>↗</span></a>)}</div></section> : null}
    </div>
  </details>;
}