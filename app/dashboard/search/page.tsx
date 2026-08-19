import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { searchSignalCatalogue, type SignalCatalogueOffer } from "@/lib/signal-engine-client";

export const metadata: Metadata = { title: "Search | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function gbp(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value)
    : "—";
}

function truePrice(offer: SignalCatalogueOffer) {
  if (typeof offer.price !== "number" || typeof offer.shippingGbp !== "number") return null;
  return offer.price + offer.shippingGbp;
}

function rrpContext(offer: SignalCatalogueOffer) {
  const delivered = truePrice(offer);
  if (delivered === null || typeof offer.rrpGbp !== "number" || offer.rrpGbp <= 0) return null;
  const difference = delivered - offer.rrpGbp;
  const percent = (difference / offer.rrpGbp) * 100;
  const sign = difference > 0 ? "+" : difference < 0 ? "−" : "";
  const percentSign = percent > 0 ? "+" : percent < 0 ? "−" : "";
  return `${sign}£${Math.abs(difference).toFixed(2)} · ${percentSign}${Math.abs(percent).toFixed(1)}% vs RRP`;
}

export default async function DashboardSearchPage({ searchParams }: { searchParams: Promise<{ q?: string; stock?: string; sort?: string }> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const stockOnly = params.stock !== "all";
  const sort = params.sort === "price" || params.sort === "title" ? params.sort : undefined;
  const result = q.length >= 2 ? await searchSignalCatalogue(q, { inStock: stockOnly, limit: 50, sort }) : null;
  const offers = result?.products ?? [];

  return (
    <DashboardPageShell title="Search" eyebrow="CANONICAL NETWORK SEARCH">
      <div className="fd-search-page">
        <section className="fd-dash-card fd-network-card fd-search-hero">
          <div className="fd-dash-card-head"><span>SEARCH THE FATEDROP NETWORK</span><i className={result ? "live" : "pending"}>{result ? "● CLOUD CONNECTED" : "○ SIGNAL ENGINE"}</i></div>
          <div className="fd-network-message"><h1>One query. The same catalogue network that powers signals.</h1><p>Search reads the canonical FateDrop Signal Engine catalogue instead of maintaining a separate dashboard search index. Stock, price and RRP context are observations from connected sources; the retailer checkout remains final confirmation.</p></div>
          <form action="/dashboard/search" method="get" className="fd-network-search-form">
            <label className="fd-dashboard-search"><span>⌕</span><input name="q" defaultValue={q} autoFocus aria-label="Search products" placeholder="Try: Elite Trainer Box, booster bundle, Charizard…" /></label>
            <label><span>STOCK</span><select name="stock" defaultValue={stockOnly ? "in" : "all"}><option value="in">Available only</option><option value="all">All observed stock</option></select></label>
            <label><span>SORT</span><select name="sort" defaultValue={sort ?? "recent"}><option value="recent">Most recent</option><option value="price">Item price</option><option value="title">Title</option></select></label>
            <button type="submit">SEARCH NETWORK →</button>
          </form>
        </section>

        <section className="fd-dash-card fd-search-results">
          <div className="fd-dash-card-head"><span>{q ? `RESULTS · ${q.toUpperCase()}` : "SEARCH STATUS"}</span><small>{result ? `${result.total} matching observed offers · ${result.count} shown` : q.length >= 2 ? "Cloud response unavailable" : "Enter at least 2 characters"}</small></div>
          {!q ? <div className="fd-dashboard-empty"><strong>Search for a product, set or format.</strong><span>The dashboard now queries the same Cloud catalogue model used by FateDrop network intelligence.</span></div> : q.length < 2 ? <div className="fd-dashboard-empty"><strong>Keep typing.</strong><span>Use at least two characters so FateDrop can resolve a useful network query.</span></div> : !result ? <div className="fd-dashboard-empty"><strong>The Signal Engine could not be reached.</strong><span>No fallback products are invented. Try again shortly or open the signal feed to check current network activity.</span><Link className="fd-dashboard-wide-button" href="/dashboard/alerts">Open signal feed →</Link></div> : offers.length ? <div className="fd-search-offers">{offers.map((offer) => {
            const delivered = truePrice(offer);
            const context = rrpContext(offer);
            return <article key={offer.id}>
              <div className="fd-search-offer-main"><span className="fd-search-offer-mark">◇</span><div><small>{offer.availability === "IN_STOCK" ? "● AVAILABLE" : offer.availability ?? "OBSERVED"} · {offer.retailer}</small><strong>{offer.title}</strong><p>{offer.category || "TCG product"}{offer.lastSeen ? ` · observed ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(offer.lastSeen))}` : ""}</p></div></div>
              <div className="fd-search-offer-price"><span><small>ITEM</small><b>{gbp(offer.price)}</b></span><span><small>RRP</small><b>{gbp(offer.rrpGbp)}</b></span><span><small>TRUE PRICE</small><b>{delivered !== null ? gbp(delivered) : typeof offer.price === "number" ? `${gbp(offer.price)} + delivery` : "—"}</b></span><span><small>DELIVERY</small><b>{typeof offer.shippingGbp === "number" ? offer.shippingGbp === 0 ? "FREE" : gbp(offer.shippingGbp) : "UNVERIFIED"}</b></span></div>
              <div className="fd-search-offer-foot"><span>{context ?? (typeof offer.rrpGbp === "number" ? "Delivered RRP comparison waits for verified delivery" : "Verified RRP reference unavailable")}</span><a href={offer.url} target="_blank" rel="noreferrer">VIEW AT {offer.retailer.toUpperCase()} ↗</a></div>
            </article>;
          })}</div> : <div className="fd-dashboard-empty"><strong>No matching observed offers.</strong><span>Try a broader product name or include sold-out observations. FateDrop does not pad empty results with sample products.</span></div>}
        </section>
      </div>
      <style>{`
        .fd-search-page{display:grid;gap:22px}.fd-search-hero,.fd-search-results{padding:28px}.fd-network-search-form{display:grid;grid-template-columns:minmax(260px,1fr) 150px 150px auto;gap:10px;align-items:end;margin-top:24px}.fd-network-search-form>label{display:grid;gap:6px}.fd-network-search-form>label>span{color:#696370;font-size:7px;font-weight:900;letter-spacing:.12em}.fd-network-search-form select{height:46px;padding:0 11px;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:#0b0a10;color:#d9d4df}.fd-network-search-form button{height:46px;padding:0 17px;border:1px solid rgba(104,232,251,.24);border-radius:12px;background:linear-gradient(135deg,rgba(104,232,251,.1),rgba(157,109,255,.12));color:#fff;font-size:9px;font-weight:900;letter-spacing:.08em}.fd-dashboard-search{height:46px;margin:0!important}.fd-search-offers{display:grid;gap:10px;margin-top:18px}.fd-search-offers article{padding:16px;border:1px solid rgba(255,255,255,.075);border-radius:16px;background:radial-gradient(circle at 100% 0%,rgba(157,109,255,.05),transparent 28%),rgba(255,255,255,.018)}.fd-search-offer-main{display:grid;grid-template-columns:42px 1fr;gap:12px;align-items:center}.fd-search-offer-mark{width:40px;height:55px;display:grid;place-items:center;border:1px solid rgba(104,232,251,.18);border-radius:7px;color:#9eefff;background:rgba(104,232,251,.03)}.fd-search-offer-main small{color:#71e8ae;font-size:7px;font-weight:900;letter-spacing:.1em}.fd-search-offer-main strong{display:block;margin:4px 0;font-size:14px}.fd-search-offer-main p{margin:0;color:#77717e;font-size:9px}.fd-search-offer-price{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:13px 0}.fd-search-offer-price span{padding:9px;border:1px solid rgba(255,255,255,.055);border-radius:10px;background:rgba(0,0,0,.14)}.fd-search-offer-price small{display:block;color:#625c69;font-size:6px;font-weight:900;letter-spacing:.1em}.fd-search-offer-price b{font-size:10px}.fd-search-offer-foot{display:flex;align-items:center;justify-content:space-between;gap:15px}.fd-search-offer-foot>span{color:#827b89;font-size:8px}.fd-search-offer-foot>a{padding:8px 11px;border:1px solid rgba(157,109,255,.22);border-radius:9px;color:#d7c7ff;font-size:8px;font-weight:900;text-decoration:none}@media(max-width:1050px){.fd-network-search-form{grid-template-columns:1fr 1fr}.fd-dashboard-search{grid-column:1/-1}.fd-network-search-form button{align-self:end}}@media(max-width:700px){.fd-network-search-form{grid-template-columns:1fr}.fd-dashboard-search{grid-column:auto}.fd-search-offer-price{grid-template-columns:1fr 1fr}.fd-search-offer-foot{align-items:flex-start;flex-direction:column}}@media(max-width:450px){.fd-search-offer-price{grid-template-columns:1fr}}
      `}</style>
    </DashboardPageShell>
  );
}
