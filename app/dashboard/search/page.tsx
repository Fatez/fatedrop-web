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

function rrpName(offer: SignalCatalogueOffer) {
  if (offer.rrpKind === "component_reference") return "REFERENCE RRP";
  if (offer.rrpKind === "pack_reference") return "PACK RRP REF";
  return "RRP";
}

function rrpContext(offer: SignalCatalogueOffer) {
  if (typeof offer.price !== "number" || typeof offer.rrpGbp !== "number" || offer.rrpGbp <= 0) return null;
  const difference = offer.price - offer.rrpGbp;
  const percent = (difference / offer.rrpGbp) * 100;
  const sign = difference > 0 ? "+" : difference < 0 ? "−" : "";
  const percentSign = percent > 0 ? "+" : percent < 0 ? "−" : "";
  return `${sign}£${Math.abs(difference).toFixed(2)} · ${percentSign}${Math.abs(percent).toFixed(1)}% vs ${rrpName(offer)}`;
}

function unitContext(offer: SignalCatalogueOffer) {
  if (typeof offer.unitCount !== "number" || offer.unitCount <= 1 || typeof offer.price !== "number") return null;
  const unit = offer.unitKind === "booster_pack" ? "pack" : "unit";
  return `${offer.unitCount} ${unit}s · ${gbp(offer.price / offer.unitCount)} item/${unit}`;
}

function groupOffers(offers: SignalCatalogueOffer[]) {
  const groups = new Map<string, SignalCatalogueOffer[]>();
  for (const offer of offers) {
    const key = offer.productId || offer.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    groups.set(key, [...(groups.get(key) ?? []), offer]);
  }
  return [...groups.entries()].map(([key, rows]) => ({
    key,
    title: rows[0]?.title ?? "TCG product",
    category: rows[0]?.category ?? "TCG product",
    rrpGbp: rows.find((row) => typeof row.rrpGbp === "number")?.rrpGbp,
    offers: rows.sort((a, b) => {
      const aKnown = truePrice(a);
      const bKnown = truePrice(b);
      if ((aKnown !== null) !== (bKnown !== null)) return aKnown !== null ? -1 : 1;
      return (aKnown ?? a.price ?? Infinity) - (bKnown ?? b.price ?? Infinity);
    }),
  })).sort((a, b) => {
    const aPrice = truePrice(a.offers[0]) ?? a.offers[0]?.price ?? Infinity;
    const bPrice = truePrice(b.offers[0]) ?? b.offers[0]?.price ?? Infinity;
    return aPrice - bPrice;
  });
}

function searchHref(input: { q: string; stockOnly: boolean; sort?: string; category?: string; maxPrice?: string; cursor?: string }) {
  const params = new URLSearchParams({ q: input.q, stock: input.stockOnly ? "in" : "all", sort: input.sort ?? "relevance" });
  if (input.category) params.set("category", input.category);
  if (input.maxPrice) params.set("maxPrice", input.maxPrice);
  if (input.cursor) params.set("cursor", input.cursor);
  return `/dashboard/search?${params.toString()}`;
}

export default async function DashboardSearchPage({ searchParams }: { searchParams: Promise<{ q?: string; stock?: string; sort?: string; category?: string; maxPrice?: string; cursor?: string }> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const stockOnly = params.stock !== "all";
  const sort = ["relevance", "recent", "price", "title"].includes(params.sort ?? "")
    ? params.sort as "relevance" | "recent" | "price" | "title"
    : "relevance";
  const category = ["SEALED", "PREORDER", "SINGLE", "GRADED", "ACCESSORY", "OTHER"].includes((params.category ?? "").toUpperCase()) ? params.category?.toUpperCase() : undefined;
  const maxPriceRaw = (params.maxPrice ?? "").trim();
  const maxPrice = maxPriceRaw && Number.isFinite(Number(maxPriceRaw)) ? Number(maxPriceRaw) : undefined;
  const cursor = (params.cursor ?? "").trim() || undefined;
  const result = q.length >= 2 ? await searchSignalCatalogue(q, { inStock: stockOnly, limit: 60, sort, category, maxPrice, cursor }) : null;
  const offers = result?.products ?? [];
  const groups = groupOffers(offers);
  const currentOffset = Number.parseInt(cursor ?? "0", 10) || 0;
  const previousCursor = currentOffset > 0 ? String(Math.max(0, currentOffset - 60)) : null;

  return (
    <DashboardPageShell title="Search" eyebrow="FIND · COMPARE · BUY">
      <div className="fd-search-page">
        <section className="fd-dash-card fd-network-card fd-search-hero">
          <div className="fd-dash-card-head"><span>SEARCH THE FATEDROP NETWORK</span><i className={result ? "live" : "pending"}>{result ? "● CLOUD CONNECTED" : "○ SIGNAL ENGINE"}</i></div>
          <div className="fd-network-message"><h1>Search the product once.<br/>Compare the retailers underneath it.</h1><p>FateDrop resolves observed offers from the canonical Cloud catalogue, keeps unknown delivery unknown, compares item price against verified RRP/reference value, and gives you a direct path into True Price or a saved FateFind.</p></div>
          <form action="/dashboard/search" method="get" className="fd-network-search-form">
            <label className="fd-dashboard-search"><span>⌕</span><input name="q" defaultValue={q} autoFocus aria-label="Search products" placeholder="Try: Elite Trainer Box, booster bundle, Charizard…" /></label>
            <label><span>STOCK</span><select name="stock" defaultValue={stockOnly ? "in" : "all"}><option value="in">Available only</option><option value="all">All observed</option></select></label>
            <label><span>CATEGORY</span><select name="category" defaultValue={category ?? ""}><option value="">All</option><option value="SEALED">Sealed</option><option value="PREORDER">Preorder</option><option value="SINGLE">Singles</option><option value="GRADED">Graded</option><option value="ACCESSORY">Accessories</option></select></label>
            <label><span>MAX ITEM £</span><input name="maxPrice" inputMode="decimal" defaultValue={maxPriceRaw} placeholder="65" /></label>
            <label><span>SORT</span><select name="sort" defaultValue={sort}><option value="relevance">Best match</option><option value="recent">Most recent</option><option value="price">Item price</option><option value="title">Title</option></select></label>
            <button type="submit">SEARCH NETWORK →</button>
          </form>
          <p className="fd-search-hint">Search understands product intent rather than exact phrasing only — for example, “destined etb” can resolve “Destined Rivals Elite Trainer Box”. Use category, stock and price filters to narrow the network further.</p>
        </section>

        <section className="fd-dash-card fd-search-results">
          <div className="fd-dash-card-head"><span>{q ? `PRODUCTS · ${q.toUpperCase()}` : "SEARCH STATUS"}</span><small>{result ? `${result.total} matching offers · ${groups.length} product group${groups.length === 1 ? "" : "s"} on this page` : q.length >= 2 ? "Cloud response unavailable" : "Enter at least 2 characters"}</small></div>
          {!q ? <div className="fd-dashboard-empty"><strong>Search for a product, set or format.</strong><span>The network groups retailer offers beneath product identities so Search stays product-first rather than shop-first.</span></div> : q.length < 2 ? <div className="fd-dashboard-empty"><strong>Keep typing.</strong><span>Use at least two characters so FateDrop can resolve a useful network query.</span></div> : !result ? <div className="fd-dashboard-empty"><strong>The Signal Engine could not be reached.</strong><span>No fallback products are invented. Try again shortly.</span></div> : groups.length ? <div className="fd-search-groups">{groups.map((group) => {
            const best = group.offers[0];
            const bestDelivered = truePrice(best);
            return <article className="fd-search-group" key={group.key}>
              <header><div><small>{group.category} · {group.offers.length} OBSERVED OFFER{group.offers.length === 1 ? "" : "S"}</small><h2>{group.title}</h2></div><div><small>LOWEST KNOWN TRUE PRICE</small><strong>{bestDelivered !== null ? gbp(bestDelivered) : "Delivery unknown"}</strong></div></header>
              <div className="fd-search-offers">{group.offers.map((offer) => {
                const delivered = truePrice(offer);
                const context = rrpContext(offer);
                const units = unitContext(offer);
                const provenance = offer.rrpReferenceBasis ?? (offer.rrpSource ? `Verified source: ${offer.rrpSource}` : null);
                return <div className="fd-search-offer" key={offer.id}>
                  <div><small>{offer.availability === "IN_STOCK" ? "● AVAILABLE" : offer.availability ?? "OBSERVED"}</small><strong>{offer.retailer}</strong><span>{offer.lastSeen ? `Observed ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(offer.lastSeen))}` : "Network observation"}</span></div>
                  <div className="fd-search-offer-price"><span><small>ITEM</small><b>{gbp(offer.price)}</b></span><span><small>DELIVERY</small><b>{typeof offer.shippingGbp === "number" ? offer.shippingGbp === 0 ? "FREE" : gbp(offer.shippingGbp) : "UNKNOWN"}</b></span><span><small>TRUE PRICE</small><b>{delivered !== null ? gbp(delivered) : "—"}</b></span><span><small>{rrpName(offer)}</small><b>{gbp(offer.rrpGbp)}</b></span></div>
                  <div className="fd-search-offer-foot"><span>{[context, units, provenance].filter(Boolean).join(" · ") || "Verified RRP/reference unavailable"}</span><a href={offer.url} target="_blank" rel="noreferrer">BUY ↗</a></div>
                </div>;
              })}</div>
              <footer><Link href={`/dashboard/true-price?q=${encodeURIComponent(group.title)}`}>COMPARE TRUE PRICE →</Link><Link href={`/dashboard/watchlist?q=${encodeURIComponent(group.title)}`}>CREATE FATEFIND →</Link></footer>
            </article>;
          })}</div> : <div className="fd-dashboard-empty"><strong>No matching observed offers.</strong><span>Try a broader product name or include sold-out observations. FateDrop does not pad empty results with sample products.</span><Link className="fd-dashboard-wide-button" href={`/dashboard/watchlist?q=${encodeURIComponent(q)}`}>Create a FateFind instead →</Link></div>}
          {result && (previousCursor || result.nextCursor) ? <nav className="fd-search-pagination" aria-label="Search result pages">{previousCursor !== null ? <Link href={searchHref({ q, stockOnly, sort: params.sort, category, maxPrice: maxPriceRaw, cursor: previousCursor })}>← PREVIOUS</Link> : <span/>}{result.nextCursor ? <Link href={searchHref({ q, stockOnly, sort: params.sort, category, maxPrice: maxPriceRaw, cursor: result.nextCursor })}>NEXT →</Link> : null}</nav> : null}
        </section>
      </div>
      <style>{`
        .fd-search-page{display:grid;gap:22px}.fd-search-hero,.fd-search-results{padding:28px}.fd-network-search-form{display:grid;grid-template-columns:minmax(260px,1.4fr) 130px 130px 120px 130px auto;gap:10px;align-items:end;margin-top:24px}.fd-network-search-form>label{display:grid;gap:6px}.fd-network-search-form>label>span{color:#8d8591;font-size:10px;font-weight:900;letter-spacing:.12em}.fd-network-search-form select,.fd-network-search-form>label>input{height:48px;padding:0 12px;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:#0b0a10;color:#e7e1ea;font-size:12px}.fd-network-search-form button{height:48px;padding:0 17px;border:1px solid rgba(104,232,251,.24);border-radius:12px;background:linear-gradient(135deg,rgba(104,232,251,.1),rgba(157,109,255,.12));color:#fff;font-size:10px;font-weight:900;letter-spacing:.08em}.fd-dashboard-search{height:48px;margin:0!important}.fd-search-hint{margin:12px 2px 0;color:#8d8691;font-size:11px;line-height:1.55}.fd-search-groups{display:grid;gap:15px;margin-top:18px}.fd-search-group{overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:18px;background:#0b0a10}.fd-search-group>header{display:flex;justify-content:space-between;gap:20px;padding:18px 20px;background:radial-gradient(circle at 100% 0%,rgba(157,109,255,.06),transparent 30%)}.fd-search-group>header small{display:block;color:#8ceffd;font-size:10px;font-weight:900;letter-spacing:.1em}.fd-search-group>header h2{margin:6px 0 0;font-size:20px}.fd-search-group>header>div:last-child{text-align:right}.fd-search-group>header>div:last-child strong{display:block;margin-top:4px;font-size:17px}.fd-search-offers{display:grid;gap:1px;background:#19161e}.fd-search-offer{display:grid;grid-template-columns:minmax(150px,.8fr) minmax(350px,1.2fr);gap:12px;padding:14px 20px;background:#0b0a10}.fd-search-offer>div:first-child small{display:block;color:#83edb8;font-size:9px;font-weight:900;letter-spacing:.1em}.fd-search-offer>div:first-child strong{display:block;margin:5px 0;font-size:14px}.fd-search-offer>div:first-child span{color:#948c98;font-size:10px}.fd-search-offer-price{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.fd-search-offer-price span{padding:8px;border:1px solid rgba(255,255,255,.05);border-radius:9px;background:rgba(0,0,0,.13)}.fd-search-offer-price small{display:block;color:#8b8490;font-size:9px;font-weight:900;letter-spacing:.08em}.fd-search-offer-price b{font-size:12px}.fd-search-offer-foot{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:12px}.fd-search-offer-foot>span{color:#aaa2ae;font-size:10px;line-height:1.45}.fd-search-offer-foot>a{color:#d8c3ff;font-size:10px;font-weight:900}.fd-search-group>footer{display:flex;gap:14px;padding:12px 20px;border-top:1px solid rgba(255,255,255,.055)}.fd-search-group>footer a{color:#aef3ff;font-size:10px;font-weight:900;text-decoration:none}.fd-search-pagination{display:flex;justify-content:space-between;gap:15px;margin-top:18px}.fd-search-pagination a{padding:11px 14px;border:1px solid rgba(157,109,255,.18);border-radius:9px;color:#d7c1ff;font-size:10px;font-weight:900;text-decoration:none}@media(max-width:1200px){.fd-network-search-form{grid-template-columns:1fr 1fr 1fr}.fd-dashboard-search{grid-column:1/-1}.fd-network-search-form button{align-self:end}}@media(max-width:800px){.fd-network-search-form{grid-template-columns:1fr 1fr}.fd-search-offer{grid-template-columns:1fr}.fd-search-offer-foot{grid-column:auto}.fd-search-offer-price{grid-template-columns:1fr 1fr}.fd-search-group>header{flex-direction:column}.fd-search-group>header>div:last-child{text-align:left}}@media(max-width:520px){.fd-network-search-form{grid-template-columns:1fr}.fd-dashboard-search{grid-column:auto}.fd-search-offer-price{grid-template-columns:1fr}.fd-search-group>footer{flex-direction:column}}
      `}</style>
    </DashboardPageShell>
  );
}