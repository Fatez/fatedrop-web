import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeSource = await readFile(new URL("../app/api/dashboard/signal-health/route.ts", import.meta.url), "utf8");
const envSource = await readFile(new URL("../.env.example", import.meta.url), "utf8");

test("operator signal health proxy is fail-closed and server-authenticated", () => {
  assert.match(routeSource, /timingSafeEqual/);
  assert.match(routeSource, /FATEDROP_PUSH_CRON_SECRET/);
  assert.match(routeSource, /FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(routeSource, /Authorization: `Bearer \$\{signalToken\}`/);
  assert.match(routeSource, /\/api\/signal-health/);
  assert.match(routeSource, /status: 401/);
  assert.match(routeSource, /status: 503/);
  assert.match(routeSource, /status: 502/);
  assert.match(routeSource, /cache: "no-store"/);
  assert.match(routeSource, /"cache-control": "no-store"/);
  assert.doesNotMatch(routeSource, /NEXT_PUBLIC_FATEDROP_SIGNAL_API_TOKEN/);
});

test("signal diagnostic token remains explicitly server-only", () => {
  assert.match(envSource, /Server-only bearer token for private Signal Engine diagnostics/);
  assert.match(envSource, /Never expose it as NEXT_PUBLIC_\*/);
  assert.match(envSource, /FATEDROP_SIGNAL_API_TOKEN/);
});
