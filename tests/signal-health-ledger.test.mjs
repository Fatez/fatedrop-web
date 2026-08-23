import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

test("dashboard separates real seven-day detections from real alert delivery", () => {
  const dashboard = read("lib/dashboard.ts");
  const trends = read("lib/signal-trends.ts");
  const page = read("app/dashboard/page.tsx");

  assert.ok(trends.includes("FROM fatedrop_signals"));
  assert.ok(trends.includes("COUNT(*)::int AS count"));
  assert.ok(trends.includes("state IN ('whisper', 'echo', 'manifested', 'vanished')"));
  assert.ok(trends.includes("safeDays - 1"), "trend must include today plus the preceding UTC days");

  assert.ok(trends.includes("fatedrop_signal_delivery_attempts"));
  assert.ok(trends.includes("INNER JOIN fatedrop_signals"));
  assert.ok(trends.includes('result === "sent"'));
  assert.ok(trends.includes('result === "skipped" && detail === "disabled"'));
  assert.ok(trends.includes("point.policySkipped"));
  assert.ok(trends.includes("point.issues"));

  assert.ok(dashboard.includes("getSignalDeliverySummary(7)"));
  assert.ok(dashboard.includes("signalDeliverySummary"));
  for (const state of ["whisper", "echo", "manifested", "vanished"]) {
    assert.ok(dashboard.includes(`${state}: signalSummary?.${state}.total ?? null`));
    assert.equal(dashboard.includes(`signalSummary?.${state}.total ?? network?.metrics.${state}`), false, `${state} must not mix snapshot and seven-day ledger windows`);
  }

  assert.ok(page.includes("7D DETECTED"));
  assert.ok(page.includes("ALERTS SENT / UTC DAY"));
  assert.ok(page.includes("POLICY SUPPRESSED"));
  assert.ok(page.includes("ISSUES"));
  assert.ok(page.includes("alerts actually sent per UTC day"));
  assert.ok(page.includes("point.value / max"), "line chart should use a zero baseline rather than min-max exaggeration");
  assert.ok(page.includes("data.signalSummary?.[key].today"));
  assert.ok(page.includes("data.signalDeliverySummary?.[key]"));
  assert.equal(page.includes("7D ALERTS"), false, "detections must not be mislabeled as delivered alerts");
  assert.ok(dashboard.includes("last seven UTC days"));
});
