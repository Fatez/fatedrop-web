import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dashboard = await readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8");
const shell = await readFile(new URL("../components/dashboard-page-shell.tsx", import.meta.url), "utf8");
const pulse = await readFile(new URL("../components/dashboard-network-pulse.tsx", import.meta.url), "utf8");

test("dashboard operational typography keeps a human-readable hierarchy", () => {
  assert.match(dashboard, /fd-ref-card-head h1\{font-size:19px\}/);
  assert.match(dashboard, /fd-lifecycle-card small\{font-size:12px/);
  assert.match(dashboard, /fd-lifecycle-days small[^}]*font-size:9px/);
  assert.match(dashboard, /fd-delivery-health b[^}]*font-size:12px/);
  assert.match(dashboard, /fd-ref-empty span\{font-size:10\.5px/);
  assert.match(dashboard, /fd-signal-row>div strong[^}]*font-size:12px/);
});

test("dashboard shell and Network Pulse remain readable at desktop scale", () => {
  assert.match(shell, /fd-ref-search input[^}]*font-size:14px/);
  assert.match(shell, /fd-ref-settings[^}]*font-size:12px/);
  assert.match(shell, /fd-ref-profile strong\{font-size:13px\}/);
  assert.match(pulse, /fd-pulse-metrics small[^}]*font-size:11px/);
  assert.match(pulse, /fd-pulse-explain span[^}]*font-size:10px/);
  assert.match(shell, /fd-dashboard-content-frame p\{font-size:max\(13px,1em\)!important/);
  assert.match(shell, /fd-dashboard-content-frame small\{font-size:max\(10\.5px,1em\)!important/);
});
