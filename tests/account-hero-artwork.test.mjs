import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const layout = fs.readFileSync("app/layout.tsx", "utf8");
const heroCss = fs.readFileSync("app/account-hero-artwork.css", "utf8");
const artwork = fs.readFileSync("public/assets/account/Beta Welcome.png");

test("account hero uses the uploaded FateDrop beta artwork with a readability treatment", () => {
  assert.match(layout, /import "\.\/account-hero-artwork\.css";/);
  assert.match(heroCss, /\.fd-account-hero\s*\{/);
  assert.match(heroCss, /url\("\/assets\/account\/Beta%20Welcome\.png"\)/);
  assert.match(heroCss, /linear-gradient\(90deg/);
  assert.match(heroCss, /cover no-repeat !important/);
  assert.match(heroCss, /backdrop-filter:\s*blur\(10px\)/);
  assert.equal(artwork.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
});
