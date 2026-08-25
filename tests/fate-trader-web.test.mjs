import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fateTraderCardLabel, fateTraderCloudPath } from "../lib/fate-trader-web.ts";

test("Fate Trader proxy only maps explicit shared Cloud routes", () => {
  assert.equal(fateTraderCloudPath(["cards"]), "/v1/cards");
  assert.equal(fateTraderCloudPath(["cards", "fdcard_123"]), "/v1/cards/fdcard_123");
  assert.equal(fateTraderCloudPath(["card-sets", "fdset_1", "cards"]), "/v1/card-sets/fdset_1/cards");
  assert.equal(fateTraderCloudPath(["collection", "items"]), "/v1/collection/items");
  assert.equal(fateTraderCloudPath(["wants", "fdcard_123"]), "/v1/wants/fdcard_123");
  assert.equal(fateTraderCloudPath(["binder", "items"]), "/v1/trader/binder/items");
  assert.equal(fateTraderCloudPath(["structured-wants", "fdcard_123"]), "/v1/trader/wants/fdcard_123");
  assert.equal(fateTraderCloudPath(["../../admin"]), null);
  assert.equal(fateTraderCloudPath(["unknown"]), null);
});

test("card labels stay tied to canonical identity fields", () => {
  assert.equal(fateTraderCardLabel({
    id: "fdcard_1",
    fateCardId: "fdcard_1",
    tcgCode: "pokemon",
    seriesId: "series",
    seriesName: "Sword & Shield",
    setId: "set",
    setName: "Darkness Ablaze",
    printingId: "printing",
    name: "Furret",
    collectorNumber: "136",
    rarity: "Uncommon",
    supertype: "Pokémon",
    variantCode: "reverse-holo",
    languageCode: "en",
    verificationStatus: "verified",
    verifiedAt: 1,
  }), "Furret #136 · reverse holo");
});

test("Fate Trader audit client uses the same-site proxy and never embeds Cloud or session credentials", async () => {
  const source = await fs.readFile(new URL("../components/fate-trader-audit.tsx", import.meta.url), "utf8");
  assert.match(source, /\/api\/trader\//);
  assert.doesNotMatch(source, /railway\.app/);
  assert.doesNotMatch(source, /fd_session/);
  assert.doesNotMatch(source, /Authorization/);
  assert.match(source, /No full collection upload/);
  assert.match(source, /I HAVE A CARD/);
  assert.match(source, /I WANT A CARD/);
  assert.match(source, /FIND A TRADE/);
});

test("Trader proxy forwards the HttpOnly session only on the server and protects mutations", async () => {
  const proxy = await fs.readFile(new URL("../app/api/trader/[...path]/route.ts", import.meta.url), "utf8");
  assert.match(proxy, /getCurrentSessionToken/);
  assert.match(proxy, /Authorization/);
  assert.match(proxy, /assertSameOrigin/);
  assert.match(proxy, /fateTraderCloudPath/);
  assert.match(proxy, /NEXT_PUBLIC_FATE_TRADER_ENABLED|fateTraderWebEnabled/);
});

test("dashboard route and nav remain feature gated", async () => {
  const page = await fs.readFile(new URL("../app/dashboard/trader/page.tsx", import.meta.url), "utf8");
  const nav = await fs.readFile(new URL("../components/dashboard-nav.tsx", import.meta.url), "utf8");
  assert.match(page, /fateTraderWebEnabled\(\)/);
  assert.match(page, /notFound\(\)/);
  assert.match(nav, /NEXT_PUBLIC_FATE_TRADER_ENABLED/);
  assert.match(nav, /Fate Trader/);
});
