import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { searchSignalTruePrice } from "@/lib/signal-engine-client";

export const metadata: Metadata = { title: "True Price | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function gbp(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value)
    : "—";
}

export default async function DashboardTruePricePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const result = q.length >= 2 ? await searchSignalTruePrice(q) : null;
  const groups = result?.groups ?? [];

  return <DashboardPageShell title="True Price" eyebrow="CANONICAL PRICE EVIDENCE">
    <div className="fd-true-price-page">
      <section className="fd-dash-card fd-true-price-hero">
        <div className="fd-dash-card-head"><span>TRUE PRICE · BETA</span><i className={result ? "live" : "pending"}>{result ? "● CLOUD CONNECTED" : "○ SIGNAL ENGINE"}</i></div>
        <div className="fd-network-message"><h1>The cheapest sticker price is not always the cheapest purchase.</h1><p>True Price compares connected offers using the canonical FateDrop Cloud network. Item price and mandatory delivery remain separate, and an offer is only given a delivered total when delivery is actually known.</p></div>
        <form action="/dashboard/true-price" method="get" className="fd-tp-search">
          <label className="fd-dashboard-search"><span>⌕</span><input name="q" defaultValue={q} autoFocus aria-label="Compare a product" placeholder="Try: Destined Rivals ETB" /></label>
          <button type="submit">COMPARE OFFERS →</button>
        </form>
        <div className="fd-tp-rules"><span><b>ITEM PRICE</b>Never confused with checkout total</span><span><b>DELIVERY</b>Unknown stays unknown</span><span><b>TRUE PRICE</b>Only shown from known mandatory cost</span></div>
      </section>

      <section className="fd-dash-card fd-tp-results">
        <div className="fd-dash-card-head"><span>{q ? `COMPARE · ${q.toUpperCase()}` : "COMPARE OFFERS"}</span><small>{result ? `${result.count} product group${result.count === 1 ? "" : "s"}` : q.length >= 2 ? "Cloud response unavailable" : "Enter a product above"}</small></div>
        {!q ? <div className="fd-dashboard-empty"><strong>Search once. Compare the network.</strong><span>True Price is now using the same canonical offer network as FateDrop Search rather than a separate Shopify lab feed.</span></div> : q.length < 2 ? <div className="fd-dashboard-empty"><strong>Keep typing.</strong><span>Use at least two characters so FateDrop can resolve a meaningful comparison.</span></div> : !result ? <div className="fd-dashboard-empty"><strong>The Signal Engine could not be reached.</strong><span>No sample prices or fallback retailers are invented.</span></div> : groups.length ? <div className="fd-tp-groups">{groups.map((group) => <article className="fd-tp-group" key={group.id}>
          <header><div><small>{group.category} · {group.retailerCount} RETAILER{group.retailerCount === 1 ? "" : "S"}</small><h2>{group.title}</h2></div><span>{Math.round(group.matchingConfidence * 100)}% identity confidence</span></header>
          <div className="fd-tp-offers">{[...group.offers].sort((a, b) => {
            if (a.deliveryKnown !== b.deliveryKnown) return a.deliveryKnown ? -1 : 1;
            return (a.totalDeliveredGbp ?? a.priceGbp ?? Infinity) - (b.totalDeliveredGbp ?? b.priceGbp ?? Infinity);
          }).map((offer) => <div className={offer.isLowestKnownDelivered ? "fd-tp-offer best" : "fd-tp-offer"} key={offer.id}>
            <div><small>{offer.isLowestKnownDelivered ? "LOWEST KNOWN DELIVERED" : offer.stockStatus.replaceAll("_", " ")}</small><strong>{offer.retailerName}</strong><span>{offer.lastCheckedAt ? `Checked ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(offer.lastCheckedAt))}` : "Observed network offer"}</span></div>
            <div className="fd-tp-cost"><span><small>ITEM</small><b>{gbp(offer.priceGbp)}</b></span><span><small>DELIVERY</small><b>{offer.deliveryKnown ? offer.shippingGbp === 0 ? "FREE" : gbp(offer.shippingGbp) : "UNKNOWN"}</b></span><span><small>TRUE PRICE</small><b>{offer.deliveryKnown ? gbp(offer.totalDeliveredGbp) : "—"}</b></span></div>
            <a href={offer.productUrl} target="_blank" rel="noreferrer">BUY AT RETAILER ↗</a>
          </div>)}</div>
          <footer><Link href={`/dashboard/watchlist?q=${encodeURIComponent(group.title)}`}>CREATE FATEFIND →</Link><Link href={`/dashboard/search?q=${encodeURIComponent(group.title)}`}>OPEN NETWORK SEARCH →</Link></footer>
        </article>)}</div> : <div className="fd-dashboard-empty"><strong>No live comparable offers found.</strong><span>FateDrop will not invent a comparison when the Cloud network has no qualifying observed offers.</span><Link className="fd-dashboard-wide-button" href={`/dashboard/watchlist?q=${encodeURIComponent(q)}`}>Create a FateFind for this product →</Link></div>}
        {result?.disclaimer ? <p className="fd-tp-disclaimer">{result.disclaimer}</p> : null}
      </section>

      <section className="fd-dash-card fd-tp-note"><div><span>FATEWINDOW · HOLD / EXPERIMENTAL</span><h2>True Price is the launch feature. Timing advice is not.</h2></div><p>FateWindow remains in the codebase as an experiment, but it is no longer a primary dashboard promise. RRP, delivered cost and evidence-backed Drop Pulse can communicate useful context without manufacturing a “buy now” instruction.</p></section>
    </div>
    <style>{`
      .fd-true-price-page{display:grid;gap:22px}.fd-true-price-hero,.fd-tp-results{padding:28px}.fd-true-price-hero{background:radial-gradient(circle at 90% 0%,rgba(88,232,255,.09),transparent 26%),radial-gradient(circle at 74% 22%,rgba(157,109,255,.11),transparent 32%),#0a090f}.fd-true-price-hero .fd-network-message h1{max-width:900px;font-size:clamp(2.2rem,4vw,4.5rem);line-height:.94}.fd-tp-search{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-top:24px}.fd-tp-search .fd-dashboard-search{height:48px;margin:0}.fd-tp-search button{height:48px;padding:0 18px;border:1px solid rgba(88,232,255,.24);border-radius:12px;background:linear-gradient(135deg,rgba(88,232,255,.09),rgba(157,109,255,.13));color:#fff;font-size:9px;font-weight:900;letter-spacing:.08em}.fd-tp-rules{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}.fd-tp-rules span{padding:12px;border:1px solid rgba(255,255,255,.06);border-radius:11px;color:#7d7684;font-size:9px}.fd-tp-rules b{display:block;margin-bottom:4px;color:#bdf5ff;font-size:7px;letter-spacing:.1em}.fd-tp-groups{display:grid;gap:16px;margin-top:18px}.fd-tp-group{overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:#0b0a10}.fd-tp-group>header{display:flex;justify-content:space-between;gap:20px;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.06)}.fd-tp-group>header small{color:#73e9fb;font-size:7px;font-weight:900;letter-spacing:.11em}.fd-tp-group h2{margin:5px 0 0;font-size:18px}.fd-tp-group>header>span{color:#746e7b;font-size:8px}.fd-tp-offers{display:grid;gap:1px;background:#19161e}.fd-tp-offer{display:grid;grid-template-columns:minmax(180px,1fr) minmax(300px,.9fr) auto;gap:16px;align-items:center;padding:16px 20px;background:#0b0a10}.fd-tp-offer.best{background:linear-gradient(90deg,rgba(86,232,177,.055),#0b0a10 42%)}.fd-tp-offer>div:first-child small{display:block;color:#8b8491;font-size:6px;font-weight:900;letter-spacing:.1em}.fd-tp-offer.best>div:first-child small{color:#71e8ae}.fd-tp-offer>div:first-child strong{display:block;margin:4px 0;font-size:13px}.fd-tp-offer>div:first-child span{color:#6f6975;font-size:8px}.fd-tp-cost{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.fd-tp-cost span{padding:8px;border:1px solid rgba(255,255,255,.055);border-radius:9px;background:rgba(0,0,0,.15)}.fd-tp-cost small{display:block;color:#625c69;font-size:6px;font-weight:900;letter-spacing:.08em}.fd-tp-cost b{font-size:9px}.fd-tp-offer>a{padding:9px 11px;border:1px solid rgba(157,109,255,.2);border-radius:9px;color:#d9cbff;font-size:7px;font-weight:900;text-decoration:none}.fd-tp-group>footer{display:flex;gap:8px;padding:12px 20px;border-top:1px solid rgba(255,255,255,.06)}.fd-tp-group>footer a{color:#9eefff;font-size:8px;font-weight:900;text-decoration:none}.fd-tp-disclaimer{margin:16px 0 0;color:#716b78;font-size:9px}.fd-tp-note{display:grid;grid-template-columns:.8fr 1.2fr;gap:30px;align-items:center;padding:24px 28px}.fd-tp-note span{color:#b28cff;font-size:8px;font-weight:900;letter-spacing:.13em}.fd-tp-note h2{margin:7px 0 0;font-size:22px}.fd-tp-note p{margin:0;color:#8d8794;font-size:11px;line-height:1.6}@media(max-width:900px){.fd-tp-offer{grid-template-columns:1fr}.fd-tp-note{grid-template-columns:1fr}.fd-tp-rules{grid-template-columns:1fr}.fd-tp-group>header{flex-direction:column}}@media(max-width:650px){.fd-tp-search{grid-template-columns:1fr}.fd-tp-cost{grid-template-columns:1fr}.fd-true-price-hero,.fd-tp-results{padding:20px}}
    `}</style>
  </DashboardPageShell>;
}
