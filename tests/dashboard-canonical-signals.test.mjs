import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const recentSource = await readFile(new URL("../lib/canonical-signals.ts", import.meta.url), "utf8");
const dashboardSource = await readFile(new URL("../lib/dashboard.ts", import.meta.url), "utf8");
const trendSource = await readFile(new URL("../lib/signal-trends.ts", import.meta.url), "utf8");
const signalsApi = await readFile(new URL("../app/api/dashboard/signals/route.ts", import.meta.url), "utf8");

test("dashboard recent signals come from the live canonical signal ledger rather than network snapshot JSON", () => {
  assert.match(dashboardSource, /getCanonicalRecentSignals\(100\)/);
  assert.match(dashboardSource, /signalBackedNetwork\(storedNetwork, recentSignals, now\)/);
  assert.match(dashboardSource, /confirmed = recentSignals\.filter/);
  assert.match(signalsApi, /getCanonicalRecentSignals\(100\)/);
  assert.doesNotMatch(signalsApi, /getLatestNetworkMetricSnapshot/);
  assert.match(signalsApi, /source: canonicalSignals !== null \? "FateDrop signal ledger" : null/);
});

test("canonical recent feed does not invent lifecycle or cause and rejects invalid Vanished rows", () => {
  assert.match(recentSource, /s\.state IN \('whisper','echo','manifested','vanished'\)/);
  assert.match(recentSource, /s\.state <> 'vanished'/);
  assert.match(recentSource, /m\.state='manifested'/);
  assert.match(recentSource, /v\.state='vanished'/);
  assert.doesNotMatch(recentSource, /queue|security|catalogue_new|restock|sold_out/);
  assert.doesNotMatch(recentSource, /kind:/);
});

test("seven-day detection and delivery summaries apply the same valid-Vanished predecessor rule", () => {
  const manifestedMatches = trendSource.match(/m\.state='manifested'/g) || [];
  const vanishedMatches = trendSource.match(/v\.state='vanished'/g) || [];
  assert.ok(manifestedMatches.length >= 2, "both lifecycle and delivery queries should validate Vanished against prior Manifested");
  assert.ok(vanishedMatches.length >= 2, "both lifecycle and delivery queries should reject repeated/unanchored Vanished");
});

test("private Cloud signal-health fallback preserves security and sends a server-only bearer token when configured", () => {
  assert.match(trendSource, /process\.env\.FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(trendSource, /headers\.set\("Authorization", `Bearer \$\{apiToken\}`\)/);
  assert.doesNotMatch(trendSource, /NEXT_PUBLIC_FATEDROP_SIGNAL_API_TOKEN/);
});
