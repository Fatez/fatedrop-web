import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("dashboard lifecycle waves use persisted network timestamps and rolling 24h metrics", async () => {
  const page = await source("app/dashboard/page.tsx");
  const dashboard = await source("lib/dashboard.ts");
  assert.ok(page.includes("type TrendPoint = { measuredAt: number; value: number }"));
  assert.ok(page.includes("point.measuredAt - firstTime"));
  assert.ok(page.includes("24H ACTIVITY"));
  assert.ok(page.includes("Exact rolling 24-hour lifecycle activity from persisted network snapshots."));
  assert.ok(dashboard.includes("whisper: network?.metrics.whisper ?? null"));
  assert.ok(dashboard.includes("echo: network?.metrics.echo ?? null"));
  assert.ok(dashboard.includes("manifested: network?.metrics.manifested ?? null"));
  assert.ok(dashboard.includes("vanished: network?.metrics.vanished ?? null"));
});

test("dashboard lifecycle wave never derives counts from personal signal_seen events", async () => {
  const page = await source("app/dashboard/page.tsx");
  assert.equal(page.includes("personal.daily"), false);
  assert.equal(page.includes("signalsSeen"), false);
});
