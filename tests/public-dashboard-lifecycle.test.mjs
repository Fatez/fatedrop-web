import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dashboardPage = readFileSync(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8");

test("dashboard uses normalized public lifecycle counters", () => {
  assert.match(dashboardPage, /metric\(data\.publicSignalMetrics\.manifested\)/);
  assert.match(dashboardPage, /metric\(data\.publicSignalMetrics\.echo\)/);
  assert.doesNotMatch(dashboardPage, /metric\(network\?\.metrics\.echo\).*ECHO/);
});

test("dashboard exposes only public lifecycle terminology", () => {
  assert.match(dashboardPage, /Echo, Manifested and Vanished lifecycle intelligence/);
  assert.match(dashboardPage, /No Echo activity yet\./);
  assert.doesNotMatch(dashboardPage, /Whisper, Manifested/);
  assert.doesNotMatch(dashboardPage, /No Whisper \/ Echo activity yet/);
});
