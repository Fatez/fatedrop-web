import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { operatorCapabilitiesFromOwnerRole } from "../lib/operator-capabilities.ts";

test("Global Echo capability fails closed unless the server role is owner", () => {
  assert.deepEqual(operatorCapabilitiesFromOwnerRole(null), { canSendGlobalEcho: false });
  assert.deepEqual(operatorCapabilitiesFromOwnerRole(undefined), { canSendGlobalEcho: false });
  assert.deepEqual(operatorCapabilitiesFromOwnerRole({ role: "owner" }), { canSendGlobalEcho: true });
});

test("Global Echo authority is keyed by immutable internal user id, not mutable identity fields", async () => {
  const ownerAccess = await readFile(new URL("../lib/owner-access.ts", import.meta.url), "utf8");
  const operatorCapabilities = await readFile(new URL("../lib/operator-capabilities.ts", import.meta.url), "utf8");

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
