import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

test("approved Koru homepage hero remains the visual anchor", () => {
  const page = read("app/page.tsx");
  const hero = read("components/koru-reference-landing.tsx");
  assert.ok(page.includes("KoruReferenceLanding"));
  assert.ok(hero.includes("/assets/home/koru-home-hero.png"));
  assert.equal(hero.includes("koru-home-hero.avif"), false);
  assert.equal(hero.includes("koru-home-hero.webp"), false);
});

test("homepage explains the product before Koru and Friends", () => {
  const page = read("app/page.tsx");
  const product = page.indexOf("FateDropProductSection");
  const koru = page.indexOf("KoruFriendsMerchSection");
  assert.ok(product >= 0);
  assert.ok(koru >= 0);
  assert.ok(product < koru);
});

test("homepage keeps the four core USPs accurate", () => {
  const section = read("components/koru-final-sections.tsx");
  assert.ok(section.includes("Signal Intelligence"));
  assert.ok(section.includes("True Price"));
  assert.ok(section.includes("FateFind"));
  assert.ok(section.includes("FateMatch"));
  assert.ok(section.includes("Independent Discovery"));
  assert.ok(section.includes("Whisper"));
  assert.ok(section.includes("Echo"));
  assert.ok(section.includes("Manifested"));
  assert.ok(section.includes("Vanished"));
});

test("homepage phone demo stays off Home and dedicated demo exists", () => {
  const page = read("app/page.tsx");
  const demo = read("app/demo/page.tsx");
  assert.equal(page.includes("InteractivePhoneDemo"), false);
  assert.ok(demo.includes("InteractivePhoneDemo"));
  assert.ok(demo.includes("Search"));
  assert.ok(demo.includes("True Price"));
  assert.ok(demo.includes("FateFind"));
  assert.ok(demo.includes("FateMatch"));
});

test("future roadmap stays away from Home", () => {
  const page = read("app/page.tsx");
  const about = read("app/about/page.tsx");
  assert.equal(page.includes("FutureExpansion"), false);
  assert.ok(about.includes("FutureExpansion"));
});

test("collector terminology keeps FateFind as hunt and FateMatch as result", () => {
  const collectors = read("app/collectors/page.tsx");
  assert.ok(collectors.includes("A FateFind is the hunt you create"));
  assert.ok(collectors.includes("the result is a FateMatch"));
});

test("Koru companion contract keeps exactly five selectable slots", () => {
  const contract = read("lib/companion-contract.ts");
  assert.ok(contract.includes('"koru", "fenn", "aeris", "nyxen", "solix"'));
  assert.ok(contract.includes("Kael"));
  assert.ok(contract.includes("Nyra"));
  assert.equal(contract.includes('"oru"'), false);
});

test("merch page keeps campaign artwork once and exposes two shop drops", () => {
  const merch = read("app/merch/page.tsx");
  assert.ok(merch.includes("koru-friends-merch-hero.png") || merch.includes("KORU_MERCH.campaign"));
  assert.ok(merch.includes("Koru &amp; Friends"));
  assert.ok(merch.includes("FateDrop Signal"));
  assert.ok(merch.includes("Oru"));
  assert.ok(merch.includes("checkoutHref"));
});

test("Merch lives in the shared top navigation as a dropdown", () => {
  const nav = read("components/nav.tsx");
  assert.ok(nav.includes("merch-menu"));
  assert.ok(nav.includes("All Merch"));
  assert.ok(nav.includes("Koru & Friends"));
  assert.ok(nav.includes("FateDrop Signal"));
});

test("collector and retailer pages stay visibly grounded in the TCG market", () => {
  const collectors = read("app/collectors/page.tsx");
  const retailers = read("app/businesses/page.tsx");
  assert.ok(collectors.includes("Find the cards. Know the price. Catch the signal."));
  assert.ok(collectors.includes("Search the network"));
  assert.ok(collectors.includes("Buy direct from stores"));
  assert.ok(retailers.includes("The bridge between indie stores and collector demand."));
  assert.ok(retailers.includes("Surface live products"));
  assert.ok(retailers.includes("Keep your checkout"));
});

test("events page fails open when the hosted encounters service is slow", () => {
  const nav = read("lib/site-data.ts");
  const events = read("app/events/page.tsx");
  const encounters = read("lib/encounters.ts");
  assert.ok(nav.includes('{ label: "Events", href: "/events" }'));
  assert.ok(events.includes("Find the TCG scene around you."));
  assert.ok(encounters.includes("ENCOUNTERS_TIMEOUT_MS"));
  assert.ok(encounters.includes("AbortSignal.timeout(ENCOUNTERS_TIMEOUT_MS)"));
  assert.ok(encounters.includes("return { live: false, events: [] as EncounterEvent[] }"));
});

test("dashboard home matches the approved evidence-backed collector workspace", () => {
  const dashboard = read("app/dashboard/page.tsx");
  const shell = read("components/dashboard-page-shell.tsx");
  const pulse = read("components/dashboard-network-pulse.tsx");
  assert.ok(dashboard.includes("Signals Overview"));
  assert.ok(dashboard.includes("Recent Signals"));
  assert.ok(dashboard.includes("True Price Comparison"));
  assert.ok(dashboard.includes("FateFind"));
  assert.ok(dashboard.includes("Network Pulse"));
  assert.ok(dashboard.includes("Recent Manifested Drops"));
  assert.ok(dashboard.includes("Retailers You Track"));
  assert.ok(dashboard.includes("KORU · NETWORK GUIDE"));
  assert.ok(shell.includes("Search cards, sets or retailers"));
  assert.ok(pulse.includes("Products"));
  assert.equal(dashboard.includes("COLLECTOR COMMAND CENTRE"), false);
});
