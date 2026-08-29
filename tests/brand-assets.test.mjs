import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readBuffer = (file) => fs.readFileSync(path.join(root, file));

const brandMark = read("components/brand-mark.tsx");
const dashboardShell = read("components/dashboard-page-shell.tsx");
const layout = read("app/layout.tsx");

const gitBlobSha = (buffer) => crypto
  .createHash("sha1")
  .update(Buffer.from(`blob ${buffer.length}\0`))
  .update(buffer)
  .digest("hex");

const pngDimensions = (buffer) => ({
  width: buffer.readUInt32BE(16),
  height: buffer.readUInt32BE(20),
});

test("shared Web chrome renders the supplied black and white FateDrop logo", () => {
  assert.match(brandMark, /\/assets\/fatedrop-wordmark\.png/);
  assert.match(brandMark, /width="192"/);
  assert.match(brandMark, /height="192"/);
  assert.match(brandMark, /height: compact \? 44 : 52/);
  assert.match(brandMark, /WORDMARK_VISIBLE_CROP = "inset\(0 0 10% 0\)"/);
  assert.match(brandMark, /clipPath: WORDMARK_VISIBLE_CROP/);
  assert.doesNotMatch(brandMark, /brand-word|<b>Fate<\/b>/);

  const wordmark = readBuffer("public/assets/fatedrop-wordmark.png");
  assert.deepEqual(pngDimensions(wordmark), { width: 192, height: 192 });
  assert.equal(gitBlobSha(wordmark), "3a1cc1ad948db2d745812824b2044f95bde48355");
});

test("dashboard fallbacks and browser metadata use the approved FateDrop medallion", () => {
  assert.match(dashboardShell, /\/assets\/fatedrop-logo-mark\.png/);
  assert.match(layout, /icon: "\/assets\/fatedrop-logo-mark\.png"/);
  assert.match(layout, /shortcut: "\/assets\/fatedrop-logo-mark\.png"/);
  assert.match(layout, /apple: "\/assets\/fatedrop-logo-mark\.png"/);

  const emblem = readBuffer("public/assets/fatedrop-logo-mark.png");
  assert.deepEqual(pngDimensions(emblem), { width: 192, height: 192 });
  assert.equal(gitBlobSha(emblem), "91cfdfb919de83f361aa7936b30a93fe5a26a93b");
});
