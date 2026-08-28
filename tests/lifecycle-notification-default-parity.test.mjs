import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const preferences = fs.readFileSync("lib/notification-preferences.ts", "utf8");
const push = fs.readFileSync("lib/canonical-push.ts", "utf8");
const repair = fs.readFileSync("database/2026-08-28-unify-lifecycle-notification-defaults.sql", "utf8");

const stages = ["whisper", "echo", "manifested", "vanished"];

test("all four lifecycle stages are enabled by the same application default", () => {
  for (const stage of stages) {
    assert.match(preferences, new RegExp(`${stage}: true`));
  }
  assert.match(preferences, /function lifecyclePreference\(value: unknown\)/);
  for (const stage of stages) {
    assert.match(preferences, new RegExp(`${stage}: lifecyclePreference\\(row\\.${stage}_enabled\\)`));
  }
});

test("canonical push eligibility treats all four lifecycle stages identically", () => {
  assert.match(push, /COALESCE\(np\.whisper_enabled,true\) AS whisper_enabled/);
  assert.match(push, /COALESCE\(np\.echo_enabled,true\) AS echo_enabled/);
  assert.match(push, /COALESCE\(np\.manifested_enabled,true\) AS manifested_enabled/);
  assert.match(push, /COALESCE\(np\.vanished_enabled,true\) AS vanished_enabled/);
  for (const stage of ["WHISPER", "ECHO", "MANIFESTED", "VANISHED"]) {
    assert.match(push, new RegExp(`alert\\.fateStage === "${stage}"`));
  }
});

test("database repair removes the historical Vanished default asymmetry", () => {
  assert.match(repair, /ALTER COLUMN vanished_enabled SET DEFAULT true/);
  assert.match(repair, /SET vanished_enabled = true/);
  assert.match(repair, /COALESCE\(whisper_enabled, true\) = true/);
  assert.match(repair, /echo_enabled = true/);
  assert.match(repair, /manifested_enabled = true/);
});
