import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

async function read(relative) {
  return fs.readFile(new URL(relative, import.meta.url), "utf8");
}

test("Fate Trader proxy helper only maps explicit shared Cloud route families", async () => {
  const source = await read("../lib/fate-trader-web.ts");
  assert.match(source, /safeSingle/);
  assert.match(source, /return `\/v1\/\$\{joined\}`/);
  assert.match(source, /\/v1\/trader\/\$\{joined\}/);
  assert.match(source, /\/v1\/trader\/wants/);
  assert.match(source, /if \(!Array\.isArray\(parts\) \|\| parts\.length === 0/);
  assert.match(source, /parts\.some\(\(part\) => !safeSingle\.test\(part\)\)/);
  assert.match(source, /return null;/);
  assert.doesNotMatch(source, /\/v1\/\$\{parts\.join\("\/"\)\}/);
});

test("card presentation remains tied to canonical identity fields", async () => {
  const source = await read("../lib/fate-trader-web.ts");
  assert.match(source, /card\.name/);
  assert.match(source, /card\.collectorNumber/);
  assert.match(source, /card\.variantCode/);
  assert.match(source, /fateCardId/);
  assert.match(source, /verificationStatus/);
});

test("Fate Trader audit client uses the same-site proxy and never embeds Cloud or session credentials", async () => {
  const source = await read("../components/fate-trader-audit.tsx");
  assert.match(source, /\/api\/trader\//);
  assert.doesNotMatch(source, /railway\.app/);
  assert.doesNotMatch(source, /fd_session/);
  assert.doesNotMatch(source, /Authorization/);
  assert.match(source, /No full collection upload/);
  assert.match(source, /I HAVE A CARD/);
  assert.match(source, /I WANT A CARD/);
  assert.match(source, /FIND A TRADE/);
  assert.match(source, /It is not a public listing yet/);
});

test("Trader proxy forwards browser cookies or native Bearer sessions and protects mutations", async () => {
  const proxy = await read("../app/api/trader/[...path]/route.ts");
  assert.match(proxy, /getCurrentSessionToken/);
  assert.match(proxy, /bearerTokenFromRequest/);
  assert.match(proxy, /bearerTokenFromRequest\(request\) \|\| await getCurrentSessionToken\(\)/);
  assert.match(proxy, /Authorization/);
  assert.match(proxy, /assertSameOrigin/);
  assert.match(proxy, /fateTraderCloudPath/);
  assert.doesNotMatch(proxy, /fateTraderWebEnabled/);
  assert.doesNotMatch(proxy, /Fate Trader is not enabled/);
  assert.match(proxy, /TRADER_UPSTREAM_UNAVAILABLE/);
});

test("Have flow stages ownership evidence then Binder intent with cleanup on partial failure", async () => {
  const source = await read("../components/fate-trader-audit.tsx");
  const createOwnership = source.indexOf('traderRequest<{ item: { id: string; revision: number } }>("collection/items"');
  const createBinder = source.indexOf('traderRequest<{ item: { id: string } }>("binder/items"');
  const cleanup = source.indexOf('traderRequest(`collection/items/${encodeURIComponent(collectionItem.id)}?expectedRevision=');
  assert.ok(createOwnership >= 0);
  assert.ok(createBinder > createOwnership);
  assert.ok(cleanup > createBinder);
  assert.match(source, /visibility: "private"/);
});

test("Want flow persists exact identity before structured trade constraints", async () => {
  const source = await read("../components/fate-trader-audit.tsx");
  const exactWant = source.indexOf('traderRequest<{ want: unknown }>(`wants/${encodeURIComponent(selected.fateCardId)}`');
  const structured = source.indexOf('traderRequest<{ constraints: unknown }>(`structured-wants/${encodeURIComponent(selected.fateCardId)}`');
  assert.ok(exactWant >= 0);
  assert.ok(structured > exactWant);
  assert.match(source, /minimumConditionCode/);
  assert.match(source, /acceptedGradingCompanies/);
});

test("dashboard route and navigation keep canonical Fate Trader discoverable without a public build flag", async () => {
  const page = await read("../app/dashboard/trader/page.tsx");
  const nav = await read("../components/dashboard-nav.tsx");
  const proxy = await read("../app/api/trader/[...path]/route.ts");
  const env = await read("../.env.example");
  assert.match(page, /FateTraderAudit/);
  assert.doesNotMatch(page, /notFound\(\)/);
  assert.doesNotMatch(page, /fateTraderWebEnabled/);
  assert.match(nav, /Fate Trader/);
  assert.match(nav, /"\/dashboard\/trader"/);
  assert.doesNotMatch(nav, /NEXT_PUBLIC_FATE_TRADER_ENABLED/);
  assert.doesNotMatch(proxy, /NEXT_PUBLIC_FATE_TRADER_ENABLED|fateTraderWebEnabled/);
  assert.doesNotMatch(env, /NEXT_PUBLIC_FATE_TRADER_ENABLED/);
});
