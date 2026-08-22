import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("dashboard snapshot ingestion accepts precise signal causes", async () => {
  const route = await source("app/api/dashboard/network-snapshot/route.ts");
  for (const kind of [
    "catalogue_new",
    "catalogue_state_change",
    "queue",
    "security",
    "access_blocked",
    "new_listing_live",
    "availability_live",
    "restock",
    "sold_out",
    "lifecycle_unspecified",
  ]) assert.ok(route.includes(`"${kind}"`), `missing precise signal kind ${kind}`);
});

test("dashboard snapshot ingestion never invents Whisper for an invalid lifecycle state", async () => {
  const route = await source("app/api/dashboard/network-snapshot/route.ts");
  assert.ok(route.includes("const state = rawState && lifecycleStates.has(rawState as SignalLifecycle) ? rawState as SignalLifecycle : null;"));
  assert.ok(route.includes("if (!kind || !state || !title) return [];"));
  assert.equal(route.includes(': "whisper";'), false);
});

test("dashboard snapshot keeps public lifecycle and exact cause as separate dimensions", async () => {
  const route = await source("app/api/dashboard/network-snapshot/route.ts");
  assert.ok(route.includes("state, kind, intensity"));
  assert.ok(route.includes('new Set<SignalLifecycle>(["whisper", "manifested", "vanished", "echo"])'));
});

test("dashboard grouping uses lifecycle state rather than precise cause", async () => {
  const dashboard = await source("lib/dashboard.ts");
  assert.ok(dashboard.includes('filter((signal) => signal.state === "manifested")'));
  assert.ok(dashboard.includes('filter((signal) => signal.state === "whisper" || signal.state === "echo")'));
  assert.equal(dashboard.includes('const kind = signal.kind ?? signal.state;\n    return kind === "manifested";'), false);
});

test("dashboard home True Price summary also groups by lifecycle state", async () => {
  const page = await source("app/dashboard/page.tsx");
  assert.ok(page.includes('if (signal.state !== "manifested" || signal.deliveredPricePence === null) continue;'));
  assert.equal(page.includes('(signal.kind ?? signal.state) !== "manifested"'), false);
});

test("dashboard signal labels can show exact cause without replacing lifecycle", async () => {
  const dashboard = await source("lib/dashboard.ts");
  for (const pair of [
    ['"queue"', '"Queue"'],
    ['"security"', '"Security"'],
    ['"restock"', '"Restock"'],
    ['"sold_out"', '"Sold out"'],
    ['"catalogue_new"', '"Catalogue new"'],
  ]) assert.ok(dashboard.includes(`if (kind === ${pair[0]}) return ${pair[1]};`));
  assert.ok(dashboard.includes('return cause ? `${lifecycle} · ${cause}` : lifecycle;'));
});

test("dashboard guide card uses the final supplied Koru artwork without duplicating its baked-in copy", async () => {
  const page = await source("app/dashboard/page.tsx");
  assert.ok(page.includes("/assets/dashboard/koru-network-guide.png"));
  assert.ok(page.includes('className="fd-koru-action"'));
  assert.equal(page.includes("The signal moves.<br/>The bond remains."), false);
  assert.equal(page.includes('<div className="fd-koru-brand">'), false);
});
