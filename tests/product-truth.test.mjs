import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("public network proof never falls back to the retired hard-coded snapshot", async () => {
  const [siteData, proof, dashboard] = await Promise.all([
    source("lib/site-data.ts"),
    source("components/network-proof.tsx"),
    source("lib/dashboard.ts"),
  ]);
  for (const retired of ["6,332", "2,592"]) assert.equal(siteData.includes(retired), false, `retired metric ${retired} must not return`);
  assert.equal(siteData.includes("snapshot:"), false, "mutable network proof must not live in static site config");
  assert.ok(proof.includes('/api/network-status'));
  assert.ok(proof.includes("No measured value available"));
  assert.ok(dashboard.includes("Awaiting FateDrop Cloud metric feed"));
});

test("canonical dashboard language separates Search, FateFind, FateMatch and Koru & Friends", async () => {
  const [nav, fateFind, fateMatch, companion] = await Promise.all([
    source("components/dashboard-nav.tsx"),
    source("app/dashboard/fatefind/page.tsx"),
    source("app/dashboard/watchlist/page.tsx"),
    source("app/dashboard/avatar/page.tsx"),
  ]);
  assert.ok(nav.includes('"Search", "/dashboard/search"'));
  assert.ok(nav.includes('"FateFind", "/dashboard/fatefind"'));
  assert.ok(nav.includes('"FateMatch", "/dashboard/watchlist"'));
  assert.ok(nav.includes('"Koru & Friends", "/dashboard/avatar"'));
  assert.ok(fateFind.includes('title="FateFind"'));
  assert.ok(fateFind.includes("Find the strongest-value deal before you buy."));
  assert.ok(fateFind.includes("searchSignalTruePrice"));
  assert.ok(fateFind.includes("ValueCompare"));
  assert.ok(fateMatch.includes('title="FateMatch"'));
  assert.ok(fateMatch.includes("let me know when this is in stock"));
  assert.ok(companion.includes('title: "Koru & Friends | FateDrop Dashboard"'));
  assert.ok(companion.includes("Koru, Fenn, Aeris, Nyxen or Solix"));
  assert.ok(companion.includes("Koru remains the mascot and signal voice of FateDrop"));
});

test("dashboard Search hands value decisions to FateFind while True Price remains calculation infrastructure", async () => {
  const [search, fateFind, legacyTruePrice, client] = await Promise.all([
    source("app/dashboard/search/page.tsx"),
    source("app/dashboard/fatefind/page.tsx"),
    source("app/dashboard/true-price/page.tsx"),
    source("lib/signal-engine-client.ts"),
  ]);
  assert.ok(search.includes("searchSignalCatalogue"));
  assert.ok(search.includes("FATEFIND · BEST VALUE NOW"));
  assert.ok(search.includes("FATEMATCH · WATCH MY CONDITIONS"));
  assert.equal(search.includes("/dashboard/true-price?q="), false);
  assert.ok(fateFind.includes("TRUE PRICE"));
  assert.ok(fateFind.includes("VS RRP / REF"));
  assert.ok(legacyTruePrice.includes("/dashboard/fatefind"));
  assert.ok(client.includes('"/api/catalogue"'));
  assert.ok(client.includes('"/api/true-price"'));
  assert.ok(client.includes("FATEDROP_SIGNAL_ENGINE_URL"));
});

test("unknown delivery can never masquerade as a delivered total", async () => {
  const catalogue = await source("lib/retailer-catalogue.ts");
  const truePrice = await source("lib/true-price.ts");
  assert.ok(catalogue.includes("return { deliveredPence: null, deliveryPence: null, known: false as const }"));
  assert.ok(truePrice.includes("deliveredTruePricePence = input.deliveryKnown && input.mandatoryPostagePence !== null"));
});

test("public signal labels preserve the final four-stage lifecycle", async () => {
  const dashboard = await source("lib/dashboard.ts");
  assert.ok(dashboard.includes('if (kind === "whisper") return "Whisper"'));
  assert.ok(dashboard.includes('if (kind === "echo" || kind === "queue" || kind === "security") return "Echo"'));
  assert.ok(dashboard.includes('if (kind === "manifested") return "Manifested"'));
  assert.ok(dashboard.includes('if (kind === "vanished") return "Vanished"'));
  assert.ok(dashboard.includes('if (kind === "drop_pulse") return "Drop Pulse"'));
  assert.equal(dashboard.includes('kind === "manifested" || kind === "echo"'), false);
  assert.equal(dashboard.includes('kind === "drop_pulse" || kind === "whisper"'), false);
});

test("Koru and Friends has one versioned five-slot renderer boundary for current 3D assets", async () => {
  const [contract, renderer, selector, truth] = await Promise.all([
    source("lib/companion-contract.ts"),
    source("components/companion-renderer.tsx"),
    source("components/companion-selector.tsx"),
    source("docs/fatedrop-product-truth.md"),
  ]);
  assert.ok(contract.includes("COMPANION_SCHEMA_VERSION = 2"));
  assert.ok(contract.includes('ACTIVE_COMPANION_IDS = ["koru", "fenn", "aeris", "nyxen", "solix"]'));
  assert.ok(contract.includes('modelFormat: "glb" | null'));
  assert.ok(contract.includes("reactionModelUrls"));
  assert.ok(contract.includes("companionModelUrl"));
  assert.ok(contract.includes("companionReactionFromSignal"));
  assert.ok(contract.includes('"fallback-2d"'));
  assert.ok(contract.includes('"webgl-3d"'));
  assert.equal(contract.includes("droidModelUrl"), false);
  assert.equal(contract.includes("AvatarLoadout"), false);
  assert.ok(contract.includes('/assets/companions/koru/koru.glb'));
  assert.ok(contract.includes('/assets/companions/fenn/fenn.glb'));
  assert.equal(contract.includes('id: "oru"'), false);
  assert.ok(renderer.includes("companionRendererMode"));
  assert.ok(renderer.includes("companionModelUrl"));
  assert.ok(renderer.includes("CompanionWebglModel"));
  assert.ok(renderer.includes("CompanionPlaceholder"));
  assert.equal(renderer.includes("KoruMascot"), false, "the selector must never substitute homepage campaign artwork for a companion model");
  assert.ok(renderer.includes("Never substitute campaign/homepage artwork"));
  assert.ok(selector.includes("ACTIVE_COMPANION_ROSTER.map"));
  assert.ok(selector.includes("SIGNAL STATE PREVIEW"));
  assert.ok(truth.includes("BETA presentation / BETA Web renderer"));
  assert.ok(truth.includes("all five active companion slots have registered GLB display assets"));
  assert.ok(truth.includes("A character may use one approved GLB or an approved reaction-specific GLB pack"));
  assert.ok(truth.includes("does **not** make skeletal animation playback a shipped claim"));
  assert.ok(truth.includes("Reduced-motion preference must retain the real model"));
});

test("FateMatch monitoring API uses same-origin writes while keeping legacy client response compatibility", async () => {
  const route = await source("app/api/fate-matches/route.ts");
  assert.ok(route.includes("assertSameOrigin(request)"));
  assert.ok(route.includes("fateMatchHunts, fateFinds: fateMatchHunts, matches: fateMatchHunts"));
  assert.ok(route.includes("fateFind: saved, match: saved"));
  assert.ok(route.includes("max: 10_000_000"));
  assert.ok(route.includes("max: 1000"));
  assert.ok(route.includes("max: 250"));
});

test("trust, roadmap and launch membership copy do not sell unimplemented tiers or trust advantages", async () => {
  const [trust, about, siteData, subscriptions] = await Promise.all([
    source("app/trust/page.tsx"),
    source("app/about/page.tsx"),
    source("lib/site-data.ts"),
    source("app/subscriptions/page.tsx"),
  ]);
  assert.equal(trust.includes("FateScore · validated beta model"), false);
  assert.ok(trust.includes("FateScore is a planned evidence-led retailer trust model"));
  assert.ok(about.includes("<FutureExpansion"));
  assert.ok(about.includes("siteConfig.roadmap"));
  assert.ok(siteData.includes('{ name: "Fate Trader matching expansion", status: "Beta roadmap" }'));
  assert.ok(siteData.includes('name: "FateDrop Plus"'));
  assert.equal(siteData.includes('name: "FateDrop Pro"'), false);
  assert.ok(siteData.includes('name: "Founding Fate Network Retailer"'));
  assert.ok(siteData.includes('price: "Free during beta"'));
  assert.ok(siteData.includes("future pricing not yet set"));
  assert.equal(siteData.includes('name: "FateDrop Indie"'), false);
  assert.equal(siteData.includes('name: "Indie Pro"'), false);
  assert.ok(subscriptions.includes("one simple upgrade: FateDrop Plus"));
  assert.ok(subscriptions.includes("cannot buy a false RRP verdict, alert priority or better organic ranking"));
});

test("privacy notice covers Koru & Friends and on-demand Local Radar handling", async () => {
  const privacy = await source("app/privacy/page.tsx");
  assert.ok(privacy.includes("Koru & Friends companion"));
  assert.ok(privacy.includes("current Local Radar route does not write those coordinates"));
  assert.ok(privacy.includes("one-way salted hashes"));
});

test("Cloud metric ingestion uses constant-time secret comparison", async () => {
  const route = await source("app/api/dashboard/network-snapshot/route.ts");
  assert.ok(route.includes("timingSafeEqual"));
  assert.ok(route.includes('authorization.startsWith("Bearer ")'));
});

test("Product Spec v1 remains the repository authority", async () => {
  const [truth, audit] = await Promise.all([
    source("docs/fatedrop-product-truth.md"),
    source("docs/fatedrop-network-audit.md"),
  ]);
  for (const status of ["LIVE", "BETA", "DEMO", "FOUNDATION", "HOLD", "PLANNED"]) assert.ok(truth.includes(`**${status}**`) || truth.includes(`**${status}`));
  assert.ok(truth.includes("FateDrop Product Spec v1"));
  assert.ok(truth.includes("FateFind answers: “What is the strongest-value option I can buy right now?”"));
  assert.ok(truth.includes("FateMatch answers: “Let me know when this is in stock under the conditions I want.”"));
  assert.ok(truth.includes("FATEMATCH — LIVE NOW"));
  assert.ok(truth.includes("Whisper — product / catalogue movement"));
  assert.ok(truth.includes("Echo — access readiness"));
  assert.ok(truth.includes("Whisper is a real public lifecycle state. Do not collapse it into Echo."));
  assert.ok(truth.includes("The interactive phone does **not** belong in the homepage hero or core landing flow"));
  assert.ok(truth.includes("It lives on the dedicated `/demo` page"));
  assert.equal(truth.includes("Whisper — internal"), false);
  assert.ok(audit.includes("RESOLVED — FateFind / FateMatch naming collision"));
  assert.ok(audit.includes("FateFind = the live intelligent best-value finder"));
  assert.ok(audit.includes("FateMatch = the monitoring/watch system"));
  assert.ok(audit.includes("The interactive phone is deliberately kept off Home"));
});
