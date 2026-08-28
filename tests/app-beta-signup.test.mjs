import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/app-beta/page.tsx", import.meta.url), "utf8");
const form = fs.readFileSync(new URL("../components/app-beta-form.tsx", import.meta.url), "utf8");

test("App Beta is a controlled signup journey, not a public install page", () => {
  assert.match(page, /controlled beta/i);
  assert.match(page, /There is no public download link yet/);
  assert.match(page, /same identity/);
  assert.doesNotMatch(page, /expo\.dev|eas\.build|TestFlight.*https?:\/\//i);
});

test("App Beta reuses the collector lead and one FateDrop ID", () => {
  assert.match(form, /fetch\("\/api\/leads"/);
  assert.match(form, /role: "collector"/);
  assert.match(form, /wantedFeature: "FateDrop App Beta"/);
  assert.match(form, /response\.status === 409/);
  assert.match(form, /already on the FateDrop beta list/);
  assert.match(form, /\/account\/register/);
});
