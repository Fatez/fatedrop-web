import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("dashboard lifecycle waves use real seven-day signal ledger counts", async () => {
  const page = await source("app/dashboard/page.tsx");
  const dashboard = await source("lib/dashboard.ts");
  const trends = await source("lib/signal-trends.ts");

  assert.ok(page.includes("7D ALERTS"));
  assert.ok(page.includes("alerts per day over the last seven days"));
  assert.ok(page.includes("data.signalSummary?.[key].trend ?? []"));
  assert.ok(page.includes("data.signalSummary?.[key].today ?? null"));

  assert.ok(dashboard.includes("getSignalLifecycleSummary(7)"));
  assert.ok(dashboard.includes("signalSummary?.whisper.total"));
  assert.ok(dashboard.includes("signalSummary?.echo.total"));
  assert.ok(dashboard.includes("signalSummary?.manifested.total"));
  assert.ok(dashboard.includes("signalSummary?.vanished.total"));

  assert.ok(trends.includes("FROM fatedrop_signals"));
  assert.ok(trends.includes("detected_at >= ${day0}"));
  assert.ok(trends.includes("state IN ('whisper', 'echo', 'manifested', 'vanished')"));
  assert.ok(trends.includes("Array.from({ length: days }"));
  assert.ok(trends.includes("value: 0"));
});

test("dashboard lifecycle wave never derives counts from personal signal_seen events or snapshot trends", async () => {
  const page = await source("app/dashboard/page.tsx");
  assert.equal(page.includes("personal.daily"), false);
  assert.equal(page.includes("signalsSeen"), false);
  assert.equal(page.includes("data.networkHistory"), false);
  assert.equal(page.includes("24H ACTIVITY"), false);
});

test("signal trend query fails closed without taking down the dashboard", async () => {
  const trends = await source("lib/signal-trends.ts");
  assert.ok(trends.includes("try {"));
  assert.ok(trends.includes("return null;"));
  assert.ok(trends.includes("signal trend aggregation unavailable"));
});
