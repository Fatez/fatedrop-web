"use client";

import { useMemo, useState } from "react";
import type { CatalogueProduct } from "@/lib/retailer-catalogue";
import { formatGBP } from "@/lib/retailer-catalogue";

export function LiveStorefront({ products }: { products: CatalogueProduct[] }) {
  const [query, setQuery] = useState("");
  const [stockOnly, setStockOnly] = useState(true);
  const [network, setNetwork] = useState<"all" | "retail" | "indie">("all");
  const visible = useMemo(() => products.filter((product) => {
    if (stockOnly && !product.available) return false;
    if (query && !product.title.toLowerCase().includes(query.toLowerCase())) return false;
    if (network === "indie" && product.retailerId !== "cob-and-pip") return false;
    return true;
  }).slice(0, 80), [products, query, stockOnly, network]);

  return (
    <section className="fd-dash-card fd-universal-storefront" style={{ marginTop: 0 }}>
      <div className="fd-dash-card-head"><span>UNIVERSAL STOREFRONT</span><i className="live">● {products.length} LIVE OFFERS</i></div>
      <div className="fd-network-message"><h1>Search once. Buy from anywhere in the FateDrop network.</h1><p>Every connected retailer feeds this catalogue. Products stay retailer-owned; FateDrop provides discovery, product identity and comparison intelligence, then sends the customer directly to buy.</p></div>

      <div className="fd-storefront-discovery">
        <label className="fd-storefront-search">
          <span aria-hidden="true">⌕</span>
          <div><small>FIND AN OFFER</small><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try a set, ETB, booster box or product name…" /></div>
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button> : <i>SEARCH</i>}
        </label>
        <div className="fd-storefront-filterbar" aria-label="Storefront filters">
          {(["all", "retail", "indie"] as const).map((value) => <button key={value} type="button" onClick={() => setNetwork(value)} data-active={network === value}>{value === "all" ? "All offers" : value === "retail" ? "Retail" : "Indies"}</button>)}
          <span className="fd-storefront-filter-divider" />
          <button type="button" onClick={() => setStockOnly((value) => !value)} data-active={stockOnly}>{stockOnly ? "● In stock" : "○ All stock"}</button>
        </div>
      </div>

      {network === "retail" && !visible.length ? <div className="fd-dashboard-empty"><strong>Retail catalogues are next.</strong><span>The universal engine is ready; retail offers will appear here as each adapter is connected.</span></div> : visible.length ? <div className="fd-dashboard-list">{visible.map((product) => <article key={product.id}>
        <span className="fd-store-thumb">{product.image ? "▣" : "◇"}</span>
        <div><strong>{product.title}</strong><small>{product.retailerName} · {product.available ? "In stock" : "Sold out"}</small></div>
        <aside><span>{formatGBP(product.pricePence)}</span><a href={product.url} target="_blank" rel="noreferrer" aria-label={`Buy ${product.title} from ${product.retailerName}`}>BUY ↗</a></aside>
      </article>)}</div> : <div className="fd-dashboard-empty"><strong>No matching products.</strong><span>Try another search or include sold-out products.</span></div>}
      {visible.length === 80 ? <div className="fd-dashboard-empty"><span>Showing the first 80 matches. Search to narrow the universal catalogue.</span></div> : null}

      <style jsx>{`
        .fd-storefront-discovery{display:grid;gap:12px;margin:22px 0 18px}
        .fd-storefront-search{min-height:68px;padding:10px 12px 10px 16px;display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:12px;border:1px solid rgba(88,232,255,.22);border-radius:18px;background:radial-gradient(circle at 8% 0%,rgba(88,232,255,.09),transparent 38%),linear-gradient(135deg,rgba(255,255,255,.055),rgba(157,109,255,.035));box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 12px 30px rgba(0,0,0,.16);transition:.2s ease}
        .fd-storefront-search:focus-within{border-color:rgba(88,232,255,.6);box-shadow:0 0 0 3px rgba(88,232,255,.07),0 15px 36px rgba(41,34,79,.2)}
        .fd-storefront-search>span{font-size:28px;color:#68e8fb;text-align:center;filter:drop-shadow(0 0 12px rgba(88,232,255,.2))}
        .fd-storefront-search>div{display:flex;min-width:0;flex-direction:column;gap:3px}
        .fd-storefront-search small{font-size:9px;letter-spacing:.16em;color:#847e8d;font-weight:850}
        .fd-storefront-search input{width:100%;padding:0;border:0;outline:0;background:transparent;color:#fff;font-size:15px;font-weight:650}
        .fd-storefront-search input::placeholder{color:#76707d;font-weight:500}
        .fd-storefront-search>i{padding:9px 11px;border:1px solid rgba(255,255,255,.11);border-radius:10px;color:#9992a4;font-size:8px;font-style:normal;font-weight:850;letter-spacing:.14em}
        .fd-storefront-search>button{width:34px;height:34px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.05);color:#d9d5df;font-size:20px;cursor:pointer}
        .fd-storefront-filterbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .fd-storefront-filterbar button{min-height:38px;padding:0 14px;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:rgba(255,255,255,.025);color:#8f8998;font-size:10px;font-weight:760;cursor:pointer;transition:.18s ease}
        .fd-storefront-filterbar button:hover{border-color:rgba(255,255,255,.22);color:#fff;background:rgba(255,255,255,.05)}
        .fd-storefront-filterbar button[data-active="true"]{border-color:rgba(157,109,255,.34);background:linear-gradient(135deg,rgba(157,109,255,.17),rgba(88,232,255,.07));color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
        .fd-storefront-filter-divider{width:1px;height:24px;background:rgba(255,255,255,.09);margin:0 2px}
        @media(max-width:720px){.fd-storefront-search{grid-template-columns:28px 1fr auto;min-height:64px;padding-left:12px}.fd-storefront-search>span{font-size:24px}.fd-storefront-search input{font-size:14px}.fd-storefront-search>i{display:none}.fd-storefront-filter-divider{display:none}}
      `}</style>
    </section>
  );
}
