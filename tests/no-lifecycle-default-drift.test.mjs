import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const initialMigration = fs.readFileSync("database/2026-08-19-user-preferences.sql", "utf8");
const repairMigration = fs.readFileSync("database/2026-08-28-unify-lifecycle-notification-defaults.sql", "utf8");

test("historical Vanished default asymmetry is explicitly repaired", () => {
  assert.match(initialMigration, /vanished_enabled boolean NOT NULL DEFAULT false/);
  assert.match(repairMigration, /ALTER COLUMN vanished_enabled SET DEFAULT true/);
  assert.match(repairMigration, /SET vanished_enabled = true/);
});
