import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workflow = fs.readFileSync(".github/workflows/deploy-production.yml", "utf8");

test("production smoke checks the explicit Turnstile container contract", () => {
  assert.match(workflow, /data-turnstile-widget/);
  assert.doesNotMatch(workflow, /grep -Fq 'cf-turnstile'/);
  assert.match(workflow, /Registration page is missing the explicit Turnstile widget/);
  assert.match(workflow, /Registration Turnstile server gate expected HTTP 403/);
});
