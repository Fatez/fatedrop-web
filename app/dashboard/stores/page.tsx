import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { RetailerMarketDirectory } from "@/components/retailer-market-directory";
import { getCobAndPipCatalogue, getWishlistCollectablesCatalogue } from "@/lib/retailer-catalogue";
import { getRetailerNetwork } from "@/lib/retailer-network";

export const metadata: Metadata = { title: "Fate Network | FateDrop Dashboard", robots: { index: false, follow: false } };
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
  const specialistRetailers = retailerNetwork.filter((retailer) => ["independent", "specialist", "regional"].includes(retailer.retailerClass) || ["indie", "tcg-specialist"].includes(retailer.category));

  return <DashboardPageShell title="Fate Network" eyebrow="MAJOR · SPECIALIST · INDEPENDENT · ONLINE · PHYSICAL">
    <div className="fd-retailer-hub">
      <section className="fd-dash-card fd-retailer-hero">
        <div className="fd-dash-card-head"><span>CANONICAL CLOUD RETAILERS · MARKET DIRECTORY</span><i className={cloud.some((item) => item.runtime.healthy) ? "live" : "pending"}>{cloud.length ? `● ${cloud.length} CLOUD RETAILER${cloud.length === 1 ? "" : "S"}` : "○ AWAITING CLOUD"}</i></div>
        <div className="fd-retailer-message"><h1>One network. Different retailer types. More places to buy.</h1><p>Fate Network keeps national/RRP reference retailers, specialist stores and independent businesses visibly understandable while allowing each to contribute useful offer evidence. If a connected retailer has a relevant genuine offer, Search and FateFind can surface it and the collector still buys directly from that store. <strong>Retailers cannot pay for a better FateFind verdict, artificial trust, alert priority or RRP treatment.</strong></p></div>
        <div className="fd-retailer-metrics"><div><strong>{major.length}</strong><span>RRP / NATIONAL</span><small>Reference and comparison lane</small></div><div><strong>{specialistRetailers.length + storefronts.length}</strong><span>SPECIALIST / INDEPENDENT</span><small>Connected discovery where evidence supports it</small></div><div><strong>{specialistRetailers.filter((item) => item.physicalStores === true).length + storefronts.filter((item) => item.physicalStores).length}</strong><span>PHYSICAL</span><small>Only where location evidence exists</small></div></div>
      </section>

      <RetailerMarketDirectory retailers={retailerNetwork} labStorefronts={storefronts} />

      <section className="fd-dash-card fd-retailer-model"><div><span>WHY RETAILER BREADTH MATTERS</span><h2>Useful stock should be discoverable regardless of store size.</h2></div><p>Specialist and independent retailers can hold products collectors would otherwise miss. FateDrop can bridge that discovery gap while keeping national retailers in the same wider network: collectors get more places to buy and each retailer keeps its own website, checkout, fulfilment and customer relationship.</p></section>
      <section className="fd-dash-card fd-retailer-model"><div><span>HOW FATEDROP STAYS NEUTRAL</span><h2>Participation can improve coverage. Payment cannot buy the answer.</h2></div><p>Founding retailer access is focused on catalogue connection, storefront control, analytics and proving business value. Any future paid retailer tools must remain separate from organic Search visibility, FateFind value decisions, verification, alert priority and RRP treatment.</p></section>
      <section className="fd-dash-card fd-retailer-model"><div><span>DATA BOUNDARY</span><h2>Live monitoring and storefront experiments are not the same evidence.</h2></div><p>Cloud monitor health describes FateDrop evidence collection. <strong>EXPERIMENTAL STOREFRONT LAB</strong> feeds remain visibly separate from canonical Cloud runtime evidence until they are promoted through the proper integration path.</p></section>
    </div>
    <style>{`.fd-retailer-hub{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-retailer-hub .fd-dash-card{border-color:rgba(221,203,188,.085);border-radius:12px;background:linear-gradient(145deg,#0f1317,#090d11 74%)}.fd-retailer-hero{padding:28px;overflow:hidden;background:radial-gradient(circle at 90% 8%,rgba(126,87,143,.14),transparent 28%),linear-gradient(145deg,#101419,#090d11 70%)!important}.fd-retailer-message h1{max-width:900px;margin:18px 0 12px;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.5rem,4vw,4.7rem);font-weight:500;line-height:.96;letter-spacing:-.05em}.fd-retailer-message p{font-size:14px;line-height:1.75;max-width:980px;color:#a0989b}.fd-retailer-message strong{color:#cbb09d;font-size:.88em;letter-spacing:.015em}.fd-retailer-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:24px}.fd-retailer-metrics div{padding:15px;border:1px solid rgba(221,203,188,.065);border-radius:10px;background:rgba(255,255,255,.015)}.fd-retailer-metrics strong{display:block;color:#eee4dc;font-family:Georgia,serif;font-size:28px;font-weight:500}.fd-retailer-metrics span{display:block;margin-top:4px;color:#b6977d;font-size:10px;font-weight:900;letter-spacing:.11em}.fd-retailer-metrics small{display:block;margin-top:4px;color:#81797d;font-size:10px}.fd-retailer-model{padding:24px 28px;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:32px;align-items:center}.fd-retailer-model span{font-size:10px;letter-spacing:.14em;color:#b6977d;font-weight:900}.fd-retailer-model h2{margin:7px 0 0;color:#e4dad2;font-family:Georgia,serif;font-size:24px;font-weight:500;line-height:1.15}.fd-retailer-model p{margin:0;color:#989095;font-size:13px;line-height:1.7}.fd-retailer-model p strong{color:#c5aa98}@media(max-width:850px){.fd-retailer-hero{padding:20px}.fd-retailer-metrics,.fd-retailer-model{grid-template-columns:1fr}}`}</style>
  </DashboardPageShell>;
}
