"use client";

import { useMemo, useState } from "react";
import type { CatalogueProduct } from "@/lib/retailer-catalogue";
import { formatGBP } from "@/lib/retailer-catalogue";

export function LiveStorefront({ products, retailerName }: { products: CatalogueProduct[]; retailerName: string }) {
  const [query, setQuery] = useState("");
  const [stockOnly, setStockOnly] = useState(true);
  const visible = useMemo(() => products.filter((product) => (!stockOnly || product.available) && (!query || product.title.toLowerCase().includes(query.toLowerCase()))).slice(0, 80), [products, query, stockOnly]);
  return (
    <section className="fd-dash-card" style={{ marginTop: 18 }}>
      <div className="fd-dash-card-head"><span>{retailerName.toUpperCase()} · LIVE STOREFRONT</span><i className="live">● {products.length} PRODUCTS LOADED</i></div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${retailerName} products…`} style={{ flex: "1 1 280px", minHeight: 44, borderRadius: 10, padding: "0 14px" }} />
        <button type="button" onClick={() => setStockOnly((value) => !value)} className="fd-dashboard-wide-button" style={{ width: "auto" }}>{stockOnly ? "In stock only" : "All products"}</button>
      </div>
      {visible.length ? <div className="fd-dashboard-list">{visible.map((product) => <article key={product.id}>
        <span className="fd-store-thumb">{product.image ? "▣" : "◇"}</span>
        <div><strong>{product.title}</strong><small>{product.available ? "In stock" : "Sold out"} · from {formatGBP(product.pricePence)}</small></div>
        <aside><span>{formatGBP(product.pricePence)}</span><a href={product.url} target="_blank" rel="noreferrer" aria-label={`Buy ${product.title} from ${retailerName}`}>BUY ↗</a></aside>
      </article>)}</div> : <div className="fd-dashboard-empty"><strong>No matching products.</strong><span>Try another search or include sold-out products.</span></div>}
      {visible.length === 80 ? <div className="fd-dashboard-empty"><span>Showing the first 80 matches for performance. Search to narrow the catalogue.</span></div> : null}
    </section>
  );
}
