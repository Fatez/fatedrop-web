import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getRetailerNetwork } from "@/lib/retailer-network";

export const metadata: Metadata = { title: "Indies | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const WISHLIST_BRAND_IMAGE = "https://www.wishlistcollectables.co.uk/cdn/shop/files/IMG_20231207_152535.jpg?v=1702206733&width=1500";
const COB_AND_PIP_LOGO = "https://cobandpip.co.uk/cdn/shop/files/Cob_and_Pip_LOGO.jpg?v=1747145906";
const INDIES_STATUS_TIMEOUT_MS = 1_500;

function relative(epoch: number | null) {
  if (!epoch) return "No successful scan recorded";
  const minutes = Math.max(0, Math.floor((Date.now() / 1000 - epoch) / 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 48 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

export default async function DashboardStoresPage() {
  const retailerNetwork = await getRetailerNetwork(INDIES_STATUS_TIMEOUT_MS);
  const monitored = retailerNetwork.filter((retailer) => retailer.source === "cloud");
  const healthy = monitored.filter((retailer) => retailer.runtime.healthy).length;
  const storefronts = [
    { id: "wishlist-collectables", name: "Wishlist Collectables", location: "London · Online + physical", tags: ["Pokémon", "Lorcana", "One Piece", "Yu-Gi-Oh"], href: "/dashboard/stores/wishlist-collectables", note: "Experimental storefront", image: WISHLIST_BRAND_IMAGE, imageMode: "cover" },
    { id: "cob-and-pip", name: "Cob & Pip", location: "UK · Online", tags: ["Pokémon", "TCG"], href: "/dashboard/stores/cob-and-pip", note: "Experimental storefront", image: COB_AND_PIP_LOGO, imageMode: "contain" },
  ];

  return <DashboardPageShell title="Indies" eyebrow="THE BRIDGE TO INDEPENDENT TCG STORES">
    <div className="fd-indies-page">
      <section className="fd-dash-card fd-indies-hero">
        <div className="fd-indies-copy">
          <span>INDEPENDENT DISCOVERY</span>
          <h1>Small stores should not be invisible.</h1>
          <p>FateDrop helps collectors search beyond the obvious big retailers and helps independent TCG stores put their products in front of people already looking for them. FateDrop handles discovery and context; <b>the retailer still owns the product page, checkout and customer relationship.</b></p>
          <div className="fd-indies-actions"><Link href="/dashboard/search">Search the network →</Link><Link href="/dashboard/true-price">Compare True Price →</Link></div>
        </div>
        <div className="fd-indies-stats">
          <div><strong>{monitored.length || "—"}</strong><span>CONNECTED RETAILERS</span><small>Observed by the Cloud network</small></div>
          <div><strong>{monitored.length ? healthy : "—"}</strong><span>HEALTHY MONITORS</span><small>Current runtime evidence</small></div>
          <div><strong>{storefronts.length}</strong><span>LAB STOREFRONT PREVIEWS</span><small>Deep catalogues load only when opened</small></div>
        </div>
      </section>

      <section className="fd-dash-card fd-indies-flow">
        <div><b>1</b><strong>COLLECTOR SEARCHES</strong><span>“Who has the card or sealed product I want?”</span></div>
        <i>→</i>
        <div><b>2</b><strong>FATEDROP CONNECTS THE DOTS</strong><span>Search, stock evidence, RRP and True Price make the options clearer.</span></div>
        <i>→</i>
        <div className="retailer"><b>3</b><strong>BUY FROM THE INDIE</strong><span>You continue to the retailer. FateDrop is the bridge, not the marketplace.</span></div>
      </section>

      <section className="fd-dash-card fd-indies-network">
        <div className="fd-indies-head"><div><span>LIVE NETWORK</span><h2>Retailers FateDrop can currently observe.</h2><p>A connected monitor means FateDrop has operational evidence from that retailer. It is not a paid ranking, endorsement or blanket trust badge.</p></div><Link href="/dashboard/search">Search observed offers →</Link></div>
        {monitored.length ? <div className="fd-indies-network-grid">{monitored.map((retailer)=><article key={retailer.id}>
          <div className="fd-indie-status"><span className={retailer.runtime.healthy ? "healthy" : "warning"}>{retailer.runtime.healthy ? "● LIVE" : "○ DEGRADED"}</span><small>{retailer.runtime.baselineCompleted ? "CATALOGUE BASELINE COMPLETE" : "BASELINE PENDING"}</small></div>
          <h3>{retailer.name}</h3><p>{retailer.category.replaceAll("-"," ")}</p>
          <dl><div><dt>PRODUCTS SEEN</dt><dd>{retailer.runtime.productsSeen ?? "—"}</dd></div><div><dt>LAST SUCCESS</dt><dd>{relative(retailer.runtime.lastSuccessAt)}</dd></div></dl>
          <div className="fd-indie-links">{retailer.website ? <a href={retailer.website} target="_blank" rel="noreferrer">VISIT STORE ↗</a> : null}<Link href={`/dashboard/search?q=${encodeURIComponent(retailer.name)}`}>SEARCH FATEDROP →</Link></div>
        </article>)}</div> : <div className="fd-dashboard-empty"><strong>Live retailer health did not answer quickly enough.</strong><span>The page stays usable instead of waiting on the monitoring service. Refresh later for current runtime evidence.</span></div>}
      </section>

      <section className="fd-dash-card fd-indies-lab">
        <div className="fd-indies-head"><div><span>STOREFRONT LAB</span><h2>What participating indie pages can become.</h2><p>These experimental direct feeds are a preview of the retailer storefront experience. They are deliberately separated from the canonical Cloud network until their data path is formally connected.</p></div></div>
        <div className="fd-indies-store-grid">{storefronts.map((store) => <article key={store.id}>
          <div className="fd-indies-store-image" style={{ backgroundImage: `url("${store.image}")`, backgroundSize: store.imageMode }} />
          <div className="fd-indies-store-body"><small>{store.note}</small><h3>{store.name}</h3><p>{store.location}</p><div className="fd-indies-tags">{store.tags.map((tag)=><span key={tag}>{tag}</span>)}</div><div className="fd-indies-store-metrics"><span><b>FAST PREVIEW</b> overview only</span><span><b>ON DEMAND</b> catalogue loads when opened</span></div><Link href={store.href}>Explore storefront preview →</Link></div>
        </article>)}</div>
      </section>

      <section className="fd-dash-card fd-indies-why">
        <div><span>WHY FATEDROP BUILDS THIS</span><h2>Collectors get more choice. Indies get more visibility.</h2></div>
        <p>The network works when both sides win: collectors can discover stock and compare the real buying context more easily, while smaller stores can be found without surrendering their checkout or brand to another marketplace.</p>
      </section>
    </div>
    <style>{`
      .fd-indies-page{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-indies-page .fd-dash-card{border-color:rgba(221,203,188,.085);background:linear-gradient(145deg,#0e1216,#090d11 74%);border-radius:12px}.fd-indies-hero{padding:28px;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(340px,.7fr);gap:30px;background:radial-gradient(circle at 92% 10%,rgba(146,105,72,.12),transparent 28%),linear-gradient(145deg,#101318,#090c10 70%)!important}.fd-indies-copy>span,.fd-indies-head span,.fd-indies-why span{color:#aa886d;font-size:7px;font-weight:900;letter-spacing:.16em}.fd-indies-copy h1{max-width:900px;margin:9px 0 13px;color:#eee4da;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.5rem,4.2vw,4.9rem);font-weight:500;line-height:.93;letter-spacing:-.05em}.fd-indies-copy p{max-width:860px;margin:0;color:#918885;font-size:12px;line-height:1.72}.fd-indies-copy p b{color:#d7c9bd}.fd-indies-actions{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}.fd-indies-actions a{padding:10px 13px;border:1px solid rgba(172,129,193,.18);border-radius:9px;color:#c9a8d7;background:rgba(119,76,146,.06);font-size:8px;font-weight:850;text-decoration:none}.fd-indies-stats{display:grid;gap:8px;align-content:center}.fd-indies-stats>div{padding:15px;border:1px solid rgba(221,203,188,.07);border-radius:10px;background:rgba(255,255,255,.018)}.fd-indies-stats strong{display:block;color:#e8ded4;font-family:Georgia,serif;font-size:28px;font-weight:500}.fd-indies-stats span{display:block;color:#a98972;font-size:7px;font-weight:900;letter-spacing:.1em}.fd-indies-stats small{color:#706968;font-size:7px}.fd-indies-flow{padding:16px;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:10px;align-items:center}.fd-indies-flow>div{min-height:82px;padding:13px;border:1px solid rgba(221,203,188,.065);border-radius:9px;background:rgba(255,255,255,.015);display:grid;grid-template-columns:27px 1fr;gap:4px 8px;align-content:center}.fd-indies-flow>div.retailer{border-color:rgba(132,164,117,.16);background:rgba(111,145,95,.04)}.fd-indies-flow b{grid-row:1/3;width:27px;height:27px;display:grid;place-items:center;border-radius:7px;background:rgba(119,76,146,.08);color:#b58ac6;font-size:8px}.fd-indies-flow strong{font-size:8px;color:#ccc1ba;letter-spacing:.07em}.fd-indies-flow span{font-size:7px;color:#71696a;line-height:1.4}.fd-indies-flow>i{font-style:normal;color:#5f555c}.fd-indies-network,.fd-indies-lab{padding:22px}.fd-indies-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.fd-indies-head h2,.fd-indies-why h2{margin:5px 0 0;color:#ddd3ca;font-family:Georgia,serif;font-size:24px;font-weight:500}.fd-indies-head p{max-width:760px;margin:6px 0 0;color:#7d7574;font-size:9px;line-height:1.6}.fd-indies-head>a{color:#b58ac6;font-size:8px;font-weight:850;text-decoration:none}.fd-indies-network-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:18px}.fd-indies-network-grid article{padding:16px;border:1px solid rgba(221,203,188,.07);border-radius:10px;background:rgba(255,255,255,.015)}.fd-indie-status{display:flex;justify-content:space-between;gap:8px}.fd-indie-status span{font-size:7px;font-weight:900;letter-spacing:.1em}.fd-indie-status .healthy{color:#86a678}.fd-indie-status .warning{color:#ba8f6e}.fd-indie-status small{color:#686061;font-size:6px}.fd-indies-network-grid h3{margin:12px 0 4px;color:#d8cec6;font-size:15px}.fd-indies-network-grid p{margin:0;color:#6f6868;font-size:8px;text-transform:capitalize}.fd-indies-network-grid dl{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:14px 0}.fd-indies-network-grid dl div{padding:8px;border:1px solid rgba(221,203,188,.05);border-radius:7px}.fd-indies-network-grid dt{color:#655e5f;font-size:6px;font-weight:900}.fd-indies-network-grid dd{margin:3px 0 0;font-size:8px}.fd-indie-links{display:flex;gap:10px;flex-wrap:wrap}.fd-indie-links a{color:#b58ac6;font-size:7px;font-weight:900;text-decoration:none}.fd-indies-store-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:18px}.fd-indies-store-grid>article{display:grid;grid-template-columns:180px 1fr;min-height:235px;overflow:hidden;border:1px solid rgba(221,203,188,.07);border-radius:10px;background:rgba(255,255,255,.015)}.fd-indies-store-image{background-position:center;background-repeat:no-repeat;background-color:#ece9e5}.fd-indies-store-body{padding:17px}.fd-indies-store-body>small{color:#a78770;font-size:6px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.fd-indies-store-body h3{margin:7px 0 4px;font-size:18px}.fd-indies-store-body p{margin:0;color:#746d6d;font-size:8px}.fd-indies-tags{display:flex;gap:5px;flex-wrap:wrap;margin:12px 0}.fd-indies-tags span{padding:4px 6px;border:1px solid rgba(221,203,188,.07);border-radius:999px;color:#8c8381;font-size:6px}.fd-indies-store-metrics{display:flex;gap:12px;color:#756d6c;font-size:7px;flex-wrap:wrap}.fd-indies-store-metrics b{color:#c9beb6}.fd-indies-store-body>a{display:inline-block;margin-top:14px;color:#b58ac6;font-size:8px;font-weight:900;text-decoration:none}.fd-indies-why{padding:22px 24px;display:grid;grid-template-columns:.9fr 1.1fr;gap:30px;align-items:center}.fd-indies-why p{margin:0;color:#857d7b;font-size:10px;line-height:1.65}@media(max-width:1100px){.fd-indies-network-grid{grid-template-columns:1fr 1fr}.fd-indies-store-grid{grid-template-columns:1fr}}@media(max-width:900px){.fd-indies-hero,.fd-indies-why,.fd-indies-flow{grid-template-columns:1fr}.fd-indies-flow>i{display:none}.fd-indies-stats{grid-template-columns:repeat(3,1fr)}}@media(max-width:650px){.fd-indies-hero,.fd-indies-network,.fd-indies-lab{padding:18px}.fd-indies-stats,.fd-indies-network-grid{grid-template-columns:1fr}.fd-indies-store-grid>article{grid-template-columns:1fr}.fd-indies-store-image{height:140px}}
    `}</style>
  </DashboardPageShell>;
}
