import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeSource = await readFile(new URL("../app/api/fate-matches/route.ts", import.meta.url), "utf8");
const clientSource = await readFile(new URL("../lib/hosted-fatefind-client.ts", import.meta.url), "utf8");
const capabilitySource = await readFile(new URL("../lib/fatefind-evaluation-capability.ts", import.meta.url), "utf8");
const migrationsSource = await readFile(new URL("../lib/production-migrations.ts", import.meta.url), "utf8");
const healthSource = await readFile(new URL("../app/api/health/fatefind-instant/route.ts", import.meta.url), "utf8");
const deploySource = await readFile(new URL("../.github/workflows/deploy-production.yml", import.meta.url), "utf8");

test("new FateFind is persisted before the immediate Cloud evaluation is attempted", () => {
  const createIndex = routeSource.indexOf("const saved = await createFateMatch(match)");
  const evaluateIndex = routeSource.indexOf("await evaluateHostedFateFindNow(saved.id)");
  assert.ok(createIndex >= 0, "FateFind must still be saved through canonical Web storage");
  assert.ok(evaluateIndex > createIndex, "instant evaluation must run only after the watch is safely persisted");
});

test("immediate evaluation is fail-soft and uses a one-use capability", () => {
  assert.match(clientSource, /mintFateFindEvaluationCapability\(cleanId\)/);
  assert.match(clientSource, /method: "POST"/);
  assert.match(clientSource, /Authorization: `Bearer \$\{token\}`/);
  assert.match(clientSource, /\/internal\/fatefind\/evaluate/);
  assert.match(clientSource, /AbortSignal\.timeout/);
  assert.match(clientSource, /catch \{\s*return null;\s*\}/s);
  assert.match(routeSource, /status: "deferred"/);
  assert.match(routeSource, /normal hosted monitoring will continue safely/);
});

test("capability is random, hashed at rest, short-lived and scoped to the saved FateFind", () => {
  assert.match(capabilitySource, /randomBytes\(32\)\.toString\("base64url"\)/);
  assert.match(capabilitySource, /createHash\("sha256"\)/);
  assert.match(capabilitySource, /fatedrop_fatefind_evaluation_capabilities/);
  assert.match(capabilitySource, /\$\{sha256\(token\)\}/);
  assert.match(capabilitySource, /\$\{cleanId\}/);
  assert.match(capabilitySource, /Math\.max\(5, Math\.min\(120/);
  assert.doesNotMatch(capabilitySource, /INSERT[\s\S]*\$\{token\}/);
  assert.match(migrationsSource, /2026-08-29-fatefind-evaluation-capabilities\.sql/);
});

test("Web sends only the saved FateFind id and never performs local stock or matching evaluation", () => {
  assert.match(clientSource, /JSON\.stringify\(\{ fateFindId: cleanId \}\)/);
  assert.doesNotMatch(clientSource, /rrp|retailer|stockStatus|pricePence/i);
  assert.doesNotMatch(routeSource, /evaluateFateFind|fatedrop_retail_offers/);
});

test("production has no permanent signal-token dependency and proves the Worker-to-Cloud path", () => {
  assert.doesNotMatch(deploySource, /FATEDROP_SIGNAL_API_TOKEN/);
  assert.doesNotMatch(clientSource, /FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(deploySource, /check_status "\/api\/health\/fatefind-instant" "204"/);
  assert.match(healthSource, /evaluateHostedFateFindNow/);
  assert.match(healthSource, /production-probe-nonexistent/);
  assert.match(healthSource, /outcome\.enabled === true/);
  assert.match(healthSource, /evaluation\?\.created \|\| 0/);
});
