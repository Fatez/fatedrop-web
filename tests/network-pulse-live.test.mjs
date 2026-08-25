import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = await readFile(new URL("../components/dashboard-network-pulse.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../app/api/dashboard/network-pulse/route.ts", import.meta.url), "utf8");

test("Network Pulse refreshes canonical network figures while the dashboard is open", () => {
  assert.match(component, /^"use client"/);
  assert.match(component, /fetch\("\/api\/dashboard\/network-pulse"/);
  assert.match(component, /30_000/);
  assert.match(component, /cache: "no-store"/);
  assert.match(component, /LIVE NETWORK/);
  assert.match(component, /network-pulse-uk\.webp/);
  assert.doesNotMatch(component, /const nodes =/);
  assert.doesNotMatch(component, /Math\.random/);
});

test("Network Pulse API uses persisted canonical network and lifecycle data", () => {
  assert.match(route, /getSnapshotForRequest/);
  assert.match(route, /getLatestNetworkMetricSnapshot/);
  assert.match(route, /getSignalLifecycleSummary\(7\)/);
  assert.match(route, /catalogueRetailers/);
  assert.match(route, /productsTracked/);
  assert.match(route, /healthyMonitors/);
  assert.match(route, /signals7d/);
  assert.match(route, /private, no-store/);
  assert.doesNotMatch(route, /Math\.random/);
});
