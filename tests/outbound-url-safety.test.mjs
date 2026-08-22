import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { safeExternalHttpsUrl } from "../lib/external-url.ts";

const read = (file) => fs.readFileSync(file, "utf8");

test("external retailer URL guard accepts only credential-free HTTPS destinations", () => {
  assert.equal(safeExternalHttpsUrl("https://example.com/product?id=1"), "https://example.com/product?id=1");
  assert.equal(safeExternalHttpsUrl(" https://example.com/store "), "https://example.com/store");
  for (const unsafe of [
    "http://example.com/product",
    "javascript:alert(1)",
    "data:text/html,hello",
    "//example.com/product",
    "/relative/path",
    "https://user:password@example.com/product",
    "not a url",
    "",
    null,
    undefined,
  ]) assert.equal(safeExternalHttpsUrl(unsafe), null, `${String(unsafe)} must fail closed`);
});

test("every static retailer registry handoff is valid HTTPS", () => {
  const registry = read("lib/retailer-registry.ts");
  const websites = [...registry.matchAll(/website:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.ok(websites.length > 0, "retailer registry must contain website handoffs");
  for (const website of websites) {
    assert.equal(safeExternalHttpsUrl(website), new URL(website).toString(), `${website} is an unsafe registry website`);
  }
});

test("Cloud catalogue and True Price handoffs are sanitized before dashboard rendering", () => {
  const client = read("lib/signal-engine-client.ts");
  const network = read("lib/retailer-network.ts");
  const search = read("app/dashboard/search/page.tsx");
  const truePrice = read("app/dashboard/true-price/page.tsx");
  const stores = read("app/dashboard/stores/page.tsx");

  assert.ok(client.includes("safeExternalHttpsUrl(offer.url)"));
  assert.ok(client.includes("safeExternalHttpsUrl(offer.productUrl)"));
  assert.ok(client.includes("return safe ? [safe] : []"), "unsafe Cloud offers must be removed rather than rendered as broken links");
  assert.ok(network.includes("safeExternalHttpsUrl(registry?.website)"));
  assert.ok(network.includes("safeExternalHttpsUrl(registry.website)"));

  assert.ok(search.includes('href={offer.url}'));
  assert.ok(truePrice.includes('href={offer.productUrl}'));
  assert.ok(stores.includes('href={retailer.website}'));
  assert.ok(search.includes('target="_blank" rel="noreferrer"'));
  assert.ok(truePrice.includes('target="_blank" rel="noreferrer"'));
  assert.ok(stores.includes('target="_blank" rel="noreferrer"'));
});

test("lead website and ticket submissions share the HTTPS-only URL guard", () => {
  const leads = read("app/api/leads/route.ts");
  assert.ok(leads.includes('safeExternalHttpsUrl'));
  assert.ok(leads.includes('assertSameOrigin(request)'));
  assert.ok(!leads.includes('url.protocol === "https:" || url.protocol === "http:"'));
});
