import test from "node:test";
import assert from "node:assert/strict";
import { confidenceLabel, humanStockStatus, presentationFromEvidence, referenceLabel } from "../lib/canonical-alert-presentation.ts";

test("source-market reference presentation preserves native authority without calling it UK RRP", () => {
  const presentation = presentationFromEvidence([
    { kind: "rrp_value_kind", value: "source_market_msrp" },
    { kind: "rrp_source_market", value: "JP" },
    { kind: "rrp_source_currency", value: "JPY" },
    { kind: "rrp_source_msrp", value: "550" },
    { kind: "rrp_reference_basis", value: "Official Japan MSRP ¥550 per booster pack; converted to GBP using a dated FateDrop FX snapshot." },
  ]);
  assert.equal(referenceLabel(presentation), "Official JP MSRP");
  assert.equal(presentation.sourceCurrency, "JPY");
  assert.equal(presentation.sourceMsrp, "550");
  assert.doesNotMatch(referenceLabel(presentation), /UK RRP/);
});

test("canonical presentation humanises stock and confidence", () => {
  assert.equal(humanStockStatus("in_stock"), "In stock");
  assert.equal(humanStockStatus("out_of_stock"), "Out of stock");
  assert.equal(confidenceLabel(0.98), "High · 98%");
  assert.equal(confidenceLabel(0.7), "Moderate · 70%");
});

test("derived UK references stay explicitly labelled as references", () => {
  assert.equal(referenceLabel({ referenceKind: "pack_reference", referenceBasis: null, sourceMarket: null, sourceCurrency: null, sourceMsrp: null }), "Pack RRP reference");
  assert.equal(referenceLabel({ referenceKind: "component_reference", referenceBasis: null, sourceMarket: null, sourceCurrency: null, sourceMsrp: null }), "Component RRP reference");
});
