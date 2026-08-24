import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { searchSignalFateFind, type SignalFateFindOpportunity } from "@/lib/signal-engine-client";

export const metadata: Metadata = { title: "FateFind | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function gbp(pence: number | null) {
  return pence === null ? "—" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

function Opportunity({ offer, best = false }: { offer: SignalFateFindOpportunity; best?: boolean }) {
  return <article className={best ? "fd-find-offer best" : "fd-find-offer"}>
    <header>
      <div><small>{best ? "BEST VALUE NOW" : `#${offer.rank} FATEFIND`}</small><h2>{offer.productTitle}</h2><span>{offer.retailerName || "Connected retailer"} · {offer.stockStatus.replaceAll("_", " ")}</span></div>
      {offer.valueLabel ? <b>{offer.valueLabel}</b> : <b className="unknown">RRP VALUE UNAVAILABLE</b>}
    </header>
    <div className="fd-find-price-grid">
      <div><small>ITEM</small><strong>{gbp(offer.itemPricePence)}</strong></div>
      <div><small>RRP / REFERENCE</small><strong>{gbp(offer.rrpPence)}</strong></div>
      <div><small>DELIVERY</small><strong>{offer.deliveryKnown ? gbp(offer.deliveryPence) : "UNKNOWN"}</strong></div>
      <div><small>TRUE PRICE</small><strong>{gbp(offer.truePricePence)}</strong></div>
    </div>
    <p>{offer.rrpReferenceBasis || (offer.rrpResolved ? "Verified RRP/reference" : "Verified RRP/reference unavailable — FateDrop will not invent one.")}</p>
    <footer>
      {offer.url ? <a href={offer.url} target="_blank" rel="noreferrer">BUY NOW ↗</a> : <span>Retailer route unavailable</span>}
      <Link href={`/dashboard/watchlist?q=${encodeURIComponent(offer.productTitle)}&productId=${encodeURIComponent(offer.productId || "")}`}>LET ME KNOW WHEN IN STOCK →</Link>
    </footer>
  </article>;
}

export default async function FateFindPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const result = q.length >= 2 ? await searchSignalFateFind(q) : null;
  const best = result?.bestOpportunity ?? null;
  const rest = result?.rankedOffers.filter((offer) => offer.rank !== 1) ?? [];

  return <DashboardPageShell title="FateFind" eyebrow="BEST VALUE · LIVE NOW">
    <div className="fd-find-page">
      <section className="fd-dash-card fd-find-hero">
        <span>FATEFIND</span>
        <h1>Find the strongest-value option available now.</h1>
        <p>FateDrop checks the live network, understands the product configuration, uses the correct RRP/reference and ranks real buying opportunities. The smallest raw £ number does not automatically win.</p>
        <form action="/dashboard/fatefind" method="get"><input name="q" defaultValue={q} autoFocus placeholder="Try: Destined Rivals booster packs" aria-label="FateFind product"/><button type="submit">FATEFIND →</button></form>
      </section>

      {!q ? <section className="fd-dash-card fd-find-empty"><strong>What do you want to buy?</strong><span>Enter a product or set. FateFind will compare the currently purchasable options using the shared Cloud intelligence.</span></section> : q.length < 2 ? <section className="fd-dash-card fd-find-empty"><strong>Keep typing.</strong><span>Use at least two characters.</span></section> : !result ? <section className="fd-dash-card fd-find-empty"><strong>FateFind is temporarily unavailable.</strong><span>No local fallback ranking is invented. The website waits for the same shared Cloud result used by the app.</span></section> : !best ? <section className="fd-dash-card fd-find-empty"><strong>No live buying opportunity right now.</strong><span>Create a FateMatch and let your companion watch for the product instead.</span><Link href={`/dashboard/watchlist?q=${encodeURIComponent(q)}`}>LET ME KNOW WHEN THIS IS IN STOCK →</Link></section> : <>
        <section className="fd-find-result-head"><div><span>FATEFIND RESULT</span><h2>Best value now</h2></div><small>{result.rankedOffers.length} live option{result.rankedOffers.length === 1 ? "" : "s"} compared · one shared Cloud ranking</small></section>
        <Opportunity offer={best} best/>
        {result.comparisonStatus === "ranked_without_rrp" ? <p className="fd-find-warning">A verified RRP/reference is unavailable for the leading result, so FateDrop is not presenting it as an RRP-value winner.</p> : null}
        {rest.length ? <><section className="fd-find-result-head"><div><span>OTHER LIVE OPTIONS</span><h2>Ranked alternatives</h2></div></section>{rest.map((offer) => <Opportunity key={offer.offerId || `${offer.productId}:${offer.rank}`} offer={offer}/>)}</> : null}
      </>}
    </div>
    <style>{`
      .fd-find-page{display:grid;gap:14px;max-width:1500px;margin:0 auto}.fd-find-hero{padding:30px;background:radial-gradient(circle at 85% 0%,rgba(128,89,151,.1),transparent 35%),linear-gradient(145deg,#101318,#090c10 72%)}.fd-find-hero>span,.fd-find-result-head span{color:#b19378;font-size:8px;font-weight:900;letter-spacing:.16em}.fd-find-hero h1{max-width:900px;margin:9px 0 12px;color:#eee4da;font-family:Georgia,serif;font-size:clamp(2rem,4vw,4rem);font-weight:500;line-height:1}.fd-find-hero p{max-width:900px;color:#9a918d;font-size:12px;line-height:1.65}.fd-find-hero form{display:flex;gap:9px;margin-top:20px;max-width:820px}.fd-find-hero input{flex:1;height:50px;padding:0 15px;border:1px solid rgba(221,203,188,.11);border-radius:12px;background:#0b0f13;color:#eee4da}.fd-find-hero button{padding:0 20px;border:1px solid rgba(172,129,193,.26);border-radius:12px;background:rgba(112,72,140,.15);color:#eee4da;font-size:9px;font-weight:900}.fd-find-empty{padding:26px;display:grid;gap:7px}.fd-find-empty strong{color:#ded4cb;font-size:18px}.fd-find-empty span{color:#81797a;font-size:11px}.fd-find-empty a{width:max-content;margin-top:7px;color:#c4a2d0;font-size:9px;font-weight:900;text-decoration:none}.fd-find-result-head{display:flex;justify-content:space-between;align-items:end;gap:14px;margin-top:9px;padding:0 4px}.fd-find-result-head h2{margin:4px 0 0;color:#ded4cb;font-family:Georgia,serif;font-size:24px;font-weight:500}.fd-find-result-head small{color:#766f70;font-size:8px}.fd-find-offer{padding:20px;border:1px solid rgba(221,203,188,.075);border-radius:14px;background:#0b0f13}.fd-find-offer.best{border-color:rgba(126,161,111,.25);background:linear-gradient(145deg,rgba(91,129,79,.065),#0b0f13 42%)}.fd-find-offer header{display:flex;justify-content:space-between;gap:20px}.fd-find-offer header small{color:#91b181;font-size:7px;font-weight:900;letter-spacing:.13em}.fd-find-offer h2{margin:5px 0 3px;color:#e4dad2;font-size:18px}.fd-find-offer header span{color:#80787a;font-size:9px;text-transform:capitalize}.fd-find-offer header>b{align-self:flex-start;padding:7px 10px;border:1px solid rgba(126,161,111,.22);border-radius:999px;color:#9bb989;background:rgba(92,130,77,.06);font-size:8px}.fd-find-offer header>b.unknown{border-color:rgba(170,135,96,.18);color:#ad9276}.fd-find-price-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px}.fd-find-price-grid>div{padding:11px;border:1px solid rgba(221,203,188,.06);border-radius:10px;background:rgba(255,255,255,.012)}.fd-find-price-grid small{display:block;color:#716a6c;font-size:7px;font-weight:900;letter-spacing:.09em}.fd-find-price-grid strong{display:block;margin-top:4px;color:#ddd3cc;font-size:14px}.fd-find-offer>p{margin:11px 0 0;color:#81797b;font-size:9px}.fd-find-offer footer{display:flex;gap:9px;margin-top:14px}.fd-find-offer footer a{min-height:39px;padding:0 14px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(172,129,193,.18);border-radius:9px;color:#d6c5d8;font-size:8px;font-weight:900;text-decoration:none}.fd-find-offer footer a:first-child{background:rgba(112,72,140,.12)}.fd-find-offer footer span{color:#71696b;font-size:8px}.fd-find-warning{margin:0 4px;color:#a38d77;font-size:9px}@media(max-width:700px){.fd-find-hero form,.fd-find-offer footer{flex-direction:column}.fd-find-hero button{height:46px}.fd-find-price-grid{grid-template-columns:1fr 1fr}.fd-find-offer header{flex-direction:column}.fd-find-result-head{align-items:flex-start;flex-direction:column}}@media(max-width:440px){.fd-find-price-grid{grid-template-columns:1fr}}
    `}</style>
  </DashboardPageShell>;
}
