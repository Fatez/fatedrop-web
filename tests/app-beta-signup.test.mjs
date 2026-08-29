import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/app-beta/page.tsx", import.meta.url), "utf8");
const form = fs.readFileSync(new URL("../components/app-beta-form.tsx", import.meta.url), "utf8");
const formStyles = fs.readFileSync(new URL("../components/app-beta-form.module.css", import.meta.url), "utf8");
const pageStyles = fs.readFileSync(new URL("../app/app-beta/app-beta-page.module.css", import.meta.url), "utf8");

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

test("App Beta owns visible, responsive form controls instead of relying on global form styles", () => {
  assert.match(form, /app-beta-form\.module\.css/);
  assert.match(form, /className=\{styles\.input\}/);
  assert.match(form, /className=\{styles\.select\}/);
  assert.match(form, /className=\{styles\.checkbox\}/);
  assert.match(formStyles, /\.input,\s*\n\.select\s*\{/);
  assert.match(formStyles, /height:\s*54px/);
  assert.match(formStyles, /border:\s*1px solid/);
  assert.match(formStyles, /background:\s*rgba\(/);
  assert.match(formStyles, /\.input:focus,\s*\n\.select:focus/);
  assert.match(formStyles, /@media \(max-width: 760px\)/);
  assert.match(page, /app-beta-page\.module\.css/);
  assert.match(pageStyles, /@media \(max-width: 980px\)/);
  assert.match(pageStyles, /grid-template-columns:\s*1fr/);
});
