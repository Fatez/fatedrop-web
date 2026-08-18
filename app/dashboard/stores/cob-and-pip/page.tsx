import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { IndieStorefront } from "@/components/indie-storefront";
import { getCobAndPipCatalogue } from "@/lib/retailer-catalogue";

const COB_AND_PIP_LOGO = "https://cobandpip.co.uk/cdn/shop/files/Cob_and_Pip_LOGO.jpg?v=1747145906";

export const metadata: Metadata = { title: "Cob & Pip | FateDrop", robots: { index: false, follow: false } };

export default async function CobAndPipStorePage() {
  const products = await getCobAndPipCatalogue();
  const inStock = products.filter((product) => product.available).length;
  return <DashboardPageShell title="Cob & Pip" eyebrow="FATEDROP INDIE STORE">
    <div className="fd-indie-substore">
      <section className="fd-dash-card fd-indie-store-hero">
        <div className="fd-dash-card-head"><span>FATEDROP STOREFRONT</span><i>INDIE · UK ONLINE</i></div>
        <div className="fd-indie-store-heading"><div className="fd-indie-logo-panel" style={{ backgroundImage: `url("${COB_AND_PIP_LOGO}")` }} aria-label="Cob & Pip logo"/><div><h1>Cob & Pip</h1><p>Browse Cob & Pip inside FateDrop. Search their indexed catalogue, inspect availability and pricing, then leave FateDrop only when you choose to purchase an item from the retailer.</p><div className="fd-indie-tags"><span>Pokémon</span><span>TCG</span><span>Online store</span></div></div></div>
        <div className="fd-network-metrics"><div><strong>{products.length}</strong><span>INDEXED ITEMS</span><small>Connected catalogue feed</small></div><div><strong>{inStock}</strong><span>IN STOCK</span><small>Feed-reported availability</small></div><div><strong>£50+</strong><span>FREE SHIPPING</span><small>UK threshold stated by retailer</small></div></div>
      </section>
      <div className="fd-indie-substore-grid"><IndieStorefront products={products} retailerName="Cob & Pip" /><aside className="fd-dash-card fd-indie-store-info"><div className="fd-dash-card-head"><span>STORE INFO</span><small>FATEDROP INDEX</small></div><h2>Cob & Pip</h2><p>UK · Online retailer</p><div className="fd-indie-info-list"><div><span>STORE TYPE</span><strong>Online</strong></div><div><span>NETWORK STATUS</span><strong>Catalogue candidate</strong></div><div><span>CHECKOUT</span><strong>With retailer after item selection</strong></div><div><span>DELIVERY</span><strong>Free UK £50+</strong></div></div><Link className="fd-indie-compare" href="/dashboard/true-price">Compare products across True Price →</Link></aside></div>
    </div>
    <style>{`.fd-indie-substore{display:grid;gap:22px}.fd-indie-store-hero{padding:30px}.fd-indie-store-heading{display:grid;grid-template-columns:150px 1fr;gap:24px;align-items:center;margin:18px 0 24px}.fd-indie-logo-panel{width:150px;height:110px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background-color:#fff;background-position:center;background-repeat:no-repeat;background-size:contain;box-shadow:0 15px 35px rgba(0,0,0,.2)}.fd-indie-store-heading h1{margin:0 0 8px;font-size:clamp(2rem,3vw,3rem);line-height:1}.fd-indie-store-heading p{margin:0;max-width:820px;color:#aaa4b0;font-size:14px;line-height:1.65}.fd-indie-tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}.fd-indie-tags span{padding:6px 9px;border:1px solid rgba(255,255,255,.09);border-radius:999px;color:#aaa4b0;font-size:9px;font-weight:800;letter-spacing:.06em}.fd-indie-substore-grid{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:22px;align-items:start}.fd-indie-store-info{padding:24px;position:sticky;top:20px}.fd-indie-store-info h2{font-size:20px;margin:20px 0 4px}.fd-indie-store-info>p{color:#8e8895;font-size:12px}.fd-indie-info-list{display:grid;gap:0;margin:20px 0}.fd-indie-info-list div{display:flex;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.07)}.fd-indie-info-list span{font-size:8px;letter-spacing:.13em;color:#706a76}.fd-indie-info-list strong{font-size:11px;text-align:right}.fd-indie-compare{display:block;margin-top:12px;text-align:center;color:#72e8f8;font-size:10px;font-weight:800;text-decoration:none}@media(max-width:1000px){.fd-indie-substore-grid{grid-template-columns:1fr}.fd-indie-store-info{position:static}}@media(max-width:650px){.fd-indie-store-hero{padding:20px}.fd-indie-store-heading{grid-template-columns:1fr}.fd-indie-logo-panel{width:100%;max-width:220px;height:120px}}`}</style>
  </DashboardPageShell>;
}
