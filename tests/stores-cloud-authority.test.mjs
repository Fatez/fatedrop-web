import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("directory-only indie storefronts do not override the canonical Cloud retailer route", () => {
  assert.equal(fs.existsSync("app/dashboard/stores/cob-and-pip/page.tsx"), false);
  assert.equal(fs.existsSync("app/dashboard/stores/wishlist-collectables/page.tsx"), false);

  const storefront = read("app/dashboard/stores/[id]/page.tsx");
  assert.ok(storefront.includes("getSignalRetailerDirectory"));
  assert.ok(storefront.includes("getSignalRetailerProfile"));
  assert.ok(storefront.includes("searchSignalCatalogue"));
  assert.equal(storefront.includes("@/lib/retailer-catalogue"), false);
});

test("canonical retailer storefront fails closed when Cloud catalogue truth is unavailable", () => {
  const storefront = read("app/dashboard/stores/[id]/page.tsx");
  assert.ok(storefront.includes('catalogue === null'));
  assert.ok(storefront.includes("Connected catalogue unavailable."));
  assert.ok(storefront.includes("No connected in-stock offers."));
});
