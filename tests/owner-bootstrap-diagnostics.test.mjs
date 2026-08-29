import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync("app/api/dashboard/production-migrations/route.ts", "utf8");

test("owner bootstrap diagnostics reveal only the match count behind the server-authenticated migration route", () => {
  assert.match(route, /authorized\(request\)/);
  assert.match(route, /timingSafeEqual/);
  assert.match(route, /SELECT COUNT\(\*\)::int AS count FROM fatedrop_users WHERE lower\(email\)='hello@fatedrop\.co\.uk'/);
  assert.match(route, /Match count:/);
  assert.doesNotMatch(route, /SELECT id,\s*email|SELECT \* FROM fatedrop_users/i);
  assert.match(route, /status: 503/);
});
