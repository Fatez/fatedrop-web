import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

test("dashboard lifecycle cards use one real seven-day signal-ledger source", () => {
  const dashboard = read("lib/dashboard.ts");
  const trends = read("lib/signal-trends.ts");
  const page = read("app/dashboard/page.tsx");

  assert.ok(trends.includes("FROM fatedrop_signals"));
  assert.ok(trends.includes("COUNT(*)::int AS count"));
  assert.ok(trends.includes("state IN ('whisper', 'echo', 'manifested', 'vanished')"));
  assert.ok(trends.includes("safeDays - 1"), "trend must include today plus the preceding UTC days");

  for (const state of ["whisper", "echo", "manifested", "vanished"]) {
    assert.ok(dashboard.includes(`${state}: signalSummary?.${state}.total ?? null`));
    assert.equal(dashboard.includes(`signalSummary?.${state}.total ?? network?.metrics.${state}`), false, `${state} must not mix snapshot and seven-day ledger windows`);
    assert.ok(page.includes(`data.signalSummary?.[key].today`));
  }

  assert.ok(page.includes("data.signalSummary?.[key].trend ?? []"));
  assert.ok(page.includes("alerts per day over the last seven days"));
  assert.ok(dashboard.includes("last seven UTC days"));
});
