import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("retailer and event onboarding require secure HTTPS destinations in client and server validation", () => {
  const form = read("components/beta-form.tsx");
  const api = read("app/api/leads/route.ts");

  assert.ok(form.includes('url.protocol !== "https:"'));
  assert.ok(form.includes("Enter a secure address beginning with https://"));
  assert.ok(!form.includes('url.protocol !== "https:" && url.protocol !== "http:"'));
  assert.ok(api.includes("safeExternalHttpsUrl"));
  assert.ok(api.includes("assertSameOrigin(request)"));
});

test("founding retailer enquiry still captures the catalogue facts needed for onboarding", () => {
  const form = read("components/beta-form.tsx");
  for (const field of [
    "businessName",
    "website",
    "ecommercePlatform",
    "productCount",
    "businessType",
    "catalogueMethod",
    "attendsEvents",
  ]) assert.ok(form.includes(`name=\"${field}\"`), `${field} must remain in retailer onboarding`);
});
