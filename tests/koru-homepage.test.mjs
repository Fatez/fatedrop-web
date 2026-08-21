import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("homepage keeps the approved Koru landing as the visual anchor", () => {
  const home = read("app/page.tsx");
  const reference = read("components/koru-home-reference.tsx");
  assert.ok(home.includes("<KoruReferenceLanding"));
  assert.ok(reference.includes("You don&apos;t chase drops."));
  assert.ok(reference.includes("You get the signal."));
  assert.ok(reference.includes("THE NETWORK LANGUAGE"));
  assert.ok(reference.includes("MEET THE VOICE OF FATEDROP"));
});

test("homepage is intentionally short and product-led", () => {
  const home = read("app/page.tsx");
  assert.ok(home.includes("<KoruFriendsMerchSection"));
  assert.ok(home.includes("<FateDropPillars"));
  assert.ok(home.includes("<FateDropPhoneSection"));
  assert.ok(home.includes("<IndieBridgeSection"));
  assert.ok(home.includes("<EventsHomeLink"));
  assert.equal(home.includes("<FutureExpansion"), false);
  assert.equal(home.includes("<NetworkProof"), false);
  assert.equal(home.includes("<WhyFateDrop"), false);
});

test("public product language preserves FateFind to FateMatch and the final lifecycle", () => {
  const siteData = read("lib/site-data.ts");
  const trust = read("app/trust/page.tsx");
  const collectors = read("app/collectors/page.tsx");
  assert.ok(siteData.includes("FateFind → FateMatch"));
  assert.ok(siteData.includes("successful result is a FateMatch"));
  assert.ok(trust.includes("Whisper. Echo. Manifested. Vanished."));
  assert.ok(collectors.includes("Whisper → Echo → Manifested → Vanished"));
});

test("free drops are removed from the public navigation", () => {
  const siteData = read("lib/site-data.ts");
  const footer = read("components/footer.tsx");
  const retired = read("app/free-drops/page.tsx");
  assert.equal(siteData.includes('label: "Free Drops"'), false);
  assert.equal(footer.includes('href="/free-drops"'), false);
  assert.ok(retired.includes('redirect("/")'));
});

test("Koru and Friends is the merch bridge rather than a second product", () => {
  const sections = read("components/koru-final-sections.tsx");
  const merch = read("app/merch/page.tsx");
  assert.ok(sections.includes("/assets/home/koru-home-section.png"));
  assert.ok(sections.includes('href="/merch"'));
  assert.ok(merch.includes("The culture around the signal."));
});
