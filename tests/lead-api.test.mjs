import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const tempDirectory = await mkdtemp(path.join(tmpdir(), "fatedrop-leads-"));
const leadFile = path.join(tempDirectory, "beta-leads.ndjson");
process.env.FATEDROP_LEAD_STORE = "file";
process.env.FATEDROP_LEAD_FILE = leadFile;

const { POST } = await import("../app/api/leads/route.ts");

function request(payload) {
  return new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000" },
    body: JSON.stringify({ companyFax: "", contactConsent: true, marketingConsent: false, ...payload }),
  });
}

test("lead API validates, stores and deduplicates local submissions", async () => {
  try {
    const journeys = [
      { role: "collector", contactName: "Sample Collector", email: "collector@example.test", primaryTcg: "Pokémon", wantedFeature: "FateFind" },
      { role: "business", contactName: "Sample Owner", businessName: "Sample Cards", email: "business@example.test", website: "https://example.test", ecommercePlatform: "Shopify", productCount: "2500", businessType: "Online-only", catalogueMethod: "Product feed", attendsEvents: "Sometimes" },
      { role: "event", contactName: "Sample Organiser", eventName: "Sample Card Day", email: "event@example.test", website: "https://example.test/event", eventLocation: "Birmingham", eventDate: "2026-09-12", vendorCount: "18", ticketLink: "https://example.test/tickets", eventVendorMode: false },
    ];

    for (const journey of journeys) {
      const response = await POST(request(journey));
      assert.equal(response.status, 201);
      assert.equal((await response.json()).stored, true);
    }

    const stored = (await readFile(leadFile, "utf8")).trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(stored.length, 3);
    assert.deepEqual(stored.map((lead) => lead.role), ["collector", "business", "event"]);

    const duplicate = await POST(request(journeys[0]));
    assert.equal(duplicate.status, 409);
    assert.match((await duplicate.json()).error, /already registered/i);

    const invalid = await POST(request({ role: "collector", contactName: "", email: "bad", primaryTcg: "", wantedFeature: "" }));
    assert.equal(invalid.status, 400);

    const spam = await POST(request({ ...journeys[0], email: "bot@example.test", companyFax: "filled" }));
    assert.equal(spam.status, 400);
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
});

test("lead API reports unavailable persistence without a fake success", async () => {
  process.env.FATEDROP_LEAD_STORE = "disabled";
  const response = await POST(request({ role: "collector", contactName: "Sample", email: "unavailable@example.test", primaryTcg: "Pokémon", wantedFeature: "FateFind" }));
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /Nothing has been saved/i);
});
