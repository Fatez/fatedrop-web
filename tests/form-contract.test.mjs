import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("collector, retailer and event journeys retain their fields and consent split", async () => {
  const form = await readFile(new URL("../components/beta-form.tsx", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/api/leads/route.ts", import.meta.url), "utf8");

  for (const field of [
    "contactName", "email", "region", "primaryTcg", "wantedFeature",
    "businessName", "website", "ecommercePlatform", "productCount",
    "businessType", "catalogueMethod", "attendsEvents", "eventName",
    "eventLocation", "eventDate", "vendorCount", "ticketLink",
    "eventVendorMode", "message",
  ]) assert.ok(form.includes(`name=\"${field}\"`), `${field} is missing`);

  assert.ok(form.includes('name="contactConsent"'));
  assert.ok(form.includes('name="marketingConsent"'));
  assert.ok(route.includes("LeadStorageUnavailableError"));
  assert.ok(route.includes("Nothing has been saved"));
});
