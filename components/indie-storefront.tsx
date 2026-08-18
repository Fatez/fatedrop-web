"use client";

import { useMemo, useState } from "react";
import type { CatalogueProduct } from "@/lib/retailer-catalogue";
import { formatGBP } from "@/lib/retailer-catalogue";

export function IndieStorefront({ products, retailerName }: { products: CatalogueProduct[]; retailerName: string }) {
  const [query, setQuery] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const visible = useMemo(() => products
    .filter((product) => !stockOnly || product.available)
    .filter((product) => !query || product.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 80), [products, query, stockOnly]);

  return <section className="fd-dash-card fd-indie-storefront">
    <div className="fd-dash-card-head"><span>FATEDROP STORE CATALOGUE</span><i className="live">● {products.length} ITEMS INDEXED</i></div>
    <p className="fd-indie-store-intro">Browse everything FateDrop has indexed for {retailerName}. External retailer links appear only at the point you choose an item to purchase.</p>
    <label className="fd-indie-search"><span>⌕</span><div><small>SEARCH {retailerName.toUpperCase()}</small><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ETBs, booster boxes, collections…" /></div>{query ? <button type="button" onClick={() => setQuery("")}>×</button> : null}</label>
    <div className="fd-indie-controls"><button type="button" data-active={!stockOnly} onClick={() => setStockOnly(false)}>All products</button><button type="button" data-active={stockOnly} onClick={() => setStockOnly(true)}>In stock</button></div>
    {visible.length ? <div className="fd-dashboard-list fd-indie-products">{visible.map((product) => <article key={product.id}>
      <span className="fd-store-thumb">{product.image ? "▣" : "◇"}</span>
      <div><strong>{product.title}</strong><small>{product.available ? "In stock" : "Sold out"} · {product.productType || "TCG product"}</small></div>
      <aside><span>{formatGBP(product.pricePence)}</span><a href={product.url} target="_blank" rel="noreferrer" aria-label={`Buy ${product.title} from ${retailerName}`}>BUY AT RETAILER ↗</a></aside>
    </article>)}</div> : <div className="fd-dashboard-empty"><strong>No matching products.</strong><span>Try another search or include sold-out items.</span></div>}
    <style jsx>{`
      .fd-indie-storefront{padding:28px}.fd-indie-store-intro{margin:16px 0 0;color:#9c96a3;font-size:13px;line-height:1.6}.fd-indie-search{min-height:70px;margin:20px 0 12px;padding:10px 14px;display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:12px;border:1px solid rgba(88,232,255,.24);border-radius:18px;background:linear-gradient(135deg,rgba(88,232,255,.07),rgba(157,109,255,.06));transition:.2s ease}.fd-indie-search:focus-within{border-color:rgba(88,232,255,.58);box-shadow:0 0 0 3px rgba(88,232,255,.06)}.fd-indie-search>span{font-size:28px;color:#68e8fb}.fd-indie-search>div{display:flex;min-width:0;flex-direction:column;gap:4px}.fd-indie-search small{font-size:9px;letter-spacing:.16em;color:#817b89;font-weight:850}.fd-indie-search input{border:0;outline:0;background:transparent;color:#fff;font-size:16px;font-weight:650}.fd-indie-search input::placeholder{color:#746f7a}.fd-indie-search button{width:34px;height:34px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.05);color:#fff;font-size:20px;cursor:pointer}.fd-indie-controls{display:flex;gap:8px;margin-bottom:18px}.fd-indie-controls button{padding:10px 14px;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:rgba(255,255,255,.03);color:#96909e;font-size:11px;font-weight:750;cursor:pointer}.fd-indie-controls button[data-active="true"]{border-color:rgba(157,109,255,.35);background:rgba(157,109,255,.12);color:#fff}.fd-indie-products article{min-height:82px}.fd-indie-products strong{font-size:14px}.fd-indie-products small{font-size:11px}.fd-indie-products aside>span{font-size:15px;font-weight:850;color:#fff}.fd-indie-products aside a{font-size:9px;font-weight:850;white-space:nowrap}@media(max-width:700px){.fd-indie-storefront{padding:20px}.fd-indie-search{grid-template-columns:28px 1fr auto}.fd-indie-search input{font-size:14px}}
    `}</style>
  </section>;
}
