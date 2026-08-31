import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dashboardPage = readFileSync(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8");
const dashboardData = readFileSync(new URL("../lib/dashboard.ts", import.meta.url), "utf8");

test("dashboard keeps all four canonical lifecycle counters distinct", () => {
  for (const row of [
    '["whisper", "Whisper", "Early movement detected."]',
    '["echo", "Echo", "Access or traffic is building."]',
    '["manifested", "Manifested", "Confirmed live. Get in."]',
    '["vanished", "Vanished", "Confirmed availability is gone."]',
  ]) assert.ok(dashboardPage.includes(row));
  assert.match(dashboardPage, /metric\(data\.publicSignalMetrics\[key\]\)/);
  assert.match(dashboardData, /whisper: signalSummary\?\.whisper\.total \?\? null/);
  assert.match(dashboardData, /echo: signalSummary\?\.echo\.total \?\? null/);
  assert.match(dashboardData, /manifested: signalSummary\?\.manifested\.total \?\? null/);
  assert.match(dashboardData, /vanished: signalSummary\?\.vanished\.total \?\? null/);
  assert.doesNotMatch(dashboardData, /signalSummary\?\.whisper\.total \?\? network\?\.metrics\.whisper/);
  assert.doesNotMatch(dashboardData, /signalSummary\?\.echo\.total \?\? network\?\.metrics\.echo/);
  assert.doesNotMatch(dashboardData, /signalSummary\?\.manifested\.total \?\? network\?\.metrics\.manifested/);
  assert.doesNotMatch(dashboardData, /signalSummary\?\.vanished\.total \?\? network\?\.metrics\.vanished/);
  assert.doesNotMatch(dashboardData, /echo: signalSummary\?\.whisper\.total/);
  assert.doesNotMatch(dashboardData, /manifested: signalSummary\?\.echo\.total/);
  assert.doesNotMatch(dashboardData, /\(network\.metrics\.manifested \?\? 0\) \+ \(network\.metrics\.echo \?\? 0\)/);
});

test("dashboard exposes the final four-stage lifecycle terminology", () => {
  assert.match(dashboardPage, /Signals Overview/);
  assert.match(dashboardPage, /Whisper/);
  assert.match(dashboardPage, /Echo/);
  assert.match(dashboardPage, /Manifested/);
  assert.match(dashboardPage, /Vanished/);
  assert.match(dashboardPage, /Verified Live Now/);
  assert.match(dashboardPage, /freshly reconfirmed by healthy monitors/);
  assert.match(dashboardData, /if \(kind === "whisper"\) return "Whisper"/);
  assert.match(dashboardData, /kind === "echo" \|\| kind === "queue" \|\| kind === "security"/);
  assert.match(dashboardData, /if \(kind === "manifested"\) return "Manifested"/);
  assert.match(dashboardData, /if \(kind === "vanished"\) return "Vanished"/);
});
