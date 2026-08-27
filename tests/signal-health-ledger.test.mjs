import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

test("dashboard separates real seven-day detections from real alert delivery through Cloud", () => {
  const dashboard = read("lib/dashboard.ts");
  const trends = read("lib/signal-trends.ts");
  const live = read("lib/live-signals.ts");
  const chart = read("lib/signal-health-chart.ts");
  const page = read("app/dashboard/page.tsx");

  assert.ok(trends.includes("getLiveCloudSignalSummary"));
  assert.ok(live.includes('"/api/signal-summary"'));
  assert.ok(live.includes('cache: "no-store"'));
  assert.equal(trends.includes("FROM fatedrop_signals"), false);
  assert.equal(trends.includes("fatedrop_signal_delivery_attempts"), false);
  assert.equal(live.includes("DATABASE_URL"), false);

  assert.ok(trends.includes("const sent = finite(rawDelivery.sent)"));
  assert.ok(trends.includes("const policySkipped = finite(rawDelivery.policySkipped)"));
  assert.ok(trends.includes("const issues = finite(rawDelivery.issues)"));
  assert.ok(trends.includes("policySkipped: policySkipped!"));
  assert.ok(trends.includes("issues: issues!"));

  assert.ok(dashboard.includes("getSignalDeliverySummary(7)"));
  assert.ok(dashboard.includes("signalDeliverySummary"));
  for (const state of ["whisper", "echo", "manifested", "vanished"]) {
    assert.ok(dashboard.includes(`${state}: signalSummary?.${state}.total ?? null`));
    assert.equal(dashboard.includes(`signalSummary?.${state}.total ?? network?.metrics.${state}`), false, `${state} must not mix snapshot and seven-day live Cloud windows`);
  }

  assert.ok(page.includes("7D DETECTED"));
  assert.ok(page.includes("ALERTS SENT / UTC DAY"));
  assert.ok(page.includes("POLICY SUPPRESSED"));
  assert.ok(page.includes("DELIVERY ISSUES"));
  assert.ok(page.includes("alerts actually sent per UTC day"));
  assert.ok(page.includes("className=\"fd-zero-baseline\""), "line chart should render a real zero baseline");
  assert.ok(page.includes("Object.values(alertSeries).flat()"), "lifecycle alert charts should share one scale rather than exaggerating each card independently");
  assert.ok(page.includes("niceSignalHealthScale"), "shared chart scale should keep tiny alert counts close to zero");
  assert.ok(chart.includes("baselineY - (Math.max(0, point.value) / safeScaleMax) * drawableHeight"), "sent-alert height must be measured from zero against the shared scale");
  assert.ok(page.includes("data.signalSummary?.[key].today"));
  assert.ok(page.includes("data.signalDeliverySummary?.[key]"));
  assert.equal(page.includes("7D ALERTS"), false, "detections must not be mislabeled as delivered alerts");
  assert.ok(dashboard.includes("last seven UTC days"));
});
