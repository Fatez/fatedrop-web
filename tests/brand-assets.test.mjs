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

test("shared Web chrome renders the approved FateDrop wordmark", () => {
  assert.match(brandMark, /\/assets\/fatedrop-wordmark\.png/);
  assert.match(brandMark, /width="320"/);
  assert.match(brandMark, /height="107"/);
  assert.doesNotMatch(brandMark, /brand-word|<b>Fate<\/b>/);

  const wordmark = readBuffer("public/assets/fatedrop-wordmark.png");
  assert.deepEqual(pngDimensions(wordmark), { width: 320, height: 107 });
  assert.equal(gitBlobSha(wordmark), "63f7b5af83b743aeead9949dd33e7b08fe978033");
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
