import assert from "node:assert/strict";
import test from "node:test";
import { classifyBetaAlertTitle, isBetaAlertRelevant } from "../lib/beta-alert-relevance.ts";

test("filters known accessory, merchandise and single-card noise", () => {
  assert.equal(classifyBetaAlertTitle("Pokemon TCG: Mini Portfolio - Q1 2026"), "ACCESSORY");
  assert.equal(classifyBetaAlertTitle("Hariyama Pokemon Pin"), "MERCHANDISE");
  assert.equal(classifyBetaAlertTitle("Shaymin EX RC21/RC25 - Light Play (LP)"), "SINGLE_CARD");
  assert.equal(isBetaAlertRelevant({ title: "Mystery Pokemon Item" }), false);
});

test("keeps the sealed beta products collectors actually need alerts for", () => {
  assert.equal(isBetaAlertRelevant({ title: "Pokemon TCG: Mega Evolution Elite Trainer Box" }), true);
  assert.equal(isBetaAlertRelevant({ title: "Pokemon TCG: Booster Bundle" }), true);
  assert.equal(isBetaAlertRelevant({ title: "Pokemon TCG Special Collection - Pin & 4 Booster Packs" }), true);
  assert.equal(isBetaAlertRelevant({ title: "Pokemon TCG: 3-Pack Blister" }), true);
});
