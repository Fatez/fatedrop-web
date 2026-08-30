import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routePath = new URL("../app/api/health/signal/route.ts", import.meta.url);
const envExamplePath = new URL("../.env.example", import.meta.url);

test("production signal health proxy uses the canonical private endpoint", async () => {
  const source = await readFile(routePath, "utf8");

  assert.match(source, /new URL\("\/api\/signal-health"/);
  assert.match(source, /Authorization: `Bearer \$\{token\}`/);
  assert.match(source, /response\.status === 401 \|\| response\.status === 403/);
  assert.doesNotMatch(source, /new URL\("\/api\/signal-summary"/);
});

test("signal health auth survives shared metrics secret rotation", async () => {
  const source = await readFile(routePath, "utf8");
  const envExample = await readFile(envExamplePath, "utf8");

  assert.match(source, /FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(source, /FATEDROP_METRICS_INGEST_SECRET/);
  assert.match(source, /fatedrop:private-diagnostics:v1/);
  assert.match(source, /createHmac\("sha256", shared\)/);
  assert.match(source, /missing_web_token/);
  assert.match(source, /upstream_unauthorized/);
  assert.match(envExample, /derived private diagnostic bearer token/);
});
