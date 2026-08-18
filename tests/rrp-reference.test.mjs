import test from "node:test";
import assert from "node:assert/strict";
import * as ingestNamespace from "../lib/network-ingest.ts";

const ingestModule = ingestNamespace.default ?? ingestNamespace;
const { parseRrpReferenceProduct } = ingestModule;

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
