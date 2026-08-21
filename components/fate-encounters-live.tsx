"use client";

import { useMemo, useState } from "react";
import type { EncounterEvent, EncounterVendor, LocalRadarResponse } from "@/lib/encounter-types";
import styles from "./fate-encounters-live.module.css";

type Filter = "all" | "this-month" | "pokemon";

function formatEventDate(event: EncounterEvent) {
  const start = new Date(event.startDateTime);
  const end = event.endDateTime ? new Date(event.endDateTime) : null;
  const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(start);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(start);
  if (!end) return `${day} · ${time}`;
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) return `${day} · ${time}–${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(end)}`;
  return `${day} → ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(end)}`;
}

function supportsPokemon(event: EncounterEvent) {
  return (event.supportedTcgs || []).some((value) => ["pokemon", "pokémon", "all", "all tcg"].includes(value.toLowerCase()));
}

function venue(event: EncounterEvent) {
  return [event.venueName, event.townCity, event.postcode].filter(Boolean).join(" · ") || "Venue to be confirmed";
}

function money(pence?: number | null) {
  return pence == null ? "Price TBC" : `£${(pence / 100).toFixed(2)}`;
}

export function FateEncountersLive({ initialEvents, live }: { initialEvents: EncounterEvent[]; live: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<EncounterEvent | null>(initialEvents[0] || null);
  const [vendors, setVendors] = useState<EncounterVendor[]>([]);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [radius, setRadius] = useState(25);
  const [radar, setRadar] = useState<LocalRadarResponse | null>(null);
  const [radarError, setRadarError] = useState("");
  const [radarLoading, setRadarLoading] = useState(false);

  const filtered = useMemo(() => initialEvents.filter((event) => {
    if (filter === "pokemon") return supportsPokemon(event);
    if (filter === "this-month") {
      const now = new Date();
      const start = new Date(event.startDateTime);
      return start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth();
    }
    return true;
  }), [filter, initialEvents]);

  async function selectEvent(event: EncounterEvent) {
    setSelected(event);
    setVendorLoading(true);
    try {
      const response = await fetch(`/api/encounters/${encodeURIComponent(event.id)}/vendors`, { cache: "no-store" });
      const data = await response.json() as { vendors?: EncounterVendor[] };
      setVendors(Array.isArray(data.vendors) ? data.vendors : []);
    } catch {
      setVendors([]);
    } finally {
      setVendorLoading(false);
    }
  }

  async function runRadar(params: URLSearchParams) {
    setRadarLoading(true);
    setRadarError("");
    try {
      params.set("radiusMiles", String(radius));
      params.set("types", "shops,events");
      const response = await fetch(`/api/encounters/radar?${params.toString()}`, { cache: "no-store" });
      const data = await response.json() as LocalRadarResponse & { error?: string };
      if (!response.ok) throw new Error(data.error || "Nearby discovery failed");
      setRadar(data);
    } catch (error) {
      setRadar(null);
      setRadarError(error instanceof Error ? error.message : "Nearby discovery failed");
    } finally {
      setRadarLoading(false);
    }
  }

  async function usePostcode() {
    const clean = postcode.trim().toUpperCase();
    if (!clean) return setRadarError("Enter a UK postcode first.");
    await runRadar(new URLSearchParams({ postcode: clean }));
  }

  function useDeviceLocation() {
    if (!("geolocation" in navigator)) return setRadarError("Location is not available in this browser. Use a postcode instead.");
    setRadarLoading(true);
    setRadarError("");
    navigator.geolocation.getCurrentPosition(
      (position) => void runRadar(new URLSearchParams({ lat: String(position.coords.latitude), lng: String(position.coords.longitude) })),
      () => { setRadarLoading(false); setRadarError("Location permission was denied. Use a postcode instead."); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return <div className={styles.shell}>
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        {(["all", "this-month", "pokemon"] as Filter[]).map((value) => <button key={value} type="button" className={`${styles.chip} ${filter === value ? styles.chipActive : ""}`} onClick={() => setFilter(value)}>{value === "all" ? "All upcoming" : value === "this-month" ? "This month" : "Pokémon"}</button>)}
      </div>
      <span className={styles.count}>{live ? `${filtered.length} live listings` : "Live feed temporarily unavailable"}</span>
    </div>

    <div className={styles.grid}>
      <div className={styles.list}>
        {filtered.length ? filtered.map((event) => <button type="button" key={event.id} onClick={() => void selectEvent(event)} className={`${styles.card} ${selected?.id === event.id ? styles.cardSelected : ""}`}>
          <div className={styles.cardTop}><div><h3 className={styles.eventName}>{event.name}</h3><p className={styles.date}>{formatEventDate(event)}</p></div>{event.distanceMiles != null ? <span className={styles.badge}>{event.distanceMiles.toFixed(1)} mi</span> : null}</div>
          <p className={styles.venue}>{venue(event)}</p>
          <div className={styles.badges}>{event.verificationStatus === "source_verified" ? <span className={styles.badge}>Source verified</span> : null}{event.verificationStatus === "fatedrop_verified" ? <span className={`${styles.badge} ${styles.badgeMint}`}>FateDrop verified</span> : null}{event.vendorApplicationsStatus === "open" ? <span className={`${styles.badge} ${styles.badgeViolet}`}>Vendor spaces</span> : null}</div>
        </button>) : <div className={styles.empty}>No verified upcoming events match this filter.</div>}
      </div>

      <aside className={styles.detail}>
        {selected ? <><p className={styles.eyebrow}>Selected encounter</p><h3>{selected.name}</h3><p className={styles.detailText}>{formatEventDate(selected)}<br />{venue(selected)}<br />{selected.organiserName ? `Organiser: ${selected.organiserName}` : ""}</p>
          <div className={styles.links}>{selected.officialEventUrl ? <a className={styles.link} href={selected.officialEventUrl} target="_blank" rel="noreferrer">Official event ↗</a> : null}{selected.officialTicketUrl ? <a className={styles.link} href={selected.officialTicketUrl} target="_blank" rel="noreferrer">Tickets ↗</a> : null}</div>
          <div className={styles.vendorHead}><div><p className={styles.eyebrow}>Confirmed vendors</p><strong>{vendorLoading ? "Loading…" : vendors.length}</strong></div></div>
          {vendorLoading ? <p className={styles.loading}>Loading organiser/vendor evidence…</p> : vendors.length ? <div className={styles.vendorList}>{vendors.map((vendor) => <div className={styles.vendor} key={vendor.id}><div className={styles.vendorName}>{vendor.name}</div><div className={styles.vendorMeta}>{[vendor.zoneLabel, vendor.stallLabel ? `Table ${vendor.stallLabel}` : null].filter(Boolean).join(" · ") || "Table / stall TBC"}</div>{(vendor.inventory || []).length ? <div className={styles.inventory}>{(vendor.inventory || []).map((item) => <div className={styles.inventoryItem} key={item.id}>{item.title} · {money(item.pricePence)} · {item.availability.replaceAll("_", " ")}</div>)}</div> : <div className={styles.stockUnknown}>Confirmed vendor location only — no physical event stock has been reported.</div>}</div>)}</div> : <p className={styles.detailText}>No confirmed vendor list is published for this event yet.</p>}
        </> : <p className={styles.detailText}>Select an event to inspect venue, source and vendor evidence.</p>}
      </aside>
    </div>

    <section className={styles.radar}>
      <div className={styles.radarTop}><div><p className={styles.eyebrow}>Local Radar</p><h3>What is happening near you?</h3><p className={styles.radarCopy}>Use device location or a UK postcode to find nearby verified events. Shop discovery uses Google Places when the hosted provider is configured; a discovered shop is never treated as stock evidence.</p></div></div>
      <div className={styles.locationRow}><input className={styles.input} value={postcode} onChange={(event) => setPostcode(event.target.value)} placeholder="UK postcode" aria-label="UK postcode"/><button type="button" className={styles.action} onClick={() => void usePostcode()}>Search postcode</button><button type="button" className={styles.action} onClick={useDeviceLocation}>Use my location</button></div>
      <div className={styles.radiusRow}>{[10,25,50,100].map((value) => <button type="button" key={value} className={`${styles.radius} ${radius === value ? styles.chipActive : ""}`} onClick={() => setRadius(value)}>{value} miles</button>)}</div>
      {radarLoading ? <p className={styles.loading}>Checking nearby Fate Encounters…</p> : null}{radarError ? <p className={styles.error}>{radarError}</p> : null}
      {radar?.providers?.shops?.status === "unconfigured" ? <div className={styles.note}>Nearby event distance is live. Google Places shop discovery is not configured on the hosted service yet, so FateDrop is deliberately showing zero discovered shops rather than inventing them.</div> : null}
      {radar ? <div className={styles.radarResults}>
        <div><p className={styles.eyebrow}>Nearby events · {radar.events.length}</p>{radar.events.length ? radar.events.map((event) => <div className={styles.result} key={event.id}><h4>{event.name}</h4><p>{formatEventDate(event)}<br />{venue(event)}{event.distanceMiles != null ? <><br />{event.distanceMiles.toFixed(1)} miles away</> : null}</p></div>) : <div className={styles.empty}>No verified upcoming events were found inside this radius.</div>}</div>
        <div><p className={styles.eyebrow}>Nearby shops · {radar.shops.length}</p>{radar.shops.length ? radar.shops.map((shop) => <div className={styles.result} key={shop.id}><h4>{shop.name}</h4><p>{shop.address || "Local TCG retailer"}{shop.distanceMiles != null ? <><br />{shop.distanceMiles.toFixed(1)} miles away</> : null}<br />{shop.networkStatus === "live_connected" ? "Live Connected" : "Local Indie"}</p>{shop.onlineCatalogue?.availableOffers ? <p className={styles.stockUnknown}>{shop.onlineCatalogue.availableOffers} online catalogue offers detected. This is not a claim that the physical branch holds those items.</p> : <p className={styles.stockUnknown}>Physical branch stock unconfirmed.</p>}</div>) : <div className={styles.empty}>No shop discovery results are available for this search.</div>}</div>
      </div> : null}
      <p className={styles.truth}>FateDrop separates place discovery, connected online catalogue evidence and explicit physical/event stock evidence. Only the last of those may be presented as local physical availability.</p>
    </section>
  </div>;
}
