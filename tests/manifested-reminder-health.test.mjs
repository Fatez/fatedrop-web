import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/api/health/manifested-reminder/route.ts", import.meta.url), "utf8");

test("Manifested reminder health diagnostic is read-only and aggregate", () => {
  assert.match(source, /event_type='manifested_reminder'/);
  assert.match(source, /manifestedReminderEligible/);
  assert.match(source, /natural_pushes_30m/);
  assert.match(source, /likelyBlocker/);
  assert.doesNotMatch(source, /INSERT\s+INTO|UPDATE\s+fatedrop_|DELETE\s+FROM|TRUNCATE/is);
  assert.doesNotMatch(source, /expo_push_token|provider_message_id\s*[:,]/i);
});

test("diagnostic reports candidate, recipient, outbox and provider receipt stages", () => {
  assert.match(source, /candidates:/);
  assert.match(source, /recipients:/);
  assert.match(source, /outbox:/);
  assert.match(source, /delivery:/);
  assert.match(source, /receiptOk/);
  assert.match(source, /ticketAccepted/);
});
