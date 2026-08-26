"use client";

import { useMemo, useState } from "react";

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
type Coordinate = { latitude: number; longitude: number };
type WorldPoint = { x: number; y: number };

const TILE_SIZE = 256;
const GRID_COLUMNS = 5;
const GRID_ROWS = 3;
const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_URL = process.env.NEXT_PUBLIC_LOCAL_RADAR_TILE_URL || DEFAULT_TILE_URL;
const UK_CENTRE: Coordinate = { latitude: 52.5, longitude: -1.5 };
const MIN_ZOOM = 5;
const MAX_ZOOM = 15;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function project(coordinate: Coordinate, zoom: number): WorldPoint {
  const latitude = clamp(coordinate.latitude, -85.05112878, 85.05112878);
  const latitudeRadians = latitude * Math.PI / 180;
  const scale = 2 ** zoom * TILE_SIZE;
  return {
    x: ((coordinate.longitude + 180) / 360) * scale,
    y: (1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2 * scale,
  };
}

function chooseZoom(coordinates: Coordinate[]) {
  if (coordinates.length <= 1) return 12;
  for (let zoom = MAX_ZOOM; zoom >= MIN_ZOOM; zoom -= 1) {
    const projected = coordinates.map((coordinate) => project(coordinate, zoom));
    const xs = projected.map((point) => point.x);
    const ys = projected.map((point) => point.y);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);
    if (spanX <= 860 && spanY <= 300) return zoom;
  }
  return MIN_ZOOM;
}

function tileUrl(zoom: number, x: number, y: number) {
  const count = 2 ** zoom;
  const wrappedX = ((x % count) + count) % count;
  const safeY = clamp(y, 0, count - 1);
  return TILE_URL
    .replace("{z}", String(zoom))
    .replace("{x}", String(wrappedX))
    .replace("{y}", String(safeY));
}

function markerClass(point: LocalRadarMapPoint) {
  if (point.kind === "event") return "event";
  if (point.status === "confirmed") return "confirmed";
  if (point.status === "expected") return "expected";
  return "store";
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
  const [zoomAdjustment, setZoomAdjustment] = useState(0);
  const selected = useMemo(() => points.find((point) => point.id === selectedId) ?? null, [points, selectedId]);

  const scene = useMemo(() => {
    const coordinates: Coordinate[] = [
      ...(origin ? [origin] : []),
      ...points.map((point) => ({ latitude: point.latitude, longitude: point.longitude })),
    ];
    const focusCoordinates = coordinates.length ? coordinates : [UK_CENTRE];
    const baseZoom = active ? chooseZoom(focusCoordinates) : 6;
    const zoom = clamp(baseZoom + zoomAdjustment, MIN_ZOOM, MAX_ZOOM);
    const projected = focusCoordinates.map((coordinate) => project(coordinate, zoom));
    const centre = {
      x: (Math.min(...projected.map((point) => point.x)) + Math.max(...projected.map((point) => point.x))) / 2,
      y: (Math.min(...projected.map((point) => point.y)) + Math.max(...projected.map((point) => point.y))) / 2,
    };
    const centreTileX = Math.floor(centre.x / TILE_SIZE);
    const centreTileY = Math.floor(centre.y / TILE_SIZE);
    const startTileX = centreTileX - Math.floor(GRID_COLUMNS / 2);
    const startTileY = centreTileY - Math.floor(GRID_ROWS / 2);
    const centreLocalX = centre.x - startTileX * TILE_SIZE;
    const centreLocalY = centre.y - startTileY * TILE_SIZE;
    const tiles = Array.from({ length: GRID_COLUMNS * GRID_ROWS }, (_, index) => {
      const column = index % GRID_COLUMNS;
      const row = Math.floor(index / GRID_COLUMNS);
      const x = startTileX + column;
      const y = startTileY + row;
      return { key: `${zoom}:${x}:${y}`, column, row, src: tileUrl(zoom, x, y) };
    });
    const markerPoints = points.map((point) => {
      const projectedPoint = project(point, zoom);
      return {
        ...point,
        x: projectedPoint.x - startTileX * TILE_SIZE,
        y: projectedPoint.y - startTileY * TILE_SIZE,
      };
    });
    const originPoint = origin ? (() => {
      const projectedOrigin = project(origin, zoom);
      return {
        x: projectedOrigin.x - startTileX * TILE_SIZE,
        y: projectedOrigin.y - startTileY * TILE_SIZE,
      };
    })() : null;
    return { zoom, tiles, markerPoints, originPoint, centreLocalX, centreLocalY };
  }, [active, origin, points, zoomAdjustment]);

  return <div className="fd-local-map-shell">
    <div
      className="fd-local-map-canvas"
      style={{
        width: GRID_COLUMNS * TILE_SIZE,
        height: GRID_ROWS * TILE_SIZE,
        left: `calc(50% - ${scene.centreLocalX}px)`,
        top: `calc(50% - ${scene.centreLocalY}px)`,
      }}
      aria-hidden={!active}
    >
      {scene.tiles.map((tile) => <img
        alt=""
        className="fd-local-map-tile"
        draggable={false}
        height={TILE_SIZE}
        key={tile.key}
        loading="lazy"
        src={tile.src}
        style={{ left: tile.column * TILE_SIZE, top: tile.row * TILE_SIZE }}
        width={TILE_SIZE}
      />)}

      {scene.originPoint ? <span
        className="fd-origin-marker"
        style={{ left: scene.originPoint.x, top: scene.originPoint.y }}
        title="Your search area"
      /> : null}

      {scene.markerPoints.map((point) => <button
        type="button"
        aria-label={`${pointLabel(point)} · ${point.name}`}
        className={`fd-map-marker ${markerClass(point)}${selectedId === point.id ? " selected" : ""}`}
        key={point.id}
        onClick={() => onSelect(point.id)}
        style={{ left: point.x, top: point.y }}
        title={`${pointLabel(point)} · ${point.name}`}
      ><span /></button>)}
    </div>

    {!active ? <div className="fd-local-map-overlay">
      <span aria-hidden="true">⌖</span>
      <strong>Your Local Radar map</strong>
      <p>Choose your location or enter a UK postcode to reveal nearby stores, expected stock, confirmed physical availability and events.</p>
    </div> : null}

    {active ? <>
      <div className="fd-map-controls" aria-label="Map zoom controls">
        <button type="button" aria-label="Zoom in" onClick={() => setZoomAdjustment((value) => clamp(value + 1, -4, 4))}>+</button>
        <button type="button" aria-label="Zoom out" onClick={() => setZoomAdjustment((value) => clamp(value - 1, -4, 4))}>−</button>
      </div>
      <div className="fd-local-map-legend" aria-label="Map marker legend">
        <span><i className="store" />STORE</span>
        <span><i className="expected" />EXPECTED</span>
        <span><i className="confirmed" />CONFIRMED</span>
        <span><i className="event" />EVENT</span>
      </div>
    </> : null}

    {selected ? <div className="fd-local-map-selected">
      <small>{pointLabel(selected)}</small>
      <strong>{selected.name}</strong>
      {selected.subtitle ? <span>{selected.subtitle}</span> : null}
    </div> : null}

    <a className="fd-map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>

    <style jsx>{`
      .fd-local-map-shell{position:relative;height:440px;overflow:hidden;border:1px solid rgba(221,203,188,.09);border-radius:16px;background:#0b0e12}.fd-local-map-canvas{position:absolute;z-index:1}.fd-local-map-tile{position:absolute;display:block;max-width:none;user-select:none;-webkit-user-drag:none}.fd-map-marker{position:absolute;z-index:3;width:22px;height:22px;padding:0;transform:translate(-50%,-50%);border:2px solid;border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,.4);cursor:pointer}.fd-map-marker span{position:absolute;inset:4px;border-radius:50%;background:currentColor}.fd-map-marker.store{border-color:#a9dfe8;background:#5fa9b8;color:#d8f4f8}.fd-map-marker.expected{border-color:#d4bdf1;background:#aa7bd7;color:#eadcf7}.fd-map-marker.confirmed{width:25px;height:25px;border-color:#b8efd2;background:#6fc99a;color:#e1f8ec}.fd-map-marker.event{border-color:#b997e8;background:#8c63c9;color:#e7daf5}.fd-map-marker.selected{box-shadow:0 0 0 5px rgba(255,255,255,.13),0 5px 18px rgba(0,0,0,.5)}.fd-map-marker:focus-visible{outline:3px solid #fff;outline-offset:3px}.fd-origin-marker{position:absolute;z-index:2;width:15px;height:15px;transform:translate(-50%,-50%);border:3px solid #fff;border-radius:50%;background:#7f5bc4;box-shadow:0 0 0 5px rgba(127,91,196,.22)}.fd-local-map-overlay{position:absolute;inset:0;z-index:5;display:grid;place-content:center;justify-items:center;padding:36px;text-align:center;background:radial-gradient(circle at 50% 45%,rgba(113,72,140,.17),transparent 32%),rgba(8,11,15,.82);backdrop-filter:blur(2px)}.fd-local-map-overlay>span{width:54px;height:54px;display:grid;place-items:center;border:1px solid rgba(176,133,208,.2);border-radius:50%;color:#c7a3df;font-size:28px;background:rgba(143,91,180,.08)}.fd-local-map-overlay strong{margin-top:12px;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:23px;font-weight:500}.fd-local-map-overlay p{max-width:520px;margin:8px 0 0;color:#9b9398;font-size:12px;line-height:1.6}.fd-map-controls{position:absolute;z-index:6;top:12px;right:12px;display:grid;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:rgba(9,12,16,.9);box-shadow:0 5px 16px rgba(0,0,0,.3)}.fd-map-controls button{width:34px;height:31px;border:0;border-bottom:1px solid rgba(255,255,255,.08);background:transparent;color:#eee4dc;font-size:18px;cursor:pointer}.fd-map-controls button:last-child{border-bottom:0}.fd-local-map-legend{position:absolute;z-index:4;top:12px;left:12px;display:flex;flex-wrap:wrap;gap:6px;padding:7px 8px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(9,12,16,.88);backdrop-filter:blur(8px)}.fd-local-map-legend span{display:flex;align-items:center;gap:5px;color:#b5adb2;font-size:8px;font-weight:900;letter-spacing:.07em}.fd-local-map-legend i{width:8px;height:8px;border:2px solid;border-radius:50%}.fd-local-map-legend i.store{border-color:#a9dfe8;background:#5fa9b8}.fd-local-map-legend i.expected{border-color:#d4bdf1;background:#aa7bd7}.fd-local-map-legend i.confirmed{border-color:#b8efd2;background:#6fc99a}.fd-local-map-legend i.event{border-color:#b997e8;background:#8c63c9}.fd-local-map-selected{position:absolute;z-index:4;left:12px;bottom:28px;max-width:min(420px,calc(100% - 24px));padding:12px 14px;display:grid;gap:3px;border:1px solid rgba(221,203,188,.1);border-radius:11px;background:rgba(9,12,16,.92);box-shadow:0 12px 30px rgba(0,0,0,.3);backdrop-filter:blur(10px)}.fd-local-map-selected small{color:#b997cf;font-size:8px;font-weight:900;letter-spacing:.1em}.fd-local-map-selected strong{color:#eee4dc;font-size:13px}.fd-local-map-selected span{color:#999196;font-size:10px;line-height:1.45}.fd-map-attribution{position:absolute;z-index:4;right:6px;bottom:4px;padding:2px 5px;border-radius:5px;background:rgba(9,12,16,.78);color:#b8b0b5;font-size:8px;text-decoration:none}@media(max-width:700px){.fd-local-map-shell{height:360px}.fd-local-map-legend{right:54px}.fd-local-map-overlay{padding:24px}.fd-local-map-overlay strong{font-size:20px}}
    `}</style>
  </div>;
}
