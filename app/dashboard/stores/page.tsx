import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { RetailerMarketDirectory } from "@/components/retailer-market-directory";
import { getCobAndPipCatalogue, getWishlistCollectablesCatalogue } from "@/lib/retailer-catalogue";
import { getRetailerNetwork } from "@/lib/retailer-network";

export const metadata: Metadata = { title: "Stores | Fate Network | FateDrop", robots: { index: false, follow: false } };
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

  return <DashboardPageShell title="Stores" eyebrow="FATE NETWORK · RETAILER DISCOVERY">
    <div className="fd-retailer-hub">
      <section className="fd-dash-card fd-retailer-hero">
        <div className="fd-dash-card-head"><span>ALL STORES · ONLINE · PHYSICAL · NEAR ME</span><i className={cloud.some((item) => item.runtime.healthy) ? "live" : "pending"}>{cloud.length ? `● ${cloud.length} CLOUD RETAILER${cloud.length === 1 ? "" : "S"}` : "○ AWAITING CLOUD"}</i></div>
        <div className="fd-retailer-message"><h1>Discover the stores that make up Fate Network.</h1><p><strong>Stores is retailer-first.</strong> Browse national retailers, specialist stores and independent businesses by who they are, what they sell and where they operate. When you want FateDrop to compare the strongest buying option for a specific product, use <strong>FateFind</strong>. Both surfaces should ultimately read from the same canonical retailer and offer truth.</p></div>
        <div className="fd-retailer-metrics"><div><strong>{major.length}</strong><span>MAJOR / NATIONAL</span><small>Reference and wider-network retailers</small></div><div><strong>{specialistRetailers.length + storefronts.length}</strong><span>SPECIALIST / INDEPENDENT</span><small>Retailers that should remain discoverable beyond cheapest-price ranking</small></div><div><strong>{specialistRetailers.filter((item) => item.physicalStores === true).length + storefronts.filter((item) => item.physicalStores).length}</strong><span>PHYSICAL</span><small>Branches only where location evidence exists</small></div></div>
      </section>

      <RetailerMarketDirectory retailers={retailerNetwork} labStorefronts={storefronts} />

      <section className="fd-dash-card fd-retailer-model"><div><span>STORE DISCOVERY VS VALUE INTELLIGENCE</span><h2>Stores helps you discover retailers. FateFind compares the buying opportunity.</h2></div><p>A smaller retailer should still be visible because it is local, independent, specialist, event-focused or carries products a collector cares about — even when it is not the cheapest current offer. Product searches inside Stores should reuse the same canonical catalogue truth as FateFind without duplicating FateFind&apos;s ranking engine.</p></section>
      <section className="fd-dash-card fd-retailer-model"><div><span>ONLINE + PHYSICAL</span><h2>One retailer identity can have more than one buying channel.</h2></div><p>Online availability and physical branch availability remain separate facts. A hybrid retailer can appear in both views without being duplicated as two businesses. Local Radar can enrich the same physical branch identity with preparation or verified stock evidence when Cloud can genuinely prove it.</p></section>
      <section className="fd-dash-card fd-retailer-model"><div><span>HOW FATEDROP STAYS NEUTRAL</span><h2>Participation can improve coverage. Payment cannot buy the answer.</h2></div><p>Retailer tools can support catalogue connection, storefront control, analytics and visibility. They must remain separate from organic FateFind value decisions, verification, alert priority, RRP treatment and physical-stock truth.</p></section>
    </div>
    <style>{`.fd-retailer-hub{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-retailer-hub .fd-dash-card{border-color:rgba(221,203,188,.085);border-radius:12px;background:linear-gradient(145deg,#0f1317,#090d11 74%)}.fd-retailer-hero{padding:28px;overflow:hidden;background:radial-gradient(circle at 90% 8%,rgba(126,87,143,.14),transparent 28%),linear-gradient(145deg,#101419,#090d11 70%)!important}.fd-retailer-message h1{max-width:900px;margin:18px 0 12px;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.5rem,4vw,4.7rem);font-weight:500;line-height:.96;letter-spacing:-.05em}.fd-retailer-message p{font-size:14px;line-height:1.75;max-width:980px;color:#a0989b}.fd-retailer-message strong{color:#cbb09d;font-size:.92em;letter-spacing:.015em}.fd-retailer-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:24px}.fd-retailer-metrics div{padding:15px;border:1px solid rgba(221,203,188,.065);border-radius:10px;background:rgba(255,255,255,.015)}.fd-retailer-metrics strong{display:block;color:#eee4dc;font-family:Georgia,serif;font-size:28px;font-weight:500}.fd-retailer-metrics span{display:block;margin-top:4px;color:#b6977d;font-size:10px;font-weight:900;letter-spacing:.11em}.fd-retailer-metrics small{display:block;margin-top:4px;color:#81797d;font-size:10px}.fd-retailer-model{padding:24px 28px;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:32px;align-items:center}.fd-retailer-model span{font-size:10px;letter-spacing:.14em;color:#b6977d;font-weight:900}.fd-retailer-model h2{margin:7px 0 0;color:#e4dad2;font-family:Georgia,serif;font-size:24px;font-weight:500;line-height:1.15}.fd-retailer-model p{margin:0;color:#989095;font-size:13px;line-height:1.7}.fd-retailer-model p strong{color:#c5aa98}@media(max-width:850px){.fd-retailer-hero{padding:20px}.fd-retailer-metrics,.fd-retailer-model{grid-template-columns:1fr}}`}</style>
  </DashboardPageShell>;
}
