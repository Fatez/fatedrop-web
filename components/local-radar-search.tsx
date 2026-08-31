"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { LocalRadarMap, type LocalRadarMapPoint } from "@/components/local-radar-map";
import { clampMarkerBudget, retailerGroup, type LocalRadarRetailerGroup } from "@/lib/local-radar-map";

type LocalAvailabilityExpected = {
  title?: string | null;
  productIdentityId?: string | null;
  expectedFrom?: string | null;
  expectedTo?: string | null;
  expectedLabel?: string | null;
  advisory?: boolean | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
};

type LocalAvailabilityConfirmed = {
  title?: string | null;
  productIdentityId?: string | null;
  observedAt?: string | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
};

type RadarStockProduct = {
  productIdentityId?: string | null;
  title?: string | null;
  localState?: "expected" | "confirmed" | "unknown" | null;
  scope?: string | null;
  expectedFrom?: string | null;
  expectedTo?: string | null;
  expectedLabel?: string | null;
};

type RadarShop = {
  id: string;
  retailerId?: string | null;
  name: string;
  address?: string | null;
  websiteUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceMiles?: number | null;
  retailerCategory?: string | null;
  retailerGroup?: string | null;
  storeFormat?: string | null;
  operationalStatus?: string | null;
  locationEvidence?: {
    branchIdentity?: "canonical" | "provisional" | "conflicted" | null;
    pokemonSeller?: "verified" | "likely" | "candidate" | "excluded" | "conflicted" | null;
    confidence?: number | null;
    sourceCount?: number | null;
    lastVerifiedAt?: number | null;
    caveat?: string | null;
  } | null;
  localAvailability?: {
    status?: "expected" | "confirmed" | "unknown" | null;
    expected?: LocalAvailabilityExpected | null;
    confirmed?: LocalAvailabilityConfirmed | null;
    disclaimer?: string | null;
  } | null;
  localStockProducts?: RadarStockProduct[] | null;
};

type RadarEvent = {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  venueName?: string | null;
  townCity?: string | null;
  postcode?: string | null;
  startDateTime?: string | null;
  officialEventUrl?: string | null;
  officialTicketUrl?: string | null;
  distanceMiles?: number | null;
  verificationStatus?: string | null;
};

type RadarResponse = {
  error?: string;
  contractVersion?: number;
  mapPolicy?: { markerBudget?: number | null; clusteringRequired?: boolean | null } | null;
  filters?: { retailerGroups?: string[] | null } | null;
  locationResolution?: { status?: string | null; postcode?: string | null; reason?: string | null } | null;
  providers?: { shops?: { status?: string | null }; localStock?: { status?: string | null }; events?: { status?: string | null } };
  shops?: RadarShop[];
  events?: RadarEvent[];
};

type SearchOrigin = { latitude: number; longitude: number } | null;
type StoreFilter = "all" | LocalRadarRetailerGroup;

const STORE_PAGE_SIZE = 80;

const STORE_FILTERS: { value: StoreFilter; label: string }[] = [
  { value: "all", label: "All stores" },
  { value: "supermarkets", label: "Supermarkets" },
  { value: "large_retailers", label: "Large retailers" },
  { value: "independents", label: "Independents" },
];

function hasCoords(point: { latitude?: number | null; longitude?: number | null }) {
  return typeof point.latitude === "number" && Number.isFinite(point.latitude)
    && typeof point.longitude === "number" && Number.isFinite(point.longitude);
}

function distance(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(value < 10 ? 1 : 0) + " mi"
    : null;
}

function eventDate(value: string | null | undefined) {
  if (!value) return "Date pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function observedTime(value: string | null | undefined) {
  if (!value) return "Observation time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Observation time unavailable";
  return `Confirmed ${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
}

function expectedTime(expected: LocalAvailabilityExpected | null | undefined) {
  if (expected?.expectedLabel) return expected.expectedLabel;
  if (!expected?.expectedFrom) return "Expected timing unavailable";
  const date = new Date(expected.expectedFrom);
  if (Number.isNaN(date.getTime())) return "Expected timing unavailable";
  return `Expected ${new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(date)}`;
}

function availabilityStatus(shop: RadarShop): "expected" | "confirmed" | "unknown" {
  const status = shop.localAvailability?.status;
  return status === "expected" || status === "confirmed" ? status : "unknown";
}

function expectedScope(shop: RadarShop) {
  const expected = shop.localAvailability?.expected;
  if (!expected) return null;
  const product = (shop.localStockProducts ?? []).find((item) => item.localState === "expected"
    && (!expected.productIdentityId || item.productIdentityId === expected.productIdentityId)
    && (!expected.title || item.title === expected.title));
  return product?.scope ?? null;
}

function sourceStatus(value: string | null | undefined) {
  return String(value || "unknown").replaceAll("_", " ").toUpperCase();
}

function sellerEvidence(shop: RadarShop) {
  const status = shop.locationEvidence?.pokemonSeller;
  if (status === "verified") return "SELLER VERIFIED";
  if (status === "likely") return "SELLER LIKELY";
  return "SELLER UNVERIFIED";
}

export function LocalRadarSearch() {
  const routeParams = useSearchParams();
  const scopedRetailerId = routeParams.get("retailerId")?.trim() || "";
  const scopedRetailerName = routeParams.get("retailerName")?.trim() || "";
  const scopedName = scopedRetailerName || "this retailer";
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [postcode, setPostcode] = useState("");
  const [result, setResult] = useState<RadarResponse | null>(null);
  const [origin, setOrigin] = useState<SearchOrigin>(null);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [mapGeneration, setMapGeneration] = useState(0);
  const [storeFilter, setStoreFilter] = useState<StoreFilter>("all");
  const [visibleStoreLimit, setVisibleStoreLimit] = useState(STORE_PAGE_SIZE);
  const [status, setStatus] = useState(scopedRetailerId
    ? `Choose your location or enter a UK postcode to find known ${scopedName} branches.`
    : "Choose your location or enter a UK postcode to start Local Radar.");
  const [loading, setLoading] = useState<"device" | "postcode" | null>(null);

  async function runSearch(params: URLSearchParams, mode: "device" | "postcode", nextOrigin: SearchOrigin = null) {
    setLoading(mode);
    setSelectedMapId(null);
    setStoreFilter("all");
    setVisibleStoreLimit(STORE_PAGE_SIZE);
    setStatus(mode === "device"
      ? scopedRetailerId ? `Finding nearby ${scopedName} branches…` : "Finding nearby Pokémon and TCG stores…"
      : scopedRetailerId ? `Resolving postcode and finding nearby ${scopedName} branches…` : "Resolving postcode and finding nearby stores…");
    try {
      params.set("radiusMiles", String(radiusMiles));
      params.set("types", "shops,events");
      const response = await fetch("/api/local-radar?" + params.toString(), { cache: "no-store" });
      const payload = await response.json() as RadarResponse;
      if (!response.ok) {
        setResult(null);
        setOrigin(null);
        setStatus(payload.error || "Local Radar could not search.");
        return;
      }
      if (payload.locationResolution?.status === "invalid" || payload.locationResolution?.status === "not_found") {
        setResult(null);
        setOrigin(null);
        setStatus(payload.locationResolution.reason || "That location could not be resolved.");
        return;
      }

      const allShops = payload.shops ?? [];
      const shops = scopedRetailerId ? allShops.filter((shop) => shop.retailerId === scopedRetailerId) : allShops;
      const scopedPayload: RadarResponse = scopedRetailerId ? { ...payload, shops, events: [] } : payload;
      const confirmed = shops.filter((shop) => availabilityStatus(shop) === "confirmed").length;
      const expected = shops.filter((shop) => availabilityStatus(shop) === "expected").length;
      setResult(scopedPayload);
      setMapGeneration((value) => value + 1);
      setOrigin(nextOrigin);
      setStatus(scopedRetailerId
        ? `${shops.length} nearby ${scopedName} branch${shops.length === 1 ? "" : "es"} · ${expected} expected stock update${expected === 1 ? "" : "s"} · ${confirmed} confirmed physical stock update${confirmed === 1 ? "" : "s"}.`
        : `${shops.length} nearby store${shops.length === 1 ? "" : "s"} · ${expected} expected stock update${expected === 1 ? "" : "s"} · ${confirmed} confirmed physical stock update${confirmed === 1 ? "" : "s"}.`);
    } catch {
      setResult(null);
      setOrigin(null);
      setStatus("Local Radar could not reach the FateDrop discovery network.");
    } finally {
      setLoading(null);
    }
  }

  function locate() {
    if (!navigator.geolocation) {
      setStatus("This browser does not expose device location. Use the postcode search instead.");
      return;
    }
    setLoading("device");
    setStatus("Requesting your location once for this Local Radar search…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextOrigin = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        void runSearch(new URLSearchParams({
          lat: String(nextOrigin.latitude),
          lng: String(nextOrigin.longitude),
        }), "device", nextOrigin);
      },
      (error) => {
        setLoading(null);
        setStatus(error.code === error.PERMISSION_DENIED
          ? "Location permission was declined. Use a UK postcode instead."
          : "Device location could not be resolved. Use a UK postcode instead.");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  function searchPostcode() {
    const clean = postcode.trim();
    if (clean.length < 5) {
      setStatus("Enter a valid UK postcode, for example ME14 1XX.");
      return;
    }
    void runSearch(new URLSearchParams({ postcode: clean.toUpperCase() }), "postcode");
  }

  const allShops = useMemo(() => result?.shops ?? [], [result]);
  const shops = useMemo(() => storeFilter === "all"
    ? allShops
    : allShops.filter((shop) => retailerGroup(shop.retailerGroup) === storeFilter), [allShops, storeFilter]);
  const events = useMemo(() => result?.events ?? [], [result]);
  const unclassifiedCount = allShops.filter((shop) => retailerGroup(shop.retailerGroup) === "unclassified").length;
  const visibleShops = shops.slice(0, visibleStoreLimit);
  const markerBudget = clampMarkerBudget(result?.mapPolicy?.markerBudget);
  const expected = shops.filter((shop) => availabilityStatus(shop) === "expected").length;
  const confirmed = shops.filter((shop) => availabilityStatus(shop) === "confirmed").length;
  const unknown = shops.filter((shop) => availabilityStatus(shop) === "unknown").length;
  const mappedShops = shops.filter(hasCoords).length;

  const mapPoints = useMemo<LocalRadarMapPoint[]>(() => [
    ...shops.filter(hasCoords).map((shop) => ({
      id: `shop:${shop.id}`,
      kind: "shop" as const,
      name: shop.name,
      latitude: shop.latitude as number,
      longitude: shop.longitude as number,
      status: availabilityStatus(shop),
      subtitle: `${distance(shop.distanceMiles) || "Distance unavailable"} · ${availabilityStatus(shop).toUpperCase()}`,
    })),
    ...events.filter(hasCoords).map((event) => ({
      id: `event:${event.id}`,
      kind: "event" as const,
      name: event.name,
      latitude: event.latitude as number,
      longitude: event.longitude as number,
      subtitle: `${eventDate(event.startDateTime)}${distance(event.distanceMiles) ? ` · ${distance(event.distanceMiles)}` : ""}`,
    })),
  ], [events, shops]);

  return <div className="fd-radar-workspace">
    <section className="fd-radar-panel fd-radar-location">
      <div className="fd-radar-panel-head">
        <div><small>YOUR AREA</small><h2>{scopedRetailerId ? `Find ${scopedName} near you.` : "Find stores near you."}</h2></div>
        <p>Use location once or enter a postcode. FateDrop uses the canonical Cloud branch coordinates returned by the same Local Radar contract as the App.</p>
      </div>
      <div className="fd-radar-controls">
        <label><small>RADIUS</small><select value={radiusMiles} onChange={(event)=>setRadiusMiles(Number(event.target.value))}><option value={5}>5 miles</option><option value={10}>10 miles</option><option value={25}>25 miles</option><option value={50}>50 miles</option></select></label>
        <button type="button" onClick={locate} disabled={Boolean(loading)}>{loading === "device" ? "LOCATING…" : "USE MY LOCATION"}</button>
        <span className="fd-radar-or">OR</span>
        <label className="postcode"><small>UK POSTCODE</small><input value={postcode} onChange={(event)=>setPostcode(event.target.value)} onKeyDown={(event)=>{if(event.key==="Enter"){event.preventDefault();searchPostcode();}}} placeholder="e.g. WD17 1AA" autoComplete="postal-code" /></label>
        <button type="button" className="secondary" onClick={searchPostcode} disabled={Boolean(loading)}>{loading === "postcode" ? "SEARCHING…" : "SEARCH POSTCODE"}</button>
      </div>
      <p className="fd-radar-status">{status}</p>
    </section>

    {scopedRetailerId ? <section className="fd-radar-scope"><strong>RETAILER-SCOPED LOCAL RADAR</strong><p>This view only keeps branches whose canonical <code>retailerId</code> exactly matches {scopedName}. It does not match stores by name or infer physical stock from the retailer’s online catalogue.</p></section> : null}

    <section className="fd-radar-panel fd-radar-map-panel">
      <div className="fd-radar-panel-head compact">
        <div><small>LOCAL RADAR MAP</small><h2>{scopedRetailerId ? `Nearby ${scopedName} branches.` : "Nearby stores and events."}</h2></div>
        <p>{result ? `${mappedShops} of ${shops.length} filtered store${shops.length === 1 ? "" : "s"} have map coordinates. Clustering keeps the map within ${markerBudget} interactive markers.` : "Choose an area to populate the live map."}</p>
      </div>
      {result ? <div className="fd-radar-filters" aria-label="Retailer group filter">
        {STORE_FILTERS.map((filter) => <button
          type="button"
          aria-pressed={storeFilter === filter.value}
          className={storeFilter === filter.value ? "active" : ""}
          key={filter.value}
          onClick={() => { setStoreFilter(filter.value); setSelectedMapId(null); setVisibleStoreLimit(STORE_PAGE_SIZE); }}
        >{filter.label}</button>)}
        {unclassifiedCount ? <button
          type="button"
          aria-pressed={storeFilter === "unclassified"}
          className={storeFilter === "unclassified" ? "active" : ""}
          onClick={() => { setStoreFilter("unclassified"); setSelectedMapId(null); setVisibleStoreLimit(STORE_PAGE_SIZE); }}
        >Unclassified ({unclassifiedCount})</button> : null}
      </div> : null}
      <LocalRadarMap key={mapGeneration} points={mapPoints} origin={origin} active={Boolean(result)} selectedId={selectedMapId} onSelect={setSelectedMapId} markerBudget={markerBudget} />
      {result ? <div className="fd-radar-summary" aria-label="Local Radar summary">
        <span><b>{shops.length}</b><small>STORES</small></span>
        <span className="expected"><b>{expected}</b><small>EXPECTED</small></span>
        <span className="confirmed"><b>{confirmed}</b><small>CONFIRMED</small></span>
        <span><b>{unknown}</b><small>UNKNOWN</small></span>
        {!scopedRetailerId ? <span><b>{events.length}</b><small>EVENTS</small></span> : null}
      </div> : null}
    </section>

    {result ? <section className="fd-radar-panel fd-radar-stores">
      <div className="fd-radar-panel-head">
        <div><small>NEARBY STORES</small><h2>{scopedRetailerId ? `Nearby ${scopedName} branches` : "Relevant physical retailer locations near you."}</h2></div>
        <p>Cloud owns branch identity, retailer grouping and seller evidence. A branch result is not proof that it sells Pokémon products, and stock remains a separate lifecycle.</p>
      </div>

      {shops.length ? <><p className="fd-store-count">Showing {visibleShops.length} of {shops.length} filtered locations.</p><div className="fd-store-grid">{visibleShops.map((shop) => {
        const localStatus = availabilityStatus(shop);
        const expectedStock = shop.localAvailability?.expected ?? null;
        const confirmedStock = shop.localAvailability?.confirmed ?? null;
        const scope = expectedScope(shop);
        const shopDistance = distance(shop.distanceMiles);
        const mapId = `shop:${shop.id}`;
        return <article className={`fd-store-card ${localStatus}`} key={shop.id}>
          <header>
            <div className="fd-store-badges"><span>STORE</span><span>{sellerEvidence(shop)}</span><b>{localStatus.toUpperCase()}</b></div>
            <strong>{shop.name}</strong>
            <small>{shop.address || "Address unavailable"}{shopDistance ? ` · ${shopDistance}` : ""}</small>
          </header>

          {localStatus === "expected" && expectedStock ? <div className="fd-stock-notice expected">
            <small>EXPECTED STOCK</small>
            <strong>{expectedStock.title || "Pokémon / TCG stock"}</strong>
            <b>{expectedTime(expectedStock)}</b>
            {scope === "retailer_chain" ? <span>Retailer-wide intelligence · not confirmed for this specific store.</span> : <span>Expected-stock intelligence applies to this store, but physical availability is not yet confirmed.</span>}
            {shop.localAvailability?.disclaimer ? <p>{shop.localAvailability.disclaimer}</p> : null}
          </div> : null}

          {localStatus === "confirmed" && confirmedStock ? <div className="fd-stock-notice confirmed">
            <small>CONFIRMED PHYSICAL STOCK</small>
            <strong>{confirmedStock.title || "Pokémon / TCG stock"}</strong>
            <b>{observedTime(confirmedStock.observedAt)}</b>
            <span>FateDrop has genuine evidence that this product is physically available at this exact branch.</span>
          </div> : null}

          {localStatus === "unknown" ? <div className="fd-stock-notice unknown">
            <small>CURRENT STOCK · UNKNOWN</small>
            <strong>No reliable current stock information.</strong>
            <span>This is a nearby physical branch with Cloud-held location evidence. Pokémon seller participation may still be unverified. FateDrop does not treat missing data or online sold-out status as physical-store stock truth.</span>
          </div> : null}

          {shop.locationEvidence?.caveat ? <p className="fd-location-evidence">{shop.locationEvidence.caveat}</p> : null}

          <footer>
            {hasCoords(shop) ? <button type="button" onClick={() => setSelectedMapId(mapId)}>SHOW ON MAP</button> : <span>MAP POSITION UNAVAILABLE</span>}
            {shop.websiteUrl ? <a href={shop.websiteUrl} target="_blank" rel="noreferrer">VIEW RETAILER ↗</a> : null}
          </footer>
        </article>;
      })}</div>{visibleShops.length < shops.length ? <button type="button" className="fd-show-more" onClick={() => setVisibleStoreLimit((value) => value + STORE_PAGE_SIZE)}>SHOW {Math.min(STORE_PAGE_SIZE, shops.length - visibleShops.length)} MORE LOCATIONS</button> : null}</> : <div className="fd-radar-empty"><strong>{scopedRetailerId ? `No nearby ${scopedName} branch found in this radius.` : "No nearby stores found in this radius."}</strong><span>Try a wider radius. FateDrop does not invent branches to fill an empty result.</span></div>}
    </section> : null}

    {result && events.length ? <section className="fd-radar-panel fd-radar-events-panel">
      <div className="fd-radar-panel-head">
        <div><small>EVENTS</small><h2>Card shows and events near you.</h2></div>
        <p>Events remain part of Local Radar but separate from store-stock status.</p>
      </div>
      <div className="fd-event-list">{events.map((event) => {
        const eventDistance = distance(event.distanceMiles);
        return <article key={event.id}>
          <div><span>EVENT</span><strong>{event.name}</strong><small>{eventDate(event.startDateTime)} · {event.venueName || event.townCity || event.postcode || "Venue pending"}{eventDistance ? ` · ${eventDistance}` : ""}</small></div>
          <aside>
            {hasCoords(event) ? <button type="button" onClick={() => setSelectedMapId(`event:${event.id}`)}>SHOW ON MAP</button> : null}
            {event.officialTicketUrl ? <a href={event.officialTicketUrl} target="_blank" rel="noreferrer">TICKETS ↗</a> : event.officialEventUrl ? <a href={event.officialEventUrl} target="_blank" rel="noreferrer">EVENT ↗</a> : null}
          </aside>
        </article>;
      })}</div>
    </section> : null}

    <section className="fd-radar-truth">
      <div><span>✓</span><strong>Physical truth stays physical.</strong></div>
      <p>Online stock never becomes confirmed store stock automatically. This does not prove stock at this physical branch. Expected stock is indicative, not guaranteed. When FateDrop has no reliable current physical information, Local Radar says <b>Unknown</b>.</p>
      {result ? <small>CLOUD DATA STATUS · STORES {sourceStatus(result.providers?.shops?.status)} · STOCK {sourceStatus(result.providers?.localStock?.status)} · EVENTS {sourceStatus(result.providers?.events?.status)}{result.locationResolution?.postcode ? ` · ORIGIN ${result.locationResolution.postcode}` : ""}</small> : null}
    </section>

    <p className="fd-radar-privacy">Location is used on demand for this search. FateDrop does not silently turn Local Radar into continuous background tracking.</p>

    <style jsx>{`
      .fd-radar-workspace{display:grid;gap:12px}.fd-radar-panel,.fd-radar-truth,.fd-radar-scope{border:1px solid rgba(221,203,188,.085);border-radius:13px;background:linear-gradient(145deg,#0f1317,#090d11 74%)}.fd-radar-scope{padding:14px 18px;border-color:rgba(103,232,249,.13)}.fd-radar-scope strong{color:#9bcbd3;font-size:8px;letter-spacing:.1em}.fd-radar-scope p{margin:5px 0 0;color:#918a8f;font-size:9px;line-height:1.5}.fd-radar-scope code{color:#cbb09d}.fd-radar-panel{padding:24px}.fd-radar-panel-head{display:flex;justify-content:space-between;gap:28px;align-items:flex-end;margin-bottom:18px}.fd-radar-panel-head.compact{margin-bottom:14px}.fd-radar-panel-head>div{min-width:0}.fd-radar-panel-head small{color:#b6977d;font-size:9px;font-weight:900;letter-spacing:.14em}.fd-radar-panel-head h2{margin:6px 0 0;color:#e8ded6;font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:500}.fd-radar-panel-head p{max-width:560px;margin:0;color:#938c91;font-size:11px;line-height:1.55;text-align:right}.fd-radar-controls{display:grid;grid-template-columns:120px auto 32px minmax(220px,1fr) auto;gap:9px;align-items:end}.fd-radar-controls label{display:grid;gap:6px}.fd-radar-controls label>small{color:#89828c;font-size:8px;font-weight:900;letter-spacing:.11em}.fd-radar-controls select,.fd-radar-controls input,.fd-radar-controls button{height:46px;border:1px solid rgba(221,203,188,.1);border-radius:10px;background:#0b0f13;color:#eee4dc;padding:0 13px;font:inherit;font-size:11px}.fd-radar-controls button{border-color:rgba(164,116,193,.24);background:linear-gradient(135deg,rgba(117,73,145,.18),rgba(146,108,83,.06));font-size:9px;font-weight:900;letter-spacing:.05em;cursor:pointer}.fd-radar-controls button.secondary{border-color:rgba(221,203,188,.12);background:rgba(255,255,255,.025)}.fd-radar-controls button:disabled{opacity:.5;cursor:wait}.fd-radar-or{height:46px;display:grid;place-items:center;color:#6f6871;font-size:8px;font-weight:900}.fd-radar-status{margin:12px 0 0;padding-top:12px;border-top:1px solid rgba(221,203,188,.055);color:#aaa2a7;font-size:11px;line-height:1.55}.fd-radar-map-panel{padding:18px}.fd-radar-map-panel .fd-radar-panel-head{padding:4px 6px 0}.fd-radar-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:10px}.fd-radar-summary span{padding:11px 9px;display:grid;gap:3px;text-align:center;border:1px solid rgba(221,203,188,.065);border-radius:9px;background:rgba(255,255,255,.014)}.fd-radar-summary b{color:#eee4dc;font-family:Georgia,serif;font-size:22px;font-weight:500}.fd-radar-summary small{color:#7f787e;font-size:7px;font-weight:900;letter-spacing:.11em}.fd-radar-summary .expected b{color:#c7a2de}.fd-radar-summary .confirmed b{color:#96cbb0}.fd-store-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.fd-store-card{padding:17px;display:flex;flex-direction:column;gap:13px;border:1px solid rgba(221,203,188,.07);border-radius:12px;background:rgba(255,255,255,.014)}.fd-store-card.expected{border-color:rgba(170,123,215,.18)}.fd-store-card.confirmed{border-color:rgba(111,201,154,.2)}.fd-store-card header{display:grid;gap:4px}.fd-store-badges{display:flex;gap:6px;align-items:center}.fd-store-badges span,.fd-store-badges b{padding:4px 6px;border-radius:999px;font-size:7px;font-weight:900;letter-spacing:.09em}.fd-store-badges span{border:1px solid rgba(169,223,232,.15);color:#9bcbd3;background:rgba(95,169,184,.045)}.fd-store-badges b{border:1px solid rgba(221,203,188,.08);color:#8e878b;background:rgba(255,255,255,.018)}.fd-store-card.expected .fd-store-badges b{color:#c7a2de;border-color:rgba(170,123,215,.18)}.fd-store-card.confirmed .fd-store-badges b{color:#96cbb0;border-color:rgba(111,201,154,.2)}.fd-store-card header>strong{margin-top:4px;color:#e6dcd4;font-size:16px}.fd-store-card header>small{color:#8c858a;font-size:9px;line-height:1.45}.fd-stock-notice{padding:13px;display:grid;gap:4px;border:1px solid rgba(221,203,188,.06);border-radius:10px;background:rgba(0,0,0,.14)}.fd-stock-notice>small{font-size:7px;font-weight:900;letter-spacing:.11em}.fd-stock-notice>strong{color:#ddd3cb;font-size:13px}.fd-stock-notice>b{font-size:10px;font-weight:800}.fd-stock-notice>span{color:#928b90;font-size:9px;line-height:1.45}.fd-stock-notice p{margin:6px 0 0;padding-top:7px;border-top:1px solid rgba(221,203,188,.055);color:#827b80;font-size:8px;line-height:1.5}.fd-stock-notice.expected>small,.fd-stock-notice.expected>b{color:#c7a2de}.fd-stock-notice.confirmed>small,.fd-stock-notice.confirmed>b{color:#96cbb0}.fd-stock-notice.unknown>small{color:#8e878b}.fd-store-card footer,.fd-event-list aside{display:flex;gap:10px;align-items:center;margin-top:auto}.fd-store-card footer button,.fd-event-list button{appearance:none;padding:0;border:0;background:none;color:#bd99d2;font:inherit;font-size:8px;font-weight:900;letter-spacing:.04em;cursor:pointer}.fd-store-card footer a,.fd-event-list a{color:#cbb09d;font-size:8px;font-weight:900;text-decoration:none}.fd-store-card footer>span{color:#706a6e;font-size:7px;font-weight:800}.fd-event-list{display:grid;gap:7px}.fd-event-list article{padding:14px 15px;display:flex;justify-content:space-between;gap:18px;align-items:center;border:1px solid rgba(221,203,188,.065);border-radius:10px;background:rgba(255,255,255,.012)}.fd-event-list article>div{display:grid;gap:4px}.fd-event-list article>div span{color:#b997cf;font-size:7px;font-weight:900;letter-spacing:.1em}.fd-event-list strong{font-size:13px}.fd-event-list small{color:#8b8489;font-size:9px}.fd-radar-empty{padding:22px;display:grid;gap:6px;border:1px dashed rgba(221,203,188,.08);border-radius:11px}.fd-radar-empty strong{font-size:13px}.fd-radar-empty span{color:#8d868b;font-size:10px}.fd-radar-truth{padding:17px 20px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:5px 16px;align-items:center}.fd-radar-truth>div{display:flex;gap:8px;align-items:center}.fd-radar-truth>div span{width:24px;height:24px;display:grid;place-items:center;border:1px solid rgba(111,201,154,.18);border-radius:50%;color:#96cbb0;font-size:10px}.fd-radar-truth>div strong{color:#ddd3cb;font-size:12px}.fd-radar-truth p{margin:0;color:#958e93;font-size:10px;line-height:1.55}.fd-radar-truth>small{grid-column:1/-1;padding-top:8px;border-top:1px solid rgba(221,203,188,.05);color:#6f696d;font-size:7px;font-weight:800;letter-spacing:.06em}.fd-radar-privacy{margin:0;padding:2px 4px;color:#736d71;font-size:8px;line-height:1.5}@media(max-width:1050px){.fd-radar-controls{grid-template-columns:120px 1fr}.fd-radar-controls .postcode{grid-column:1/2}.fd-radar-or{display:none}.fd-store-grid{grid-template-columns:1fr}.fd-radar-panel-head{align-items:flex-start;flex-direction:column;gap:7px}.fd-radar-panel-head p{text-align:left}}@media(max-width:700px){.fd-radar-panel{padding:17px}.fd-radar-map-panel{padding:10px}.fd-radar-controls{grid-template-columns:1fr}.fd-radar-controls .postcode{grid-column:auto}.fd-radar-summary{grid-template-columns:repeat(2,1fr)}.fd-radar-summary span:last-child{grid-column:1/-1}.fd-event-list article{align-items:flex-start;flex-direction:column}.fd-radar-truth{grid-template-columns:1fr}.fd-radar-truth>small{grid-column:auto}}
    `}</style>
    <style jsx>{`
      .fd-radar-filters{display:flex;flex-wrap:wrap;gap:7px;margin:0 6px 12px}.fd-radar-filters button,.fd-show-more{appearance:none;border:1px solid rgba(221,203,188,.1);border-radius:999px;background:rgba(255,255,255,.018);color:#918a8f;font:800 8px/1 system-ui;letter-spacing:.05em;cursor:pointer}.fd-radar-filters button{padding:9px 12px}.fd-radar-filters button.active{border-color:rgba(185,151,232,.36);background:rgba(140,99,201,.15);color:#e5d9f2}.fd-store-count{margin:-7px 0 12px;color:#787176;font-size:9px}.fd-location-evidence{margin:0;padding:9px 10px;border:1px solid rgba(169,223,232,.08);border-radius:8px;background:rgba(95,169,184,.025);color:#858084;font-size:8px;line-height:1.5}.fd-show-more{display:block;margin:14px auto 0;padding:11px 16px;border-radius:9px;color:#c7a2de}.fd-show-more:hover,.fd-radar-filters button:hover{border-color:rgba(185,151,232,.28);color:#e4d9ea}
    `}</style>
  </div>;
}
