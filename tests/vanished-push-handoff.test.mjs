import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const alerts = fs.readFileSync(new URL("../lib/canonical-alerts.ts", import.meta.url), "utf8");
const push = fs.readFileSync(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");

test("Vanished remains a canonical mobile alert stage", () => {
  assert.match(alerts, /const canonicalStages = new Set<CanonicalSignalStage>\(\["WHISPER", "ECHO", "MANIFESTED", "VANISHED"\]\)/);
  assert.match(alerts, /if \(state === "vanished"\) return "VANISHED"/);
});

test("Vanished is enabled by the canonical push preference fallback", () => {
  assert.match(push, /alert\.fateStage === "VANISHED"/);
  assert.match(push, /alert\.fateStage === "VANISHED" \? recipient\.vanished_enabled/);
  assert.match(push, /COALESCE\(np\.vanished_enabled,\s*true\)/);
});

test("Vanished uses the same canonical outbox and Expo sender as every lifecycle stage", () => {
  assert.match(push, /event_type: alert\.fateStage\.toLowerCase\(\)/);
  assert.match(push, /title: alert\.notification\.title/);
  assert.match(push, /body: alert\.notification\.body/);
  assert.match(push, /\.\.\.alert\.notification\.data/);
  assert.match(push, /state IN \('pending','failed'\)/);
  assert.doesNotMatch(push, /event_type\s*=\s*'manifested'/);
  assert.match(push, /sound: "default"/);
  assert.match(push, /title: row\.title/);
  assert.match(push, /body: row\.body/);
});
