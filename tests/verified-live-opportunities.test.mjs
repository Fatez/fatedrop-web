import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dashboard = await readFile(new URL("../lib/dashboard.ts", import.meta.url), "utf8");
const page = await readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8");

test("dashboard cycles only Cloud-verified open opportunities and respects account TCG selection", () => {
  assert.match(dashboard, /listCanonicalAlerts\(\{ state: "manifested", currentOnly: true, limit: 24 \}\)/);
  assert.match(dashboard, /normalizeSelectedTcgCodes\(snapshot\.account\.selectedTcgCodes\)/);
  assert.match(dashboard, /selectedTcgs\.has\(alert\.tcgCode\)/);
  assert.match(page, /data\.verifiedLive\.slice\(0, 4\)/);
  assert.match(page, /Open Manifested offer episodes/);
  assert.doesNotMatch(page, /recentManifested\.slice\(0, 4\)/);
});

test("Verified Live Now cannot manufacture notifications or repeat Manifested alarms", () => {
  assert.match(dashboard, /Cycling this view never creates or repeats an alert/);
  assert.doesNotMatch(dashboard, /sendPush|deliverSignals|enqueue/);
  assert.match(page, /No stock is freshly verified live right now/);
});
