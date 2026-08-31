import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const canary = fs.readFileSync(new URL("../lib/local-radar-push-canary.ts", import.meta.url), "utf8");
const route = fs.readFileSync(new URL("../app/api/dashboard/local-radar-push-canary/route.ts", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../custom-worker.mjs", import.meta.url), "utf8");
const wrangler = fs.readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");

test("Local Radar production canary is a real remote push but never stock truth", () => {
  assert.match(canary, /route:\s*"local-radar"/);
  assert.match(canary, /test:\s*true/);
  assert.match(canary, /canary:\s*true/);
  assert.match(canary, /branchCount:\s*0/);
  assert.match(canary, /event_type,event_id,channel,title,body,url,payload_json/);
  assert.doesNotMatch(canary, /fatedrop_local_stock_observations|upsertLocalStock|local_stock_observations/i);
  assert.match(canary, /Temporal Forces ETB and Destined Rivals expected Monday 31 August/);
});

test("Local Radar canary is deterministic and cannot resend every cron tick", () => {
  assert.match(canary, /const CANARY_KEY = "2026-08-29-smyths-monday"/);
  assert.match(canary, /local-radar-canary:\$\{CANARY_KEY\}:\$\{recipient\.endpoint_id\}/);
  assert.match(canary, /existing\?\.state === "sent" && existing\.provider_message_id/);
  assert.match(canary, /alreadySent:\s*true/);
  assert.match(canary, /ON CONFLICT \(dedupe_key\) DO NOTHING/);
});

test("production trigger stays secret-protected and explicitly armed", () => {
  assert.match(route, /FATEDROP_PUSH_CRON_SECRET/);
  assert.match(route, /timingSafeEqual/);
  assert.match(worker, /FATEDROP_LOCAL_RADAR_CANARY_KEY/);
  assert.match(worker, /local-radar-push-canary/);
  assert.match(wrangler, /"FATEDROP_LOCAL_RADAR_CANARY_KEY": "2026-08-29-smyths-monday"/);
});
