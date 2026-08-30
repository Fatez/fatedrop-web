import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const presentation = fs.readFileSync(path.join(root, "lib/canonical-alert-presentation.ts"), "utf8");
const signalPack = fs.readFileSync(path.join(root, "components/canonical-alert-signal-pack.tsx"), "utf8");
const mobileRoute = fs.readFileSync(path.join(root, "app/api/mobile/alerts/route.ts"), "utf8");
const canonicalAlerts = fs.readFileSync(path.join(root, "lib/canonical-alerts.ts"), "utf8");

test("source-market presentation preserves native authority without calling it UK RRP", () => {
  assert.match(presentation, /source_market_msrp/);
  assert.match(presentation, /Official \$\{market\} MSRP/);
  assert.match(presentation, /rrp_source_currency/);
  assert.match(presentation, /rrp_source_msrp/);
  assert.doesNotMatch(presentation, /Official UK RRP.*source_market_msrp/);
});

test("collector presentation humanises stock and confidence", () => {
  assert.match(presentation, /in_stock.*In stock/);
  assert.match(presentation, /out_of_stock.*Out of stock/);
  assert.match(presentation, /High/);
  assert.match(presentation, /Moderate/);
  assert.match(presentation, /Developing/);
  assert.match(signalPack, /AVAILABILITY/);
  assert.match(signalPack, /CONFIDENCE/);
});

test("derived references remain explicitly labelled as references", () => {
  assert.match(presentation, /Pack RRP reference/);
  assert.match(presentation, /Component RRP reference/);
  assert.match(presentation, /MSRP reference/);
});

test("mobile API carries presentation metadata while preserving free-tier redaction", () => {
  assert.match(canonicalAlerts, /presentation: CanonicalAlertPresentation/);
  assert.match(canonicalAlerts, /isCanonicalPresentation\(value\.presentation\)/);
  assert.doesNotMatch(mobileRoute, /listCanonicalAlertPresentations/);
  assert.match(mobileRoute, /presentation: null/);
  assert.match(mobileRoute, /alertsWithDelivery\.map\(freeAlert\)/);
});
