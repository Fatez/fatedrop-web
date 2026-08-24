import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { ValueCompare } from "@/components/value-compare";
import { searchSignalTruePrice, type SignalTruePriceGroup } from "@/lib/signal-engine-client";

export const metadata: Metadata = { title: "True Price | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function gbp(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value)
    : "—";
}

function rrpDelta(price: number | undefined, rrp: number | undefined) {
  if (typeof price !== "number" || typeof rrp !== "number" || !Number.isFinite(price) || !Number.isFinite(rrp) || rrp <= 0) return null;
  const difference = price - rrp;
  const percent = (difference / rrp) * 100;
  const prefix = difference > 0 ? "+" : difference < 0 ? "−" : "";
  const percentPrefix = percent > 0 ? "+" : percent < 0 ? "−" : "";
  return `${prefix}£${Math.abs(difference).toFixed(2)} · ${percentPrefix}${Math.abs(percent).toFixed(1)}%`;
}

function sourceLabel(group: SignalTruePriceGroup) {
  if (group.rrpKind === "component_reference") return `Component RRP reference · ${group.rrpReferenceBasis ?? "verified unit basis"}`;
  if (group.rrpKind === "pack_reference") return `Pack RRP reference · ${group.rrpReferenceBasis ?? "verified set pack"}`;
  if (!group.rrpSource) return "RRP source unavailable";
  if (group.rrpSource === "pokemon-center-uk") return "Pokémon Center UK observed RRP";
  return `Observed RRP source: ${group.rrpSource}`;
}

function rrpHeading(group: SignalTruePriceGroup) {
  if (group.rrpKind === "component_reference") return "REFERENCE RRP";
  if (group.rrpKind === "pack_reference") return "PACK RRP REFERENCE";
  return "RRP";
}

export default async function DashboardTruePricePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const result = q.length >= 2 ? await searchSignalTruePrice(q) : null;
  const groups = result?.groups ?? [];

  return <DashboardPageShell title="True Price" eyebrow="WHAT YOU REALLY PAY">
    <div className="fd-true-price-page">
      <section className="fd-dash-card fd-true-price-hero">
        <div className="fd-tp-intro">
          <span>TRUE PRICE · VALUE INTELLIGENCE</span>
          <h1>The price on the shelf is not always the price at your door.</h1>
          <p>True Price answers <b>what you actually pay</b>, while RRP/reference position answers <b>whether the item itself is good value</b>. FateDrop keeps those questions separate: item price is compared with the verified value baseline, and delivery is only added when its cost is genuinely known.</p>
        </div>
        <div className="fd-tp-simple">
          <div><b>1</b><strong>ITEM PRICE / RRP</strong><span>Compare the item price with a verified RRP or clearly-labelled reference.</span></div>
          <i>+</i>
          <div><b>2</b><strong>KNOWN DELIVERY</strong><span>Only a real mandatory delivery cost. Unknown never means free.</span></div>
          <i>=</i>
          <div className="answer"><b>3</b><strong>TRUE PRICE</strong><span>The known total you would actually pay at checkout.</span></div>
        </div>
        <form action="/dashboard/true-price" method="get" className="fd-tp-search">
          <label className="fd-dashboard-search"><span>⌕</span><input name="q" defaultValue={q} autoFocus aria-label="Compare a product" placeholder="Try: Destined Rivals" /></label>
          <button type="submit">COMPARE VALUE →</button>
        </form>
        <p className="fd-tp-kid-copy">A bigger bundle can cost more at checkout and still be better value. FateDrop therefore keeps the RRP/reference percentage item-price based, while True Price separately adds known delivery.</p>
      </section>

      <section className="fd-dash-card fd-tp-results">
        <div className="fd-tp-results-head"><div><span>{q ? `COMPARING · ${q.toUpperCase()}` : "COMPARE OFFERS"}</span><h2>{q ? "Which offer is cheapest — and which item is better value?" : "Search once. Compare the network."}</h2></div><small>{result ? `${result.count} product group${result.count === 1 ? "" : "s"}` : q.length >= 2 ? "Cloud response unavailable" : "Enter a product above"}</small></div>
        {!q ? <div className="fd-dashboard-empty"><strong>Type a product above.</strong><span>FateDrop compares qualifying observed retailer offers, RRP/reference position and known checkout cost without inventing missing evidence.</span></div> : q.length < 2 ? <div className="fd-dashboard-empty"><strong>Keep typing.</strong><span>Use at least two characters so FateDrop can resolve a meaningful product search.</span></div> : !result ? <div className="fd-dashboard-empty"><strong>The Signal Engine could not be reached.</strong><span>No sample prices or pretend retailers are substituted.</span></div> : groups.length ? <>
          <ValueCompare groups={groups} />
          <div className="fd-tp-groups">{groups.map((group) => <article className="fd-tp-group" key={group.id}>
            <header><div><small>{group.category} · {group.retailerCount} RETAILER{group.retailerCount === 1 ? "" : "S"}</small><h2>{group.title}</h2><p>{typeof group.rrpGbp === "number" ? `${rrpHeading(group)} ${gbp(group.rrpGbp)} · ${sourceLabel(group)}${group.rrpObservedAt ? ` · observed ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(group.rrpObservedAt))}` : ""}` : "Verified RRP/reference unavailable for this product identity"}</p></div><span>{Math.round(group.matchingConfidence * 100)}% identity confidence</span></header>
            <div className="fd-tp-offers">{[...group.offers].sort((a, b) => {
              if (a.deliveryKnown !== b.deliveryKnown) return a.deliveryKnown ? -1 : 1;
              return (a.totalDeliveredGbp ?? a.priceGbp ?? Infinity) - (b.totalDeliveredGbp ?? b.priceGbp ?? Infinity);
            }).map((offer) => {
              const delta = rrpDelta(offer.priceGbp, group.rrpGbp);
              return <div className={offer.isLowestKnownDelivered ? "fd-tp-offer best" : "fd-tp-offer"} key={offer.id}>
                <div className="fd-tp-store"><small>{offer.isLowestKnownDelivered ? "LOWEST KNOWN TRUE PRICE" : offer.stockStatus.replaceAll("_", " ")}</small><strong>{offer.retailerName}</strong><span>{offer.lastCheckedAt ? `Checked ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(offer.lastCheckedAt))}` : "Observed network offer"}</span></div>
                <div className="fd-tp-cost"><span><small>ITEM</small><b>{gbp(offer.priceGbp)}</b></span><span><small>DELIVERY</small><b>{offer.deliveryKnown ? offer.shippingGbp === 0 ? "FREE" : gbp(offer.shippingGbp) : "UNKNOWN"}</b></span><span className="true"><small>TRUE PRICE</small><b>{offer.deliveryKnown ? gbp(offer.totalDeliveredGbp) : "—"}</b></span><span><small>VS RRP / REF</small><b>{delta ?? "RRP UNKNOWN"}</b><em>{delta ? "ITEM PRICE VS VALUE BASELINE" : ""}</em></span></div>
                <a href={offer.productUrl} target="_blank" rel="noreferrer">BUY AT RETAILER ↗</a>
              </div>;
            })}</div>
            <footer><Link href={`/dashboard/fatefind?q=${encodeURIComponent(group.title)}`}>FATEFIND BEST VALUE →</Link><Link href={`/dashboard/watchlist?q=${encodeURIComponent(group.title)}`}>LET ME KNOW WHEN IN STOCK →</Link><Link href={`/dashboard/search?q=${encodeURIComponent(group.title)}`}>OPEN NETWORK SEARCH →</Link></footer>
          </article>)}</div>
        </> : <div className="fd-dashboard-empty"><strong>No comparable live offers found.</strong><span>FateDrop will not invent a comparison when the network has no qualifying observed offers.</span><Link className="fd-dashboard-wide-button" href={`/dashboard/watchlist?q=${encodeURIComponent(q)}`}>Create a FateMatch stock watch →</Link></div>}
        {result?.disclaimer ? <p className="fd-tp-disclaimer">{result.disclaimer}</p> : null}
      </section>

      <section className="fd-dash-card fd-tp-trust"><div><span>WHY THIS MATTERS</span><h2>Checkout cost and product value are different measurements.</h2></div><p>RRP/reference percentage compares item price with the verified value baseline. True Price separately tells you the real checkout cost when mandatory delivery is known. FateDrop does not call unknown delivery “free”, guess an RRP, or force a value verdict when product identity is uncertain.</p></section>
    </div>
    <style>{`
      .fd-true-price-page{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-true-price-page .fd-dash-card{border-color:rgba(221,203,188,.085);background:linear-gradient(145deg,#0e1216,#090d11 74%);border-radius:12px}.fd-true-price-hero{padding:28px;background:radial-gradient(circle at 90% 8%,rgba(126,80,146,.15),transparent 28%),linear-gradient(145deg,#101318,#090c10 70%)!important}.fd-tp-intro>span,.fd-tp-results-head span,.fd-tp-trust span{color:#aa886d;font-size:7px;font-weight:900;letter-spacing:.16em}.fd-tp-intro h1{max-width:900px;margin:9px 0 13px;color:#eee4da;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.4rem,4vw,4.8rem);font-weight:500;line-height:.94;letter-spacing:-.05em}.fd-tp-intro p{max-width:850px;margin:0;color:#918885;font-size:12px;line-height:1.72}.fd-tp-intro p b{color:#d8c9bd}.fd-tp-simple{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:10px;align-items:center;margin-top:22px}.fd-tp-simple>div{min-height:92px;padding:14px;border:1px solid rgba(221,203,188,.07);border-radius:10px;background:rgba(255,255,255,.018);display:grid;grid-template-columns:25px 1fr;gap:4px 8px;align-content:center}.fd-tp-simple>div.answer{border-color:rgba(132,164,117,.18);background:rgba(111,145,95,.045)}.fd-tp-simple b{grid-row:1/3;width:25px;height:25px;display:grid;place-items:center;border:1px solid rgba(172,129,193,.2);border-radius:7px;color:#b88dcc;font-size:8px}.fd-tp-simple strong{font-size:8px;letter-spacing:.08em;color:#cfc4bc}.fd-tp-simple span{font-size:7px;color:#71696a;line-height:1.4}.fd-tp-simple>i{font-style:normal;color:#675a63}.fd-tp-search{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-top:18px}.fd-tp-search .fd-dashboard-search{height:48px;margin:0}.fd-tp-search button{height:48px;padding:0 18px;border:1px solid rgba(172,129,193,.22);border-radius:10px;background:linear-gradient(135deg,rgba(112,72,140,.14),rgba(136,105,84,.08));color:#e4d8cf;font-size:8px;font-weight:900;letter-spacing:.08em}.fd-tp-kid-copy{max-width:1000px;margin:12px 0 0;color:#766f6e;font-size:8px;line-height:1.55}.fd-tp-results{padding:22px}.fd-tp-results-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.fd-tp-results-head h2{margin:5px 0 0;color:#ded4cb;font-family:Georgia,serif;font-size:24px;font-weight:500}.fd-tp-results-head small{color:#746d6c;font-size:8px}.fd-tp-groups{display:grid;gap:12px;margin-top:18px}.fd-tp-group{overflow:hidden;border:1px solid rgba(221,203,188,.08);border-radius:11px;background:#0b0f13}.fd-tp-group>header{display:flex;justify-content:space-between;gap:20px;padding:17px 18px;border-bottom:1px solid rgba(221,203,188,.06)}.fd-tp-group>header small{color:#a6846c;font-size:7px;font-weight:900;letter-spacing:.1em}.fd-tp-group h2{margin:5px 0 0;font-size:17px;color:#ddd3cb}.fd-tp-group>header p{margin:6px 0 0;color:#7a7272;font-size:8px}.fd-tp-group>header>span{color:#746d70;font-size:8px}.fd-tp-offers{display:grid;gap:1px;background:#17171a}.fd-tp-offer{display:grid;grid-template-columns:minmax(180px,1fr) minmax(390px,1.15fr) auto;gap:16px;align-items:center;padding:15px 18px;background:#0b0f13}.fd-tp-offer.best{background:linear-gradient(90deg,rgba(119,151,102,.06),#0b0f13 44%)}.fd-tp-store small{display:block;color:#8b817d;font-size:6px;font-weight:900;letter-spacing:.1em}.fd-tp-offer.best .fd-tp-store small{color:#86a678}.fd-tp-store strong{display:block;margin:4px 0;font-size:12px}.fd-tp-store span{color:#6d6666;font-size:7px}.fd-tp-cost{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.fd-tp-cost span{padding:8px;border:1px solid rgba(221,203,188,.055);border-radius:8px;background:rgba(0,0,0,.14)}.fd-tp-cost span.true{border-color:rgba(132,164,117,.16)}.fd-tp-cost small{display:block;color:#655e5f;font-size:6px;font-weight:900;letter-spacing:.08em}.fd-tp-cost b{font-size:9px}.fd-tp-cost em{display:block;margin-top:3px;color:#6d6666;font-size:5px;font-style:normal;font-weight:800;letter-spacing:.05em}.fd-tp-cost .true b{color:#9cb68f}.fd-tp-offer>a{padding:9px 11px;border:1px solid rgba(172,129,193,.18);border-radius:8px;color:#c9a8d7;font-size:7px;font-weight:900;text-decoration:none}.fd-tp-group>footer{display:flex;gap:12px;padding:11px 18px;border-top:1px solid rgba(221,203,188,.06)}.fd-tp-group>footer a{color:#b78ac7;font-size:8px;font-weight:900;text-decoration:none}.fd-tp-disclaimer{margin:14px 0 0;color:#716a6a;font-size:8px}.fd-tp-trust{padding:22px 24px;display:grid;grid-template-columns:.8fr 1.2fr;gap:30px;align-items:center}.fd-tp-trust h2{margin:6px 0 0;color:#ddd2c8;font-family:Georgia,serif;font-size:22px;font-weight:500}.fd-tp-trust p{margin:0;color:#857d7b;font-size:10px;line-height:1.65}@media(max-width:1050px){.fd-tp-offer{grid-template-columns:1fr}.fd-tp-cost{grid-template-columns:repeat(2,1fr)}}@media(max-width:850px){.fd-tp-simple,.fd-tp-trust{grid-template-columns:1fr}.fd-tp-simple>i{display:none}.fd-tp-group>header{flex-direction:column}}@media(max-width:650px){.fd-tp-search,.fd-tp-cost{grid-template-columns:1fr}.fd-true-price-hero,.fd-tp-results{padding:18px}}
    `}</style>
  </DashboardPageShell>;
}
