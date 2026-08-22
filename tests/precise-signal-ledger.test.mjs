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
