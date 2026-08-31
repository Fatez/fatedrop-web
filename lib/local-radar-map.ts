export type LocalRadarRetailerGroup = "supermarkets" | "large_retailers" | "independents" | "unclassified";

export type ProjectedRadarPoint<T> = T & {
  id: string;
  latitude: number;
  longitude: number;
  x: number;
  y: number;
};

export type RadarMapMarker<T> =
  | { kind: "point"; id: string; x: number; y: number; latitude: number; longitude: number; point: ProjectedRadarPoint<T>; count: 1 }
  | { kind: "cluster"; id: string; x: number; y: number; latitude: number; longitude: number; points: ProjectedRadarPoint<T>[]; count: number };

const MIN_MARKERS = 8;
const MAX_MARKERS = 100;
export const DEFAULT_MARKER_BUDGET = 72;

export function clampMarkerBudget(value: unknown) {
  const parsed = Number(value);
  return Math.max(MIN_MARKERS, Math.min(MAX_MARKERS, Number.isFinite(parsed) ? Math.floor(parsed) : DEFAULT_MARKER_BUDGET));
}

export function retailerGroup(value: unknown): LocalRadarRetailerGroup {
  const group = String(value ?? "").trim().toLowerCase();
  if (group === "supermarkets" || group === "large_retailers" || group === "independents") return group;
  return "unclassified";
}

export function clusterProjectedRadarPoints<T>(points: ProjectedRadarPoint<T>[], requestedBudget: unknown): RadarMapMarker<T>[] {
  const markerBudget = clampMarkerBudget(requestedBudget);
  if (points.length <= markerBudget) {
    return points.map((point) => ({
      kind: "point",
      id: point.id,
      x: point.x,
      y: point.y,
      latitude: point.latitude,
      longitude: point.longitude,
      point,
      count: 1,
    }));
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const aspect = Math.max(0.35, Math.min(3, width / height));
  const columns = Math.max(1, Math.floor(Math.sqrt(markerBudget * aspect)));
  const rows = Math.max(1, Math.floor(markerBudget / columns));
  const buckets = new Map<string, ProjectedRadarPoint<T>[]>();

  for (const point of points) {
    const column = Math.min(columns - 1, Math.max(0, Math.floor(((point.x - minX) / width) * columns)));
    const row = Math.min(rows - 1, Math.max(0, Math.floor(((point.y - minY) / height) * rows)));
    const key = `${row}:${column}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(point);
    buckets.set(key, bucket);
  }

  return [...buckets.entries()].map(([key, bucket]) => {
    if (bucket.length === 1) {
      const point = bucket[0];
      return {
        kind: "point" as const,
        id: point.id,
        x: point.x,
        y: point.y,
        latitude: point.latitude,
        longitude: point.longitude,
        point,
        count: 1 as const,
      };
    }
    const average = (field: "x" | "y" | "latitude" | "longitude") => bucket.reduce((sum, point) => sum + point[field], 0) / bucket.length;
    return {
      kind: "cluster" as const,
      id: `cluster:${key}:${bucket.length}`,
      x: average("x"),
      y: average("y"),
      latitude: average("latitude"),
      longitude: average("longitude"),
      points: bucket,
      count: bucket.length,
    };
  });
}
