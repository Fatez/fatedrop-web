import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { ValueCompare } from "@/components/value-compare";
import { searchSignalFateVerdict, type SignalFateVerdictPosition } from "@/lib/fatefind-verdict";
import type { SignalTruePriceGroup } from "@/lib/signal-engine-client";

export const metadata: Metadata = { title: "FateFind | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function gbp(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value)
    : "—";
}

function percent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "RRP UNKNOWN";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(1)}%`;
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

function orderedOffers(group: SignalTruePriceGroup, position: SignalFateVerdictPosition | undefined) {
  if (!position?.offerId) return group.offers;
  const leader = group.offers.find((offer) => offer.id === position.offerId);
  if (!leader) return group.offers;
  return [leader, ...group.offers.filter((offer) => offer.id !== leader.id)];
}

export default async function DashboardFateFindPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const result = q.length >= 2 ? await searchSignalFateVerdict(q) : null;
  const ranking = result?.verdict.ranking ?? [];
  const positionByGroup = new Map(ranking.map((position) => [position.groupId, position]));
  const rankByGroup = new Map(ranking.map((position, index) => [position.groupId, index]));
  const groups = [...(result?.groups ?? [])].sort((left, right) =>
    (rankByGroup.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (rankByGroup.get(right.id) ?? Number.MAX_SAFE_INTEGER));
  const winner = result?.verdict.winnerId
    ? ranking.find((position) => position.groupId === result.verdict.winnerId) ?? null
    : null;
  const hasMixedReferenceCoverage = ranking.some((position) => position.rrpPercent === null)
    && ranking.some((position) => position.rrpPercent !== null);

  return <DashboardPageShell title="FateFind" eyebrow="BEST VALUE · RRP INTELLIGENCE">
    <div className="fd-true-price-page">
      <section className="fd-dash-card fd-true-price-hero">
        <div className="fd-tp-intro">
          <span>FATEFIND · VALUE INTELLIGENCE</span>
          <h1>Find the strongest-value deal before you buy.</h1>
          <p>FateFind compares live retailer offers against the correct RRP/reference so you can see which option is actually best value. True Price remains part of that result: item price is compared with the verified value baseline, and delivery is only added when its cost is genuinely known.</p>
        </div>
        <div className="fd-tp-simple">
          <div><b>1</b><strong>ITEM PRICE / RRP</strong><span>Compare the item price with a verified RRP or clearly-labelled reference.</span></div>
          <i>+</i>
          <div><b>2</b><strong>KNOWN DELIVERY</strong><span>Only a real mandatory delivery cost. Unknown never means free.</span></div>
          <i>=</i>
          <div className="answer"><b>3</b><strong>TRUE PRICE</strong><span>The known total you would actually pay at checkout.</span></div>
        </div>
        <form action="/dashboard/fatefind" method="get" className="fd-tp-search">
          <label className="fd-dashboard-search"><span>⌕</span><input name="q" defaultValue={q} autoFocus aria-label="Find the best-value deal" placeholder="Try: Destined Rivals" /></label>
          <button type="submit">FATEFIND →</button>
        </form>
        <p className="fd-tp-kid-copy">A bigger bundle can cost more at checkout and still be better value. FateFind therefore ranks value from the verified RRP/reference position first, while True Price separately shows the known delivered cost.</p>
      </section>

      <section className="fd-dash-card fd-tp-results">
        <div className="fd-tp-results-head"><div><span>{q ? `FATEFIND · ${q.toUpperCase()}` : "COMPARE OFFERS"}</span><h2>{q ? "Which live option is the strongest value?" : "Search once. Let FateFind compare the network."}</h2></div><small>{result ? `${result.count} product group${result.count === 1 ? "" : "s"}` : q.length >= 2 ? "Cloud response unavailable" : "Enter a product above"}</small></div>
        {!q ? <div className="fd-dashboard-empty"><strong>Type a product above.</strong><span>FateDrop compares qualifying observed retailer offers, RRP/reference position and known checkout cost without inventing missing evidence.</span></div> : q.length < 2 ? <div className="fd-dashboard-empty"><strong>Keep typing.</strong><span>Use at least two characters so FateDrop can resolve a meaningful product search.</span></div> : !result ? <div className="fd-dashboard-empty"><strong>The Signal Engine could not be reached.</strong><span>No sample prices or pretend retailers are substituted.</span></div> : groups.length ? <>
          {winner ? <section className="fd-tp-winner" aria-label="FateFind best value">
            <div><small>{hasMixedReferenceCoverage ? "BEST VERIFIED VALUE · FATEDROP CLOUD" : "BEST VALUE · FATEDROP CLOUD"}</small><strong>{winner.title}</strong><span>{winner.retailerName ?? "Qualifying retailer"}</span></div>
            <div className="fd-tp-winner-metrics"><span><small>VS RRP / REF</small><b>{percent(winner.rrpPercent)}</b></span><span><small>ITEM PRICE</small><b>{gbp(winner.itemPrice)}</b></span><span><small>TRUE PRICE</small><b>{winner.deliveryKnown ? gbp(winner.truePrice) : "UNKNOWN"}</b></span></div>
            <p>{result.verdict.reason}</p>
          </section> : <div className="fd-tp-no-winner"><strong>No single value winner declared.</strong><span>{result.verdict.reason}</span></div>}
          <ValueCompare key={q} query={q} groups={groups} />
          <div className="fd-tp-groups">{groups.map((group) => {
            const position = positionByGroup.get(group.id);
            return <article className="fd-tp-group" key={group.id}>
              <header><div><small>{group.category} · {group.retailerCount} RETAILER{group.retailerCount === 1 ? "" : "S"}{result?.verdict.winnerId === group.id ? " · BEST VALUE" : ""}</small><h2>{group.title}</h2><p>{typeof group.rrpGbp === "number" ? `${rrpHeading(group)} ${gbp(group.rrpGbp)} · ${sourceLabel(group)}${group.rrpObservedAt ? ` · observed ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(group.rrpObservedAt))}` : ""}` : "Verified RRP/reference unavailable for this product identity"}</p></div><span>{Math.round(group.matchingConfidence * 100)}% identity confidence</span></header>
              <div className="fd-tp-offers">{orderedOffers(group, position).map((offer) => {
                const isGroupSelectedOffer = offer.id === position?.offerId;
                const hasVerifiedValuePosition = typeof position?.rrpPercent === "number" && Number.isFinite(position.rrpPercent);
                const isCloudValueWinner = result.verdict.winnerId === group.id && isGroupSelectedOffer;
                const statusLabel = isCloudValueWinner && offer.isLowestKnownDelivered
                  ? "FATEFIND VALUE LEADER · LOWEST TRUE PRICE"
                  : isCloudValueWinner
                    ? "FATEFIND VALUE LEADER"
                    : isGroupSelectedOffer && !hasVerifiedValuePosition && offer.isLowestKnownDelivered
                      ? "LOWEST KNOWN TRUE PRICE · VALUE UNVERIFIED"
                      : isGroupSelectedOffer && !hasVerifiedValuePosition
                        ? "IN STOCK · VALUE UNVERIFIED"
                        : offer.isLowestKnownDelivered
                          ? "LOWEST KNOWN TRUE PRICE"
                          : offer.stockStatus.replaceAll("_", " ");
                const valueEvidenceLabel = isCloudValueWinner
                  ? "CLOUD-RANKED VALUE POSITION"
                  : isGroupSelectedOffer && hasVerifiedValuePosition
                    ? "REFERENCE-BACKED GROUP POSITION"
                    : isGroupSelectedOffer
                      ? "VALUE UNVERIFIED · RRP UNKNOWN"
                      : "GROUP LEADER SHOWN ABOVE";
                return <div className={isCloudValueWinner ? "fd-tp-offer value-leader" : "fd-tp-offer"} key={offer.id}>
                  <div className="fd-tp-store"><small>{statusLabel}</small><strong>{offer.retailerName}</strong><span>{offer.lastCheckedAt ? `Checked ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(offer.lastCheckedAt))}` : "Observed network offer"}</span></div>
                  <div className="fd-tp-cost"><span><small>ITEM</small><b>{gbp(offer.priceGbp)}</b></span><span><small>DELIVERY</small><b>{offer.deliveryKnown ? offer.shippingGbp === 0 ? "FREE" : gbp(offer.shippingGbp) : "UNKNOWN"}</b></span><span className="true"><small>TRUE PRICE</small><b>{offer.deliveryKnown ? gbp(offer.totalDeliveredGbp) : "—"}</b></span><span><small>VS RRP / REF</small><b>{isGroupSelectedOffer ? percent(position?.rrpPercent) : "—"}</b><em>{valueEvidenceLabel}</em></span></div>
                  <a href={offer.productUrl} target="_blank" rel="noreferrer">BUY AT RETAILER ↗</a>
                </div>;
              })}</div>
              <footer><Link href={`/dashboard/watchlist?q=${encodeURIComponent(group.title)}`}>FATEMATCH · WATCH MY CONDITIONS →</Link><Link href={`/dashboard/search?q=${encodeURIComponent(group.title)}`}>OPEN NETWORK SEARCH →</Link></footer>
            </article>;
          })}</div>
        </> : <div className="fd-dashboard-empty"><strong>No comparable live offers found.</strong><span>FateDrop will not invent a comparison when the network has no qualifying observed offers.</span><Link className="fd-dashboard-wide-button" href={`/dashboard/watchlist?q=${encodeURIComponent(q)}`}>Create a FateMatch stock watch →</Link></div>}
        {result?.disclaimer ? <p className="fd-tp-disclaimer">{result.disclaimer}</p> : null}
      </section>

      <section className="fd-dash-card fd-tp-trust"><div><span>HOW FATEFIND DECIDES</span><h2>RRP value first. Checkout cost stays transparent.</h2></div><p>FateFind compares item price with the verified RRP/reference to judge value, while True Price separately tells you the real checkout cost when mandatory delivery is known. FateDrop does not call unknown delivery “free”, guess an RRP, or force a value verdict when product identity is uncertain.</p></section>
    </div>
    <style>{`
      .fd-true-price-page{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-true-price-page .fd-dash-card{border-color:rgba(221,203,188,.085);background:linear-gradient(145deg,#0e1216,#090d11 74%);border-radius:12px}.fd-true-price-hero{padding:28px;background:radial-gradient(circle at 90% 8%,rgba(126,80,146,.15),transparent 28%),linear-gradient(145deg,#101318,#090c10 70%)!important}.fd-tp-intro>span,.fd-tp-results-head span,.fd-tp-trust span{color:#aa886d;font-size:7px;font-weight:900;letter-spacing:.16em}.fd-tp-intro h1{max-width:900px;margin:9px 0 13px;color:#eee4da;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.4rem,4vw,4.8rem);font-weight:500;line-height:.94;letter-spacing:-.05em}.fd-tp-intro p{max-width:850px;margin:0;color:#918885;font-size:12px;line-height:1.72}.fd-tp-intro p b{color:#d8c9bd}.fd-tp-simple{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:10px;align-items:center;margin-top:22px}.fd-tp-simple>div{min-height:92px;padding:14px;border:1px solid rgba(221,203,188,.07);border-radius:10px;background:rgba(255,255,255,.018);display:grid;grid-template-columns:25px 1fr;gap:4px 8px;align-content:center}.fd-tp-simple>div.answer{border-color:rgba(132,164,117,.18);background:rgba(111,145,95,.045)}.fd-tp-simple b{grid-row:1/3;width:25px;height:25px;display:grid;place-items:center;border:1px solid rgba(172,129,193,.2);border-radius:7px;color:#b88dcc;font-size:8px}.fd-tp-simple strong{font-size:8px;letter-spacing:.08em;color:#cfc4bc}.fd-tp-simple span{font-size:7px;color:#71696a;line-height:1.4}.fd-tp-simple>i{font-style:normal;color:#675a63}.fd-tp-search{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-top:18px}.fd-tp-search .fd-dashboard-search{height:48px;margin:0}.fd-tp-search button{height:48px;padding:0 18px;border:1px solid rgba(172,129,193,.22);border-radius:10px;background:linear-gradient(135deg,rgba(112,72,140,.14),rgba(136,105,84,.08));color:#e4d8cf;font-size:8px;font-weight:900;letter-spacing:.08em}.fd-tp-kid-copy{max-width:1000px;margin:12px 0 0;color:#766f6e;font-size:8px;line-height:1.55}.fd-tp-results{padding:22px}.fd-tp-results-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.fd-tp-results-head h2{margin:5px 0 0;color:#ded4cb;font-family:Georgia,serif;font-size:24px;font-weight:500}.fd-tp-results-head small{color:#746d6c;font-size:8px}.fd-tp-winner{display:grid;grid-template-columns:minmax(220px,.8fr) minmax(360px,1fr);gap:14px 20px;margin-top:18px;padding:18px;border:1px solid rgba(113,232,174,.24);border-radius:13px;background:linear-gradient(120deg,rgba(113,232,174,.065),rgba(157,109,255,.04) 55%,rgba(0,0,0,.1))}.fd-tp-winner>div:first-child{display:grid;gap:4px}.fd-tp-winner small{color:#82d9aa;font-size:7px;font-weight:900;letter-spacing:.12em}.fd-tp-winner strong{color:#eee7df;font-size:18px}.fd-tp-winner>div:first-child>span{color:#918b87;font-size:9px}.fd-tp-winner-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.fd-tp-winner-metrics>span{padding:9px;border:1px solid rgba(255,255,255,.06);border-radius:9px;background:rgba(0,0,0,.14)}.fd-tp-winner-metrics b{display:block;margin-top:4px;font-size:13px}.fd-tp-winner>p{grid-column:1/-1;margin:0;color:#918b87;font-size:9px;line-height:1.5}.fd-tp-no-winner{display:grid;gap:4px;margin-top:18px;padding:14px;border:1px solid rgba(221,203,188,.07);border-radius:11px}.fd-tp-no-winner strong{font-size:11px}.fd-tp-no-winner span{color:#7a7372;font-size:8px}.fd-tp-groups{display:grid;gap:12px;margin-top:18px}.fd-tp-group{overflow:hidden;border:1px solid rgba(221,203,188,.08);border-radius:11px;background:#0b0f13}.fd-tp-group>header{display:flex;justify-content:space-between;gap:20px;padding:17px 18px;border-bottom:1px solid rgba(221,203,188,.06)}.fd-tp-group>header small{color:#a6846c;font-size:7px;font-weight:900;letter-spacing:.1em}.fd-tp-group h2{margin:5px 0 0;font-size:17px;color:#ddd3cb}.fd-tp-group>header p{margin:6px 0 0;color:#7a7272;font-size:8px}.fd-tp-group>header>span{color:#746d70;font-size:8px}.fd-tp-offers{display:grid;gap:1px;background:#17171a}.fd-tp-offer{display:grid;grid-template-columns:minmax(180px,1fr) minmax(390px,1.15fr) auto;gap:16px;align-items:center;padding:15px 18px;background:#0b0f13}.fd-tp-offer.value-leader{background:linear-gradient(90deg,rgba(113,232,174,.065),#0b0f13 48%)}.fd-tp-store small{display:block;color:#8b817d;font-size:6px;font-weight:900;letter-spacing:.1em}.fd-tp-offer.value-leader .fd-tp-store small{color:#82d9aa}.fd-tp-store strong{display:block;margin:4px 0;font-size:12px}.fd-tp-store span{color:#6d6666;font-size:7px}.fd-tp-cost{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.fd-tp-cost span{padding:8px;border:1px solid rgba(221,203,188,.055);border-radius:8px;background:rgba(0,0,0,.14)}.fd-tp-cost span.true{border-color:rgba(132,164,117,.16)}.fd-tp-cost small{display:block;color:#655e5f;font-size:6px;font-weight:900;letter-spacing:.08em}.fd-tp-cost b{font-size:9px}.fd-tp-cost em{display:block;margin-top:3px;color:#6d6666;font-size:5px;font-style:normal;font-weight:800;letter-spacing:.05em}.fd-tp-cost .true b{color:#9cb68f}.fd-tp-offer>a{padding:9px 11px;border:1px solid rgba(172,129,193,.18);border-radius:8px;color:#c9a8d7;font-size:7px;font-weight:900;text-decoration:none}.fd-tp-group>footer{display:flex;gap:12px;padding:11px 18px;border-top:1px solid rgba(221,203,188,.06)}.fd-tp-group>footer a{color:#b78ac7;font-size:8px;font-weight:900;text-decoration:none}.fd-tp-disclaimer{margin:14px 0 0;color:#716a6a;font-size:8px}.fd-tp-trust{padding:22px 24px;display:grid;grid-template-columns:.8fr 1.2fr;gap:30px;align-items:center}.fd-tp-trust h2{margin:6px 0 0;color:#ddd2c8;font-family:Georgia,serif;font-size:22px;font-weight:500}.fd-tp-trust p{margin:0;color:#857d7b;font-size:10px;line-height:1.65}@media(max-width:1050px){.fd-tp-offer{grid-template-columns:1fr}.fd-tp-cost{grid-template-columns:repeat(2,1fr)}.fd-tp-winner{grid-template-columns:1fr}}@media(max-width:850px){.fd-tp-simple,.fd-tp-trust{grid-template-columns:1fr}.fd-tp-simple>i{display:none}.fd-tp-group>header{flex-direction:column}}@media(max-width:650px){.fd-tp-search,.fd-tp-cost,.fd-tp-winner-metrics{grid-template-columns:1fr}.fd-true-price-hero,.fd-tp-results{padding:18px}}
    `}</style>
  </DashboardPageShell>;
}