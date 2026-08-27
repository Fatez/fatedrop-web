import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("an exact retailer-name search resolves to Cloud's retailer catalogue filter", () => {
  const client = read("lib/signal-engine-client.ts");
  const stores = read("app/dashboard/stores/page.tsx");
  const directory = read("components/retailer-market-directory.tsx");

  assert.equal(client.includes('import { retailerRegistry } from "./retailer-registry"'), false);
  assert.ok(client.includes("const directory = await getSignalRetailerDirectory()"));
  assert.ok(client.includes("directory?.retailers.find"));
  assert.ok(client.includes("return retailer?.id ?? null"));
  assert.ok(client.includes("await retailerFilterForQuery(clean)"));
  assert.ok(client.includes('if (clean.length >= 2 && !inferredRetailer) params.set("q", clean)'));
  assert.ok(client.includes('if (retailerFilter) params.set("retailer", retailerFilter)'));
  assert.ok(stores.includes("<RetailerMarketDirectory"));
  assert.ok(directory.includes('/dashboard/stores/${encodeURIComponent(retailer.id)}'));
});

test("retailer-name catalogue resolution preserves explicit product-plus-retailer filtering", () => {
  const client = read("lib/signal-engine-client.ts");

  assert.ok(client.includes("const inferredRetailer = options.retailer ? null : await retailerFilterForQuery(clean)"));
  assert.ok(client.includes("const retailerFilter = options.retailer ?? inferredRetailer"));
  assert.ok(client.includes("if (clean.length < 2 && !retailerFilter) return null"));
});
