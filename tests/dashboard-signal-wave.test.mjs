import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("dashboard lifecycle waves separate real detections from real sent alerts", async () => {
  const page = await source("app/dashboard/page.tsx");
  const dashboard = await source("lib/dashboard.ts");
  const trends = await source("lib/signal-trends.ts");
  const live = await source("lib/live-signals.ts");

  assert.ok(page.includes("7D DETECTED"));
  assert.ok(page.includes("ALERTS SENT / UTC DAY"));
  assert.ok(page.includes("alerts actually sent per UTC day over the last seven days"));
  assert.ok(page.includes("data.signalSummary?.[key].trend ?? []"));
  assert.ok(page.includes("data.signalSummary?.[key].today ?? null"));
  assert.ok(page.includes("data.signalDeliverySummary?.[key]"));
  assert.equal(page.includes("7D ALERTS"), false);

  assert.ok(dashboard.includes("getSignalLifecycleSummary(7)"));
  assert.ok(dashboard.includes("getSignalDeliverySummary(7)"));
  assert.ok(dashboard.includes("signalSummary?.whisper.total"));
  assert.ok(dashboard.includes("signalSummary?.echo.total"));
  assert.ok(dashboard.includes("signalSummary?.manifested.total"));
  assert.ok(dashboard.includes("signalSummary?.vanished.total"));

  assert.ok(trends.includes("getLiveCloudSignalSummary"));
  assert.ok(live.includes('"/api/signal-summary"'));
  assert.ok(live.includes('cache: "no-store"'));
  assert.equal(trends.includes("FROM fatedrop_signals"), false);
  assert.equal(trends.includes("fatedrop_signal_delivery_attempts"), false);
});

test("dashboard lifecycle wave never derives counts from personal signal_seen events or snapshot trends", async () => {
  const page = await source("app/dashboard/page.tsx");
  assert.equal(page.includes("personal.daily"), false);
  assert.equal(page.includes("signalsSeen"), false);
  assert.equal(page.includes("data.networkHistory"), false);
  assert.equal(page.includes("24H ACTIVITY"), false);
});

test("live signal and delivery reads fail closed without taking down the dashboard", async () => {
  const trends = await source("lib/signal-trends.ts");
  const live = await source("lib/live-signals.ts");
  assert.ok(trends.includes(".catch(() => null)"));
  assert.ok(trends.includes("?.lifecycle ?? null"));
  assert.ok(trends.includes("?.delivery ?? null"));
  assert.ok(live.includes("if (!response.ok) return null"));
  assert.ok(live.includes("catch {"));
  assert.ok(live.includes("return null;"));
});
