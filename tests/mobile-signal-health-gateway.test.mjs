import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("mobile signal health gateway reuses canonical lifecycle aggregation", async () => {
  const source = await readFile(new URL("app/api/mobile/signal-health/route.ts", root), "utf8");

  assert.ok(source.includes("getSignalLifecycleSummary"));
  assert.equal(source.includes("getSignalDeliverySummary"), false, "Home pulse must not fail because unrelated delivery telemetry is unavailable");
  assert.ok(source.includes("available: true"));
  assert.ok(source.includes("available: false"));
  assert.ok(source.includes("Math.max(2, Math.min(30"));
  assert.equal(source.includes("fatedrop_signals"), false, "gateway must reuse the canonical aggregator rather than reimplement lifecycle SQL");
  assert.equal(source.includes("whisper:"), false, "gateway must not hard-code lifecycle counts");
  assert.equal(source.includes("echo:"), false, "gateway must not hard-code lifecycle counts");
  assert.equal(source.includes("manifested:"), false, "gateway must not hard-code lifecycle counts");
  assert.equal(source.includes("vanished:"), false, "gateway must not hard-code lifecycle counts");
});
