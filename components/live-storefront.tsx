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
    <section className="fd-dash-card fd-universal-storefront" style={{ marginTop: 18 }}>
      <div className="fd-dash-card-head"><span>UNIVERSAL STOREFRONT</span><i className="live">● {products.length} LIVE OFFERS</i></div>
      <div className="fd-network-message"><h1>Search once. Buy from anywhere in the FateDrop network.</h1><p>Every connected retailer feeds this catalogue. Products stay retailer-owned; FateDrop provides discovery, product identity and comparison intelligence, then sends the customer directly to buy.</p></div>
      <div className="fd-storefront-controls">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, sets or collections…" />
        {(["all", "retail", "indie"] as const).map((value) => <button key={value} type="button" onClick={() => setNetwork(value)} className="fd-dashboard-wide-button" data-active={network === value}>{value === "all" ? "All offers" : value === "retail" ? "Retail" : "Indies"}</button>)}
        <button type="button" onClick={() => setStockOnly((value) => !value)} className="fd-dashboard-wide-button" data-active={stockOnly}>{stockOnly ? "In stock" : "All stock"}</button>
      </div>
      {network === "retail" && !visible.length ? <div className="fd-dashboard-empty"><strong>Retail catalogues are next.</strong><span>The universal engine is ready; retail offers will appear here as each adapter is connected.</span></div> : visible.length ? <div className="fd-dashboard-list">{visible.map((product) => <article key={product.id}>
        <span className="fd-store-thumb">{product.image ? "▣" : "◇"}</span>
        <div><strong>{product.title}</strong><small>{product.retailerName} · {product.available ? "In stock" : "Sold out"}</small></div>
        <aside><span>{formatGBP(product.pricePence)}</span><a href={product.url} target="_blank" rel="noreferrer" aria-label={`Buy ${product.title} from ${product.retailerName}`}>BUY ↗</a></aside>
      </article>)}</div> : <div className="fd-dashboard-empty"><strong>No matching products.</strong><span>Try another search or include sold-out products.</span></div>}
      {visible.length === 80 ? <div className="fd-dashboard-empty"><span>Showing the first 80 matches. Search to narrow the universal catalogue.</span></div> : null}
    </section>
  );
}
