import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import {
  getSignalRetailerDirectory,
  getSignalRetailerProfile,
  searchSignalCatalogue,
  type SignalRetailerProfile,
} from "@/lib/signal-engine-client";

export const metadata: Metadata = { title: "Retailer | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function classLabel(value: string) {
  if (value === "national") return "Major retailer";
  if (value === "specialist") return "TCG specialist";
  if (value === "independent" || value === "regional") return "Independent & local";
  return value.replaceAll("_", " ") || "Retailer";
}

function tcgLabel(value: string) {
  const key = value.trim().toLowerCase().replaceAll("_", " ").replaceAll("-", " ");
  if (key === "pokemon") return "Pokémon";
  if (key === "one piece") return "One Piece";
  if (["mtg", "magic", "magic the gathering"].includes(key)) return "Magic";
  if (key === "lorcana") return "Lorcana";
  if (key === "yu gi oh" || key === "yugioh") return "Yu-Gi-Oh!";
  return key.split(/\s+/).filter(Boolean).map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}

function presenceLabel(retailer: SignalRetailerProfile) {
  if (retailer.online && retailer.physicalStores === true) return "Online + physical stores";
  if (retailer.physicalStores === true) return "Physical stores";
  if (retailer.online && retailer.physicalStores === false) return "Online retailer";
  if (retailer.online) return "Online · physical status unknown";
  return "Retail presence unknown";
}

function monitoringLabel(retailer: SignalRetailerProfile) {
  if (!retailer.monitoring.configured) return "No active monitor reported";
  if (retailer.monitoring.healthy && !retailer.monitoring.stale) return "Monitor healthy";
  if (retailer.monitoring.stale) return "Monitor stale";
  return "Monitor needs attention";
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function price(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `£${value.toFixed(2)}` : "Price unavailable";
}

export default async function RetailerStorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id: rawId } = await params;
  const { q: rawQuery } = await searchParams;
  const id = decodeURIComponent(rawId || "").trim();
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";

  const profileResponse = id ? await getSignalRetailerProfile(id) : null;
  let retailer = profileResponse?.retailer ?? null;
  let directoryAvailable = true;

  if (!retailer && id) {
    const directory = await getSignalRetailerDirectory();
    directoryAvailable = Boolean(directory);
    const fallback = directory?.retailers.find((item) => item.id === id) ?? null;
    if (fallback) retailer = { ...fallback, locations: [] };
  }

  const catalogue = retailer
    ? await searchSignalCatalogue(query, { retailer: retailer.id, inStock: true, limit: 50, sort: query ? "relevance" : "recent" })
    : null;
  const offers = (catalogue?.products ?? []).filter((offer) => offer.availability === "IN_STOCK" && offer.isCurrentlyListed !== false);

  if (!retailer) {
    return <DashboardPageShell title="Retailer" eyebrow="FATE NETWORK · RETAILER STOREFRONT">
      <div className="fd-storefront-shell">
        <section className="fd-dash-card fd-storefront-error">
          <strong>{directoryAvailable ? "Retailer not found." : "Retailer directory unavailable."}</strong>
          <p>{directoryAvailable ? "This retailer is not present in the current canonical FateDrop retailer directory." : "FateDrop could not reach the canonical Cloud retailer directory. No static retailer record has been substituted."}</p>
          <Link href="/dashboard/stores">← Back to Retailers</Link>
        </section>
      </div>
    </DashboardPageShell>;
  }

  const logoStyle = retailer.logoUrl ? { backgroundImage: `url("${retailer.logoUrl}")` } : undefined;
  const localRadarHref = `/dashboard/local-radar?retailerId=${encodeURIComponent(retailer.id)}&retailerName=${encodeURIComponent(retailer.name)}`;

  return <DashboardPageShell title={retailer.name} eyebrow="FATE NETWORK · RETAILER STOREFRONT">
    <div className="fd-storefront-shell">
      <section className="fd-dash-card fd-storefront-hero">
        <div className="fd-storefront-identity">
          <div className={`fd-storefront-logo ${retailer.logoUrl ? "has-logo" : ""}`} style={logoStyle} aria-label={`${retailer.name} retailer identity`}>{!retailer.logoUrl ? initials(retailer.name) : null}</div>
          <div>
            <span>{classLabel(retailer.retailerClass).toUpperCase()}</span>
            <h1>{retailer.name}</h1>
            <p>{retailer.description || "FateDrop has not received a public retailer description from the canonical Cloud profile."}</p>
          </div>
        </div>
        <div className="fd-storefront-actions">
          {retailer.websiteUrl ? <a href={retailer.websiteUrl} target="_blank" rel="noreferrer">VISIT RETAILER ↗</a> : null}
          {retailer.physicalStores === true ? <Link href={localRadarHref}>FIND STORES IN LOCAL RADAR →</Link> : null}
        </div>
        <div className="fd-storefront-facts">
          <div><span>RETAILER TYPE</span><strong>{classLabel(retailer.retailerClass)}</strong></div>
          <div><span>PRESENCE</span><strong>{presenceLabel(retailer)}</strong></div>
          <div><span>VERIFICATION</span><strong>{String(retailer.verification || "unverified").replaceAll("_", " ")}</strong></div>
          <div><span>MONITORING</span><strong>{monitoringLabel(retailer)}</strong></div>
        </div>
        <div className="fd-storefront-tags">{retailer.tcgs.length ? retailer.tcgs.map((tcg) => <span key={tcg}>{tcgLabel(tcg)}</span>) : <span>TCGs not supplied by FateDrop Cloud</span>}</div>
      </section>

      {retailer.locations.length ? <section className="fd-dash-card fd-storefront-locations">
        <div className="fd-dash-card-head"><span>KNOWN PHYSICAL LOCATIONS</span><span>{retailer.locations.length}</span></div>
        <p>These are canonical retailer branches. Their existence does not prove current physical stock.</p>
        <div className="fd-location-grid">{retailer.locations.map((location) => <article key={location.id}>
          <strong>{location.name}</strong>
          <span>{[location.address, location.postcode].filter(Boolean).join(" · ") || "Address not supplied by FateDrop Cloud"}</span>
          {location.phone ? <small>{location.phone}</small> : null}
        </article>)}</div>
        <Link className="fd-location-radar" href={localRadarHref}>VIEW THIS RETAILER IN LOCAL RADAR →</Link>
      </section> : null}

      <section className="fd-dash-card fd-storefront-truth">
        <strong>ONLINE ≠ PHYSICAL STOCK</strong>
        <p>Online retailer availability never proves stock at a physical branch. Local Radar only confirms physical availability from genuine exact-branch evidence.</p>
      </section>

      <section className="fd-dash-card fd-storefront-catalogue">
        <div className="fd-dash-card-head"><span>CONNECTED IN-STOCK CATALOGUE</span><Link href="/dashboard/fatefind">Compare across retailers in FateFind →</Link></div>
        <form method="get" className="fd-storefront-search">
          <input name="q" defaultValue={query} placeholder={`Search ${retailer.name}`} aria-label={`Search ${retailer.name} catalogue`} />
          <button type="submit">SEARCH</button>
          {query ? <Link href={`/dashboard/stores/${encodeURIComponent(retailer.id)}`}>CLEAR</Link> : null}
        </form>
        {catalogue === null ? <div className="fd-dashboard-empty"><strong>Connected catalogue unavailable.</strong><span>FateDrop could not reach the canonical catalogue for this retailer.</span></div> : offers.length ? <div className="fd-offer-grid">{offers.map((offer) => <article key={offer.id}>
          <span>IN STOCK</span>
          <h2>{offer.title}</h2>
          <strong>{price(offer.price)}</strong>
          <small>{offer.shippingGbp === undefined ? "Delivery cost unknown" : offer.shippingGbp === 0 ? "Delivery reported free" : `Delivery £${offer.shippingGbp.toFixed(2)}`}</small>
          <a href={offer.url} target="_blank" rel="noreferrer">VIEW AT RETAILER ↗</a>
        </article>)}</div> : <div className="fd-dashboard-empty"><strong>{query ? "No in-stock matches." : "No connected in-stock offers."}</strong><span>{query ? "Try another search inside this retailer." : "FateDrop has no currently verified in-stock online offers connected to this retailer."}</span></div>}
      </section>
    </div>

    <style>{`.fd-storefront-shell{display:grid;gap:12px;max-width:1500px;margin:0 auto}.fd-storefront-shell .fd-dash-card{border-color:rgba(221,203,188,.085);border-radius:12px;background:linear-gradient(145deg,#0f1317,#090d11 74%)}.fd-storefront-hero{padding:28px;background:radial-gradient(circle at 90% 5%,rgba(126,87,143,.14),transparent 30%),linear-gradient(145deg,#101419,#090d11 70%)!important}.fd-storefront-identity{display:grid;grid-template-columns:112px 1fr;gap:22px;align-items:center}.fd-storefront-logo{width:110px;height:110px;display:grid;place-items:center;border:1px solid rgba(203,176,157,.4);border-radius:18px;background:#eee5dc;color:#203028;font-family:Georgia,serif;font-size:30px;font-weight:700;background-position:center;background-repeat:no-repeat;background-size:contain}.fd-storefront-logo.has-logo{font-size:0}.fd-storefront-identity>div>span{color:#b6977d;font-size:8px;font-weight:900;letter-spacing:.13em}.fd-storefront-identity h1{margin:7px 0 8px;color:#eee4dc;font-family:Georgia,serif;font-size:clamp(2.4rem,4vw,4.5rem);font-weight:500;line-height:.96;letter-spacing:-.04em}.fd-storefront-identity p{max-width:850px;margin:0;color:#999196;font-size:12px;line-height:1.65}.fd-storefront-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.fd-storefront-actions a,.fd-location-radar{padding:10px 13px;border:1px solid rgba(203,176,157,.2);border-radius:9px;color:#d6c0af;font-size:8px;font-weight:900;text-decoration:none}.fd-storefront-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:20px}.fd-storefront-facts div{padding:12px;border:1px solid rgba(221,203,188,.06);border-radius:9px;background:rgba(255,255,255,.012)}.fd-storefront-facts span{display:block;color:#746d71;font-size:6px;font-weight:900;letter-spacing:.09em}.fd-storefront-facts strong{display:block;margin-top:4px;color:#d8cec7;font-size:10px;text-transform:capitalize}.fd-storefront-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}.fd-storefront-tags span{padding:5px 8px;border:1px solid rgba(221,203,188,.07);border-radius:999px;color:#928a8f;font-size:7px}.fd-storefront-locations,.fd-storefront-catalogue{padding:24px}.fd-storefront-locations>p{color:#898185;font-size:10px}.fd-location-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:16px 0}.fd-location-grid article{padding:14px;border:1px solid rgba(221,203,188,.06);border-radius:10px;background:rgba(255,255,255,.012)}.fd-location-grid strong,.fd-location-grid span,.fd-location-grid small{display:block}.fd-location-grid strong{color:#ded4cc;font-size:11px}.fd-location-grid span{margin-top:5px;color:#8b8387;font-size:9px;line-height:1.45}.fd-location-grid small{margin-top:5px;color:#a99688;font-size:8px}.fd-storefront-truth{padding:18px 22px;border-color:rgba(203,176,157,.22)!important}.fd-storefront-truth strong{color:#cbb09d;font-size:8px;letter-spacing:.1em}.fd-storefront-truth p{margin:5px 0 0;color:#968e92;font-size:10px;line-height:1.55}.fd-storefront-search{display:flex;gap:8px;margin-top:16px}.fd-storefront-search input{flex:1;min-width:180px;border:1px solid rgba(221,203,188,.1);border-radius:9px;background:#080c10;color:#eee4dc;padding:11px 12px;font:inherit;font-size:11px}.fd-storefront-search button,.fd-storefront-search a{border:1px solid rgba(203,176,157,.2);border-radius:9px;background:rgba(182,151,125,.08);color:#d6c0af;padding:10px 12px;font:inherit;font-size:8px;font-weight:900;text-decoration:none;cursor:pointer}.fd-offer-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:18px}.fd-offer-grid article{padding:16px;border:1px solid rgba(221,203,188,.07);border-radius:11px;background:rgba(255,255,255,.013)}.fd-offer-grid article>span{color:#8bc5a4;font-size:7px;font-weight:900;letter-spacing:.08em}.fd-offer-grid h2{min-height:42px;margin:7px 0;color:#ddd3cc;font-size:14px;line-height:1.35}.fd-offer-grid article>strong{display:block;color:#eee4dc;font-family:Georgia,serif;font-size:20px}.fd-offer-grid small{display:block;margin:5px 0 12px;color:#7f777c;font-size:8px}.fd-offer-grid a{color:#cbb09d;font-size:8px;font-weight:900;text-decoration:none}.fd-storefront-error{padding:24px}.fd-storefront-error strong{color:#e0b887}.fd-storefront-error p{color:#928a8f}.fd-storefront-error a{color:#cbb09d;text-decoration:none}@media(max-width:1000px){.fd-storefront-facts,.fd-location-grid,.fd-offer-grid{grid-template-columns:1fr 1fr}}@media(max-width:700px){.fd-storefront-identity{grid-template-columns:1fr}.fd-storefront-facts,.fd-location-grid,.fd-offer-grid{grid-template-columns:1fr}.fd-storefront-search{flex-wrap:wrap}.fd-storefront-hero,.fd-storefront-locations,.fd-storefront-catalogue{padding:20px}}`}</style>
  </DashboardPageShell>;
}
