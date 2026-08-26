import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("mobile signal health gateway reuses the canonical signal trend", async () => {
  const source = await readFile(new URL("app/api/mobile/signal-health/route.ts", root), "utf8");

  assert.ok(source.includes("getCanonicalSignalTrend"));
  assert.ok(source.includes("canonical-alert-trends"));
  assert.equal(source.includes("getSignalLifecycleSummary"), false, "mobile pulse must not use the legacy lifecycle helper");
  assert.equal(source.includes("fatedrop_signals"), false, "gateway must not reimplement lifecycle SQL");
  assert.ok(source.includes("available: true"));
  assert.ok(source.includes("available: false"));
  assert.ok(source.includes("Math.max(2, Math.min(30"));
  assert.ok(source.includes("stage.points.at(-1)?.count ?? 0"));
  assert.ok(source.includes("stage.total"));
});
