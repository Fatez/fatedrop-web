import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { ValueCompare } from "@/components/value-compare";
import { searchSignalTruePrice, type SignalTruePriceGroup } from "@/lib/signal-engine-client";

export const metadata: Metadata = { title: "True Price | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function gbp(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value)
    : "—";
}

function rrpDelta(price: number | undefined, rrp: number | undefined) {
  if (typeof price !== "number" || typeof rrp !== "number" || !Number.isFinite(price) || !Number.isFinite(rrp) || rrp <= 0) return null;
  const difference = price - rrp;
  const percent = (difference / rrp) * 100;
  const prefix = difference > 0 ? "+" : difference < 0 ? "−" : "";
  const percentPrefix = percent > 0 ? "+" : percent < 0 ? "−" : "";
  return `${prefix}£${Math.abs(difference).toFixed(2)} · ${percentPrefix}${Math.abs(percent).toFixed(1)}%`;
}

function sourceLabel(group: SignalTruePriceGroup) {
  if (group.rrpKind === "component_reference") return `Component RRP reference · ${group.rrpReferenceBasis ?? "verified unit basis"}`;
  if (group.rrpKind === "pack_reference") return `Pack RRP reference · ${group.rrpReferenceBasis ?? "verified set pack"}`;
  if (!group.rrpSource) return "RRP source unavailable";
  if (group.rrpSource === "pokemon-center-uk") return "Pokémon Center UK observed RRP";
  return `Observed RRP source: ${group.rrpSource}`;
}

function rrpHeading(group: SignalTruePriceGroup) {
  if (group.rrpKind === "component_reference") return "REFERENCE RRP";
  if (group.rrpKind === "pack_reference") return "PACK RRP REFERENCE";
  return "RRP";
}

export default async function DashboardTruePricePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const result = q.length >= 2 ? await searchSignalTruePrice(q) : null;
  const groups = result?.groups ?? [];

  return <DashboardPageShell title="True Price" eyebrow="CANONICAL PRICE EVIDENCE">
    <div className="fd-true-price-page">
      <section className="fd-dash-card fd-true-price-hero">
        <div className="fd-dash-card-head"><span>TRUE PRICE · VALUE INTELLIGENCE</span><i className={result ? "live" : "pending"}>{result ? "● CLOUD CONNECTED" : "○ SIGNAL ENGINE"}</i></div>
        <div className="fd-network-message"><h1>What costs less is not always the better deal.</h1><p>FateDrop uses the same canonical offer network for Search and True Price, while separating checkout cost from value. True Price tells you what you actually pay when delivery is known; verified RRP or a clearly-labelled component reference tells you how expensive that product is relative to what you are actually getting.</p></div>
        <form action="/dashboard/true-price" method="get" className="fd-tp-search">
          <label className="fd-dashboard-search"><span>⌕</span><input name="q" defaultValue={q} autoFocus aria-label="Compare a product" placeholder="Try: Destined Rivals" /></label>
          <button type="submit">COMPARE VALUE →</button>
        </form>
        <div className="fd-tp-rules"><span><b>RRP / REFERENCE %</b>Item price against the verified value baseline</span><span><b>TRUE PRICE</b>Item + known mandatory delivery</span><span><b>PER PACK / UNIT</b>Shown only when composition is provable</span></div>
      </section>

      <section className="fd-dash-card fd-tp-results">
        <div className="fd-dash-card-head"><span>{q ? `COMPARE · ${q.toUpperCase()}` : "COMPARE OFFERS"}</span><small>{result ? `${result.count} product group${result.count === 1 ? "" : "s"}` : q.length >= 2 ? "Cloud response unavailable" : "Enter a product above"}</small></div>
        {!q ? <div className="fd-dashboard-empty"><strong>Search once. Compare value across the network.</strong><span>FateDrop compares RRP/reference position as well as the checkout cost, so a 4-pack and 10-pack can be judged on what they actually represent rather than sticker price alone.</span></div> : q.length < 2 ? <div className="fd-dashboard-empty"><strong>Keep typing.</strong><span>Use at least two characters so FateDrop can resolve a meaningful comparison.</span></div> : !result ? <div className="fd-dashboard-empty"><strong>The Signal Engine could not be reached.</strong><span>No sample prices or fallback retailers are invented.</span></div> : groups.length ? <>
          <ValueCompare groups={groups} />
          <div className="fd-tp-groups">{groups.map((group) => <article className="fd-tp-group" key={group.id}>
            <header><div><small>{group.category} · {group.retailerCount} RETAILER{group.retailerCount === 1 ? "" : "S"}</small><h2>{group.title}</h2><p>{typeof group.rrpGbp === "number" ? `${rrpHeading(group)} ${gbp(group.rrpGbp)} · ${sourceLabel(group)}${group.rrpObservedAt ? ` · observed ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(group.rrpObservedAt))}` : ""}` : "Verified RRP/reference unavailable for this product identity"}</p></div><span>{Math.round(group.matchingConfidence * 100)}% identity confidence</span></header>
            <div className="fd-tp-offers">{[...group.offers].sort((a, b) => {
              if (a.deliveryKnown !== b.deliveryKnown) return a.deliveryKnown ? -1 : 1;
              return (a.totalDeliveredGbp ?? a.priceGbp ?? Infinity) - (b.totalDeliveredGbp ?? b.priceGbp ?? Infinity);
            }).map((offer) => {
              const delta = rrpDelta(offer.priceGbp, group.rrpGbp);
              return <div className={offer.isLowestKnownDelivered ? "fd-tp-offer best" : "fd-tp-offer"} key={offer.id}>
                <div><small>{offer.isLowestKnownDelivered ? "LOWEST KNOWN DELIVERED" : offer.stockStatus.replaceAll("_", " ")}</small><strong>{offer.retailerName}</strong><span>{offer.lastCheckedAt ? `Checked ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(offer.lastCheckedAt))}` : "Observed network offer"}</span></div>
                <div className="fd-tp-cost"><span><small>ITEM</small><b>{gbp(offer.priceGbp)}</b></span><span><small>DELIVERY</small><b>{offer.deliveryKnown ? offer.shippingGbp === 0 ? "FREE" : gbp(offer.shippingGbp) : "UNKNOWN"}</b></span><span><small>TRUE PRICE</small><b>{offer.deliveryKnown ? gbp(offer.totalDeliveredGbp) : "—"}</b></span><span><small>VS RRP / REF</small><b>{delta ?? "RRP UNKNOWN"}</b><em>{delta ? "ITEM PRICE VS VALUE BASELINE" : ""}</em></span></div>
                <a href={offer.productUrl} target="_blank" rel="noreferrer">BUY AT RETAILER ↗</a>
              </div>;
            })}</div>
            <footer><Link href={`/dashboard/watchlist?q=${encodeURIComponent(group.title)}`}>CREATE FATEFIND →</Link><Link href={`/dashboard/search?q=${encodeURIComponent(group.title)}`}>OPEN NETWORK SEARCH →</Link></footer>
          </article>)}</div>
        </> : <div className="fd-dashboard-empty"><strong>No live comparable offers found.</strong><span>FateDrop will not invent a comparison when the Cloud network has no qualifying observed offers.</span><Link className="fd-dashboard-wide-button" href={`/dashboard/watchlist?q=${encodeURIComponent(q)}`}>Create a FateFind for this product →</Link></div>}
        {result?.disclaimer ? <p className="fd-tp-disclaimer">{result.disclaimer}</p> : null}
      </section>

      <section className="fd-dash-card fd-tp-note"><div><span>FATEWINDOW · HOLD / EXPERIMENTAL</span><h2>RRP position and True Price answer different questions.</h2></div><p>RRP/reference percentage compares the observed item price with the verified value baseline. True Price separately tells you the real checkout cost with known delivery. FateDrop keeps both visible so a larger bundle cannot look “worse” merely because its sticker price is higher. FateWindow remains held as an experiment rather than being presented as launch advice.</p></section>
    </div>
    <style>{`
      .fd-true-price-page{display:grid;gap:22px}.fd-true-price-hero,.fd-tp-results{padding:28px}.fd-true-price-hero{background:radial-gradient(circle at 90% 0%,rgba(88,232,255,.09),transparent 26%),radial-gradient(circle at 74% 22%,rgba(157,109,255,.11),transparent 32%),#0a090f}.fd-true-price-hero .fd-network-message h1{max-width:900px;font-size:clamp(2.2rem,4vw,4.5rem);line-height:.94}.fd-tp-search{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-top:24px}.fd-tp-search .fd-dashboard-search{height:48px;margin:0}.fd-tp-search button{height:48px;padding:0 18px;border:1px solid rgba(88,232,255,.24);border-radius:12px;background:linear-gradient(135deg,rgba(88,232,255,.09),rgba(157,109,255,.13));color:#fff;font-size:9px;font-weight:900;letter-spacing:.08em}.fd-tp-rules{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}.fd-tp-rules span{padding:12px;border:1px solid rgba(255,255,255,.06);border-radius:11px;color:#7d7684;font-size:9px}.fd-tp-rules b{display:block;margin-bottom:4px;color:#bdf5ff;font-size:7px;letter-spacing:.1em}.fd-tp-groups{display:grid;gap:16px;margin-top:18px}.fd-tp-group{overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:#0b0a10}.fd-tp-group>header{display:flex;justify-content:space-between;gap:20px;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.06)}.fd-tp-group>header small{color:#73e9fb;font-size:7px;font-weight:900;letter-spacing:.11em}.fd-tp-group h2{margin:5px 0 0;font-size:18px}.fd-tp-group>header p{margin:6px 0 0;color:#817a88;font-size:8px}.fd-tp-group>header>span{color:#746e7b;font-size:8px}.fd-tp-offers{display:grid;gap:1px;background:#19161e}.fd-tp-offer{display:grid;grid-template-columns:minmax(180px,1fr) minmax(390px,1.15fr) auto;gap:16px;align-items:center;padding:16px 20px;background:#0b0a10}.fd-tp-offer.best{background:linear-gradient(90deg,rgba(86,232,177,.055),#0b0a10 42%)}.fd-tp-offer>div:first-child small{display:block;color:#8b8491;font-size:6px;font-weight:900;letter-spacing:.1em}.fd-tp-offer.best>div:first-child small{color:#71e8ae}.fd-tp-offer>div:first-child strong{display:block;margin:4px 0;font-size:13px}.fd-tp-offer>div:first-child span{color:#6f6975;font-size:8px}.fd-tp-cost{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.fd-tp-cost span{padding:8px;border:1px solid rgba(255,255,255,.055);border-radius:9px;background:rgba(0,0,0,.15)}.fd-tp-cost small{display:block;color:#625c69;font-size:6px;font-weight:900;letter-spacing:.08em}.fd-tp-cost b{font-size:9px}.fd-tp-cost em{display:block;margin-top:3px;color:#746d7b;font-size:6px;font-style:normal}.fd-tp-offer>a{padding:9px 11px;border:1px solid rgba(157,109,255,.2);border-radius:9px;color:#d9cbff;font-size:7px;font-weight:900;text-decoration:none}.fd-tp-group>footer{display:flex;gap:8px;padding:12px 20px;border-top:1px solid rgba(255,255,255,.06)}.fd-tp-group>footer a{color:#9eefff;font-size:8px;font-weight:900;text-decoration:none}.fd-tp-disclaimer{margin:16px 0 0;color:#716b78;font-size:9px}.fd-tp-note{display:grid;grid-template-columns:.8fr 1.2fr;gap:30px;align-items:center;padding:24px 28px}.fd-tp-note span{color:#b28cff;font-size:8px;font-weight:900;letter-spacing:.13em}.fd-tp-note h2{margin:7px 0 0;font-size:22px}.fd-tp-note p{margin:0;color:#8d8794;font-size:11px;line-height:1.6}@media(max-width:1050px){.fd-tp-offer{grid-template-columns:1fr}.fd-tp-cost{grid-template-columns:repeat(2,1fr)}}@media(max-width:900px){.fd-tp-note{grid-template-columns:1fr}.fd-tp-rules{grid-template-columns:1fr}.fd-tp-group>header{flex-direction:column}}@media(max-width:650px){.fd-tp-search{grid-template-columns:1fr}.fd-tp-cost{grid-template-columns:1fr}.fd-true-price-hero,.fd-tp-results{padding:20px}}
    `}</style>
  </DashboardPageShell>;
}
