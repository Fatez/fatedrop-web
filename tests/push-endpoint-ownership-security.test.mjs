import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../app/api/mobile/push/route.ts", import.meta.url), "utf8");

test("push token conflict cannot transfer ownership between FateDrop accounts", () => {
  assert.match(source, /WHERE fatedrop_push_endpoints\.user_id=EXCLUDED\.user_id/);
  assert.match(source, /RETURNING user_id/);
  assert.match(source, /already registered to another FateDrop ID/);

  const conflict = source.match(/ON CONFLICT \(expo_push_token\) DO UPDATE SET([\s\S]*?)WHERE fatedrop_push_endpoints\.user_id=EXCLUDED\.user_id/);
  assert.ok(conflict, "push token conflict must include an owner-scoped update");
  assert.doesNotMatch(conflict[1], /\buser_id\s*=/);
});

test("push endpoint deletion remains scoped to the authenticated owner", () => {
  assert.match(source, /WHERE user_id=\$\{snapshot\.account\.id\} AND expo_push_token=\$\{token\}/);
});
