import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const operatorCapabilitiesUrl = new URL("../lib/operator-capabilities.ts", import.meta.url);

test("Global Echo capabilities fail closed unless the server role is owner", async () => {
  const source = await readFile(operatorCapabilitiesUrl, "utf8");

  assert.match(source, /NO_OPERATOR_CAPABILITIES[\s\S]*canSendGlobalEcho:\s*false[\s\S]*canRetractGlobalEcho:\s*false/);
  assert.match(source, /const owner = role\?\.role === "owner"/);
  assert.match(source, /return \{ canSendGlobalEcho: owner, canRetractGlobalEcho: owner \}/);
  assert.match(source, /if \(!cleanUserId\) return NO_OPERATOR_CAPABILITIES/);
  assert.match(source, /catch \{[\s\S]*return NO_OPERATOR_CAPABILITIES/);
});

test("Global Echo authority is keyed by immutable internal user id, not mutable identity fields", async () => {
  const ownerAccess = await readFile(new URL("../lib/owner-access.ts", import.meta.url), "utf8");
  const operatorCapabilities = await readFile(operatorCapabilitiesUrl, "utf8");

  assert.match(ownerAccess, /WHERE user_id = \$\{cleanUserId\} AND role = 'owner'/);
  assert.match(operatorCapabilities, /getOwnerRole\(cleanUserId\)/);
  assert.doesNotMatch(operatorCapabilities, /findAccountByEmail|fateId\s*===|email\s*===/);
});

test("existing mobile identity contracts carry the server capability without accepting a client-owned flag", async () => {
  const sessionRoute = await readFile(new URL("../app/api/mobile/session/route.ts", import.meta.url), "utf8");
  const syncRoute = await readFile(new URL("../app/api/mobile/sync/route.ts", import.meta.url), "utf8");

  assert.match(sessionRoute, /operatorCapabilities/);
  assert.match(sessionRoute, /getOperatorCapabilities\(snapshot\.account\.id\)/);
  assert.match(syncRoute, /getOperatorCapabilities\(snapshot\.account\.id\)/);
  assert.match(syncRoute, /NO_OPERATOR_CAPABILITIES/);
  assert.doesNotMatch(sessionRoute, /payload\?\.operatorCapabilities|payload\?\.canSendGlobalEcho/);
  assert.doesNotMatch(syncRoute, /request.*canSendGlobalEcho|payload.*canSendGlobalEcho/);
});