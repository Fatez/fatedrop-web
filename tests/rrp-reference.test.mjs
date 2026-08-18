import test from "node:test";
import assert from "node:assert/strict";
import * as ingestNamespace from "../lib/network-ingest.ts";
import * as truePriceNamespace from "../lib/true-price.ts";
import * as identityNamespace from "../lib/product-identity.ts";

const ingestModule = ingestNamespace.default ?? ingestNamespace;
const truePriceModule = truePriceNamespace.default ?? truePriceNamespace;
const identityModule = identityNamespace.default ?? identityNamespace;
const { parseRrpReferenceProduct } = ingestModule;
const { buildTruePriceOffer } = truePriceModule;
const { identifyProduct } = identityModule;

test("official RRP reference preserves canonical product identity", () => {
  const parsed = parseRrpReferenceProduct({
    id: "prd_abc123",
    canonicalKey: "pokemon:destined-rivals:elite-trainer-box:standard",
    title: "Destined Rivals Elite Trainer Box",
    productType: "elite-trainer-box",
    tcg: "pokemon",
    officialRrpPence: 4999,
    rrpSource: "pokemon-center-uk",
    rrpObservedAt: 1_800_000_000,
  });
  assert.equal(parsed?.id, "prd_abc123");
  assert.equal(parsed?.officialRrpPence, 4999);
  assert.equal(parsed?.rrpSource, "pokemon-center-uk");
  assert.equal(parsed?.tcg, "pokemon");
});

test("RRP reference rejects unverified prices", () => {
  assert.equal(parseRrpReferenceProduct({ id: "prd_x", canonicalKey: "x", title: "X", officialRrpPence: 4999 }), null);
  assert.equal(parseRrpReferenceProduct({ id: "prd_x", canonicalKey: "x", title: "X", officialRrpPence: null, rrpSource: "pokemon-center-uk" }), null);
});

test("shared True Price offer builder consumes Fate Network RRP lookup", () => {
  const product = {
    id: "offer_1",
    retailerId: "cob-and-pip",
    retailerName: "Cob & Pip",
    title: "Destined Rivals Elite Trainer Box",
    handle: "destined-rivals-etb",
    url: "https://example.test/destined-rivals-etb",
    pricePence: 5999,
    available: true,
  };
  const identity = identifyProduct(product.title);
  const offer = buildTruePriceOffer(product, {
    [identity.key]: { rrpPence: 4999, source: "pokemon-center-uk" },
  });
  assert.equal(offer.rrpPence, 4999);
  assert.equal(offer.rrpSource, "pokemon-center-uk");
  assert.equal(offer.itemMarkupPence, 1000);
  assert.ok(Math.abs(offer.itemMarkupPercent - 20.004000800160032) < 0.0001);
});
