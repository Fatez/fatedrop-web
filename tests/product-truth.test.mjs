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

test("canonical dashboard language is Search, FateFind and Koru", async () => {
  const [nav, fateFind, companion] = await Promise.all([
    source("components/dashboard-nav.tsx"),
    source("app/dashboard/watchlist/page.tsx"),
    source("app/dashboard/avatar/page.tsx"),
  ]);
  assert.ok(nav.includes('["⌕", "Search", "/dashboard/search"]'));
  assert.ok(nav.includes('["♡", "FateFind", "/dashboard/watchlist"]'));
  assert.ok(nav.includes('["◇", "Companion", "/dashboard/avatar"]'));
  assert.ok(fateFind.includes('title="FateFind"'));
  assert.ok(fateFind.includes("FateFind</b> is the hunt"));
  assert.ok(fateFind.includes("successful result is a <b>FateMatch</b>"));
  assert.ok(companion.includes('title="Koru"'));
  assert.ok(companion.includes("Meet Koru"));
  assert.ok(companion.includes("FateDrop&apos;s signal voice"));
});

test("dashboard Search and True Price use the canonical Signal Engine", async () => {
  const [search, truePrice, client] = await Promise.all([
    source("app/dashboard/search/page.tsx"),
    source("app/dashboard/true-price/page.tsx"),
    source("lib/signal-engine-client.ts"),
  ]);
  assert.ok(search.includes("searchSignalCatalogue"));
  assert.ok(search.includes("CREATE FATEFIND"));
  assert.ok(truePrice.includes("searchSignalTruePrice"));
  assert.ok(truePrice.includes("same canonical offer network"));
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

test("Koru Companion has a versioned renderer boundary for future 3D assets", async () => {
  const [contract, renderer] = await Promise.all([
    source("lib/companion-contract.ts"),
    source("components/companion-renderer.tsx"),
  ]);
  assert.ok(contract.includes("COMPANION_SCHEMA_VERSION"));
  assert.ok(contract.includes('characterFormat: "glb"'));
  assert.ok(contract.includes("droidModelUrl"));
  assert.ok(contract.includes("companionReactionFromSignal"));
  assert.ok(contract.includes('"fallback-2d"'));
  assert.ok(contract.includes('"webgl-3d"'));
  assert.ok(renderer.includes('mode === "webgl-3d"'));
  assert.ok(renderer.includes("KoruMascot"));
  assert.equal(renderer.includes("AvatarPreview"), false);
});

test("FateFind API uses same-origin writes while keeping legacy client response compatibility", async () => {
  const route = await source("app/api/fate-matches/route.ts");
  assert.ok(route.includes("assertSameOrigin(request)"));
  assert.ok(route.includes("fateFinds, matches: fateFinds"));
  assert.ok(route.includes("fateFind: saved, match: saved"));
  assert.ok(route.includes("max: 10_000_000"));
  assert.ok(route.includes("max: 1000"));
  assert.ok(route.includes("max: 250"));
});

test("trust and membership copy do not claim unimplemented finality", async () => {
  const [trust, about, future, subscriptions] = await Promise.all([
    source("app/trust/page.tsx"),
    source("app/about/page.tsx"),
    source("components/future-expansion.tsx"),
    source("app/subscriptions/page.tsx"),
  ]);
  assert.equal(trust.includes("FateScore · validated beta model"), false);
  assert.ok(trust.includes("FateScore is a planned evidence-led retailer trust model"));
  assert.ok(about.includes("<FutureExpansion"));
  assert.ok(future.includes("FateFair · planned"));
  assert.ok(subscriptions.includes("final higher-tier feature split is still being reviewed"));
});

test("privacy notice covers Companion and on-demand Local Radar handling", async () => {
  const privacy = await source("app/privacy/page.tsx");
  assert.ok(privacy.includes("FateDrop Companion"));
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
  assert.ok(truth.includes("FateFind is the hunt"));
  assert.ok(truth.includes("FateMatch is the successful result"));
  assert.ok(truth.includes("Whisper — product / catalogue movement"));
  assert.ok(truth.includes("Echo — access readiness"));
  assert.ok(truth.includes("Whisper is a real public lifecycle state. Do not collapse it into Echo."));
  assert.equal(truth.includes("Whisper — internal"), false);
  assert.ok(audit.includes("RESOLVED — FateFind / FateMatch naming collision"));
  assert.ok(audit.includes("FateFind = the hunt the collector creates"));
  assert.ok(audit.includes("FateMatch = the successful observed result"));
});