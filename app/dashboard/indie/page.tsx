import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { resolveRetailerWorkspace } from "@/lib/retailer-access";
import { getRetailerValueDashboard } from "@/lib/retailer-insights";
import { listAnonymousRetailerDemand } from "@/lib/retailer-demand";

export const metadata: Metadata = { title: "FateDrop Indie Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function number(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

export default async function IndieDashboardPage({ searchParams }: { searchParams: Promise<{ retailer?: string; days?: string }> }) {
  const params = await searchParams;
  const days = Math.min(Math.max(Number.parseInt(params.days ?? "30", 10) || 30, 7), 90);
  let snapshot: Awaited<ReturnType<typeof getCurrentSnapshot>> = null;
  try { snapshot = await getCurrentSnapshot(); } catch { snapshot = null; }

  if (!snapshot) return <DashboardPageShell title="Indie Dashboard" eyebrow="RETAILER VALUE PROOF">
    <section className="fd-dash-card fd-indie-gate"><span>FATEDROP INDIE</span><h1>Your shop. Your network impact.</h1><p>Sign in with the FateDrop ID linked to your retailer workspace to see privacy-safe traffic, FateFind visibility and collector demand.</p><Link href="/account/login?next=%2Fdashboard%2Findie">SIGN IN →</Link></section>
    <style>{gateStyles}</style>
  </DashboardPageShell>;

  let workspace: Awaited<ReturnType<typeof resolveRetailerWorkspace>> = null;
  try { workspace = await resolveRetailerWorkspace(snapshot.account.id, params.retailer); } catch { workspace = null; }

  if (!workspace) return <DashboardPageShell title="Indie Dashboard" eyebrow="RETAILER VALUE PROOF">
    <section className="fd-dash-card fd-indie-gate"><span>RETAILER WORKSPACE</span><h1>No verified shop is linked to this FateDrop ID yet.</h1><p>Retailer analytics are private. FateDrop only opens a workspace after the business and its account mapping have been verified.</p><div><Link href="/join?type=business">CONNECT YOUR INDIE →</Link>{process.env.NODE_ENV !== "production" ? <><Link href="/dashboard/indie?retailer=cob-and-pip">PREVIEW COB & PIP</Link><Link href="/dashboard/indie?retailer=wishlist-collectables">PREVIEW WISHLIST COLLECTABLES</Link></> : null}</div></section>
    <style>{gateStyles}</style>
  </DashboardPageShell>;

  const [insights, demand] = await Promise.all([
    getRetailerValueDashboard(workspace.retailer, { days }).catch(() => null),
    listAnonymousRetailerDemand(workspace.retailer, 10).catch(() => []),
  ]);
  const metrics = insights?.metrics ?? { productAppearances: 0, searchAppearances: 0, fateFindAppearances: 0, bestValueWins: 0, outboundClicks: 0, storefrontViews: 0, fateMatchHandoffs: 0 };
  const maxTrend = Math.max(1, ...(insights?.trend ?? []).map((point) => point.appearances + point.outboundClicks + point.fateMatchHandoffs));
  const demandGaps = demand.filter((item) => item.retailerStockKnown && item.retailerCurrentlyStocksIdentity === false);

  return <DashboardPageShell title="Indie Dashboard" eyebrow="RETAILER VALUE PROOF">
    <div className="fd-indie-dashboard">
      <section className="fd-dash-card fd-indie-hero">
        <div><span>FATEDROP INDIE · {workspace.role.toUpperCase()}</span><h1>{workspace.retailer.name}</h1><p>See the measurable value FateDrop is creating for your business: where your catalogue is appearing, how often collectors leave FateDrop for your store, and which products the community is actively trying to buy.</p></div>
        <aside><b>{workspace.preview ? "BETA PREVIEW" : "VERIFIED WORKSPACE"}</b><small>{days}-day measurement window</small><small>{insights?.lastActivityDay ? `Latest measured activity · ${insights.lastActivityDay}` : "Waiting for measured activity"}</small></aside>
      </section>

      <section className="fd-indie-metrics" aria-label="Retailer value metrics">
        <article><small>PRODUCT APPEARANCES</small><strong>{number(metrics.productAppearances)}</strong><span>Search + FateFind visibility</span></article>
        <article><small>FATEFIND APPEARANCES</small><strong>{number(metrics.fateFindAppearances)}</strong><span>Your offers in value comparisons</span></article>
        <article><small>BEST VALUE WINS</small><strong>{number(metrics.bestValueWins)}</strong><span>FateFind value recommendations</span></article>
        <article className="primary"><small>RETAILER VISITS SENT</small><strong>{number(metrics.outboundClicks)}</strong><span>Collectors opened your website</span></article>
        <article><small>FATEMATCH HANDOFFS</small><strong>{number(metrics.fateMatchHandoffs)}</strong><span>Your offer satisfied a watch</span></article>
        <article><small>STOREFRONT VIEWS</small><strong>{number(metrics.storefrontViews)}</strong><span>Your FateDrop store presence</span></article>
      </section>

      <section className="fd-indie-grid">
        <article className="fd-dash-card fd-indie-panel">
          <header><div><span>YOUR TOP PRODUCTS</span><h2>What is earning collector attention?</h2></div><small>{days} DAYS</small></header>
          {insights?.topProducts.length ? <div className="fd-indie-products">{insights.topProducts.map((product, index) => <div key={product.title}><b>{index + 1}</b><span><strong>{product.title}</strong><small>{number(product.appearances)} appearances · {number(product.outboundClicks)} retailer visits</small></span><em>{product.bestValueWins ? `${number(product.bestValueWins)} best-value wins` : product.fateMatchHandoffs ? `${number(product.fateMatchHandoffs)} FateMatch handoffs` : "Building evidence"}</em></div>)}</div> : <div className="fd-indie-empty"><strong>No product traffic measured yet.</strong><span>As signed-in collectors encounter this retailer through Search and FateFind, evidence will accumulate here.</span></div>}
        </article>

        <article className="fd-dash-card fd-indie-panel">
          <header><div><span>NETWORK MOVEMENT</span><h2>Visibility → high-intent handoff</h2></div><small>DAILY</small></header>
          {insights?.trend.length ? <div className="fd-indie-trend">{insights.trend.slice(-14).map((point) => { const total = point.appearances + point.outboundClicks + point.fateMatchHandoffs; return <div key={point.day} title={`${point.day}: ${point.appearances} appearances, ${point.outboundClicks} retailer visits, ${point.fateMatchHandoffs} FateMatch handoffs`}><i style={{ height: `${Math.max(4, Math.round((total / maxTrend) * 100))}%` }}/><small>{point.day.slice(5)}</small></div>; })}</div> : <div className="fd-indie-empty"><strong>Your evidence line starts with the first interaction.</strong><span>FateDrop will show measured activity here rather than filling the chart with demo traffic.</span></div>}
          <footer><span><i/> APPEARANCES + HANDOFFS</span><b>{number(metrics.searchAppearances)} Search appearances</b></footer>
        </article>
      </section>

      <section className="fd-dash-card fd-indie-demand">
        <header><div><span>COLLECTOR DEMAND</span><h2>What are people actively asking FateMatch to find?</h2></div><small>ANONYMOUS · AGGREGATED</small></header>
        <p>These numbers come from active FateMatch intent and never expose who the collectors are. A stock-gap label is only shown when FateDrop has a verified product-identity link to your connected catalogue.</p>
        {demand.length ? <div>{demand.map((item) => <article key={item.productIdentityId} className={item.retailerCurrentlyStocksIdentity === false ? "gap" : ""}><span><strong>{item.title}</strong><small>{item.onlineDemand} online · {item.localDemand} local/either</small></span><b>{number(item.activeFateMatches)}<small>ACTIVE FATEMATCHES</small></b><em>{item.retailerCurrentlyStocksIdentity === false ? "DEMAND GAP · NOT CURRENTLY STOCKED" : item.retailerCurrentlyStocksIdentity === true ? "YOUR NETWORK STOCK IS VISIBLE" : "STOCK OVERLAP NOT YET VERIFIED"}</em></article>)}</div> : <div className="fd-indie-empty"><strong>Demand intelligence is waiting for enough verified FateMatch intent.</strong><span>FateDrop will not manufacture demand numbers or infer a stock gap from an unlinked catalogue.</span></div>}
        {demandGaps.length ? <footer><strong>{demandGaps.length} verified demand opportunit{demandGaps.length === 1 ? "y" : "ies"}</strong><span>Use these as buying signals for your own stock planning — not as guaranteed future sales.</span></footer> : null}
      </section>

      <section className="fd-dash-card fd-indie-proof"><div><span>WHAT FATEDROP CAN PROVE</span><h2>Traffic and intent, not invented sales.</h2></div><p>{insights?.definition ?? "FateDrop records privacy-safe network visibility and retailer handoffs."} Revenue attribution will only appear later when a retailer explicitly opts into a verified conversion integration such as Shopify or WooCommerce.</p></section>
    </div>
    <style>{styles}</style>
  </DashboardPageShell>;
}

const gateStyles = `
.fd-indie-gate{max-width:920px;padding:34px}.fd-indie-gate>span{color:#b6977d;font-size:11px;font-weight:900;letter-spacing:.14em}.fd-indie-gate h1{margin:8px 0 12px;color:#eee4dc;font:500 clamp(2rem,4vw,4rem)/1 Georgia,serif}.fd-indie-gate p{max-width:720px;color:#aaa1a7;font-size:14px;line-height:1.7}.fd-indie-gate div{display:flex;gap:10px;flex-wrap:wrap}.fd-indie-gate a{display:inline-flex;margin-top:12px;padding:11px 14px;border:1px solid rgba(183,119,233,.22);border-radius:9px;color:#d4b4e7;font-size:12px;font-weight:900;text-decoration:none}
`;

const styles = `
.fd-indie-dashboard{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-indie-dashboard .fd-dash-card{border-color:rgba(221,203,188,.085);border-radius:13px;background:linear-gradient(145deg,#0f1317,#090d11 75%)}.fd-indie-hero{padding:28px;display:flex;justify-content:space-between;gap:30px;background:radial-gradient(circle at 88% 4%,rgba(133,91,158,.15),transparent 28%),linear-gradient(145deg,#11151a,#090d11 72%)!important}.fd-indie-hero>div>span,.fd-indie-panel header span,.fd-indie-demand header span,.fd-indie-proof span{color:#b6977d;font-size:10px;font-weight:900;letter-spacing:.14em}.fd-indie-hero h1{margin:7px 0 10px;color:#eee5dd;font:500 clamp(2.5rem,5vw,5rem)/.95 Georgia,serif;letter-spacing:-.04em}.fd-indie-hero p{max-width:840px;margin:0;color:#aaa1a7;font-size:14px;line-height:1.7}.fd-indie-hero aside{min-width:220px;align-self:flex-start;padding:14px;border:1px solid rgba(183,119,233,.12);border-radius:11px;display:grid;gap:5px}.fd-indie-hero aside b{color:#c9a9dc;font-size:11px}.fd-indie-hero aside small{color:#938a90;font-size:11px}.fd-indie-metrics{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.fd-indie-metrics article{min-height:116px;padding:16px;border:1px solid rgba(221,203,188,.075);border-radius:11px;background:#0c1014;display:flex;flex-direction:column}.fd-indie-metrics article.primary{border-color:rgba(113,232,174,.18);background:linear-gradient(145deg,rgba(113,232,174,.055),#0c1014 65%)}.fd-indie-metrics small{color:#8e8281;font-size:10px;font-weight:900;letter-spacing:.08em}.fd-indie-metrics strong{margin:8px 0 5px;color:#eee4dc;font-size:30px}.fd-indie-metrics .primary strong{color:#9fd4b6}.fd-indie-metrics span{margin-top:auto;color:#81797d;font-size:11px;line-height:1.4}.fd-indie-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.fd-indie-panel,.fd-indie-demand{padding:21px}.fd-indie-panel header,.fd-indie-demand header{display:flex;justify-content:space-between;gap:20px}.fd-indie-panel h2,.fd-indie-demand h2,.fd-indie-proof h2{margin:5px 0 0;color:#ddd4cd;font:500 22px/1.2 Georgia,serif}.fd-indie-panel header>small,.fd-indie-demand header>small{color:#777077;font-size:10px;font-weight:900}.fd-indie-products{display:grid;margin-top:16px}.fd-indie-products>div{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 0;border-top:1px solid rgba(221,203,188,.06)}.fd-indie-products>div>b{width:25px;height:25px;display:grid;place-items:center;border:1px solid rgba(183,119,233,.14);border-radius:7px;color:#b393c5;font-size:10px}.fd-indie-products span{display:grid;gap:3px}.fd-indie-products strong{color:#d9d0ca;font-size:13px}.fd-indie-products small{color:#81797d;font-size:11px}.fd-indie-products em{color:#9d8a79;font-size:10px;font-style:normal;font-weight:900}.fd-indie-trend{height:190px;margin-top:18px;display:flex;align-items:flex-end;gap:5px;padding:8px 6px 0;border-bottom:1px solid rgba(221,203,188,.08)}.fd-indie-trend>div{height:100%;flex:1;min-width:8px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:5px}.fd-indie-trend i{width:min(18px,80%);min-height:4px;border-radius:4px 4px 1px 1px;background:linear-gradient(#b78ce0,#6a4a82)}.fd-indie-trend small{color:#716a70;font-size:8px;writing-mode:vertical-rl}.fd-indie-panel footer{display:flex;justify-content:space-between;gap:12px;margin-top:10px;color:#837a80;font-size:10px}.fd-indie-panel footer span i{display:inline-block;width:7px;height:7px;margin-right:4px;border-radius:2px;background:#9f72bf}.fd-indie-demand>p{max-width:950px;color:#948b90;font-size:12px;line-height:1.6}.fd-indie-demand>div:not(.fd-indie-empty){display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:14px}.fd-indie-demand article{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 16px;padding:13px;border:1px solid rgba(221,203,188,.06);border-radius:10px}.fd-indie-demand article.gap{border-color:rgba(205,151,93,.18);background:rgba(205,151,93,.025)}.fd-indie-demand article span{display:grid;gap:3px}.fd-indie-demand article strong{font-size:12px;color:#d7cec8}.fd-indie-demand article span small{font-size:10px;color:#7d7479}.fd-indie-demand article>b{font-size:20px;color:#c6a9d6;text-align:right}.fd-indie-demand article>b small{display:block;font-size:7px;color:#786f75;letter-spacing:.06em}.fd-indie-demand article em{grid-column:1/-1;color:#9b806b;font-size:9px;font-style:normal;font-weight:900}.fd-indie-demand footer{display:flex;gap:10px;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid rgba(221,203,188,.06);color:#8d8589;font-size:11px}.fd-indie-demand footer strong{color:#c8a985}.fd-indie-empty{margin-top:15px;padding:18px;border:1px dashed rgba(221,203,188,.1);border-radius:10px;display:grid;gap:5px}.fd-indie-empty strong{color:#c9c0ba;font-size:13px}.fd-indie-empty span{color:#81797e;font-size:11px;line-height:1.55}.fd-indie-proof{padding:21px 23px;display:grid;grid-template-columns:.85fr 1.15fr;gap:32px;align-items:center}.fd-indie-proof p{margin:0;color:#9b9296;font-size:12px;line-height:1.7}@media(max-width:1180px){.fd-indie-metrics{grid-template-columns:repeat(3,1fr)}}@media(max-width:850px){.fd-indie-hero{flex-direction:column}.fd-indie-grid,.fd-indie-demand>div:not(.fd-indie-empty),.fd-indie-proof{grid-template-columns:1fr}.fd-indie-metrics{grid-template-columns:1fr 1fr}}@media(max-width:520px){.fd-indie-metrics{grid-template-columns:1fr}.fd-indie-products>div{grid-template-columns:28px 1fr}.fd-indie-products em{grid-column:2}.fd-indie-demand article{grid-template-columns:1fr}}
`;
