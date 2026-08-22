import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dashboardPage = readFileSync(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8");
const dashboardData = readFileSync(new URL("../lib/dashboard.ts", import.meta.url), "utf8");

test("dashboard keeps all four canonical lifecycle counters distinct", () => {
  assert.match(dashboardPage, /metric\(data\.publicSignalMetrics\.whisper\)/);
  assert.match(dashboardPage, /metric\(data\.publicSignalMetrics\.echo\)/);
  assert.match(dashboardPage, /metric\(data\.publicSignalMetrics\.manifested\)/);
  assert.match(dashboardData, /whisper: network\?\.metrics\.whisper/);
  assert.match(dashboardData, /echo: network\?\.metrics\.echo/);
  assert.match(dashboardData, /manifested: network\?\.metrics\.manifested/);
  assert.doesNotMatch(dashboardData, /echo: network\?\.metrics\.whisper/);
  assert.doesNotMatch(dashboardData, /\(network\.metrics\.manifested \?\? 0\) \+ \(network\.metrics\.echo \?\? 0\)/);
});

test("dashboard exposes the final four-stage lifecycle terminology", () => {
  assert.match(dashboardPage, /Whisper, Echo, Manifested and Vanished with one consistent meaning/);
  assert.match(dashboardPage, /Whisper and Echo activity will surface here/);
  assert.match(dashboardData, /if \(kind === "whisper"\) return "Whisper"/);
  assert.match(dashboardData, /kind === "echo" \|\| kind === "queue" \|\| kind === "security"/);
  assert.match(dashboardData, /if \(kind === "manifested"\) return "Manifested"/);
  assert.match(dashboardData, /if \(kind === "vanished"\) return "Vanished"/);
});
