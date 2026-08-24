import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

test("external retailer URL guard is HTTPS-only and rejects embedded credentials", () => {
  const guard = read("lib/external-url.ts");
  assert.ok(guard.includes('url.protocol !== "https:"'));
  assert.ok(guard.includes("url.username || url.password"));
  assert.ok(guard.includes("input.length > 2048"));
  assert.ok(guard.includes("return null"));
});

test("every static retailer registry handoff is HTTPS", () => {
  const registry = read("lib/retailer-registry.ts");
  const websites = [...registry.matchAll(/website:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.ok(websites.length > 0, "retailer registry must contain website handoffs");
  for (const website of websites) {
    const url = new URL(website);
    assert.equal(url.protocol, "https:", `${website} must use HTTPS`);
    assert.equal(url.username, "", `${website} must not embed a username`);
    assert.equal(url.password, "", `${website} must not embed a password`);
  }
});

test("Cloud catalogue and True Price handoffs are sanitized before dashboard rendering", () => {
  const client = read("lib/signal-engine-client.ts");
  const network = read("lib/retailer-network.ts");
  const search = read("app/dashboard/search/page.tsx");
  const truePrice = read("app/dashboard/true-price/page.tsx");
  const stores = read("app/dashboard/stores/page.tsx");
  const directory = read("components/retailer-market-directory.tsx");

  assert.ok(client.includes("safeExternalHttpsUrl(offer.url)"));
  assert.ok(client.includes("safeExternalHttpsUrl(offer.productUrl)"));
  assert.ok(client.includes("return safe ? [safe] : []"), "unsafe Cloud offers must be removed rather than rendered as broken links");
  assert.ok(network.includes("safeExternalHttpsUrl(registry?.website)"));
  assert.ok(network.includes("safeExternalHttpsUrl(registry.website)"));

  assert.ok(search.includes('href={offer.url}'));
  assert.ok(truePrice.includes('href={offer.productUrl}'));
  assert.ok(stores.includes("<RetailerMarketDirectory"));
  assert.ok(directory.includes('href={retailer.website}'));
  assert.ok(search.includes('target="_blank" rel="noreferrer"'));
  assert.ok(truePrice.includes('target="_blank" rel="noreferrer"'));
  assert.ok(directory.includes('target="_blank" rel="noreferrer"'));
});

test("lead website and ticket submissions share the HTTPS-only URL guard", () => {
  const leads = read("app/api/leads/route.ts");
  assert.ok(leads.includes("safeExternalHttpsUrl"));
  assert.ok(leads.includes("assertSameOrigin(request)"));
  assert.ok(!leads.includes('url.protocol === "https:" || url.protocol === "http:"'));
});
