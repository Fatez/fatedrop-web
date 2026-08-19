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

test("canonical dashboard language is Search, FateFind and FateDrop Companion", async () => {
  const [nav, fateFind, companion] = await Promise.all([
    source("components/dashboard-nav.tsx"),
    source("app/dashboard/watchlist/page.tsx"),
    source("app/dashboard/avatar/page.tsx"),
  ]);
  assert.ok(nav.includes('["⌕", "Search", "/dashboard/search"]'));
  assert.ok(nav.includes('["♡", "FateFind", "/dashboard/watchlist"]'));
  assert.ok(nav.includes('["◇", "Companion", "/dashboard/avatar"]'));
  assert.ok(fateFind.includes('title="FateFind"'));
  assert.ok(fateFind.includes("Existing internal FateMatch storage names are retained for compatibility"));
  assert.ok(companion.includes('title="FateDrop Companion"'));
  assert.ok(companion.includes("richer 3D renderer"));
});

test("dashboard Search is connected to the canonical Signal Engine client", async () => {
  const [page, client] = await Promise.all([
    source("app/dashboard/search/page.tsx"),
    source("lib/signal-engine-client.ts"),
  ]);
  assert.ok(page.includes("searchSignalCatalogue"));
  assert.ok(page.includes("CLOUD CONNECTED"));
  assert.ok(client.includes('"/api/catalogue"'));
  assert.ok(client.includes("FATEDROP_SIGNAL_ENGINE_URL"));
});

test("trust and membership copy do not claim unimplemented finality", async () => {
  const [trust, home, subscriptions] = await Promise.all([
    source("app/trust/page.tsx"),
    source("app/page.tsx"),
    source("app/subscriptions/page.tsx"),
  ]);
  assert.equal(trust.includes("FateScore · validated beta model"), false);
  assert.ok(trust.includes("FateScore is a planned evidence-led retailer trust model"));
  assert.ok(home.includes("FateFair · planned"));
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

test("product truth and audit documents remain part of the repository", async () => {
  const [truth, audit] = await Promise.all([
    source("docs/fatedrop-product-truth.md"),
    source("docs/fatedrop-network-audit.md"),
  ]);
  for (const status of ["LIVE", "BETA", "DEMO", "FOUNDATION", "PLANNED"]) assert.ok(truth.includes(`**${status}**`) || truth.includes(`**${status}`));
  assert.ok(truth.includes("Canonical signal lifecycle"));
  assert.ok(audit.includes("FateFind / FateMatch / Watchlist naming collision"));
});
