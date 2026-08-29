import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeSource = await readFile(new URL("../app/api/fate-matches/route.ts", import.meta.url), "utf8");
const clientSource = await readFile(new URL("../lib/hosted-fatefind-client.ts", import.meta.url), "utf8");
const deploySource = await readFile(new URL("../.github/workflows/deploy-production.yml", import.meta.url), "utf8");

test("new FateFind is persisted before the immediate Cloud evaluation is attempted", () => {
  const createIndex = routeSource.indexOf("const saved = await createFateMatch(match)");
  const evaluateIndex = routeSource.indexOf("await evaluateHostedFateFindNow(saved.id)");
  assert.ok(createIndex >= 0, "FateFind must still be saved through canonical Web storage");
  assert.ok(evaluateIndex > createIndex, "instant evaluation must run only after the watch is safely persisted");
});

test("immediate evaluation is fail-soft and preserves scheduled monitoring fallback", () => {
  assert.match(clientSource, /FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(clientSource, /method: "POST"/);
  assert.match(clientSource, /Authorization: `Bearer \$\{token\}`/);
  assert.match(clientSource, /\/internal\/fatefind\/evaluate/);
  assert.match(clientSource, /AbortSignal\.timeout/);
  assert.match(clientSource, /catch \{\s*return null;\s*\}/s);
  assert.match(routeSource, /status: "deferred"/);
  assert.match(routeSource, /normal hosted monitoring will continue safely/);
});

test("Web sends only the saved FateFind id and never performs local stock or matching evaluation", () => {
  assert.match(clientSource, /JSON\.stringify\(\{ fateFindId: cleanId \}\)/);
  assert.doesNotMatch(clientSource, /rrp|retailer|stockStatus|pricePence/i);
  assert.doesNotMatch(routeSource, /evaluateFateFind|fatedrop_retail_offers/);
});

test("production deploy fails closed without the shared signal token and proves the private Cloud contract", () => {
  assert.match(deploySource, /FATEDROP_SIGNAL_API_TOKEN: \$\{\{ secrets\.FATEDROP_SIGNAL_API_TOKEN \}\}/);
  assert.match(deploySource, /Missing FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(deploySource, /wrangler secret put FATEDROP_SIGNAL_API_TOKEN/);
  assert.match(deploySource, /\/internal\/fatefind\/evaluate/);
  assert.match(deploySource, /production-probe-nonexistent/);
  assert.match(deploySource, /Instant FateFind production contract is unavailable/);
});
