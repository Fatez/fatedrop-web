import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workflow = fs.readFileSync(".github/workflows/deploy-production.yml", "utf8");

test("production migration failure preserves sanitized endpoint evidence", () => {
  const migrationStep = workflow.slice(workflow.indexOf("- name: Apply and verify production database migrations"), workflow.indexOf("- name: Exercise canonical production push dispatcher"));
  assert.match(migrationStep, /--output \/tmp\/production-migrations\.json/);
  assert.match(migrationStep, /--write-out '%\{http_code\}'/);
  assert.match(migrationStep, /Production migration endpoint returned HTTP/);
  assert.match(migrationStep, /Production migration error:/);
  assert.match(migrationStep, /String\(result\.error \|\| "unknown"\)\.slice\(0,300\)/);
  assert.doesNotMatch(migrationStep, /curl --fail/);
  assert.match(migrationStep, /exit 22/);
});
