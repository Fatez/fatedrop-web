export type SignalHealthChartPoint = {
  measuredAt: number;
  value: number;
};

export type SignalHealthChartCoordinate = SignalHealthChartPoint & {
  x: number;
  y: number;
};

export function niceSignalHealthScale(maxValue: number, minimum = 10) {
  const requested = Math.max(minimum, Number.isFinite(maxValue) ? Math.max(0, maxValue) : 0);
  if (requested <= 10) return 10;

  const magnitude = 10 ** Math.floor(Math.log10(requested));
  const normalized = requested / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

export function signalHealthChartCoordinates(
  points: SignalHealthChartPoint[],
  scaleMax: number,
  width = 120,
  height = 46,
  topPadding = 5,
  bottomPadding = 5,
): SignalHealthChartCoordinate[] {
  if (!points.length) return [];

  const safeScaleMax = Math.max(1, scaleMax);
  const baselineY = height - bottomPadding;
  const drawableHeight = Math.max(1, baselineY - topPadding);
  const firstTime = points[0]?.measuredAt ?? 0;
  const lastTime = points[points.length - 1]?.measuredAt ?? firstTime;
  const timeSpread = Math.max(1, lastTime - firstTime);

  return points.map((point) => ({
    ...point,
    x: points.length === 1 ? width / 2 : ((point.measuredAt - firstTime) / timeSpread) * width,
    y: baselineY - (Math.max(0, point.value) / safeScaleMax) * drawableHeight,
  }));
}

export function signalHealthChartPath(
  points: SignalHealthChartPoint[],
  scaleMax: number,
  width = 120,
  height = 46,
) {
  const coordinates = signalHealthChartCoordinates(points, scaleMax, width, height);
  if (!coordinates.length) return "";
  return coordinates.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
}
