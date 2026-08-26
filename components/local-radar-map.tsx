"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type LocalRadarMapPoint = {
  id: string;
  kind: "shop" | "event";
  name: string;
  latitude: number;
  longitude: number;
  status?: "expected" | "confirmed" | "unknown";
  subtitle?: string | null;
};

type LocalRadarOrigin = { latitude: number; longitude: number } | null;

type LeafletLayer = {
  addTo(map: LeafletMap): LeafletLayer;
  bindTooltip(content: string, options?: { direction?: string; offset?: [number, number] }): LeafletLayer;
  on(event: string, handler: () => void): LeafletLayer;
};

type LeafletMap = {
  remove(): void;
  setView(center: [number, number], zoom: number): LeafletMap;
  fitBounds(bounds: LeafletBounds, options?: { padding?: [number, number]; maxZoom?: number }): LeafletMap;
};

type LeafletBounds = object;

type LeafletApi = {
  map(element: HTMLElement, options?: { zoomControl?: boolean; attributionControl?: boolean }): LeafletMap;
  tileLayer(url: string, options?: { maxZoom?: number; attribution?: string }): LeafletLayer;
  circleMarker(
    coordinate: [number, number],
    options?: {
      radius?: number;
      color?: string;
      weight?: number;
      opacity?: number;
      fillColor?: string;
      fillOpacity?: number;
    },
  ): LeafletLayer;
  latLngBounds(points: [number, number][]): LeafletBounds;
};

declare global {
  interface Window {
    L?: LeafletApi;
    __fateDropLeafletPromise?: Promise<LeafletApi>;
  }
}

const LEAFLET_CSS_ID = "fatedrop-leaflet-css";
const LEAFLET_SCRIPT_ID = "fatedrop-leaflet-script";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_SCRIPT = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const UK_CENTRE: [number, number] = [52.5, -1.5];

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (window.__fateDropLeafletPromise) return window.__fateDropLeafletPromise;

  if (!document.getElementById(LEAFLET_CSS_ID)) {
    const link = document.createElement("link");
    link.id = LEAFLET_CSS_ID;
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);
  }

  window.__fateDropLeafletPromise = new Promise<LeafletApi>((resolve, reject) => {
    const complete = () => {
      if (window.L) resolve(window.L);
      else reject(new Error("Leaflet did not initialise."));
    };
    const fail = () => reject(new Error("Leaflet could not load."));

    const existing = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", complete, { once: true });
      existing.addEventListener("error", fail, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = LEAFLET_SCRIPT_ID;
    script.src = LEAFLET_SCRIPT;
    script.async = true;
    script.addEventListener("load", complete, { once: true });
    script.addEventListener("error", fail, { once: true });
    document.body.appendChild(script);
  });

  return window.__fateDropLeafletPromise;
}

function markerPalette(point: LocalRadarMapPoint) {
  if (point.kind === "event") return { stroke: "#b997e8", fill: "#8c63c9" };
  if (point.status === "confirmed") return { stroke: "#b8efd2", fill: "#6fc99a" };
  if (point.status === "expected") return { stroke: "#d4bdf1", fill: "#aa7bd7" };
  return { stroke: "#a9dfe8", fill: "#5fa9b8" };
}

function pointLabel(point: LocalRadarMapPoint) {
  if (point.kind === "event") return "EVENT";
  if (point.status === "confirmed") return "CONFIRMED";
  if (point.status === "expected") return "EXPECTED";
  return "STORE";
}

export function LocalRadarMap({
  points,
  origin,
  active,
  selectedId,
  onSelect,
}: {
  points: LocalRadarMapPoint[];
  origin: LocalRadarOrigin;
  active: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState(false);
  const selected = useMemo(() => points.find((point) => point.id === selectedId) ?? null, [points, selectedId]);

  useEffect(() => {
    if (!mapElement.current) return;
    let disposed = false;
    let map: LeafletMap | null = null;

    void loadLeaflet().then((leaflet) => {
      if (disposed || !mapElement.current) return;
      setMapError(false);
      map = leaflet.map(mapElement.current, { zoomControl: true, attributionControl: true });
      leaflet.tileLayer(TILE_URL, {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const centre: [number, number] = origin
        ? [origin.latitude, origin.longitude]
        : points[0]
          ? [points[0].latitude, points[0].longitude]
          : UK_CENTRE;
      map.setView(centre, active ? 11 : 6);

      if (origin) {
        leaflet.circleMarker([origin.latitude, origin.longitude], {
          radius: 6,
          color: "#ffffff",
          weight: 2,
          opacity: 0.9,
          fillColor: "#7f5bc4",
          fillOpacity: 0.9,
        }).addTo(map).bindTooltip("Your search area", { direction: "top", offset: [0, -7] });
      }

      for (const point of points) {
        const palette = markerPalette(point);
        leaflet.circleMarker([point.latitude, point.longitude], {
          radius: point.kind === "event" ? 7 : point.status === "confirmed" ? 9 : 8,
          color: palette.stroke,
          weight: 2,
          opacity: 0.95,
          fillColor: palette.fill,
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindTooltip(`${pointLabel(point)} · ${point.name}`, { direction: "top", offset: [0, -8] })
          .on("click", () => onSelect(point.id));
      }

      const boundsPoints: [number, number][] = [
        ...(origin ? [[origin.latitude, origin.longitude] as [number, number]] : []),
        ...points.map((point) => [point.latitude, point.longitude] as [number, number]),
      ];
      if (boundsPoints.length > 1) {
        map.fitBounds(leaflet.latLngBounds(boundsPoints), { padding: [42, 42], maxZoom: 13 });
      } else if (boundsPoints.length === 1) {
        map.setView(boundsPoints[0], 12);
      }
    }).catch(() => {
      if (!disposed) setMapError(true);
    });

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [active, onSelect, origin, points]);

  return <div className="fd-local-map-shell">
    <div ref={mapElement} className="fd-local-map" aria-label="Local Radar map showing nearby stores and events" />

    {!active ? <div className="fd-local-map-overlay">
      <span aria-hidden="true">⌖</span>
      <strong>Your Local Radar map</strong>
      <p>Choose your location or enter a UK postcode to reveal nearby stores, expected stock, confirmed physical availability and events.</p>
    </div> : null}

    {mapError ? <div className="fd-local-map-overlay error">
      <strong>Map tiles could not load.</strong>
      <p>Your Local Radar store list still uses the same Cloud results below. Try refreshing the page to reload the map.</p>
    </div> : null}

    {active ? <div className="fd-local-map-legend" aria-label="Map marker legend">
      <span><i className="store" />STORE</span>
      <span><i className="expected" />EXPECTED</span>
      <span><i className="confirmed" />CONFIRMED</span>
      <span><i className="event" />EVENT</span>
    </div> : null}

    {selected ? <div className="fd-local-map-selected">
      <small>{pointLabel(selected)}</small>
      <strong>{selected.name}</strong>
      {selected.subtitle ? <span>{selected.subtitle}</span> : null}
    </div> : null}

    <style jsx>{`
      .fd-local-map-shell{position:relative;height:440px;overflow:hidden;border:1px solid rgba(221,203,188,.09);border-radius:16px;background:#0b0e12}.fd-local-map{position:absolute;inset:0;z-index:1}.fd-local-map :global(.leaflet-control-container){font-family:inherit}.fd-local-map :global(.leaflet-control-zoom a){background:#10141a;color:#e7ddd5;border-color:rgba(255,255,255,.1)}.fd-local-map :global(.leaflet-control-attribution){background:rgba(9,12,16,.82);color:#8e878b}.fd-local-map :global(.leaflet-control-attribution a){color:#bca1d2}.fd-local-map :global(.leaflet-tooltip){border:1px solid rgba(221,203,188,.12);border-radius:8px;background:#10141a;color:#eee4dc;box-shadow:0 8px 24px rgba(0,0,0,.35);font-size:11px;font-weight:800}.fd-local-map-overlay{position:absolute;inset:0;z-index:3;display:grid;place-content:center;justify-items:center;padding:36px;text-align:center;background:radial-gradient(circle at 50% 45%,rgba(113,72,140,.17),transparent 32%),rgba(8,11,15,.86);backdrop-filter:blur(2px)}.fd-local-map-overlay>span{width:54px;height:54px;display:grid;place-items:center;border:1px solid rgba(176,133,208,.2);border-radius:50%;color:#c7a3df;font-size:28px;background:rgba(143,91,180,.08)}.fd-local-map-overlay strong{margin-top:12px;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:23px;font-weight:500}.fd-local-map-overlay p{max-width:520px;margin:8px 0 0;color:#9b9398;font-size:12px;line-height:1.6}.fd-local-map-overlay.error{z-index:5;background:rgba(8,11,15,.93)}.fd-local-map-legend{position:absolute;z-index:4;top:12px;left:12px;display:flex;flex-wrap:wrap;gap:6px;padding:7px 8px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(9,12,16,.88);backdrop-filter:blur(8px)}.fd-local-map-legend span{display:flex;align-items:center;gap:5px;color:#b5adb2;font-size:8px;font-weight:900;letter-spacing:.07em}.fd-local-map-legend i{width:8px;height:8px;border:2px solid;border-radius:50%}.fd-local-map-legend i.store{border-color:#a9dfe8;background:#5fa9b8}.fd-local-map-legend i.expected{border-color:#d4bdf1;background:#aa7bd7}.fd-local-map-legend i.confirmed{border-color:#b8efd2;background:#6fc99a}.fd-local-map-legend i.event{border-color:#b997e8;background:#8c63c9}.fd-local-map-selected{position:absolute;z-index:4;left:12px;bottom:12px;max-width:min(420px,calc(100% - 24px));padding:12px 14px;display:grid;gap:3px;border:1px solid rgba(221,203,188,.1);border-radius:11px;background:rgba(9,12,16,.92);box-shadow:0 12px 30px rgba(0,0,0,.3);backdrop-filter:blur(10px)}.fd-local-map-selected small{color:#b997cf;font-size:8px;font-weight:900;letter-spacing:.1em}.fd-local-map-selected strong{color:#eee4dc;font-size:13px}.fd-local-map-selected span{color:#999196;font-size:10px;line-height:1.45}@media(max-width:700px){.fd-local-map-shell{height:360px}.fd-local-map-legend{right:12px}.fd-local-map-overlay{padding:24px}.fd-local-map-overlay strong{font-size:20px}}
    `}</style>
  </div>;
}
