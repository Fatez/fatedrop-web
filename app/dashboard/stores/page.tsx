import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { RetailerMarketDirectory } from "@/components/retailer-market-directory";
import { getCobAndPipCatalogue, getWishlistCollectablesCatalogue } from "@/lib/retailer-catalogue";
import { getRetailerNetwork } from "@/lib/retailer-network";

export const metadata: Metadata = { title: "Retailers | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardStoresPage() {
  const [cobAndPip, wishlist, retailerNetwork] = await Promise.all([
    getCobAndPipCatalogue(),
    getWishlistCollectablesCatalogue(),
    getRetailerNetwork(),
  ]);

  const storefronts = [
    {
      id: "wishlist-collectables",
      name: "Wishlist Collectables",
      location: "London · Online + physical",
      online: true,
      physicalStores: true,
      href: "/dashboard/stores/wishlist-collectables",
      indexed: wishlist.length,
      available: wishlist.filter((product) => product.available).length,
    },
    {
      id: "cob-and-pip",
      name: "Cob & Pip",
      location: "UK · Online",
      online: true,
      physicalStores: false,
      href: "/dashboard/stores/cob-and-pip",
      indexed: cobAndPip.length,
      available: cobAndPip.filter((product) => product.available).length,
    },
  ];

  const cloud = retailerNetwork.filter((retailer) => retailer.source === "cloud");
  const major = retailerNetwork.filter((retailer) => retailer.retailerClass === "national" || retailer.category === "major-retail");
  const indies = retailerNetwork.filter((retailer) => ["independent", "specialist", "regional"].includes(retailer.retailerClass) || ["indie", "tcg-specialist"].includes(retailer.category));

  return <DashboardPageShell title="Retailers" eyebrow="RRP / MAJOR · INDEPENDENTS · ONLINE · PHYSICAL">
    <div className="fd-retailer-hub">
      <section className="fd-dash-card fd-retailer-hero">
        <div className="fd-dash-card-head"><span>FATEDROP RETAILER NETWORK</span><i className={cloud.some((item) => item.runtime.healthy) ? "live" : "pending"}>{cloud.length ? `● ${cloud.length} CLOUD RETAILER${cloud.length === 1 ? "" : "S"}` : "○ AWAITING CLOUD"}</i></div>
        <div className="fd-retailer-message"><h1>Two markets.<br/>One source of truth.</h1><p>Major/RRP comparison retailers stay separate from the independent network. Independents can then be explored by online or physical presence without confusing a website with a real shop. Cloud monitor health describes FateDrop evidence collection — it is not a paid-partner badge.</p></div>
        <div className="fd-retailer-metrics"><div><strong>{major.length}</strong><span>RRP / MAJOR</span><small>National comparison lane</small></div><div><strong>{indies.length + storefronts.length}</strong><span>INDEPENDENTS</span><small>Specialist + indie discovery</small></div><div><strong>{indies.filter((item) => item.physicalStores === true).length + storefronts.filter((item) => item.physicalStores).length}</strong><span>PHYSICAL</span><small>Explicit evidence only</small></div></div>
      </section>

      <RetailerMarketDirectory retailers={retailerNetwork} labStorefronts={storefronts} />

      <section className="fd-dash-card fd-retailer-model"><div><span>THE RETAILER MODEL</span><h2>RRP/reference gives comparison context. Indies give collectors choice.</h2></div><p>Search, stock, RRP and True Price continue to come from canonical FateDrop evidence. The retailer directory then adds a clean discovery layer for national retailers and independents — including genuine physical-store discovery as that evidence grows.</p></section>
    </div>
    <style>{`.fd-retailer-hub{display:grid;gap:22px}.fd-retailer-hero{padding:28px}.fd-retailer-message h1{font-size:clamp(2rem,3vw,3.2rem);line-height:1.02;max-width:850px}.fd-retailer-message p{font-size:15px;line-height:1.7;max-width:920px;color:#9a949f}.fd-retailer-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:24px}.fd-retailer-metrics div{padding:14px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(255,255,255,.02)}.fd-retailer-metrics strong{display:block;font-size:24px}.fd-retailer-metrics span{display:block;margin-top:3px;color:#68e8fb;font-size:7px;font-weight:900;letter-spacing:.12em}.fd-retailer-metrics small{display:block;margin-top:4px;color:#77717f;font-size:8px}.fd-retailer-model{padding:24px 28px;display:grid;grid-template-columns:1fr 1fr;gap:30px;align-items:center}.fd-retailer-model span{font-size:8px;letter-spacing:.15em;color:#68e8fb;font-weight:850}.fd-retailer-model h2{margin:7px 0 0;font-size:22px}.fd-retailer-model p{margin:0;color:#96909c;font-size:12px;line-height:1.65}@media(max-width:850px){.fd-retailer-hero{padding:20px}.fd-retailer-metrics,.fd-retailer-model{grid-template-columns:1fr}}`}</style>
  </DashboardPageShell>;
}
