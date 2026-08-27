import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { RetailerMarketDirectory } from "@/components/retailer-market-directory";
import { getRetailerNetworkSnapshot } from "@/lib/retailer-network";

export const metadata: Metadata = { title: "Retailers | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardStoresPage() {
  const network = await getRetailerNetworkSnapshot();
  const retailers = network.retailers;
  const major = retailers.filter((retailer) => retailer.retailerClass === "national");
  const specialists = retailers.filter((retailer) => retailer.retailerClass === "specialist");
  const local = retailers.filter((retailer) => retailer.retailerClass === "independent" || retailer.retailerClass === "regional");
  const physical = retailers.filter((retailer) => retailer.physicalStores === true);

  return <DashboardPageShell title="Retailers" eyebrow="FATE NETWORK · MAJOR · SPECIALIST · INDEPENDENT & LOCAL">
    <div className="fd-retailer-hub">
      <section className="fd-dash-card fd-retailer-hero">
        <div className="fd-dash-card-head"><span>FATE NETWORK · RETAILER DISCOVERY</span><i className={network.available ? "live" : "pending"}>{network.available ? `● ${retailers.length} CLOUD RETAILER${retailers.length === 1 ? "" : "S"}` : "○ DIRECTORY UNAVAILABLE"}</i></div>
        <div className="fd-retailer-message">
          <h1>Discover the stores behind the hobby.</h1>
          <p>Browse major retailers, TCG specialists and independent or local stores through one canonical FateDrop directory. Retailers is for discovering the businesses themselves; <strong>FateFind remains the place to compare products and value across every qualifying connected retailer.</strong></p>
        </div>
        <div className="fd-retailer-metrics">
          <div><strong>{major.length}</strong><span>MAJOR RETAILERS</span><small>Cloud class: national</small></div>
          <div><strong>{specialists.length}</strong><span>TCG SPECIALISTS</span><small>Cloud class: specialist</small></div>
          <div><strong>{local.length}</strong><span>INDEPENDENT & LOCAL</span><small>Independent + regional</small></div>
          <div><strong>{physical.length}</strong><span>PHYSICAL PRESENCE</span><small>Only where Cloud explicitly knows it</small></div>
        </div>
      </section>

      {!network.available ? <section className="fd-dash-card fd-retailer-unavailable"><strong>Retailer directory unavailable.</strong><span>FateDrop will not substitute a static retailer list or guess missing retailer facts. Try again when the canonical Cloud directory is reachable.</span></section> : null}

      <RetailerMarketDirectory retailers={retailers} />

      <section className="fd-dash-card fd-retailer-model"><div><span>ONE CANONICAL IDENTITY</span><h2>The same retailer should mean the same retailer everywhere.</h2></div><p>Search, FateFind, Retailers and Local Radar use the Cloud retailer ID rather than separate Web names or aliases. This keeps catalogue offers, storefronts and physical branches tied to one canonical business identity.</p></section>
      <section className="fd-dash-card fd-retailer-model"><div><span>PHYSICAL TRUTH BOUNDARY</span><h2>A retailer can have stores without FateDrop claiming branch stock.</h2></div><p>Retailers may show that physical locations exist when Cloud knows that fact. Exact physical availability remains Local Radar evidence only. Online availability is never promoted into a physical-store claim.</p></section>
    </div>
    <style>{`.fd-retailer-hub{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-retailer-hub .fd-dash-card{border-color:rgba(221,203,188,.085);border-radius:12px;background:linear-gradient(145deg,#0f1317,#090d11 74%)}.fd-retailer-hero{padding:28px;overflow:hidden;background:radial-gradient(circle at 90% 8%,rgba(126,87,143,.14),transparent 28%),linear-gradient(145deg,#101419,#090d11 70%)!important}.fd-retailer-message h1{max-width:900px;margin:18px 0 12px;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.5rem,4vw,4.7rem);font-weight:500;line-height:.96;letter-spacing:-.05em}.fd-retailer-message p{font-size:14px;line-height:1.75;max-width:980px;color:#a0989b}.fd-retailer-message strong{color:#cbb09d;font-size:.92em}.fd-retailer-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:24px}.fd-retailer-metrics div{padding:15px;border:1px solid rgba(221,203,188,.065);border-radius:10px;background:rgba(255,255,255,.015)}.fd-retailer-metrics strong{display:block;color:#eee4dc;font-family:Georgia,serif;font-size:28px;font-weight:500}.fd-retailer-metrics span{display:block;margin-top:4px;color:#b6977d;font-size:9px;font-weight:900;letter-spacing:.1em}.fd-retailer-metrics small{display:block;margin-top:4px;color:#81797d;font-size:9px}.fd-retailer-unavailable{padding:18px 22px;border-color:rgba(244,183,111,.2)!important}.fd-retailer-unavailable strong{display:block;color:#e0b887;font-size:12px}.fd-retailer-unavailable span{display:block;margin-top:5px;color:#91888a;font-size:10px;line-height:1.55}.fd-retailer-model{padding:24px 28px;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:32px;align-items:center}.fd-retailer-model span{font-size:10px;letter-spacing:.14em;color:#b6977d;font-weight:900}.fd-retailer-model h2{margin:7px 0 0;color:#e4dad2;font-family:Georgia,serif;font-size:24px;font-weight:500;line-height:1.15}.fd-retailer-model p{margin:0;color:#989095;font-size:13px;line-height:1.7}@media(max-width:1000px){.fd-retailer-metrics{grid-template-columns:1fr 1fr}}@media(max-width:850px){.fd-retailer-hero{padding:20px}.fd-retailer-model{grid-template-columns:1fr}}@media(max-width:560px){.fd-retailer-metrics{grid-template-columns:1fr}}`}</style>
  </DashboardPageShell>;
}
