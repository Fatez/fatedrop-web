import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const brandMark = read("components/brand-mark.tsx");
const dashboardShell = read("components/dashboard-page-shell.tsx");
const favicon = read("public/favicon.svg");

test("shared Web chrome renders the canonical FateDrop wordmark asset", () => {
  assert.match(brandMark, /\/assets\/fatedrop-wordmark\.png/);
  assert.doesNotMatch(brandMark, /brand-word|<b>Fate<\/b>/);

  const wordmark = fs.statSync(path.join(root, "public/assets/fatedrop-wordmark.png"));
  assert.ok(wordmark.size > 10000, `FateDrop wordmark unexpectedly small: ${wordmark.size} bytes`);
});

test("dashboard account fallbacks consume the shared compact FateDrop mark", () => {
  assert.match(dashboardShell, /\/assets\/fatedrop-logo-mark\.png/);

  const emblem = fs.statSync(path.join(root, "public/assets/fatedrop-logo-mark.png"));
  assert.ok(emblem.size > 4000, `FateDrop compact emblem unexpectedly small: ${emblem.size} bytes`);
});

test("favicon is an image derivative rather than an independently redrawn SVG mark", () => {
  assert.match(favicon, /data:image\/png;base64,/);
  assert.doesNotMatch(favicon, /<path\b|<polygon\b|<circle\b/);
});
