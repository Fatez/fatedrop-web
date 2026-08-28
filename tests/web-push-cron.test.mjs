import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const worker = fs.readFileSync(new URL("../custom-worker.mjs", import.meta.url), "utf8");
const wrangler = fs.readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");

test("Web worker owns the one-minute lifecycle push schedule", () => {
  assert.match(wrangler, /"main": "\.\/custom-worker\.mjs"/);
  assert.match(wrangler, /"crons": \["\* \* \* \* \*"\]/);
  assert.match(worker, /fetch: handler\.fetch/);
  assert.match(worker, /async scheduled/);
});

test("scheduled dispatch reuses the authenticated canonical route without arbitrary notification content", () => {
  assert.match(worker, /FATEDROP_METRICS_INGEST_SECRET/);
  assert.match(worker, /\/api\/dashboard\/push-dispatch/);
  assert.match(worker, /method: "POST"/);
  assert.match(worker, /handler\.fetch\(request, env, ctx\)/);
  assert.doesNotMatch(worker, /request\.json/);
  assert.doesNotMatch(worker, /title:/);
  assert.doesNotMatch(worker, /body:/);
});
