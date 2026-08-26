import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await readFile(new URL("../app/api/local-radar/route.ts", import.meta.url), "utf8");
const component = await readFile(new URL("../components/local-radar-search.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../app/dashboard/local-radar/page.tsx", import.meta.url), "utf8");

test("Local Radar uses canonical Cloud discovery instead of a second Web Places engine", () => {
  assert.match(route, /FATEDROP_SIGNAL_ENGINE_URL/);
  assert.match(route, /\/api\/local-radar/);
  assert.doesNotMatch(route, /GOOGLE_PLACES_API_KEY/);
  assert.match(page, /canonical FateDrop Cloud discovery engine/);
});

test("Local Radar supports both on-demand device location and UK postcode search", () => {
  assert.match(component, /USE MY LOCATION/);
  assert.match(component, /searchPostcode/);
  assert.match(component, /postal-code/);
  assert.match(route, /postcode/);
  assert.match(route, /radiusMiles/);
});

test("Local Radar keeps physical discovery separate from online catalogue stock evidence", () => {
  assert.match(component, /Online stock never becomes confirmed store stock automatically/);
  assert.match(component, /missing data or online sold-out status as physical-store stock truth/);
  assert.match(component, /CURRENT STOCK · UNKNOWN/);
  assert.match(component, /EVENTS/);
  assert.match(component, /continuous background tracking/);
});

test("Local Radar exposes only the simple consumer-facing physical states", () => {
  assert.match(page, /STORE/);
  assert.match(page, /EXPECTED/);
  assert.match(page, /CONFIRMED/);
  assert.match(page, /UNKNOWN/);
  assert.match(component, /localAvailability/);
  assert.doesNotMatch(component, /LOCAL WHISPER|LOCAL ECHO|LOCAL MANIFESTED|LOCAL VANISHED/);
});
