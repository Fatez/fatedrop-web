import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { isValidIanaTimezone } = require("../lib/notification-preferences.ts");

test("notification timezone validation accepts real IANA zones", () => {
  assert.equal(isValidIanaTimezone("Europe/London"), true);
  assert.equal(isValidIanaTimezone("America/New_York"), true);
  assert.equal(isValidIanaTimezone("Asia/Tokyo"), true);
});

test("notification timezone validation rejects arbitrary or empty values", () => {
  assert.equal(isValidIanaTimezone(""), false);
  assert.equal(isValidIanaTimezone("London"), false);
  assert.equal(isValidIanaTimezone("Not/A_Real_Zone"), false);
});
