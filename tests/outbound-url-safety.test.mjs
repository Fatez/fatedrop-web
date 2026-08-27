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

test("Cloud catalogue FateFind and retailer storefront handoffs are sanitized before dashboard rendering", () => {
  const client = read("lib/signal-engine-client.ts");
  const network = read("lib/retailer-network.ts");
  const search = read("app/dashboard/search/page.tsx");
  const fateFind = read("app/dashboard/fatefind/page.tsx");
  const stores = read("app/dashboard/stores/page.tsx");
  const directory = read("components/retailer-market-directory.tsx");
  const storefront = read("app/dashboard/stores/[id]/page.tsx");

  assert.ok(client.includes("safeExternalHttpsUrl(offer.url)"));
  assert.ok(client.includes("safeExternalHttpsUrl(offer.productUrl)"));
  assert.ok(client.includes("return safe ? [safe] : []"), "unsafe Cloud offers must be removed rather than rendered as broken links");
  assert.ok(client.includes("safeExternalHttpsUrl(profile.websiteUrl)"));
  assert.ok(client.includes("safeExternalHttpsUrl(profile.logoUrl)"));
  assert.ok(client.includes("safeExternalHttpsUrl(location.websiteUrl)"));
  assert.ok(network.includes("safeExternalHttpsUrl(directory.websiteUrl)"));
  assert.ok(network.includes("safeExternalHttpsUrl(directory.logoUrl)"));

  assert.ok(search.includes('href={offer.url}'));
  assert.ok(fateFind.includes('href={offer.productUrl}'));
  assert.ok(stores.includes("<RetailerMarketDirectory"));
  assert.ok(directory.includes('/dashboard/stores/${encodeURIComponent(retailer.id)}'));
  assert.ok(storefront.includes('href={retailer.websiteUrl}'));
  assert.ok(storefront.includes('href={offer.url}'));
  assert.ok(search.includes('target="_blank" rel="noreferrer"'));
  assert.ok(fateFind.includes('target="_blank" rel="noreferrer"'));
  assert.ok(storefront.includes('target="_blank" rel="noreferrer"'));
});

test("lead website and ticket submissions share the HTTPS-only URL guard", () => {
  const leads = read("app/api/leads/route.ts");
  assert.ok(leads.includes("safeExternalHttpsUrl"));
  assert.ok(leads.includes("assertSameOrigin(request)"));
  assert.ok(!leads.includes('url.protocol === "https:" || url.protocol === "http:"'));
});
